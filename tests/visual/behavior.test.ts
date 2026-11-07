import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type ElementHandle, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, inject, it } from "vite-plus/test";
import {
  fixedTime,
  mismatch,
  openSettledPage,
  stableScreenshot,
  writeDiff,
  type Clip,
} from "./page-setup";
import { routeSlug } from "./serve-build";

declare global {
  interface Window {
    __behaviorControls?: Element[];
  }
}

// What each demo does when hovered and activated, pinned as screenshots of the region around the
// control. The control list itself is pinned too: a control appearing or disappearing fails.

type Activation = "click" | "fill" | "slide" | "select" | "hover-only";
type Control = { key: string; activation: Activation };

const baselineDir = path.join(import.meta.dirname, "__behavior__");
const diffDir = path.join(import.meta.dirname, "__diff__", "behavior");
const update = process.env.UPDATE_BEHAVIOR === "1";

// Long enough for hover delays and fake latency to land, short enough that "Copied" style
// feedback (1.4s to 1.6s on the rule pages) is still showing.
const settleMs = 1000;
// Pages open at once across every route; each is a headless Chromium tab on a shared machine.
const pageSlots = 5;

const routes = inject("routes");

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(() => browser?.close());

let freeSlots = pageSlots;
const waiting: (() => void)[] = [];
async function withSlot<T>(work: () => Promise<T>) {
  if (freeSlots > 0) freeSlots--;
  else await new Promise<void>((resolve) => waiting.push(resolve));
  try {
    return await work();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else freeSlots++;
  }
}

/** Runs in the page: every visible control in `main`, open shadow roots included, in DOM order. */
function collectControls() {
  const selector = [
    "button",
    "a[href]",
    "input:not([type=hidden])",
    "select",
    "textarea",
    "summary",
    ...["button", "tab", "switch", "checkbox", "radio", "slider", "option", "menuitem"].map(
      (role) => `[role=${role}]`,
    ),
  ].join(",");
  const isControl = (element: Element) =>
    element.matches(selector) ||
    (element instanceof HTMLElement && element.hasAttribute("tabindex") && element.tabIndex >= 0);
  const textTypes = new Set(["text", "search", "email", "url", "tel", "password", "number"]);
  const found: Element[] = [];
  const visit = (root: ParentNode) => {
    for (const element of root.querySelectorAll("*")) {
      if (isControl(element)) found.push(element);
      if (element.shadowRoot) visit(element.shadowRoot);
    }
  };
  visit(document.querySelector("main")!);
  const controls = found.filter((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      element.checkVisibility({ visibilityProperty: true }) &&
      !element.closest("[inert]")
    );
  });
  window.__behaviorControls = controls;
  return controls.map((element): Activation => {
    if (element instanceof HTMLAnchorElement) {
      const inPage =
        element.origin === location.origin &&
        element.pathname === location.pathname &&
        element.hash !== "";
      return inPage ? "click" : "hover-only";
    }
    if (element instanceof HTMLSelectElement) return "select";
    if (element instanceof HTMLTextAreaElement) return "fill";
    if (element instanceof HTMLInputElement) {
      if (element.type === "range") return "slide";
      if (textTypes.has(element.type)) return "fill";
      return "click";
    }
    if (element.getAttribute("role") === "slider") return "slide";
    return "click";
  });
}

/** Each collected control's role and accessible name as Chromium's accessibility tree has them. */
async function describeControls(page: Page, activations: Activation[]) {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { result } = await cdp.send("Runtime.evaluate", {
      expression: "window.__behaviorControls",
    });
    const { result: items } = await cdp.send("Runtime.getProperties", {
      objectId: result.objectId!,
      ownProperties: true,
    });
    const elements = items.filter((item) => /^\d+$/.test(item.name));
    const seen = new Map<string, number>();
    const controls: Control[] = [];
    for (const [index, item] of elements.entries()) {
      const { node } = await cdp.send("DOM.describeNode", { objectId: item.value!.objectId! });
      const { nodes } = await cdp.send("Accessibility.getPartialAXTree", {
        backendNodeId: node.backendNodeId,
        fetchRelatives: false,
      });
      const role = String(nodes[0]?.role?.value ?? "none");
      const name = String(nodes[0]?.name?.value ?? "")
        .replace(/\s+/g, " ")
        .trim();
      const base = `${role} "${name}"`;
      const occurrence = seen.get(base) ?? 0;
      seen.set(base, occurrence + 1);
      controls.push({ key: `${base} #${occurrence}`, activation: activations[index]! });
    }
    return controls;
  } finally {
    await cdp.detach();
  }
}

