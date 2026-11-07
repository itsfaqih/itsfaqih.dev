import { chromium, type Browser, type BrowserContext, type Locator, type Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, inject, it } from "vite-plus/test";
import { PUBLISHED_GUIDELINES, VISIBLE_GUIDELINES } from "../../src/data/guidelines";
import { pageErrors, pathname } from "./page-setup";
import { pageReady } from "../ready";

// Drives the built site the way a reader does, across page navigations.
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

/** Collects every error the page throws or logs into `errors`, which afterEach checks. */
function watch(page: Page) {
  errors = pageErrors(page);
  return page;
}

async function open(route: string, viewport = { width: 1440, height: 900 }) {
  context = await browser.newContext({ viewport, colorScheme: "light" });
  // The home intro plays once a session; these tests start past it.
  await context.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
  const page = watch(await context.newPage());
  await page.goto(new URL(route, inject("baseURL")).href, { waitUntil: "networkidle" });
  await page.waitForFunction(pageReady);
  return page;
}

/**
 * Hovers and presses each control `selector` finds that moves on hover or press, 1px inside its top
 * and bottom edges. Returns how many moved and each edge where the pointer slipped off.
 */
async function edgeSlips(page: Page, selector: string) {
  // Instant moves make a slip show within a frame, and a press never follows a link.
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; }" });
  await page.evaluate(() => {
    const swallow = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    for (const type of ["click", "dragstart"]) addEventListener(type, swallow, true);
  });
  // Samples every frame for a span of time rather than a count of frames, so a loaded machine
  // checks just as long.
  const holds = (target: Locator, state: string, span = 200) =>
    target.evaluate(
      (node, { state, span }) =>
        new Promise<boolean>((done) => {
          const start = performance.now();
          let frames = 0;
          let held = true;
          const tick = (now: number) => {
            held &&= node.matches(state);
            if (++frames < 2 || now - start < span) requestAnimationFrame(tick);
            else done(held);
          };
          requestAnimationFrame(tick);
        }),
      { state, span },
    );
  const owns = (target: Locator, x: number, y: number) =>
    target.evaluate((node, { x, y }) => node.contains(document.elementFromPoint(x, y)), { x, y });
  // A cut-in waits out its stagger standing still, then glitches sideways, so a still box is not
  // yet at rest. Rest is once the one-shot animations on the control and its ancestors end.
  const settled = async (target: Locator) => {
    await target.evaluate(async (node) => {
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
      await Promise.all(
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.playState === "running" &&
              animation.effect?.getComputedTiming().iterations !== Infinity &&
              animation.effect instanceof KeyframeEffect &&
              (animation.effect.target?.contains(node) ?? false),
          )
          .map((animation) => animation.finished.catch(() => undefined)),
      );
    });
    return target.boundingBox();
  };

  const slips: string[] = [];
  let movers = 0;
  for (const target of await page.locator(selector).all()) {
    if (!(await target.isVisible())) continue;
    await target.scrollIntoViewIfNeeded();
    await page.mouse.move(1, 1);
    const rest = await settled(target);
    if (!rest || rest.height < 12) continue;
    const x = rest.x + rest.width / 2;
    if (!(await owns(target, x, rest.y + rest.height / 2))) continue;
    await page.mouse.move(x, rest.y + rest.height / 2);
    await holds(target, "*", 0);
    const hovered = (await target.boundingBox())!;
    await page.mouse.down();
    await holds(target, "*", 0);
    const pressed = (await target.boundingBox())!;
    await page.mouse.up();
    if (Math.abs(hovered.y - rest.y) < 1 && Math.abs(pressed.y - rest.y) < 1) continue;
    movers++;
    const name = (await target.innerText()).trim().split("\n")[0];
    for (const [edge, y] of [
      ["top", rest.y + 1],
      ["bottom", rest.y + rest.height - 1],
    ] as const) {
      await page.mouse.move(1, 1);
      if (!(await owns(target, x, y))) continue;
      await page.mouse.move(x, y);
      if (!(await holds(target, ":hover"))) slips.push(`"${name}" hovered at its ${edge}`);
      await page.mouse.down();
      if (!(await holds(target, ":hover:active"))) slips.push(`"${name}" pressed at its ${edge}`);
      await page.mouse.up();
    }
  }
  return { movers, slips };
}

