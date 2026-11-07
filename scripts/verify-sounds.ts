import { mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Page } from "playwright";
import { pageReady } from "../tests/visual/ready.ts";
import { serveSite, SITE_ROOT } from "../tests/visual/serve-build.ts";

const { values } = parseArgs({ options: { shots: { type: "string" } } });

declare global {
  interface Window {
    played: string[];
    playedAt: number[];
    revealedAt: number;
    activeAtHover: boolean[];
  }
}

// Tags each clip's bytes by the URL they came from, then the AudioBuffer they decode to, so every
// AudioBufferSourceNode.start can be logged by cue. Two clips share a duration, so length can't.
function recordPlays() {
  const tags = new WeakMap<object, string>();
  const arrayBuffer = Response.prototype.arrayBuffer;
  Response.prototype.arrayBuffer = async function () {
    const bytes = await arrayBuffer.call(this);
    const cue = /\/sounds\/(\w+)\.mp3$/.exec(this.url)?.[1];
    if (cue) tags.set(bytes, cue);
    return bytes;
  };
  const decode = BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData = async function (bytes: ArrayBuffer) {
    const cue = tags.get(bytes);
    const buffer = await decode.call(this, bytes);
    if (cue) tags.set(buffer, cue);
    return buffer;
  };
  window.played = [];
  window.playedAt = [];
  addEventListener("pagereveal", () => (window.revealedAt = performance.now()));
  window.activeAtHover = [];
  document.addEventListener(
    "pointerover",
    (event) => {
      if (event.target instanceof Element && event.target.closest("[data-cut]"))
        window.activeAtHover.push(navigator.userActivation.hasBeenActive);
    },
    { capture: true },
  );
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    window.played.push((this.buffer && tags.get(this.buffer)) ?? "untagged");
    window.playedAt.push(performance.now());
    return start.apply(this, args);
  };
}

const site = await serveSite(SITE_ROOT);
const browser = await chromium.launch();
const failures: string[] = [];
const logs: string[] = [];