async function discover(page: Page) {
  const activations = await page.evaluate(collectControls);
  return describeControls(page, activations);
}

/** File-name stems for each control, unique within the route. */
function shotStems(slug: string, controls: Control[]) {
  const taken = new Set<string>();
  return controls.map(({ key }) => {
    const stem = `${slug}--${key
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80)}`;
    let unique = stem;
    for (let n = 2; taken.has(unique); n++) unique = `${stem}-${n}`;
    taken.add(unique);
    return unique;
  });
}

/**
 * The region's part inside the viewport, in viewport coordinates, or the whole viewport when the
 * region is gone. A capture beyond the viewport resizes it, which drops the hover and moves the
 * page, so a shot never reaches past what a reader sees.
 */
function regionClip(page: Page, region: ElementHandle<Element> | null): Promise<Clip> {
  return page.evaluate((region) => {
    const box = region?.isConnected ? region.getBoundingClientRect() : undefined;
    if (!box || box.width === 0 || box.height === 0) {
      return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    }
    const left = Math.max(0, Math.floor(box.left));
    const top = Math.max(0, Math.floor(box.top));
    const right = Math.min(window.innerWidth, Math.ceil(box.right));
    const bottom = Math.min(window.innerHeight, Math.ceil(box.bottom));
    return { x: left, y: top, width: right - left, height: bottom - top };
  }, region);
}

/**
 * Waits out smooth scrolling, which the browser animates in real time whatever the page clock
 * says. Every scrolled box counts, so a carousel paging itself is waited for too.
 */
async function scrollSettled(page: Page) {
  const offsets = () =>
    page.evaluate(() => {
      const parts = [window.scrollX, window.scrollY];
      for (const element of document.querySelectorAll("*")) {
        if (element.scrollTop || element.scrollLeft)
          parts.push(element.scrollTop, element.scrollLeft);
      }
      return parts.join();
    });
  let previous = await offsets();
  for (let still = 0, polls = 0; still < 3; polls++) {
    if (polls > 100) throw new Error("scrolling never settled");
    await page.waitForTimeout(50);
    const current = await offsets();
    still = current === previous ? still + 1 : 0;
    previous = current;
  }
}

function nearestRegion(control: ElementHandle<Element>) {
  return control.evaluateHandle((element) => {
    let node: Element | null = element;
    while (node) {
      if (node.matches("section, figure, article, [role=region]") && node !== element) return node;
      const root = node.getRootNode();
      node = node.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }
    return null;
  });
}

async function activate(page: Page, control: ElementHandle<Element>, activation: Activation) {
  switch (activation) {
    case "click":
      // A disabled control still takes the click, so the shot pins that nothing happens.
      return control.click({ force: !(await control.isEnabled()) });
    case "fill":
      return control.fill((await control.getAttribute("type")) === "number" ? "42" : "hello");
    case "slide":
      await control.focus();
      for (let press = 0; press < 3; press++) await page.keyboard.press("ArrowRight");
      return;
    case "select": {
      const next = await control.evaluate((select: HTMLSelectElement) =>
        select.options.length ? (select.selectedIndex + 1) % select.options.length : 0,
      );
      await control.selectOption({ index: next });
      return;
    }
    case "hover-only":
      return;
  }
}

type Shot = { name: string; image: Buffer };

async function exercise(route: string, index: number, control: Control, stem: string) {
  const { context, page, errors } = await openSettledPage(browser, {
    route,
    viewport: "desktop",
    scheme: "light",
  });
  try {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // Real time stops here: timers, frames, and idle callbacks run only as the clock is advanced.
    await page.clock.pauseAt(fixedTime);
    const found = await discover(page);
    if (found[index]?.key !== control.key) {
      throw new Error(`control ${index} is ${found[index]?.key} on a fresh page`);
    }
    const handle = (
      await page.evaluateHandle((at) => window.__behaviorControls![at]!, index)
    ).asElement();
    if (!handle) throw new Error(`control ${index} is not an element`);
    const region = (await nearestRegion(handle)).asElement();
    const shots: Shot[] = [];
    const shoot = async (phase: string) => {
      await scrollSettled(page);
      await page.clock.runFor(settleMs);
      await scrollSettled(page);
      const clip = await regionClip(page, region);
      const image = await stableScreenshot(page, clip, `${route} ${control.key}`, {
        fullPage: false,
      });
      shots.push({ name: `${stem}--${phase}.png`, image });
    };
    // Playwright scrolls a control into view with alignments it varies on retry, so every run
    // centres the region first, or the control when the region is taller than the viewport.
    await handle.evaluate((element, region) => {
      const fits = region && region.getBoundingClientRect().height <= window.innerHeight;
      (fits ? region : element).scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "instant",
      });
    }, region);
    await scrollSettled(page);
    await handle.hover();
    await shoot("hover");
    if (control.activation !== "hover-only") {
      await activate(page, handle, control.activation);
      await shoot("activate");
    }
    return { shots, errors };
  } finally {
    await context.close();
  }
}

