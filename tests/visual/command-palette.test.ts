import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, inject, it } from "vite-plus/test";
import { VISIBLE_GUIDELINES } from "../../src/data/guidelines";
import { pageReady } from "./ready";

// Drives the ⌘K palette on the built site. Every test fails on any error the page logs.

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

async function openPalette(route = "/blog") {
  context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  errors = [];
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(new URL(route, inject("baseURL")).href, { waitUntil: "networkidle" });
  await summon(page);
  return page;
}

async function summon(page: Page) {
  await page.waitForFunction(pageReady);
  await page.keyboard.press("ControlOrMeta+k");
  const input = page.getByRole("combobox");
  await expect.poll(() => input.evaluate((node) => node === document.activeElement)).toBe(true);
}

const groupNames = (page: Page) =>
  page
    .getByRole("group")
    .evaluateAll((groups) => groups.map((group) => group.getAttribute("aria-label")));
const optionNames = (page: Page, group: string) =>
  page
    .getByRole("group", { name: group, exact: true })
    .getByRole("option")
    .evaluateAll((options) =>
      options.map((option) => option.querySelector(".cmdk-name")?.textContent),
    );
const selectedOption = (page: Page) =>
  page
    .getByRole("option", { selected: true })
    .evaluateAll((options) =>
      options.map((option) => option.querySelector(".cmdk-name")?.textContent),
    );
const listedOptions = (page: Page) =>
  page
    .getByRole("listbox")
    .getByRole("option")
    .evaluateAll((options) =>
      options.map((option) => option.querySelector(".cmdk-name")?.textContent),
    );
const pathname = (page: Page) => new URL(page.url()).pathname.replace(/\.html$/, "");

describe("the command palette", () => {
  it("groups the root commands by category", async () => {
    const page = await openPalette();

    expect(await groupNames(page)).toEqual(["Pages", "Links", "Actions"]);
    expect(await optionNames(page, "Pages")).toEqual(["Home", "Rule of Thumb"]);
    expect(await optionNames(page, "Links")).toEqual(["GitHub", "LinkedIn"]);
    expect(await optionNames(page, "Actions")).toEqual(["Copy Email"]);
    expect(await selectedOption(page)).toEqual(["Home"]);
  });

  it("filters by label, description and keywords, dropping empty groups", async () => {
    const page = await openPalette();
    const input = page.getByRole("combobox");

    await input.pressSequentially("repo");
    expect(await groupNames(page)).toEqual(["Links"]);
    expect(await optionNames(page, "Links")).toEqual(["GitHub"]);

    await input.fill("");
    await input.pressSequentially("zzz");
    expect(await page.getByRole("option").count()).toBe(0);
    await expect.poll(() => page.getByText('No results for "zzz"').isVisible()).toBe(true);
  });

  it("finds every rule, home section and footer link from the root search", async () => {
    const page = await openPalette();
    const input = page.getByRole("combobox");
    const listed = () => listedOptions(page);
    const unfiltered = ["Home", "Rule of Thumb", "GitHub", "LinkedIn", "Copy Email"];

    expect(await listed()).toEqual(unfiltered);

    await input.pressSequentially("experience");
    expect(await listed()).toEqual(["Experience"]);

    await input.fill("");
    await input.pressSequentially("dribbble");
    expect(await listed()).toEqual(["Dribbble"]);

    await input.fill("");
    expect(await listed()).toEqual(unfiltered);

    await input.pressSequentially("button");
    expect(await groupNames(page)).toEqual(["Rule of Thumb"]);
    expect(await selectedOption(page)).toEqual(["Button Design"]);
    await Promise.all([page.waitForURL(/button-design/), page.keyboard.press("Enter")]);
    expect(pathname(page)).toBe("/rule-of-thumb/button-design");
  });

  it("answers similar words with every way to reach me, the exact word first", async () => {
    const page = await openPalette();
    const input = page.getByRole("combobox");
    const listed = () => listedOptions(page);
    const reach = ["Connect", "LinkedIn", "Copy Email"];

    await input.pressSequentially("connect");
    await expect.poll(listed).toEqual(reach);
    await expect.poll(() => selectedOption(page)).toEqual(["Connect"]);

    await input.fill("");
    await input.pressSequentially("contact");
    await expect.poll(listed).toEqual(reach);
    await expect.poll(() => selectedOption(page)).toEqual(["Connect"]);

    await input.fill("");
    await input.pressSequentially("email");
    await expect.poll(async () => (await listed())[0]).toBe("Copy Email");
    await expect.poll(() => selectedOption(page)).toEqual(["Copy Email"]);
  });

  it("wraps the highlight and runs the highlighted command on Enter", async () => {
    const page = await openPalette();

    await page.keyboard.press("ArrowUp");
    expect(await selectedOption(page)).toEqual(["Copy Email"]);
    await page.keyboard.press("ArrowDown");
    expect(await selectedOption(page)).toEqual(["Home"]);

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.keyboard.press("Enter"),
    ]);
    expect(pathname(page)).toBe("/");
  });

  it("opens the Rule of Thumb submenu and returns to its parent item", async () => {
    const page = await openPalette();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    expect(await groupNames(page)).toEqual(["Rule of Thumb"]);
    expect(await optionNames(page, "Rule of Thumb")).toEqual([
      "Index",
      ...VISIBLE_GUIDELINES.map((guideline) => guideline.title),
    ]);

    await page.keyboard.press("ArrowDown");
    await Promise.all([page.waitForURL(/rule-of-thumb\//), page.keyboard.press("Enter")]);
    expect(pathname(page)).toBe(VISIBLE_GUIDELINES[0]!.href);

    await summon(page);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Backspace");
    expect(await groupNames(page)).toEqual(["Pages", "Links", "Actions"]);
    expect(await selectedOption(page)).toEqual(["Rule of Thumb"]);
  });
});
