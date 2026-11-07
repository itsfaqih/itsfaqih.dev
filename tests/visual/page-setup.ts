import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import type { Browser, Page } from "playwright";
import { PNG } from "pngjs";
import { inject } from "vite-plus/test";
import { pageReady } from "./ready";

declare global {
  interface Window {
    settleFrames?: number;
  }
}

export const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

export type Viewport = keyof typeof viewports;
export type Scheme = "light" | "dark";
export type Clip = { x: number; y: number; width: number; height: number };

// Repeat captures match pixel for pixel, while a recoloured icon changes ~130 pixels and a hidden
// one ~40. A flat budget holds a small change to the same bar on a tall page as on a short one.
export const maxDiffPixels = 20;

// Blocks that fade in once scrolled into view: [data-cut] cut-ins gain .in (cut-ins.ts), and
// [data-rev] rule sections gain data-in (rule-motion.ts). A new reveal marker belongs here.
const unrevealedSelector = "[data-cut]:not(.in), [data-rev]:not([data-in])";

export const fixedTime = new Date("2026-01-15T09:30:00Z");

/** Every error the page throws or logs, gathered as it runs. */
export function pageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

export const pathname = (page: Page) => new URL(page.url()).pathname.replace(/\.html$/, "");

/**
 * Opens a route frozen for screenshots: seeded randomness, a fixed clock, no motion, the intro
 * already seen, and every reveal-on-scroll block already shown. The caller closes the context.
 */
export async function openSettledPage(
  browser: Browser,
  { route, viewport, scheme }: { route: string; viewport: Viewport; scheme: Scheme },
) {
  const context = await browser.newContext({
    viewport: viewports[viewport],
    colorScheme: scheme,
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  await context.addInitScript((theme) => {
    localStorage.setItem("theme", theme);
    sessionStorage.setItem("intro-seen", "1");
    let seed = 42;
    Math.random = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const style = document.createElement("style");
    style.textContent = `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      scroll-behavior: auto !important;
    }`;
    document.addEventListener("DOMContentLoaded", () => document.head.append(style));
  }, scheme);
  const page = await context.newPage();
  const errors = pageErrors(page);
  await page.clock.setFixedTime(fixedTime);
  try {
    await page.goto(new URL(route, inject("baseURL")).href, { waitUntil: "networkidle" });
    await page.waitForFunction(pageReady);
    await page.evaluate(() => document.fonts.ready);
    // Polled on real frames with a real deadline: the page's own requestAnimationFrame runs on the
    // fake clock, which fires a burst of frames at once after the main thread stalls. Two frames
    // pass first so intersection observers see the new scroll position.
    const settle = async () => {
      try {
        await page.waitForFunction(
          (pending) => {
            window.settleFrames = (window.settleFrames ?? 0) + 1;
            if (window.settleFrames < 3) return false;
            return !Array.from(document.querySelectorAll(pending)).some((block) => {
              const rect = block.getBoundingClientRect();
              return (
                rect.height > 0 &&
                rect.bottom > 0 &&
                rect.top < window.innerHeight * 0.85 &&
                rect.right > 0 &&
                rect.left < window.innerWidth
              );
            });
          },
          unrevealedSelector,
          { polling: "raf", timeout: 2_000 },
        );
      } catch (error) {
        if (!(error instanceof Error && error.name === "TimeoutError")) throw error;
      }
    };
    const scrollTo = (top: number) =>
      page.evaluate((top) => {
        window.settleFrames = 0;
        window.scrollTo({ top, behavior: "instant" });
        return document.body.scrollHeight;
      }, top);
    for (let y = 0; y < (await scrollTo(y)); y += viewports[viewport].height / 2) {
      await settle();
    }
    await scrollTo(0);
    await settle();
    // A carousel card waiting off to the side cuts in when it is paged to, not on scroll.
    const unrevealed = await page.evaluate(
      (pending) =>
        Array.from(document.querySelectorAll(pending))
          .filter((block) => {
            const rect = block.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            return rect.width > 0 && center >= 0 && center <= window.innerWidth;
          })
          .map((block) => {
            const { top, height } = block.getBoundingClientRect();
            const text = block.textContent?.trim().slice(0, 40);
            return `"${text}" at ${Math.round(top + window.scrollY)}+${Math.round(height)}`;
          }),
      unrevealedSelector,
    );
    if (unrevealed.length) {
      throw new Error(`blocks never revealed on ${route}: ${unrevealed.join(", ")}`);
    }
    await page.waitForFunction(() => !document.querySelector("[data-shown]"));
    await page.waitForLoadState("networkidle");
  } catch (error) {
    await context.close();
    throw error;
  }
  return { context, page, errors };
}

/**
 * Screenshots a clip until two captures in a row agree, so a page mid-update is never kept. The
 * clip is in page coordinates for a full-page capture and in viewport coordinates otherwise.
 */
export async function stableScreenshot(
  page: Page,
  clip: Clip,
  label: string,
  { fullPage = true } = {},
) {
  let previous: Buffer | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.waitForTimeout(100);
    const current = await page.screenshot({
      fullPage,
      clip,
      animations: "disabled",
      caret: "hide",
    });
    if (previous && !mismatch(previous, current)) return current;
    previous = current;
  }
  throw new Error(`${label} never settled into a stable screenshot`);
}

export function mismatch(expected: Buffer, actual: Buffer) {
  const before = PNG.sync.read(expected);
  const after = PNG.sync.read(actual);
  const { width, height } = before;
  if (width !== after.width || height !== after.height) {
    return { reason: `size changed from ${width}x${height} to ${after.width}x${after.height}` };
  }
  const diff = new PNG({ width, height });
  const changed = pixelmatch(before.data, after.data, diff.data, width, height, { threshold: 0.1 });
  if (changed <= maxDiffPixels) return undefined;
  return { reason: `${changed} pixels changed`, diff: PNG.sync.write(diff) };
}

export function writeDiff(dir: string, name: string, actual: Buffer, diff?: Buffer) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name.replace(".png", ".actual.png")), actual);
  if (diff) writeFileSync(path.join(dir, name.replace(".png", ".diff.png")), diff);
}
