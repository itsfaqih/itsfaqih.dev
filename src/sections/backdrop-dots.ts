import * as stylex from "@stylexjs/stylex";

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
// Lit dots are filled in this many alpha steps, so a frame fills a few paths rather than one per dot.
const TINT_STEPS = 12;

type Box = { left: number; right: number; top: number; bottom: number };

/** Whether grid step (p, q) holds a dot of the turned screen. */
const onScreen = (p: number, q: number) => (3 * p + q) % 10 === 0;
/** A steady 0..1 per dot of the page, for dithering the tide's two hues. */
const grain = (p: number, pageQ: number) => {
  const hash = Math.sin(p * 127.1 + pageQ * 311.7) * 43_758.5453;
  return hash - Math.floor(hash);
};

export const styles = stylex.create({
  // The custom element that holds the screen's template takes no box.
  host: {
    display: "none",
  },
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

  let presses: {
    x: number;
    pageY: number;
    to: { x: number; pageY: number };
    start: number;
    end?: number;
  }[] = [];
  let drawn = performance.now();
  let frame = 0;

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

    // Presses move dots off their places, so the canvas then draws the whole screen in place of the
    // grid. The tide only swells dots, so it draws them over the grid.
    const moving = grips.length > 0;
    grid.style.visibility = moving ? "hidden" : "";
    const regions: Box[] =
      moving || tiding ? [{ left: 0, right: innerWidth, top: 0, bottom: innerHeight }] : [];
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

          const lift = Math.min(1, Math.max(gripped, swell * swell * TIDE_LIFT));
          const tint = Math.min(1, Math.max(gripped * 1.6, crest * TIDE_ALPHA));
          if (tint < 0.01 && lift < 0.02) {
            if (!moving) continue;
            base.moveTo(dotX + DOT, dotY);
            base.arc(dotX, dotY, DOT, 0, Math.PI * 2);
            continue;
          }
          const radius = DOT + lift * DOT_LIFT;
          base.moveTo(dotX + radius, dotY);
          base.arc(dotX, dotY, radius, 0, Math.PI * 2);
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
    for (const [key, path] of tints) {
      context.globalAlpha = (key % 100) / TINT_STEPS;
      context.fillStyle = colours[Math.floor(key / 100)]!;
      context.fill(path);
    }
  };

  const tick = (now: number) => {
    draw(now);
    frame = (withTide && !still.matches) || presses.length ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  redraw = () => {
    if (frame) draw();
  };

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
  if (withTide) wake();
  return () => {
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