function check(ok: boolean, label: string, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${detail ? `  ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

async function open(page: Page, route: string) {
  await page.goto(site.url + route);
  await page.waitForFunction(pageReady);
  // The clips load once the browser is idle.
  await page.waitForTimeout(400);
}

// Settles past the 150ms a decoding cue may wait, then returns and clears what played.
async function heard(page: Page) {
  await page.waitForTimeout(250);
  return page.evaluate(() => window.played.splice(0));
}

async function expectHeard(page: Page, label: string, want: string[]) {
  const got = await heard(page);
  check(JSON.stringify(got) === JSON.stringify(want), label, `heard ${JSON.stringify(got)}`);
}

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });
  await context.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
  await context.addInitScript(recordPlays);
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error")
      logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => logs.push(`pageerror: ${error.message}`));

  // Playwright's evaluate and locators count as a user gesture, so this first look at the page
  // waits and moves the mouse by hand.
  await page.goto(`${site.url}/rule-of-thumb`);
  await page.waitForTimeout(800);
  for (let y = 100; y < 900; y += 40) await page.mouse.move(700, y);
  const before = await page.evaluate(() => ({
    active: window.activeAtHover,
    played: window.played.splice(0),
  }));
  check(
    before.active.length > 0 && !before.active.includes(true) && before.played.length === 0,
    "hovering rule tiles before any gesture plays nothing",
    JSON.stringify(before),
  );

  const tiles = page.locator("[data-cut][href^='/rule-of-thumb/']");

  const chip = page.locator("main button").filter({ hasText: /\S/ }).first();
  await chip.click();
  await expectHeard(page, "a button click plays tap", ["tap"]);
  await tiles.nth(0).hover();
  await expectHeard(
    page,
    "entering the rule grid plays move, then the lamp's two flicker crackles",
    ["move", "flicker", "flicker"],
  );
  await tiles.nth(1).hover();
  await page.waitForTimeout(60);
  await tiles.nth(2).hover();
  await expectHeard(page, "moving across lit tiles plays move per tile, no flicker", [
    "move",
    "move",
  ]);
  await tiles.nth(2).hover({ position: { x: 4, y: 4 } });
  await expectHeard(page, "staying on one tile plays nothing", []);

  const theme = page.locator('site-header [data-part="theme"]');
  await theme.click();
  await expectHeard(page, "theme to light plays on", ["on"]);
  await page.waitForTimeout(600);
  await theme.click();
  await expectHeard(page, "theme to dark plays off", ["off"]);
  await page.waitForTimeout(600);

  await page.locator('site-header [data-part="search"]').click();
  await page.waitForTimeout(300);
  await expectHeard(page, "search button opens the palette with open, no tap", ["open"]);
  await page.keyboard.press("ArrowDown");
  await expectHeard(page, "palette ArrowDown plays move", ["move"]);
  await page.locator("command-palette [role=option]").first().hover();
  await expectHeard(page, "palette pointer highlight plays move", ["move"]);
  await page.locator("command-palette [role=option][data-submenu]").hover();
  await expectHeard(page, "pointing at another option plays move again", ["move"]);
  await page.keyboard.press("ArrowRight");
  await expectHeard(page, "palette ArrowRight into the submenu plays enter", ["enter"]);
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowLeft");
  await expectHeard(page, "palette ArrowLeft back plays back", ["back"]);
  await page.waitForTimeout(300);
  await page.locator("command-palette [role=option][data-submenu]").click();
  await expectHeard(page, "clicking a submenu option plays enter, no tap", ["enter"]);
  await page.waitForTimeout(300);
  await page.locator('command-palette [data-part="back"]').click();
  await expectHeard(page, "the palette's back button plays back, no tap", ["back"]);
  await page.waitForTimeout(300);
  await page.keyboard.press("Escape");
  await expectHeard(page, "Escape closes the palette with close", ["close"]);
  await page.waitForTimeout(600);
  await page.keyboard.press("Meta+k");
  await expectHeard(page, "⌘K opens the palette with open", ["open"]);
  await page.waitForTimeout(300);
  await page.keyboard.press("Meta+k");
  await expectHeard(page, "⌘K again closes it with close", ["close"]);
  await page.waitForTimeout(600);

  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: site.url });
  await page.keyboard.press("Meta+k");
  await page.waitForTimeout(300);
  const copy = page.locator("command-palette [role=option][data-copy]");
  await copy.hover();
  await heard(page);
  await copy.click();
  await expectHeard(page, "copying the email plays success, no tap", ["success"]);
  await page.waitForTimeout(2000);
  await expectHeard(
    page,
    "the palette closing itself after the copy stays quiet, the tile it uncovers too",
    [],
  );

  await chip.focus();
  await page.keyboard.press("Enter");
  await expectHeard(page, "Enter on a focused button plays tap once", ["tap"]);

  await open(page, "/rule-of-thumb/proximity-principle");
  const quiz = page.locator("rule-quiz").first();
  await quiz.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const answer = await quiz.getAttribute("data-answer");
  const piece = quiz.locator('[data-part="piece"]');
  check((await piece.count()) === 1, "the quiz has a piece to pick up");
  const wrong = quiz.locator(`[data-slot]:not([data-slot="${answer}"])`).first();
  const right = quiz.locator(`[data-slot="${answer}"]`);
  await piece.click();
  await expectHeard(page, "picking up the quiz piece plays lift", ["lift"]);
  await page.keyboard.press("Escape");
  await expectHeard(page, "Esc puts the piece back with place", ["place"]);
  await piece.click();
  await expectHeard(page, "picking it up again plays lift", ["lift"]);
  await wrong.click();
  await expectHeard(page, "a quiz miss plays error, no tap", ["error"]);
  await page.waitForTimeout(500);
  const from = (await piece.boundingBox())!;
  const over = (await wrong.boundingBox())!;
  const slotBoxes = await Promise.all(
    (await quiz.locator("[data-slot]").all()).map(async (slot) => (await slot.boundingBox())!),
  );
  const [cx, cy] = [from.x + from.width / 2, from.y + from.height / 2];
  // Somewhere on screen well past the quiz's 48px snap reach of every slot.
  const spots: [number, number][] = [
    [cx, cy + 220],
    [cx, cy - 220],
    [cx - 360, cy],
    [cx + 360, cy],
  ];
  const away = spots.find(([x, y]) =>
    slotBoxes.every(
      (box) =>
        Math.hypot(
          Math.max(box.x - x, 0, x - box.x - box.width),
          Math.max(box.y - y, 0, y - box.y - box.height),
        ) > 120,
    ),
  )!;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(over.x + over.width / 2, over.y + over.height / 2, { steps: 12 });
  await page.mouse.move(away[0], away[1], { steps: 12 });
  await page.mouse.up();
  const dragged = await heard(page);
  check(
    dragged[0] === "lift" &&
      dragged.at(-1) === "place" &&
      dragged.slice(1, -1).length > 0 &&
      dragged.slice(1, -1).every((cue) => cue === "move"),
    "dragging the piece plays lift, move over slots, place when let go away from them",
    `heard ${JSON.stringify(dragged)}`,
  );
  await page.waitForTimeout(500);
  await piece.click();
  await expectHeard(page, "a third pickup plays lift", ["lift"]);
  await right.click();
  await expectHeard(page, "a quiz hit plays success, no tap", ["success"]);

  // The dive: the rule page it lands on plays it, so read what that page heard.
  await open(page, "/rule-of-thumb");
  const tile = page.locator("[data-cut][href^='/rule-of-thumb/']").first();
  await tile.hover();
  await page.waitForTimeout(300);
  await tile.click();
  await page.waitForURL(/\/rule-of-thumb\/.+/);
  await page.waitForTimeout(800);
  const landed = await page.evaluate(() => ({
    played: window.played.splice(0),
    after: Math.round(window.playedAt[0]! - window.revealedAt),
  }));
  check(
    JSON.stringify(landed.played) === '["dive"]' && landed.after < 250,
    "a tile's dive into a rule plays dive on the rule page as the transition starts",
    JSON.stringify(landed),
  );
  await page.locator("main a[href='/rule-of-thumb']").first().click();
  await page.waitForURL(/\/rule-of-thumb$/);
  await page.waitForTimeout(800);
  await expectHeard(page, "All rules zooms back out to the index with rise", ["rise"]);
  await page.goto(page.url().replace(/\/rule-of-thumb$/, "/rule-of-thumb/proximity-principle"));
  await page.waitForTimeout(800);
  await expectHeard(page, "loading a rule page directly plays nothing", []);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/rule-of-thumb");
  await tile.click();
  await page.waitForURL(/\/rule-of-thumb\/.+/);
  await page.waitForTimeout(800);
  await expectHeard(page, "with reduced motion the page fades in without the dive", []);
  await page.emulateMedia({ reducedMotion: null });

  // The work history on the home page sounds a job opening and closing.
  await open(page, "/");
  const jobs = page.locator("experience-list > * > h3 > button");
  await jobs.nth(1).scrollIntoViewIfNeeded();
  await jobs.nth(1).click();
  await expectHeard(page, "opening a job plays expand, no tap", ["expand"]);
  await page.waitForTimeout(500);
  await jobs.nth(1).click();
  await expectHeard(page, "closing the open job plays collapse", ["collapse"]);

  const sound = page.locator('site-header [data-part="sound"]');
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(400);
  check((await sound.getAttribute("aria-pressed")) === "true", "sound starts on");
  await sound.click();
  await expectHeard(page, "turning sound off plays off", ["off"]);
  check((await sound.getAttribute("aria-pressed")) === "false", "sound button shows off");
  await theme.click();
  await page.waitForTimeout(600);
  await page.locator("main a[href], main button").first().hover();
  await page.locator('site-header [data-part="search"]').click();
  await page.waitForTimeout(300);
  await page.keyboard.press("Escape");
  await expectHeard(page, "with sound off, clicks and the palette play nothing", []);
  await page.waitForTimeout(600);

  await page.reload();
  await page.waitForFunction(pageReady);
  await page.waitForTimeout(400);
  check(
    await page.evaluate(() => document.documentElement.classList.contains("sound-off")),
    "after reload the root is .sound-off",
  );
  check((await sound.getAttribute("aria-pressed")) === "false", "after reload the button is off");
  const glyphs = await sound
    .locator("svg")
    .evaluateAll((svgs) => svgs.map((svg) => getComputedStyle(svg).opacity));
  check(
    JSON.stringify(glyphs) === '["0","1"]',
    "after reload the slash glyph shows",
    glyphs.join(),
  );
  await theme.click();
  await expectHeard(page, "after reload, clicks still play nothing", []);
  await page.waitForTimeout(600);
  await sound.click();
  await expectHeard(page, "turning sound back on plays on", ["on"]);
  await theme.click();
  await expectHeard(page, "and the theme toggle sounds again (dark to light)", ["on"]);
  await context.close();

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await phone.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
  await phone.addInitScript(recordPlays);
  const small = await phone.newPage();
  small.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error")
      logs.push(`${message.type()}: ${message.text()}`);
  });
  // The menu button shows only once the header folds, which needs a page long enough to scroll.
  await open(small, "/rule-of-thumb");
  await small.mouse.wheel(0, 600);
  const menu = small.locator('site-header [data-part="menu"]');
  await menu.waitFor({ state: "visible" });
  await small.waitForTimeout(700);
  await menu.click();
  await expectHeard(small, "the header menu opens with open, no tap", ["open"]);
  await small.waitForTimeout(700);
  await menu.click();
  await expectHeard(small, "and closes with close", ["close"]);
  await small.waitForTimeout(700);
  await menu.click();
  await small.waitForTimeout(700);
  await heard(small);
  await small.keyboard.press("Escape");
  await expectHeard(small, "Escape closes the header menu with close", ["close"]);
  await phone.close();

  if (values.shots) {
    mkdirSync(values.shots, { recursive: true });
    for (const [viewport, size] of [
      ["desktop", { width: 1440, height: 900 }],
      ["mobile", { width: 390, height: 844 }],
    ] as const) {
      for (const scheme of ["light", "dark"] as const) {
        const shots = await browser.newContext({ viewport: size, reducedMotion: "reduce" });
        await shots.addInitScript((theme) => {
          localStorage.setItem("theme", theme);
          sessionStorage.setItem("intro-seen", "1");
        }, scheme);
        const shot = await shots.newPage();
        await open(shot, "/rule-of-thumb");
        const clip = { x: 0, y: 0, width: size.width, height: 120 };
        const file = (state: string) =>
          path.join(values.shots!, `${viewport}-${scheme}-${state}.png`);
        await shot.screenshot({ path: file("top"), clip });
        await shot.evaluate(() => scrollTo(0, 800));
        await shot.waitForTimeout(900);
        await shot.screenshot({ path: file("scrolled"), clip });
        await shot.evaluate(() => localStorage.setItem("sound", "off"));
        await shot.reload();
        await shot.waitForTimeout(900);
        await shot.screenshot({ path: file("muted"), clip });
        await shots.close();
      }
    }
  }
} finally {
  await browser.close();
  await site.close();
}

check(logs.length === 0, "no console warnings or errors", logs.join(" | "));
if (failures.length) {
  console.log(`\n${failures.length} failed`);
  process.exit(1);
}
console.log("\nall passed");
