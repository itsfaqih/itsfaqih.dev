import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// The dots sit on a halftone screen like the hero's prints: a square grid turned by atan(1/3),
// about 18°. At that angle the screen repeats every ten steps of U, so it still tiles.
const U = 5;
const TILE = U * 10;
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
// The dots the pointer leaves behind light up and gather onto its path a beat later, then let go.
const TRAIL_RADIUS = 56;
const TRAIL_PULL_RADIUS = 110;
const TRAIL_PULL = 0.5;
const TRAIL_DELAY = 180;
const TRAIL_MS = 1000;
const TRAIL_STEP = 8;
const TRAIL_MAX = 80;
// Auroras drift in the page's empty places, each a curtain of dots dithered between two hues. Once
// born they stay, and the page fills with up to AURORA_COUNT per screen as it is scrolled.
const AURORA_COUNT = 5;
// Each aurora takes the longest length its empty place has room for.
const AURORA_LONG = [120, 360] as const;
const AURORA_LONG_STEP = 20;
const AURORA_SHORT = [22, 38] as const;
const AURORA_FADE_IN = 1500;
// Only for an aurora that content has since moved onto, as when a section expands or the page resizes.
const AURORA_FADE_OUT = 2000;
const AURORA_SPAWN_MS = [700, 2300] as const;
const AURORA_DRIFT = 8;
const AURORA_TILT = 0.08;
const AURORA_WAVE = 0.3;
const AURORA_MARGIN = 10;
// Above 1, an aurora's colour and swell thin out toward its edges sooner.
const AURORA_EDGE = 2.2;
const AURORA_LIFT = 0.35;
const AURORA_ALPHA = 0.9;
// Below the fixed header, which would cover an aurora born under it.
const HEADER_CLEAR = 96;
const CONTENT =
  "h1, h2, h3, h4, p, li, a, button, img, svg, canvas, video, pre, table, header, footer, [data-cut]";

type Box = { left: number; right: number; top: number; bottom: number };
type Aurora = {
  x: number;
  pageY: number;
  long: number;
  short: number;
  angle: number;
  hues: [number, number];
  born: number;
  covered?: boolean;
  leaving?: number;
  seed: number;
};

/** Whether grid step (p, q) holds a dot of the turned screen. */
const onScreen = (p: number, q: number) => (3 * p + q) % 10 === 0;
/** Whether an element floats over the page (fixed or sticky), so it covers nothing for good. */
const floats = (node: Element) => {
  for (let at: Element | null = node; at && at !== document.body; at = at.parentElement) {
    const { position } = getComputedStyle(at);
    if (position === "fixed" || position === "sticky") return true;
  }
  return false;
};
const between = ([low, high]: readonly [number, number]) => low + Math.random() * (high - low);
const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
/** A steady 0..1 per dot of the page, for dithering an aurora's two hues. */
const grain = (p: number, pageQ: number) => {
  const hash = Math.sin(p * 127.1 + pageQ * 311.7) * 43_758.5453;
  return hash - Math.floor(hash);
};

/** The page box an aurora can reach as it drifts, tilts and waves. */
const reachOf = ({ x, pageY, long, short, angle }: Aurora): Box => {
  const along = long + AURORA_DRIFT + AURORA_MARGIN;
  const across = short * (1 + AURORA_WAVE) + long * AURORA_TILT + AURORA_DRIFT + AURORA_MARGIN;
  const [width, height] = angle === 0 ? [along, across] : [across, along];
  return { left: x - width, right: x + width, top: pageY - height, bottom: pageY + height };
};

export function Backdrop({ aurora = false }: { aurora?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const liven = useCallback((element: HTMLDivElement) => animateDots(element, aurora), [aurora]);

  if (!mounted) return null;
  return createPortal(
    <div ref={liven} {...stylex.props(styles.root)} aria-hidden="true">
      <i {...stylex.props(styles.layer, styles.grid)} />
      <canvas {...stylex.props(styles.layer)} />
    </div>,
    document.body,
  );
}

const styles = stylex.create({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    // Fade the grid toward the middle so it frames the content instead of sitting under copy.
    mask: "radial-gradient(ellipse 75% 65% at 50% 45%, rgb(0 0 0 / 0.45), #000)",
  },
  layer: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  // The resting screen in the theme's --dot, under the canvas's lit dots. It is one tile taller, so
  // sliding it up by a part of a tile never bares the bottom edge.
  grid: {
    height: `calc(100% + ${TILE}px)`,
    willChange: "transform",
    backgroundPosition: "0 0",
    backgroundSize: `${TILE}px ${TILE}px`,
  },
});

