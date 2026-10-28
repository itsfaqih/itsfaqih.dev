import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { chromium, type Browser } from "playwright";
import { PNG } from "pngjs";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";

type Shot = {
  route: string;
  viewport: keyof typeof viewports;
  scheme: "light" | "dark";
};

const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const baselineDir = path.join(import.meta.dirname, "__screenshots__");
const diffDir = path.join(import.meta.dirname, "__diff__");
const update = process.env.UPDATE_VISUAL === "1";

const maxDiffRatio = 0.0005;

const buildRoot = inject("buildRoot");
const routes = readdirSync(buildRoot, { recursive: true, encoding: "utf8" })
  .filter((file) => path.basename(file) === "index.html")
  .map((file) => `/${path.dirname(file)}`.replace(/\/\.$/, "/"))
  .sort();

const shots: Shot[] = routes.flatMap((route) =>
  (["desktop", "mobile"] as const).flatMap((viewport) =>
    (["light", "dark"] as const).map((scheme) => ({ route, viewport, scheme })),
  ),
);

function shotName({ route, viewport, scheme }: Shot) {
  const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "__");
  return `${slug}--${viewport}-${scheme}.png`;
}

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
  rmSync(diffDir, { recursive: true, force: true });
  if (update) rmSync(baselineDir, { recursive: true, force: true });
});
afterAll(() => browser?.close());

async function capture(shot: Shot) {
  const context = await browser.newContext({
    viewport: viewports[shot.viewport],
    colorScheme: shot.scheme,
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
  }, shot.scheme);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date("2026-01-15T09:30:00Z"));
  try {
    await page.goto(new URL(shot.route, inject("baseURL")).href, { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      const bar = document.querySelector(".arc-bar");
      return bar && Object.keys(bar).some((key) => key.startsWith("__reactFiber"));
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const unrevealedInView = () =>
        Array.from(document.querySelectorAll("[data-rv]:not(.in), [data-cut]:not(.in)")).some(
          (block) => {
            const rect = block.getBoundingClientRect();
            return rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight * 0.85;
          },
        );
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
    });
    await page.waitForLoadState("networkidle");
    let previous: Buffer | undefined;
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.waitForTimeout(100);
      const current = await page.screenshot({
        fullPage: true,
        animations: "disabled",
        caret: "hide",
      });
      if (previous && !mismatch(previous, current)) return current;
      previous = current;
    }
    throw new Error(`${shot.route} never settled into a stable screenshot`);
  } finally {
    await context.close();
  }
}

function mismatch(expected: Buffer, actual: Buffer) {
  const before = PNG.sync.read(expected);
  const after = PNG.sync.read(actual);
  const { width, height } = before;
  if (width !== after.width || height !== after.height) {
    return { reason: `size changed from ${width}x${height} to ${after.width}x${after.height}` };
  }
  const diff = new PNG({ width, height });
  const changed = pixelmatch(before.data, after.data, diff.data, width, height, { threshold: 0.1 });
  if (changed / (width * height) <= maxDiffRatio) return undefined;
  return { reason: `${changed} pixels changed`, diff: PNG.sync.write(diff) };
}

function writeDiff(name: string, actual: Buffer, diff?: Buffer) {
  mkdirSync(diffDir, { recursive: true });
  writeFileSync(path.join(diffDir, name.replace(".png", ".actual.png")), actual);
  if (diff) writeFileSync(path.join(diffDir, name.replace(".png", ".diff.png")), diff);
}

describe.concurrent("pages match their baseline screenshots", () => {
  it.each(shots.map((shot) => [shotName(shot), shot] as const))("%s", async (name, shot) => {
    const actual = await capture(shot);
    if (update) {
      mkdirSync(baselineDir, { recursive: true });
      writeFileSync(path.join(baselineDir, name), actual);
      return;
    }
    const result = mismatch(readFileSync(path.join(baselineDir, name)), actual);
    if (result) writeDiff(name, actual, result.diff);
    expect(result?.reason, `see ${diffDir}`).toBeUndefined();
  });
});

it.skipIf(update)("every baseline still has a page", () => {
  const expected = shots.map(shotName).sort();
  expect(readdirSync(baselineDir).sort()).toEqual(expected);
});
