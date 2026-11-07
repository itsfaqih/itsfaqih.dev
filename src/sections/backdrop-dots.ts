import { TILE, U } from "./backdrop-dots.css";
import { REDUCE } from "../browser/media-query";
const PALETTE = ["--cw", "--ux", "--ar", "--ts", "--ax", "--go"];
// A press draws the dots around it in and colours them, and lets go once the button comes up.
const PRESS_RADIUS = 200;
const PRESS_PULL = 0.6;
const PRESS_RISE = 140;
const PRESS_RELEASE = 900;
// While held, a press follows the pointer, easing after it at this rate per second.
const PRESS_FOLLOW = 16;
const MAX_PRESSES = 4;
// A lit dot swells up to the prints' own ratio of dot to screen.
const DOT = 2;
const DOT_LIFT = 3.5;
// The tide: three slow waves cross the page, and the dots under their sum swell like a print's
// screen under shifting ink. Each wave is [x frequency, y frequency, speed], per px and per second.
const TIDE_WAVES = [
  [0.0065, 0, 0.55],
  [0, 0.0085, -0.42],
  [0.0029, -0.0038, 0.31],
] as const;
// Dots swell above the tide's middle; only the crests, its top quarter, take a tint.
const TIDE_SWELL = 0.5;
const TIDE_CREST = 0.76;
const TIDE_LIFT = 0.6;
const TIDE_ALPHA = 0.6;
// Crests dither from --cw at the left edge to --ax at the right.
const TIDE_HUES = [1 + PALETTE.indexOf("--cw"), 1 + PALETTE.indexOf("--ax")] as const;
// A glow tints the dots around a box in its hue: fullest at the box's edge, gone GLOW_REACH px out,
// or less on a narrow screen, so the hue still fades out before the screen's edge.
// A new hue fades in over the old one in GLOW_FADE ms.
const GLOW_REACH = 240;
const GLOW_REACH_WIDTH = 0.3;
const GLOW_ALPHA = 0.95;
const GLOW_LIFT = 0.45;
const GLOW_FADE = 600;
// A glow from inside a box has less edge to spread along, so it reaches this much further.
const GLOW_SOURCE_REACH = 1.6;
// A light turns on the first time its source enters the viewport: each dot flickers on like a tube,
// the dots nearest the source first, scattered so they don't light as a ring.
const BLIP: readonly (readonly [ms: number, level: number])[] = [
  [0, 0],
  [45, 1],
  [90, 0.25],
  [150, 1],
  [200, 0.6],
  [320, 1],
];
const BLIP_SPREAD = 350;
const BLIP_SCATTER = 350;
const BLIP_SPAN = BLIP_SPREAD + BLIP_SCATTER + BLIP[BLIP.length - 1]![0];
// How far into the viewport a source rises from below before it turns on, so the blip plays in view.
const BLIP_VIEW_INSET = 0.1;
// Once on, each lit dot breathes between full and this much dimmer, on its own period and phase.
const BREATH_DEPTH = 0.55;
const BREATH_MIN_MS = 3200;
const BREATH_MAX_MS = 5600;
// Breathing is slow, so while nothing else moves the canvas redraws at about 30fps.
const IDLE_FRAME_MS = 33;
// Lit dots are filled in this many alpha steps, so a frame fills a few paths rather than one per dot.
const TINT_STEPS = 24;

type Box = { left: number; right: number; top: number; bottom: number };
/** Part of a box, as fractions of its width and height: [left, top, right, bottom]. */
type GlowArea = readonly [left: number, top: number, right: number, bottom: number];
type Glow = { box: Element; hue: string; from?: GlowArea; strength: number; since: number };

// Each source's glows, newest last. A glow stays until a newer one has fully faded in over it.
const glowSources = new Map<string, Glow[]>();
// When each source's light turned on. A source not here yet hasn't entered the viewport.
const turnedOn = new Map<string, number>();
let onGlow = () => {};

/**
 * Tints the backdrop's dots around `box` in `hue`, a CSS colour, or clears the source's glow when
 * `box` is null. With `from`, the glow spreads from that part of the box instead of its edges.
 * `strength` scales how much the dots tint and swell, from 0 to 1.
 * Sources light the dots side by side, and a new glow fades in over the same source's last one.
 * Call it again as the box moves, so the dots follow it.
 */