function readManifest(slug: string): string[] | undefined {
  try {
    return JSON.parse(readFileSync(path.join(baselineDir, `${slug}.json`), "utf8"));
  } catch {
    return undefined;
  }
}

describe.concurrent("demos behave as their baseline screenshots show", () => {
  it.for(routes.map((route) => [routeSlug(route), route] as const))(
    "%s",
    { timeout: 30 * 60_000 },
    async ([slug, route], { expect }) => {
      const controls = await withSlot(async () => {
        const { context, page, errors } = await openSettledPage(browser, {
          route,
          viewport: "desktop",
          scheme: "light",
        });
        try {
          const found = await discover(page);
          expect(errors, "errors logged while the page loaded").toEqual([]);
          return found;
        } finally {
          await context.close();
        }
      });
      expect(controls.length, `${route} has no controls in main`).toBeGreaterThan(0);
      const keys = controls.map((control) => control.key);
      const stems = shotStems(slug, controls);
      const owned = (file: string) => file.startsWith(`${slug}--`) || file === `${slug}.json`;
      if (update) {
        mkdirSync(baselineDir, { recursive: true });
        const manifest = `${JSON.stringify(keys, null, 2)}\n`;
        if (JSON.stringify(readManifest(slug)) !== JSON.stringify(keys))
          writeFileSync(path.join(baselineDir, `${slug}.json`), manifest);
      } else {
        expect(keys, "controls found differ from the manifest").toEqual(readManifest(slug));
      }

      const failures: string[] = [];
      const expectedFiles = [`${slug}.json`];
      await Promise.all(
        controls.map((control, index) =>
          withSlot(async () => {
            try {
              const { shots, errors } = await exercise(route, index, control, stems[index]!);
              if (errors.length) failures.push(`${control.key}: page errors ${errors.join(" | ")}`);
              for (const { name, image } of shots) {
                expectedFiles.push(name);
                const file = path.join(baselineDir, name);
                // An update writes a shot only when it is new or no longer matches, so an update
                // commits only the shots that changed.
                if (update) {
                  if (!existsSync(file) || mismatch(readFileSync(file), image))
                    writeFileSync(file, image);
                  continue;
                }
                let baseline: Buffer;
                try {
                  baseline = readFileSync(file);
                } catch {
                  writeDiff(diffDir, name, image);
                  failures.push(`${name}: no baseline`);
                  continue;
                }
                const result = mismatch(baseline, image);
                if (result) {
                  writeDiff(diffDir, name, image, result.diff);
                  failures.push(`${name}: ${result.reason}`);
                }
              }
            } catch (error) {
              failures.push(`${control.key}: ${error instanceof Error ? error.message : error}`);
            }
          }),
        ),
      );
      expect(failures, `see ${diffDir}`).toEqual([]);
      const stored = readdirSync(baselineDir).filter(owned).sort();
      if (update) {
        // Every control ran, so a baseline no shot wrote belongs to a control that is gone.
        for (const file of stored.filter((file) => !expectedFiles.includes(file)))
          rmSync(path.join(baselineDir, file));
      } else {
        expect(stored, "baselines without a control").toEqual(expectedFiles.sort());
      }
    },
  );
});

// The checks above cover each page's own files. An update also drops a removed page's baselines.
const slugs = routes.map(routeSlug);
const ownedByPage = (file: string) =>
  slugs.some((slug) => file.startsWith(`${slug}--`) || file === `${slug}.json`);
afterAll(() => {
  if (!update) return;
  for (const file of readdirSync(baselineDir).filter((file) => !ownedByPage(file)))
    rmSync(path.join(baselineDir, file));
});
it.skipIf(update)("every baseline belongs to a page", () => {
  expect(readdirSync(baselineDir).filter((file) => !ownedByPage(file))).toEqual([]);
});
