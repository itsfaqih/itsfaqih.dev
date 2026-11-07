import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, inject, it } from "vite-plus/test";
import { pageReady } from "./ready";

// The print cursor draws the glyph each element's own cursor token names, read from that token's
// url fragment (arcade.css), with no image file to fetch.

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(() => browser?.close());

it("draws the hand over a link, the I-beam over text and the arrow elsewhere", async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cursorFetches: string[] = [];
  page.on("request", (request) => {
    if (/\/cursors?\//.test(new URL(request.url()).pathname) && request.resourceType() !== "script")
      cursorFetches.push(request.url());
  });
  await page.goto(new URL("/cv", inject("baseURL")).href, { waitUntil: "networkidle" });
  await page.waitForFunction(pageReady);

  const modeOver = async (selector: string) => {
    const box = await page.locator(selector).first().boundingBox();
    if (!box) throw new Error(`${selector} is not on screen`);
    await page.mouse.move(box.x + 4, box.y + box.height / 2);
    return expect.poll(() => page.locator("print-cursor").getAttribute("data-mode"));
  };
  await (await modeOver("main a[href]")).toBe("point");
  await (await modeOver("main p")).toBe("text");
  await page.mouse.move(2, 450);
  await expect.poll(() => page.locator("print-cursor").getAttribute("data-mode")).toBe("arrow");
  expect(cursorFetches, "cursor images fetched").toEqual([]);
  await context.close();
});