export function glowDots(
  source: string,
  box: Element | null,
  hue = "",
  from?: GlowArea,
  strength = 1,
) {
  const glows = glowSources.get(source) ?? [];
  const newest = glows.at(-1);
  if (box && newest?.box === box && newest.hue === hue) return onGlow();
  if (box) {
    const now = performance.now();
    let covered = glows.length - 1;
    while (covered > 0 && now - glows[covered]!.since < GLOW_FADE) covered--;
    // A source's first glow comes on with its blip; only a later one fades in over the last.
    glowSources.set(source, [
      ...glows.slice(Math.max(0, covered)),
      { box, hue, from, strength, since: newest ? now : -Infinity },
    ]);
  } else {
    glowSources.delete(source);
    turnedOn.delete(source);
  }
  onGlow();
}

/** Whether grid step (p, q) holds a dot of the turned screen. */
const onScreen = (p: number, q: number) => (3 * p + q) % 10 === 0;
/** A steady 0..1 per dot of the page, for dithering and for setting dots apart in time. */
const grain = (p: number, pageQ: number) => {
  const hash = Math.sin(p * 127.1 + pageQ * 311.7) * 43_758.5453;
  return hash - Math.floor(hash);
};

/** How far on a dot is, `ms` into its blip. */
const blipLevel = (ms: number) => {
  if (ms <= 0) return 0;
  const end = BLIP.findIndex(([at]) => at >= ms);
  if (end < 0) return 1;
  const [fromMs, fromLevel] = BLIP[end - 1]!;
  const [toMs, toLevel] = BLIP[end]!;
  return fromLevel + ((toLevel - fromLevel) * (ms - fromMs)) / (toMs - fromMs);
};

/**
 * Livens the backdrop's grid and canvas under `element`: the grid slides with the page, the tide
 * swells its dots, and a press draws the dots around it in. Returns the stop.
 */