// pagereveal can fire after load, so the transition's type is polled for.
const transitionType = (page: Page) => page.evaluate(() => document.documentElement.dataset.vt);

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
    const right = quiz.getByRole("button", { name: "Both 09:00 UTC" });
    await right.click();
    await expect.poll(() => status.innerText()).toContain("Store UTC");
    await expect.poll(() => quiz.getByText("Clear", { exact: true }).isVisible()).toBe(true);
    await expect.poll(() => right.isDisabled()).toBe(true);
  });

  it("closes the Dialog Design demo's dialog on Esc and hands focus back", async () => {
    const page = await open("/rule-of-thumb/dialog-design");
    const good = page.locator("figure[data-side='good']", {
      has: page.getByRole("button", { name: "What's new", exact: true }),
    });
    const trigger = good.getByRole("button", { name: "What's new", exact: true });
    const dialog = good.locator("[role=dialog]");
    const focused = (target: Locator) =>
      target.evaluate((node) => node.contains(document.activeElement));
    expect(await dialog.isVisible()).toBe(false);
    await good.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect.poll(() => dialog.isVisible()).toBe(true);
    await expect.poll(() => focused(dialog)).toBe(true);
    await page.keyboard.press("Escape");
    await expect.poll(() => dialog.isVisible()).toBe(false);
    await expect.poll(() => focused(trigger)).toBe(true);
  });

  it("dives from a rule tile into its page and zooms back out", async () => {
    const page = await open("/rule-of-thumb");
    const rule = VISIBLE_GUIDELINES[0]!;
    const tile = page.locator(`main a[href='${rule.href}']`).first();
    await Promise.all([page.waitForURL(new RegExp(`${rule.href}$`)), tile.click()]);
    await page.waitForFunction(pageReady);
    await expect.poll(() => transitionType(page)).toBe("rule-open");
    await expect.poll(() => heading(page)).toContain(rule.title);

    const crumb = page.locator("main a[href='/rule-of-thumb']").first();
    await Promise.all([page.waitForURL(/\/rule-of-thumb$/), crumb.click()]);
    await expect.poll(() => transitionType(page)).toBe("rule-close");
  });

  it("zooms back out onto the home deck's card from a rule's Back to home", async () => {
    const page = await open("/");
    await page.locator("#rules").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Next rule" }).click();
    const card = page.locator("[data-part=stage] a[aria-current]");
    const href = (await card.getAttribute("href"))!;
    await Promise.all([page.waitForURL(new RegExp(`${href}$`)), card.click()]);
    await page.waitForFunction(pageReady);
    await expect.poll(() => transitionType(page)).toBe("rule-open");

    const back = page.locator("main a[data-back]").first();
    expect(await back.innerText()).toContain("Back to home");
    await Promise.all([page.waitForURL(/\/#rules$/), back.click()]);
    await expect.poll(() => transitionType(page)).toBe("rule-close");
    expect(await card.getAttribute("href")).toBe(href);
  });

  it("lays every key flat while it is disabled", async () => {
    const raised: string[] = [];
    for (const route of ["/", "/rule-of-thumb", ...PUBLISHED_GUIDELINES.map(({ href }) => href)]) {
      const page = await open(route);
      await page.addStyleTag({
        content: "*, *::before, *::after { transition: none !important; }",
      });
      const found = await page.evaluate(() => {
        // A hard drop is a shadow cast straight down with no blur, the key's side.
        const hardDrop = (shadow: string) =>
          shadow
            .split(/,(?![^(]*\))/)
            .filter((part) => !part.includes("inset"))
            .some((part) => {
              const [, y = 0, blur = 0] =
                part
                  .replace(/[a-z-]+\([^)]*\)/g, "")
                  .match(/-?[\d.]+px/g)
                  ?.map(parseFloat) ?? [];
              return y > 0 && blur === 0;
            });
        const keys = [...document.querySelectorAll("button")];
        for (const key of keys) key.disabled = true;
        return keys
          .filter((key) => hardDrop(getComputedStyle(key).boxShadow))
          .map((key) => (key.innerText || key.getAttribute("aria-label") || "").trim());
      });
      raised.push(...found.map((name) => `${route} "${name}"`));
    }
    expect(raised).toEqual([]);
  });

  it("keeps a control that moves on hover or press under a pointer at its edge", async () => {
    const { movers, slips } = await edgeSlips(
      await open("/"),
      "header a, header button, main a, main button",
    );
    expect(movers, "controls that move on hover or press").toBeGreaterThan(0);
    expect(slips).toEqual([]);
  }, 120_000);

  // Rule-page demos animate on their own, so only their moving keys are driven here.
  it.each([
    ["/rule-of-thumb/table-design", 'table-states [data-part="act"]'],
    [
      "/rule-of-thumb/null-vs-undefined",
      'null-flow [data-part="remove"], null-flow [data-part="save"]',
    ],
  ])("keeps the moving demo keys on %s under a pointer at their edge", async (route, selector) => {
    const { movers, slips } = await edgeSlips(await open(route), selector);
    expect(movers, "controls that move on hover or press").toBeGreaterThan(0);
    expect(slips).toEqual([]);
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

  it("gives a page its full width from the first frame where scrollbars take up room", async () => {
    const withScrollbars = await chromium.launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });
    try {
      context = await withScrollbars.newContext({ viewport: { width: 1440, height: 900 } });
      await context.addInitScript(() => {
        sessionStorage.setItem("intro-seen", "1");
        const measure = () => {
          const html = document.documentElement;
          const widths = new Set(html.dataset.widths?.split(","));
          html.dataset.widths = [...widths.add(String(html.clientWidth))].join();
          requestAnimationFrame(measure);
        };
        requestAnimationFrame(measure);
      });
      const page = watch(await context.newPage());
      await page.goto(new URL("/rule-of-thumb/button-design", inject("baseURL")).href, {
        waitUntil: "networkidle",
      });
      await page.locator("a[href='/']").first().click();
      await page.waitForURL(new URL("/", inject("baseURL")).href);
      await page.waitForFunction(pageReady);
      expect(await page.locator("html").getAttribute("data-widths")).toBe("1440");
    } finally {
      await context.close();
      await withScrollbars.close();
    }
  });

  it("fits every rule's title in its column before any script runs", async () => {
    context = await browser.newContext({ colorScheme: "light" });
    await context.route("**/*.js", (route) =>
      route.fulfill({ contentType: "text/javascript", body: "" }),
    );
    const page = watch(await context.newPage());
    const misfits: string[] = [];
    for (const rule of PUBLISHED_GUIDELINES) {
      for (const width of [320, 375, 768, 1024, 1280, 1366, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(new URL(rule.href, inject("baseURL")).href, { waitUntil: "load" });
        const fits = await page.evaluate(async () => {
          await document.fonts.load('900 40px "Unbounded"');
          const title = document.querySelector("h1")!;
          const texts = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
          const wordLines: number[] = [];
          while (texts.nextNode()) {
            const text = texts.currentNode;
            for (const word of text.textContent!.matchAll(/\S+/g)) {
              const range = document.createRange();
              range.setStart(text, word.index);
              range.setEnd(text, word.index + word[0].length);
              wordLines.push(new Set([...range.getClientRects()].map(({ top }) => top)).size);
            }
          }
          return (
            wordLines.every((lines) => lines === 1) &&
            title.scrollWidth <= title.parentElement!.clientWidth
          );
        });
        if (!fits) misfits.push(`${rule.id} at ${width}px`);
      }
    }
    expect(misfits).toEqual([]);
  });
});