function animateDots(element: HTMLDivElement, withAurora: boolean) {
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
  const paint = () => {
    const resolve = (value: string) => {
      canvas.style.color = value;
      return getComputedStyle(canvas).color;
    };
    colours = [
      resolve("var(--dot)"),
      ...PALETTE.map((name) =>
        resolve(`color-mix(in oklab, var(${name}) calc(var(--ink-mix) + 20%), #000)`),
      ),
    ];
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
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  let trail: { x: number; pageY: number; at: number }[] = [];
  let presses: { x: number; pageY: number; to: { x: number; pageY: number }; start: number; end?: number }[] = [];
  let drawn = performance.now();
  let auroras: Aurora[] = [];
  let nextAurora = performance.now() + between(AURORA_SPAWN_MS);
  let frame = 0;

  // Each dot keeps its hue while the page scrolls, keyed by its place on the turned screen.
  const hueOf = (p: number, pageQ: number) => {
    const along = (3 * p + pageQ) / 10;
    const across = (3 * pageQ - p) / 10;
    const hash = (along * 7 + across * 13) ^ (along * across);
    return 1 + (((hash % PALETTE.length) + PALETTE.length) % PALETTE.length);
  };

  const prune = (now: number) => {
    trail = trail.filter((point) => now - point.at < TRAIL_MS);
    presses = presses.filter((press) => press.end === undefined || now - press.end < PRESS_RELEASE);
    auroras = auroras.filter((aurora) => aurora.leaving === undefined || now - aurora.leaving < AURORA_FADE_OUT);
  };

  /**
   * Sends off the auroras that content now covers, then starts one at a random spot in view that no
   * content or other aurora covers, while the view holds fewer than AURORA_COUNT.
   */
  const spawn = (now: number) => {
    const width = document.documentElement.clientWidth;
    const content: (Box & { node: Element })[] = [];
    for (const node of document.querySelectorAll(CONTENT)) {
      if (element.contains(node)) continue;
      const box = node.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      content.push({ node, left: box.left, right: box.right, top: box.top + scrollY, bottom: box.bottom + scrollY });
    }
    const staying = auroras.filter((aurora) => aurora.leaving === undefined);
    for (const aurora of staying) {
      const reach = reachOf(aurora);
      // Covered on two checks running, so a passing cut-in glitch does not count.
      const covered =
        reach.left < 0 ||
        reach.right > width ||
        content.some((box) => overlaps(box, reach) && !floats(box.node));
      if (covered && aurora.covered) aurora.leaving = now;
      aurora.covered = covered;
    }
    const view = { left: 0, right: width, top: scrollY, bottom: scrollY + innerHeight };
    const kept = staying.filter((aurora) => aurora.leaving === undefined);
    if (kept.filter((aurora) => overlaps(reachOf(aurora), view)).length >= AURORA_COUNT) return;
    const taken = [...content, ...kept.map(reachOf)];
    const fits = (aurora: Aurora) => {
      const reach = reachOf(aurora);
      if (reach.left < 0 || reach.right > width || reach.top < scrollY + HEADER_CLEAR) return false;
      return reach.bottom <= scrollY + innerHeight && !taken.some((box) => overlaps(box, reach));
    };
    for (let attempt = 0; attempt < 80; attempt++) {
      const first = Math.floor(Math.random() * PALETTE.length);
      const second = (first + 1 + Math.floor(Math.random() * (PALETTE.length - 1))) % PALETTE.length;
      const aurora: Aurora = {
        x: Math.random() * width,
        pageY: scrollY + HEADER_CLEAR + Math.random() * (innerHeight - HEADER_CLEAR),
        long: AURORA_LONG[1],
        short: between(AURORA_SHORT),
        angle: Math.random() < 0.5 ? 0 : Math.PI / 2,
        hues: [1 + first, 1 + second],
        born: now,
        seed: Math.random() * 100,
      };
      while (aurora.long > AURORA_LONG[0] && !fits(aurora)) aurora.long -= AURORA_LONG_STEP;
      if (!fits(aurora)) continue;
      auroras.push(aurora);
      return;
    }
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
    const sparks = trail.map((point) => {
      const age = now - point.at;
      const rise = Math.min(1, age / TRAIL_DELAY);
      const left = 1 - Math.max(0, age - TRAIL_DELAY) / (TRAIL_MS - TRAIL_DELAY);
      const taper = 0.4 + 0.6 * left;
      return {
        x: point.x,
        y: point.pageY - scrollY,
        // Nothing under the pointer yet: the dots come up once it has moved on.
        life: rise * rise * (3 - 2 * rise) * left ** 1.5,
        radius: TRAIL_RADIUS * taper,
        reach: TRAIL_PULL_RADIUS * taper,
      };
    });
    const time = now / 1000;
    const view = { left: 0, right: innerWidth, top: scrollY, bottom: scrollY + innerHeight };
    const curtains = auroras.filter((aurora) => overlaps(reachOf(aurora), view)).map((aurora) => {
      const age = now - aurora.born;
      const gone = aurora.leaving === undefined ? 0 : (now - aurora.leaving) / AURORA_FADE_OUT;
      const angle = aurora.angle + Math.sin(time * 0.4 + aurora.seed) * AURORA_TILT;
      const reach = reachOf(aurora);
      return {
        ...aurora,
        x: aurora.x + Math.sin(time * 0.31 + aurora.seed) * AURORA_DRIFT,
        y: aurora.pageY - scrollY + Math.cos(time * 0.23 + aurora.seed * 1.7) * AURORA_DRIFT,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        strength: Math.max(0, Math.min(1, age / AURORA_FADE_IN, 1 - gone)),
        sway: Math.sin(time * 0.5 + aurora.seed) * 0.3,
        box: { ...reach, top: reach.top - scrollY, bottom: reach.bottom - scrollY },
      };
    });

    // Presses and the trail move dots off their places, so the canvas then draws the whole screen
    // in place of the grid. Otherwise it draws only the boxes the auroras fall in, and a dot in more
    // than one is drawn by the first.
    const moving = grips.length > 0 || sparks.length > 0;
    grid.style.visibility = moving ? "hidden" : "";
    const regions: Box[] = moving
      ? [{ left: 0, right: innerWidth, top: 0, bottom: innerHeight }]
      : curtains.map(({ box }) => box);
    const trailBox: Box = {
      left: Math.min(...sparks.map(({ x }) => x)) - TRAIL_PULL_RADIUS,
      right: Math.max(...sparks.map(({ x }) => x)) + TRAIL_PULL_RADIUS,
      top: Math.min(...sparks.map(({ y }) => y)) - TRAIL_PULL_RADIUS,
      bottom: Math.max(...sparks.map(({ y }) => y)) + TRAIL_PULL_RADIUS,
    };
    // Resting dots go in one path, filled once under the lit ones.
    const resting = new Path2D();
    const lit: { x: number; y: number; radius: number; tint: number; hue: number }[] = [];

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
          const inside = (box: Box) => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
          if (earlier.some(inside)) continue;

          let trailed = 0;
          let dotX = x;
          let dotY = y;
          if (inside(trailBox)) {
            let pull = 0;
            let toward = { x, y };
            for (const spark of sparks) {
              const distance = Math.hypot(spark.x - x, spark.y - y);
              if (distance < spark.radius)
                trailed = Math.max(trailed, (1 - distance / spark.radius) ** 2 * spark.life);
              const drawn = distance < spark.reach ? (1 - distance / spark.reach) ** 1.5 * spark.life : 0;
              if (drawn > pull) {
                pull = drawn;
                toward = spark;
              }
            }
            dotX += (toward.x - x) * TRAIL_PULL * pull * pulling;
            dotY += (toward.y - y) * TRAIL_PULL * pull * pulling;
          }
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
          let shimmer = 0;
          let shimmerHue = 0;
          for (const curtain of curtains) {
            const dx = x - curtain.x;
            const dy = y - curtain.y;
            const u = (dx * curtain.cos + dy * curtain.sin) / curtain.long;
            const across = -dx * curtain.sin + dy * curtain.cos;
            const wave = Math.sin(u * 2.4 + time * 0.9 + curtain.seed) * curtain.short * AURORA_WAVE;
            const v = (across - wave) / curtain.short;
            const fall = 1 - (u * u + v * v);
            if (fall <= 0) continue;
            const strength = fall ** AURORA_EDGE * curtain.strength;
            if (strength <= shimmer) continue;
            shimmer = strength;
            shimmerHue = curtain.hues[grain(p, pageQ) < (u + 1) / 2 + curtain.sway ? 1 : 0];
          }

          const lift = Math.min(1, Math.max(trailed, gripped, shimmer * AURORA_LIFT));
          const tint = Math.min(1, Math.max(trailed * 1.6, gripped * 1.6, shimmer * AURORA_ALPHA));
          if (tint < 0.01) {
            if (!moving) continue;
            resting.moveTo(dotX + DOT, dotY);
            resting.arc(dotX, dotY, DOT, 0, Math.PI * 2);
            continue;
          }
          const hue = shimmer > Math.max(trailed, gripped) ? shimmerHue : hueOf(p, pageQ);
          lit.push({ x: dotX, y: dotY, radius: DOT + lift * DOT_LIFT, tint, hue });
        }
      }
    });

    context.globalAlpha = 1;
    context.fillStyle = colours[0]!;
    context.fill(resting);
    for (const dot of lit) {
      context.beginPath();
      context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      context.globalAlpha = 1;
      context.fillStyle = colours[0]!;
      context.fill();
      context.globalAlpha = dot.tint;
      context.fillStyle = colours[dot.hue]!;
      context.fill();
    }
  };

  const tick = (now: number) => {
    const aurora = withAurora && !still.matches;
    if (aurora && now >= nextAurora) {
      spawn(now);
      nextAurora = now + between(AURORA_SPAWN_MS);
    }
    draw(now);
    frame = aurora || trail.length || presses.length ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  redraw = () => {
    if (frame) draw();
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const now = performance.now();
    const x = event.clientX;
    const pageY = event.clientY + scrollY;
    for (const press of presses) if (press.end === undefined) press.to = { x, pageY };
    trail = trail.filter((point) => now - point.at < TRAIL_MS);
    const last = trail.at(-1);
    const gap = last ? Math.hypot(x - last.x, pageY - last.pageY) : TRAIL_STEP;
    if (gap < TRAIL_STEP) return;
    // A fast sweep skips ahead between events; fill the gap so the trail stays unbroken.
    const steps = last ? Math.min(12, Math.floor(gap / TRAIL_STEP)) : 1;
    for (let step = 1; step <= steps; step++) {
      const along = step / steps;
      trail.push({
        x: last ? last.x + (x - last.x) * along : x,
        pageY: last ? last.pageY + (pageY - last.pageY) * along : pageY,
        at: now,
      });
    }
    if (trail.length > TRAIL_MAX) trail.splice(0, trail.length - TRAIL_MAX);
    wake();
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
    addEventListener("pointerdown", press, { capture: true, passive: true });
    addEventListener("pointerup", release, { capture: true, passive: true });
    addEventListener("pointercancel", release, { capture: true, passive: true });
    addEventListener("blur", release);
  }
  if (withAurora) wake();
  return () => {
    theme.disconnect();
    removeEventListener("scroll", scroll);
    removeEventListener("resize", onResize);
    cancelAnimationFrame(frame);
    removeEventListener("pointermove", move);
    removeEventListener("pointerdown", press, { capture: true });
    removeEventListener("pointerup", release, { capture: true });
    removeEventListener("pointercancel", release, { capture: true });
    removeEventListener("blur", release);
  };
}