export function animateDots(element: Element, withTide: boolean) {
  const grid = element.querySelector("i");
  const canvas = element.querySelector("canvas");
  const context = canvas?.getContext("2d");
  if (!grid) return;

  let shift = 0;
  let scrolledRows = 0;
  let redraw = () => {};
  const scroll = () => {
    shift = scrollY % TILE;
    scrolledRows = Math.floor(scrollY / TILE) * 10;
    grid.style.transform = `translateY(${-shift}px)`;
    redraw();
  };
  scroll();
  addEventListener("scroll", scroll, { passive: true });
  if (!canvas || !context) return () => removeEventListener("scroll", scroll);

  // colours[0] is the theme's --dot and the rest the palette's.
  let colours: string[] = [];
  let scale = 1;
  const resolve = (value: string) => {
    canvas.style.color = value;
    return getComputedStyle(canvas).color;
  };
  const inkOf = (value: string) =>
    resolve(`color-mix(in oklab, ${value} calc(var(--ink-mix) + 20%), #000)`);
  const glowInk = new Map<string, string>();
  const paint = () => {
    glowInk.clear();
    colours = [resolve("var(--dot)"), ...PALETTE.map((name) => inkOf(`var(${name})`))];
    const tile = document.createElement("canvas");
    tile.width = tile.height = TILE * scale;
    const ink = tile.getContext("2d");
    if (!ink) return;
    ink.scale(scale, scale);
    ink.fillStyle = colours[0]!;
    for (let q = 0; q < 10; q++)
      for (let p = 0; p < 10; p++) {
        if (!onScreen(p, q)) continue;
        ink.beginPath();
        ink.arc(p * U + U / 2, q * U + U / 2, DOT, 0, Math.PI * 2);
        ink.fill();
      }
    grid.style.backgroundImage = `url(${tile.toDataURL()})`;
  };
  const resize = () => {
    // Whole device pixels per CSS pixel, so the tile's edges land on the screen's grid.
    const next = Math.max(1, Math.round(Math.min(2, devicePixelRatio)));
    canvas.width = innerWidth * next;
    canvas.height = innerHeight * next;
    if (next === scale && colours.length) return;
    scale = next;
    paint();
  };
  resize();
  const theme = new MutationObserver(() => {
    paint();
    draw();
  });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const onResize = () => {
    resize();
    draw();
  };
  addEventListener("resize", onResize);
  const still = matchMedia(REDUCE);

  let presses: {
    x: number;
    pageY: number;
    to: { x: number; pageY: number };
    start: number;
    end?: number;
  }[] = [];
  let drawn = performance.now();
  let frame = 0;
  // What the last draw found: lit dots on screen, and a blip still playing.
  let lighting = false;
  let blipping = false;
  // A wake always draws, however recent the last draw, so its change can't be skipped as it sleeps.
  let woken = false;

  // Each dot keeps its hue while the page scrolls, keyed by its place on the turned screen.
  const hueOf = (p: number, pageQ: number) => {
    const along = (3 * p + pageQ) / 10;
    const across = (3 * pageQ - p) / 10;
    const hash = (along * 7 + across * 13) ^ (along * across);
    return 1 + (((hash % PALETTE.length) + PALETTE.length) % PALETTE.length);
  };

  const prune = (now: number) => {
    presses = presses.filter((press) => press.end === undefined || now - press.end < PRESS_RELEASE);
  };

  const draw = (now = performance.now()) => {
    prune(now);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, innerWidth, innerHeight);
    // Pulls are motion, so reduced motion keeps only the colour.
    const pulling = still.matches ? 0 : 1;
    const follow = 1 - Math.exp(-PRESS_FOLLOW * Math.min(0.05, (now - drawn) / 1000));
    drawn = now;
    for (const press of presses) {
      press.x += (press.to.x - press.x) * follow;
      press.pageY += (press.to.pageY - press.pageY) * follow;
    }
    const grips = presses.map((press) => {
      const rise = Math.min(1, (now - press.start) / PRESS_RISE);
      const held = press.end === undefined ? 1 : 1 - (now - press.end) / PRESS_RELEASE;
      return {
        x: press.x,
        y: press.pageY - scrollY,
        strength: rise * (2 - rise) * held * held,
      };
    });
    const time = now / 1000;
    const tiding = withTide && !still.matches;
    const width = document.documentElement.clientWidth;
    const phases = TIDE_WAVES.map(([, , speed]) => time * speed);
    const reach = Math.min(GLOW_REACH, innerWidth * GLOW_REACH_WIDTH);
    // Each glow's box and weight: a glow fades in over its first GLOW_FADE ms, and gives way as
    // each newer one of its source fades in over it.
    const lit = [...glowSources].flatMap(([source, glows]) =>
      glows.flatMap((glow, index) => {
        const weight = glows
          .slice(index + 1)
          .reduce(
            (left, newer) => left * (1 - Math.min(1, (now - newer.since) / GLOW_FADE)),
            Math.min(1, (now - glow.since) / GLOW_FADE),
          );
        const rect = glow.box.getBoundingClientRect();
        if (weight < 0.01 || rect.width === 0) return [];
        const [left, top, right, bottom] = glow.from ?? [0, 0, 1, 1];
        const box: Box = {
          left: rect.left + rect.width * left,
          right: rect.left + rect.width * right,
          top: rect.top + rect.height * top,
          bottom: rect.top + rect.height * bottom,
        };
        const spread = glow.from ? reach * GLOW_SOURCE_REACH : reach;
        if (box.bottom < -spread || box.top > innerHeight + spread) return [];
        let on = turnedOn.get(source);
        if (on === undefined) {
          // Above the viewport, half the glow's reach still leaves its brightest dots in view.
          const seen = box.top <= innerHeight * (1 - BLIP_VIEW_INSET) && box.bottom >= -spread / 2;
          if (!still.matches && !seen) return [];
          on = still.matches ? -Infinity : now;
          turnedOn.set(source, on);
        }
        let colour = glowInk.get(glow.hue);
        if (!colour) glowInk.set(glow.hue, (colour = inkOf(glow.hue)));
        const paths: Path2D[] = [];
        return [{ box, spread, weight: weight * glow.strength, on, colour, paths }];
      }),
    );
    lighting = lit.length > 0;
    blipping = lit.some(({ on }) => now - on < BLIP_SPAN);
    const nearness = (glow: (typeof lit)[number], x: number, y: number, scatter: number) => {
      const dx = Math.max(glow.box.left - x, 0, x - glow.box.right);
      const dy = Math.max(glow.box.top - y, 0, y - glow.box.bottom);
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / glow.spread);
      const blip =
        now - glow.on < BLIP_SPAN
          ? blipLevel(now - glow.on - (1 - near) * BLIP_SPREAD - scatter * BLIP_SCATTER)
          : 1;
      return near * near * glow.weight * blip;
    };

    // Presses move dots off their places, so the canvas then draws the whole screen in place of the
    // grid. The tide only swells dots, so it draws them over the grid.
    const moving = grips.length > 0;
    grid.style.visibility = moving ? "hidden" : "";
    const regions: Box[] =
      moving || tiding
        ? [{ left: 0, right: innerWidth, top: 0, bottom: innerHeight }]
        : lit.map(({ box, spread }) => ({
            left: box.left - spread,
            right: box.right + spread,
            top: box.top - spread,
            bottom: box.bottom + spread,
          }));
    // Every drawn dot goes in one path of the theme's --dot; tints go on top, one path per hue and
    // alpha step.
    const base = new Path2D();
    const tints = new Map<number, Path2D>();

    regions.forEach((region, index) => {
      const earlier = regions.slice(0, index);
      const firstP = Math.max(0, Math.floor(region.left / U));
      const lastX = Math.min(innerWidth + U, region.right);
      const firstQ = Math.max(0, Math.floor((region.top + shift) / U));
      const lastY = Math.min(innerHeight + U, region.bottom);
      for (let q = firstQ; q * U - shift <= lastY; q++) {
        const pageQ = q + scrolledRows;
        // Only every tenth step of a row is on the screen; start from the first one past firstP.
        const offset = (((-7 * q - firstP) % 10) + 10) % 10;
        for (let p = firstP + offset; p * U <= lastX; p += 10) {
          const x = p * U + U / 2;
          const y = q * U + U / 2 - shift;
          const inside = (box: Box) =>
            x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
          if (earlier.some(inside)) continue;

          let dotX = x;
          let dotY = y;
          let gripped = 0;
          for (const grip of grips) {
            const distance = Math.hypot(grip.x - x, grip.y - y);
            if (distance >= PRESS_RADIUS) continue;
            const near = 1 - distance / PRESS_RADIUS;
            gripped = Math.max(gripped, near * near * grip.strength);
            const pull = near ** 1.5 * grip.strength * PRESS_PULL * pulling;
            dotX += (grip.x - x) * pull;
            dotY += (grip.y - y) * pull;
          }
          let swell = 0;
          let crest = 0;
          if (tiding) {
            const pageY = y + scrollY;
            const sum = TIDE_WAVES.reduce(
              (total, [fx, fy], index) => total + Math.sin(x * fx + pageY * fy + phases[index]!),
              0,
            );
            const level = (sum + TIDE_WAVES.length) / (2 * TIDE_WAVES.length);
            swell = Math.max(0, (level - TIDE_SWELL) / (1 - TIDE_SWELL));
            crest = Math.max(0, (level - TIDE_CREST) / (1 - TIDE_CREST)) ** 1.5;
          }

          const scatter = lit.length ? grain(p, pageQ) : 0;
          let glowing = 0;
          for (const glow of lit) glowing = Math.max(glowing, nearness(glow, x, y, scatter));
          const lift = Math.min(
            1,
            Math.max(gripped, swell * swell * TIDE_LIFT, glowing * GLOW_LIFT),
          );
          const tint = Math.min(1, Math.max(gripped * 1.6, crest * TIDE_ALPHA));
          if (tint < 0.01 && lift < 0.02 && glowing < 0.01) {
            if (!moving) continue;
            base.moveTo(dotX + DOT, dotY);
            base.arc(dotX, dotY, DOT, 0, Math.PI * 2);
            continue;
          }
          const radius = DOT + lift * DOT_LIFT;
          base.moveTo(dotX + radius, dotY);
          base.arc(dotX, dotY, radius, 0, Math.PI * 2);
          let breath = 1;
          if (glowing >= 0.01 && !still.matches) {
            const period = BREATH_MIN_MS + grain(pageQ, p) * (BREATH_MAX_MS - BREATH_MIN_MS);
            const wave = Math.sin((now / period + scatter) * Math.PI * 2);
            breath = 1 - BREATH_DEPTH * (0.5 + wave / 2);
          }
          for (const glow of lit) {
            const step = Math.round(
              nearness(glow, x, y, scatter) * breath * GLOW_ALPHA * TINT_STEPS,
            );
            if (step < 1) continue;
            const path = (glow.paths[step] ??= new Path2D());
            path.moveTo(dotX + radius, dotY);
            path.arc(dotX, dotY, radius, 0, Math.PI * 2);
          }
          if (tint < 0.01) continue;
          const hue =
            crest * TIDE_ALPHA > gripped * 1.6
              ? TIDE_HUES[grain(p, pageQ) < x / width ? 1 : 0]
              : hueOf(p, pageQ);
          const key = hue * 100 + Math.max(1, Math.round(tint * TINT_STEPS));
          let path = tints.get(key);
          if (!path) tints.set(key, (path = new Path2D()));
          path.moveTo(dotX + radius, dotY);
          path.arc(dotX, dotY, radius, 0, Math.PI * 2);
        }
      }
    });

    context.globalAlpha = 1;
    context.fillStyle = colours[0]!;
    context.fill(base);
    for (const glow of lit) {
      context.fillStyle = glow.colour;
      glow.paths.forEach((path, step) => {
        context.globalAlpha = step / TINT_STEPS;
        context.fill(path);
      });
    }
    for (const [key, path] of tints) {
      context.globalAlpha = (key % 100) / TINT_STEPS;
      context.fillStyle = colours[Math.floor(key / 100)]!;
      context.fill(path);
    }
  };

  const fading = (now: number) =>
    [...glowSources.values()].some((glows) => glows.some((glow) => now - glow.since < GLOW_FADE));
  const tick = (now: number) => {
    const busy = (withTide && !still.matches) || presses.length || fading(now) || blipping;
    if (busy || woken || now - drawn >= IDLE_FRAME_MS) draw(now);
    woken = false;
    const live = busy || blipping || (lighting && !still.matches);
    frame = live ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (frame) return;
    woken = true;
    frame = requestAnimationFrame(tick);
  };
  redraw = () => {
    if (frame || glowSources.size) draw();
    // A scroll can bring a light into view while the loop sleeps.
    if (lighting && !still.matches) wake();
  };
  onGlow = wake;

  // A wheel or key scroll slides the page under a still pointer and fires no pointermove, so a held
  // press also follows the pointer's place on the page as it scrolls.
  let pointer: { x: number; y: number } | null = null;
  const lay = (x: number, clientY: number) => {
    const pageY = clientY + scrollY;
    for (const press of presses) if (press.end === undefined) press.to = { x, pageY };
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointer = { x: event.clientX, y: event.clientY };
    lay(pointer.x, pointer.y);
  };
  const glide = () => {
    if (pointer) lay(pointer.x, pointer.y);
  };
  const leave = (event: PointerEvent) => {
    if (!event.relatedTarget) pointer = null;
  };
  const press = (event: PointerEvent) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    const at = { x: event.clientX, pageY: event.clientY + scrollY };
    presses.push({ ...at, to: at, start: performance.now() });
    if (presses.length > MAX_PRESSES) presses.shift();
    wake();
  };
  const release = () => {
    const now = performance.now();
    for (const press of presses) press.end ??= now;
  };

  const hover = matchMedia("(hover: hover)").matches;
  if (hover) {
    addEventListener("pointermove", move, { passive: true });
    addEventListener("scroll", glide, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    addEventListener("pointerdown", press, { capture: true, passive: true });
    addEventListener("pointerup", release, { capture: true, passive: true });
    addEventListener("pointercancel", release, { capture: true, passive: true });
    addEventListener("blur", release);
  }
  if (withTide || glowSources.size) wake();
  return () => {
    onGlow = () => {};
    theme.disconnect();
    removeEventListener("scroll", scroll);
    removeEventListener("resize", onResize);
    cancelAnimationFrame(frame);
    removeEventListener("pointermove", move);
    removeEventListener("scroll", glide);
    document.removeEventListener("pointerout", leave);
    removeEventListener("pointerdown", press, { capture: true });
    removeEventListener("pointerup", release, { capture: true });
    removeEventListener("pointercancel", release, { capture: true });
    removeEventListener("blur", release);
  };
}
