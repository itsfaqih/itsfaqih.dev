import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, inject, it } from "vite-plus/test";
import {
  mismatch,
  openSettledPage,
  stableScreenshot,
  viewports,
  writeDiff,
  type Scheme,
  type Viewport,
} from "./page-setup";
import { routeSlug } from "../site";

type Shot = { route: string; viewport: Viewport; scheme: Scheme };

const baselineDir = path.join(import.meta.dirname, "__screenshots__");
const diffDir = path.join(import.meta.dirname, "__diff__");
const update = process.env.UPDATE_VISUAL === "1";

const routes = inject("routes");

const shots: Shot[] = routes.flatMap((route) =>
  (["desktop", "mobile"] as const).flatMap((viewport) =>
    (["light", "dark"] as const).map((scheme) => ({ route, viewport, scheme })),
  ),
);

function shotName({ route, viewport, scheme }: Shot) {
  return `${routeSlug(route)}--${viewport}-${scheme}.png`;
}

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
  rmSync(diffDir, { recursive: true, force: true });
});
afterAll(async () => {
  await browser?.close();
  // An update drops the baselines of pages that no longer exist. The others it rewrote one by one.
  if (!update) return;
  const expected = new Set(shots.map(shotName));
  for (const file of readdirSync(baselineDir)) {
    if (!expected.has(file)) rmSync(path.join(baselineDir, file));
  }
});

async function capture(shot: Shot) {
  const { context, page, errors } = await openSettledPage(browser, shot);
  try {
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    // A full-page capture sizes itself from body's overflow too, which counts decoration the root
    // clips, so the clip pins it to the area a reader can scroll to.
    const clip = { x: 0, y: 0, width: viewports[shot.viewport].width, height: scrollHeight };
    return { image: await stableScreenshot(page, clip, shot.route), errors };
  } finally {
    await context.close();
  }
}

describe.concurrent("pages match their baseline screenshots", () => {
  it.each(shots.map((shot) => [shotName(shot), shot] as const))("%s", async (name, shot) => {
    const { image: actual, errors } = await capture(shot);
    expect(errors, "errors logged while the page ran").toEqual([]);
    const file = path.join(baselineDir, name);
    if (update) {
      // A baseline that still matches stays as it is, so an update commits only the shots that changed.
      if (existsSync(file) && !mismatch(readFileSync(file), actual)) return;
      mkdirSync(baselineDir, { recursive: true });
      writeFileSync(file, actual);
      return;
    }
    const result = mismatch(readFileSync(file), actual);
    if (result) writeDiff(diffDir, name, actual, result.diff);
    expect(result?.reason, `see ${diffDir}`).toBeUndefined();
  });
});

it.skipIf(update)("every baseline still has a page", () => {
  const expected = shots.map(shotName).sort();
  expect(readdirSync(baselineDir).sort()).toEqual(expected);
});
