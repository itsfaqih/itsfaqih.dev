import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import type { Browser, Page } from "playwright";
import { PNG } from "pngjs";
import { inject } from "vite-plus/test";
import { pageReady } from "./ready";

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

// Blocks that fade in once scrolled into view: [data-cut] cut-ins gain .in (use-cut-ins.ts), and
// [data-rev] rule sections gain data-in (rule-landing.tsx). A new reveal marker belongs here.
const unrevealedSelector = "[data-cut]:not(.in), [data-rev]:not([data-in])";

export function routeSlug(route: string) {
  return route === "/" ? "home" : route.slice(1).replaceAll("/", "__");
}

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
    }`;
    document.addEventListener("DOMContentLoaded", () => document.head.append(style));
  }, scheme);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.clock.setFixedTime(new Date("2026-01-15T09:30:00Z"));
  try {
    await page.goto(new URL(route, inject("baseURL")).href, { waitUntil: "networkidle" });
    await page.waitForFunction(pageReady);
    const unrevealed = await page.evaluate(async (pending) => {
      await document.fonts.ready;
      const unrevealedInView = () =>
        Array.from(document.querySelectorAll(pending)).some((block) => {
          const rect = block.getBoundingClientRect();
          return rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight * 0.85;
        });
      const settle = async () => {
        for (let frame = 0; frame < 100; frame++) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          if (frame > 0 && !unrevealedInView()) return;
        }
      };
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo({ top: y, behavior: "instant" });
        await settle();
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await settle();
      // A carousel card waiting off to the side cuts in when it is paged to, not on scroll.
      return Array.from(document.querySelectorAll(pending)).filter((block) => {
        const rect = block.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        return rect.width > 0 && center >= 0 && center <= window.innerWidth;
      }).length;
    }, unrevealedSelector);
    if (unrevealed > 0) throw new Error(`${unrevealed} blocks never revealed on ${route}`);
    await page.waitForFunction(() => !document.querySelector("[data-shown]"));
    await page.waitForLoadState("networkidle");
  } catch (error) {
    await context.close();
    throw error;
  }
  return { context, page, errors };
}

/** Screenshots a clip until two captures in a row agree, so a page mid-update is never kept. */
export async function stableScreenshot(page: Page, clip: Clip, label: string) {
  let previous: Buffer | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.waitForTimeout(100);
    const current = await page.screenshot({
      fullPage: true,
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
