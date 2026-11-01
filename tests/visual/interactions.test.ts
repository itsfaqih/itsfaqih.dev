import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, inject, it } from "vite-plus/test";
import { VISIBLE_GUIDELINES } from "../../src/data/guidelines";
import { pageReady } from "./ready";

// Drives the built site the way a reader does, across island hydration and page navigations.
// Every test fails on any error the page logs.

let browser: Browser;
let context: BrowserContext;
let errors: string[];

beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(() => browser?.close());
afterEach(async () => {
  await context?.close();
  expect(errors, "errors logged while the page ran").toEqual([]);
});

async function open(route: string, viewport = { width: 1440, height: 900 }) {
  context = await browser.newContext({ viewport, colorScheme: "light" });
  // The home intro plays once a session; these tests start past it.
  await context.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
  errors = [];
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(new URL(route, inject("baseURL")).href, { waitUntil: "networkidle" });
  await hydrated(page);
  return page;
}

function hydrated(page: Page) {
  return page.waitForFunction(pageReady);
}

// pagereveal can fire after load, so the transition's type is polled for.
const transitionType = (page: Page) => page.evaluate(() => document.documentElement.dataset.vt);

const pathname = (page: Page) => new URL(page.url()).pathname.replace(/\.html$/, "");
const heading = (page: Page) =>
  page
    .locator("h1")
    .first()
    .innerText()
    .then((text) => text.replace(/\s+/g, " "));

describe("the built site responds to a reader", () => {
  it("opens the command palette on Cmd/Ctrl+K and goes where it is sent", async () => {
    const page = await open("/blog");
    await page.keyboard.press("ControlOrMeta+k");
    const input = page.getByRole("combobox");
    await expect.poll(() => input.evaluate((node) => node === document.activeElement)).toBe(true);
    // Rule of Thumb, into its submenu, onto the first rule.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await Promise.all([page.waitForURL(/rule-of-thumb\//), page.keyboard.press("Enter")]);
    expect(pathname(page)).toBe(VISIBLE_GUIDELINES[0]!.href);
    await expect.poll(() => heading(page)).toContain(VISIBLE_GUIDELINES[0]!.title);
  });

  it("switches the theme and keeps it across a reload", async () => {
    const page = await open("/");
    const theme = () =>
      page.evaluate(() => ({
        dark: document.documentElement.classList.contains("dark"),
        saved: localStorage.getItem("theme"),
      }));
    expect(await theme()).toEqual({ dark: false, saved: null });
    await page.getByRole("button", { name: "Switch theme" }).click();
    await expect.poll(theme).toEqual({ dark: true, saved: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    expect(await theme()).toEqual({ dark: true, saved: "dark" });
  });

  it("clears the Handling Timestamps quiz when the right choice is tapped", async () => {
    const page = await open("/rule-of-thumb/handling-timestamps");
    const quiz = page.locator("article#lv-1");
    await quiz.scrollIntoViewIfNeeded();
    const status = quiz.locator("[aria-live]");
    await expect.poll(() => status.innerText()).toContain("Tap the one that fits");
    const right = quiz.getByRole("button", { name: "Both 06:00 UTC" });
    await right.click();
    await expect.poll(() => status.innerText()).toContain("Store UTC");
    await expect.poll(() => quiz.getByText("Clear", { exact: true }).isVisible()).toBe(true);
    await expect.poll(() => right.isDisabled()).toBe(true);
  });

  it("closes the Dialog Design demo's dialog on Esc", async () => {
    const page = await open("/rule-of-thumb/dialog-design");
    const good = page.locator("figure[data-side='good']", {
      has: page.getByRole("button", { name: "What's new", exact: true }),
    });
    const dialog = good.locator("[role=dialog]");
    expect(await dialog.getAttribute("inert")).toBe("");
    await good.scrollIntoViewIfNeeded();
    await good.getByRole("button", { name: "What's new", exact: true }).click();
    await expect.poll(() => dialog.getAttribute("inert")).toBeNull();
    await page.keyboard.press("Escape");
    await expect.poll(() => dialog.getAttribute("inert")).toBe("");
  });

  it("dives from a rule tile into its page and zooms back out", async () => {
    const page = await open("/rule-of-thumb");
    const rule = VISIBLE_GUIDELINES[0]!;
    const tile = page.locator(`main a[href='${rule.href}']`).first();
    await Promise.all([page.waitForURL(new RegExp(`${rule.href}$`)), tile.click()]);
    await hydrated(page);
    await expect.poll(() => transitionType(page)).toBe("rule-open");
    await expect.poll(() => heading(page)).toContain(rule.title);

    const crumb = page.locator("main a[href='/rule-of-thumb']").first();
    await Promise.all([page.waitForURL(/\/rule-of-thumb$/), crumb.click()]);
    await expect.poll(() => transitionType(page)).toBe("rule-close");
  });

  it("renders the blog post's table of contents and highlighted code", async () => {
    const page = await open("/blog/hello-world");
    const toc = page.locator("nav", { hasText: "On this page" });
    await expect.poll(() => toc.locator("a").count()).toBeGreaterThan(0);
    const target = await toc.locator("a").first().getAttribute("href");
    expect(await page.locator(`h2${target}`).count()).toBe(1);

    // The highlighted lines sit in the container's shadow root, which locators pierce.
    const code = page.locator("diffs-container pre").first();
    await expect.poll(() => code.innerText()).toContain("interface User");
  });

  it("filters the home stack and opens an experience entry", async () => {
    const page = await open("/");
    const stack = page.locator("#stack");
    await stack.scrollIntoViewIfNeeded();
    const tools = stack.locator("li");
    const all = await tools.count();
    const chip = page
      .getByRole("group", { name: /^Filter by/ })
      .first()
      .getByRole("button")
      .first();
    await chip.click();
    await expect.poll(() => chip.getAttribute("aria-pressed")).toBe("true");
    await expect.poll(() => tools.count()).toBeLessThan(all);

    const entry = page.locator("#work button[aria-controls='job-1']");
    expect(await entry.getAttribute("aria-expanded")).toBe("false");
    await entry.scrollIntoViewIfNeeded();
    await entry.click();
    await expect.poll(() => entry.getAttribute("aria-expanded")).toBe("true");
  });
});
