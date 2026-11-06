import {
  ARROWS_CHANGED,
  arrowsFor,
  brush,
  looped,
  walk,
  PHI,
  type BrushArrow,
  type HintLook,
  type Point,
  type ToggleLook,
} from "../arrows";
import { isTransitioning } from "../sections/rule-open";

type Box = { left: number; top: number; right: number; bottom: number };
export type Hint = {
  zone: string;
  at: Point;
  tilt: "up" | "down" | "level";
} & BrushArrow;

const HINT_STEP = 10;
const HINT_CLEAR = 8;
const HINT_NEAR = 56;
const HINT_FAR = 130;
// How far a label steps sideways off its edge's middle, per px of gap, so every arrow from one
// ring has the same length.
const HINT_LEAN = 14 / 26;
// The room a label keeps from words level with it, so it never reads as part of a line of text.
const HINT_BERTH = 40;
// How much further out than the hint's reach the wider rings sit, for when every slot in the first
// ring is taken, then one nearer ring for a pane with no room further out.
const HINT_RINGS = [0, 14, 34, -14];
// The spots a label tries round its target, in order: above right, right, their mirror images,
// level beside it, then below. `dir` is the side of the edge's middle it steps toward, and a
// level label (dir 0) points straight across.
const HINT_SLOTS = [
  { edge: "top", dir: 1 },
  { edge: "right", dir: -1 },
  { edge: "top", dir: -1 },
  { edge: "left", dir: -1 },
  { edge: "right", dir: 0 },
  { edge: "left", dir: 0 },
  { edge: "bottom", dir: 1 },
  { edge: "right", dir: 1 },
  { edge: "bottom", dir: -1 },
  { edge: "left", dir: 1 },
] as const;

function overlap(a: Box, b: Box) {
  return (
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  );
}

function area(b: Box) {
  return (b.right - b.left) * (b.bottom - b.top);
}

function holds(outer: Box, inner: Box) {
  return (
    inner.left >= outer.left &&
    inner.right <= outer.right &&
    inner.top >= outer.top &&
    inner.bottom <= outer.bottom
  );
}

/** The gap between two boxes, 0 when they touch. */
function apart(a: Box, b: Box) {
  return Math.hypot(
    Math.max(0, a.left - b.right, b.left - a.right),
    Math.max(0, a.top - b.bottom, b.top - a.bottom),
  );
}

const centre = (b: Box): Point => ({ x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 });

/** Where a ray from the box's centre along the unit vector `dir` leaves the box, `gap` further out. */
function exit(b: Box, dir: Point, gap: number): Point {
  const c = centre(b);
  const reach =
    Math.min(
      dir.x ? (b.right - b.left) / 2 / Math.abs(dir.x) : Infinity,
      dir.y ? (b.bottom - b.top) / 2 / Math.abs(dir.y) : Infinity,
    ) + gap;
  return { x: c.x + dir.x * reach, y: c.y + dir.y * reach };
}

type Edge = (typeof HINT_SLOTS)[number]["edge"];
type Spot = { edge: Edge; dir: -1 | 0 | 1; gap: number; shift: number };
// Further steps off an edge's middle for when a neighbour blocks every slot, so the label slides
// past it along the same edge.
const HINT_REACH = [30, 48, 72, 100, 130, 160];
/** Every place a label tries round its target, nearest first, for labels `reach` off its edge. */
function spots(reach: number): Spot[] {
  const rings = HINT_RINGS.map((ring) => reach + ring);
  return [
    ...rings.flatMap((gap) =>
      HINT_SLOTS.map(({ edge, dir }) => ({ edge, dir, gap, shift: gap * HINT_LEAN })),
    ),
    ...HINT_REACH.flatMap((shift) =>
      rings.flatMap((gap) =>
        HINT_SLOTS.filter(({ dir }) => dir !== 0).map(({ edge, dir }) => ({
          edge,
          dir,
          gap,
          shift,
        })),
      ),
    ),
  ];
}
type Way = { label: Box; way: ReturnType<typeof arc> };
const SQUEEZES = [0, 1, 2] as const;
type Squeeze = (typeof SQUEEZES)[number];

/** A `w` by `h` label at one of the spots round `t`. */
function slot(t: Box, { edge, dir, gap, shift }: Spot, w: number, h: number): Box {
  const { x: cx, y: cy } = centre(t);
  if (edge === "top" || edge === "bottom") {
    const left = dir > 0 ? cx + shift : cx - shift - w;
    const top = edge === "top" ? t.top - gap - h : t.bottom + gap;
    return { left, right: left + w, top, bottom: top + h };
  }
  const left = edge === "right" ? t.right + gap : t.left - gap - w;
  const top = dir === 0 ? cy - h / 2 : dir > 0 ? cy + shift : cy - shift - h;
  return { left, right: left + w, top, bottom: top + h };
}
/**
 * A hand-drawn arc from the label to the target, with its head. It leaves the label on a ray from
 * the label's centre and lands on a ray into the target's centre, so the nock points back at the
 * word and the head at the target. Both rays turn off the line between the centres by the same
 * angle, to the side `bow` picks, so even a label level with its target draws a curve.
 */
function arc(label: Box, target: Box, bow: number, look: HintLook) {
  const from = centre(label);
  const to = centre(target);
  const heading = Math.atan2(to.y - from.y, to.x - from.x);
  const turn = Math.atan(bow * look.bow);
  const out = { x: Math.cos(heading + turn), y: Math.sin(heading + turn) };
  const into = { x: Math.cos(heading - turn), y: Math.sin(heading - turn) };
  const start = exit(label, out, look.labelGap);
  const end = exit(target, { x: -into.x, y: -into.y }, look.targetGap);
  // The head's length runs straight along the ray, so the head sits square on the line.
  const neck = { x: end.x - into.x * look.head, y: end.y - into.y * look.head };
  const handle = Math.hypot(neck.x - start.x, neck.y - start.y) * look.handle;
  const c1 = { x: start.x + out.x * handle, y: start.y + out.y * handle };
  const c2 = { x: neck.x - into.x * handle, y: neck.y - into.y * handle };
  const curve = Array.from({ length: 31 }, (_, i) => {
    const t = i / 30;
    const u = 1 - t;
    return {
      x: u ** 3 * start.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * neck.x,
      y: u ** 3 * start.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * neck.y,
    };
  });
  const line = looped(curve, look.loop, look.curl);
  const along = line.slice(1, -1);
  const length = walk(line).total;
  // How far the head leans off square to the page, plus a hair for an arc that sags rather than
  // arches, so a caller picking between the two sides takes the one that lands straighter.
  const middle = curve[15] ?? start;
  const sags = middle.y > (start.y + end.y) / 2;
  const skew = 1 - Math.max(Math.abs(into.x), Math.abs(into.y)) + (sags ? 1e-3 : 0);
  return { spine: [...line, end], along, length, skew, curled: line !== curve };
}

/**
 * The arcs bending `bow` to either side, the one whose head lands squarer first. A side long enough
 * to curl comes curled, then plain, so a curl that hits something gives way without moving the label.
 */
function bowed(label: Box, target: Box, bow: number, look: HintLook) {
  const sides = [bow, -bow].map((side) => ({ side, way: arc(label, target, side, look) }));
  sides.sort((a, b) => a.way.skew - b.way.skew);
  return sides.flatMap(({ side, way }) =>
    way.curled ? [way, arc(label, target, side, { ...look, loop: 0 })] : [way],
  );
}

/** Spots right beside a target, nearest side first, for a label with a short straight arrow. */
function beside(t: Box, w: number, h: number, { reach }: ToggleLook): Box[] {
  const { x: cx, y: cy } = centre(t);
  return [
    {
      left: t.right + reach,
      right: t.right + reach + w,
      top: cy - h / 2,
      bottom: cy + h / 2,
    },
    {
      left: t.left - reach - w,
      right: t.left - reach,
      top: cy - h / 2,
      bottom: cy + h / 2,
    },
    {
      left: cx - w / 2,
      right: cx + w / 2,
      top: t.bottom + reach,
      bottom: t.bottom + reach + h,
    },
    {
      left: cx - w / 2,
      right: cx + w / 2,
      top: t.top - reach - h,
      bottom: t.top - reach,
    },
  ];
}

/** Which cells of the room any box covers, summed so a rectangle's coverage costs one lookup. */
function raster(room: Box, boxes: Box[]) {
  const cell = 4;
  const cols = Math.ceil((room.right - room.left) / cell);
  const rows = Math.ceil((room.bottom - room.top) / cell);
  const col = (x: number) => Math.min(cols, Math.max(0, Math.round((x - room.left) / cell)));
  const row = (y: number) => Math.min(rows, Math.max(0, Math.round((y - room.top) / cell)));
  const hit = new Uint8Array(cols * rows);
  for (const b of boxes) {
    for (let r = row(b.top); r < row(b.bottom); r++)
      hit.fill(1, r * cols + col(b.left), r * cols + col(b.right));
  }
  const sum = new Uint32Array((cols + 1) * (rows + 1));
  for (let r = 0; r < rows; r++) {
    let line = 0;
    for (let c = 0; c < cols; c++) {
      line += hit[r * cols + c] ?? 0;
      sum[(r + 1) * (cols + 1) + c + 1] = (sum[r * (cols + 1) + c + 1] ?? 0) + line;
    }
  }
  const at = (r: number, c: number) => sum[r * (cols + 1) + c] ?? 0;
  return {
    covers: (b: Box) => {
      const [c0, c1, r0, r1] = [col(b.left), col(b.right), row(b.top), row(b.bottom)];
      return (at(r1, c1) - at(r0, c1) - at(r1, c0) + at(r0, c0)) * cell * cell;
    },
    has: (p: Point) => {
      const c = Math.floor((p.x - room.left) / cell);
      const r = Math.floor((p.y - room.top) / cell);
      return c >= 0 && c < cols && r >= 0 && r < rows && hit[r * cols + c] === 1;
    },
  };
}

type Mark = {
  e: Element;
  box: Box;
  kind: "content" | "surface" | "leaf" | "frame";
  glyphs?: true;
};

/**
 * Sort what's on screen in the card: content (text, controls, icons) a hint must never cover,
 * surfaces (cards, panels) it covers only when they're big enough to be a backdrop, bare leaves
 * that count only when small, and frames that don't count.
 */
function survey(things: Element[]): Mark[] {
  return things.flatMap<Mark>((e) => {
    const box = e.getBoundingClientRect();
    // A screen-reader-only box is 1px, though its text still measures full width.
    if (box.width <= 1 || box.height <= 1 || e.matches("col, colgroup")) return [];
    if (e.matches("button, input, select, textarea, svg")) return [{ e, box, kind: "content" }];
    const look = getComputedStyle(e);
    const surface =
      !/^(transparent|rgba\(0, 0, 0, 0\))$|\/ 0\)$/.test(look.backgroundColor) ||
      parseFloat(look.borderTopWidth) + parseFloat(look.borderBottomWidth) > 0 ||
      look.boxShadow !== "none";
    const words = [...e.childNodes].filter(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
    );
    const cell = e.matches("td, th");
    if (words.length && surface && !cell) return [{ e, box, kind: "content" }];
    // Bare text, and text in a table cell, counts only where its glyphs are, line by line, so a
    // wide cell or a wrapped heading's short last line keeps its empty space.
    if (words.length) {
      const range = document.createRange();
      const glyphs = words.flatMap((n) => {
        range.selectNodeContents(n);
        return [...range.getClientRects()]
          .filter((r) => r.width)
          .map((r) => ({ e, box: r, kind: "content" as const, glyphs: true as const }));
      });
      return surface ? [...glyphs, { e, box, kind: "surface" }] : glyphs;
    }
    return [{ e, box, kind: surface ? "surface" : e.childElementCount === 0 ? "leaf" : "frame" }];
  });
}

/**
 * An arrow to every `[data-hint]` in the card, so readers know the demo takes input. A toggle in
 * the copy gets a short one from right beside it. Anything else gets an arrow from the first
 * clear spot round it, so every pane reads the same. Only when no spot is clear does the label
 * search the pane for empty space. Each fades once the reader touches the pane it points into.
 */
export function watchHints(card: HTMLElement, ruler: HTMLElement, render: (hints: Hint[]) => void) {
  const place = () => {
    const { hint, toggle } = arrowsFor(card.dataset.arrows);
    const box = card.getBoundingClientRect();
    const w = ruler.offsetWidth;
    const h = ruler.offsetHeight;
    const figures = [...card.querySelectorAll<HTMLElement>("figure[data-side]")];
    const hidden = figures.filter((f) => getComputedStyle(f).visibility === "hidden");
    const marks = survey(
      [...card.querySelectorAll("*")].filter(
        (e) => !e.closest("svg *, [data-hint-layer]") && !hidden.some((f) => f.contains(e)),
      ),
    );
    const next: Hint[] = [];
    const draw = (way: ReturnType<typeof arc>) =>
      brush(
        way.spine.map((p) => ({ x: p.x - box.left, y: p.y - box.top })),
        hint,
      );
    const grow = (by: number) => (b: Box) => ({
      left: b.left - by,
      right: b.right + by,
      top: b.top - by,
      bottom: b.bottom + by,
    });
    const pad = grow(HINT_CLEAR);
    // The ink is wider than the centreline the rasters test, so what an arc must miss grows by half
    // its width and a hair.
    const inked = grow(hint.body / 2 + 1);
    const curved: {
      zone: string;
      t: Box;
      fits: (spot: Spot, squeeze: Squeeze) => Way | undefined;
      roam: () => Way | undefined;
    }[] = [];
    for (const target of card.querySelectorAll<HTMLElement>("[data-hint]")) {
      const figure = target.closest<HTMLElement>("figure[data-side]");
      if (figure && hidden.includes(figure)) continue;
      resized.observe(target);
      const t = target.getBoundingClientRect();
      if (t.width === 0) continue;
      const zone = (figure ?? card).getBoundingClientRect();
      const solid: Box[] = [];
      const backdrops: Box[] = [];
      const firm: Box[] = [];
      const sheets: Box[] = [];
      for (const { e, box: r, kind } of marks) {
        if (kind === "frame" || target.contains(e)) continue;
        const big = area(r) >= area(zone) * 0.4;
        if (kind === "content" || !big) solid.push(r);
        else if (kind === "surface") backdrops.push(r);
        if (kind === "surface") sheets.push(r);
        else if (kind === "content" || !big) firm.push(r);
      }
      for (const other of figures)
        if (other !== figure && !hidden.includes(other)) {
          solid.push(other.getBoundingClientRect());
          firm.push(other.getBoundingClientRect());
        }
      const covered = raster(box, [...solid, t]);
      const near = figure
        ? undefined
        : beside(t, w, h, toggle).find((b) => holds(box, pad(b)) && covered.covers(pad(b)) === 0);
      if (near) {
        const look = { ...hint, labelGap: toggle.labelGap, targetGap: toggle.targetGap };
        const struck = raster(box, [...solid.map(inked), t]);
        const way = bowed(near, t, 1, look).find((a) => !a.curled || !a.along.some(struck.has));
        const mid = centre(near);
        if (way)
          next.push({
            zone: "copy",
            at: { x: mid.x - box.left, y: mid.y - box.top },
            tilt: "level",
            ...draw(way),
          });
        continue;
      }
      const crossed = raster(box, [...solid.filter((r) => !holds(r, t)).map(inked), t]);
      const blocked = raster(box, [...firm, t]);
      const words = raster(
        box,
        marks.filter((m) => m.glyphs && !target.contains(m.e)).map((m) => m.box),
      );
      const threaded = raster(box, [...firm.filter((r) => !holds(r, t)).map(inked), t]);
      const cells = [...(figure ?? card).querySelectorAll("td, th")].map((e) =>
        e.getBoundingClientRect(),
      );
      // A label in a slot may sit on a card or off it, never across its edge. Squeezed, it may sit
      // in a table's cells, then draw a curve shorter than the hint's length, as nothing else fits.
      const fits = (spot: Spot, squeeze: Squeeze) => {
        const label = slot(t, spot, w, h);
        const clear = pad(label);
        const level = {
          ...label,
          left: label.left - HINT_BERTH,
          right: label.right + HINT_BERTH,
        };
        const sits =
          holds(zone, squeeze > 1 ? label : clear) &&
          blocked.covers(clear) === 0 &&
          words.covers(level) === 0 &&
          (squeeze > 0 || cells.every((r) => overlap(label, r) === 0)) &&
          sheets.every((r) => {
            const o = overlap(label, r);
            return o === 0 || o === area(label);
          });
        if (!sits) return undefined;
        // A full bend first, on the side whose head lands squarer, then ones a golden step gentler
        // when a neighbour sits close.
        for (const bow of [1, 1 / PHI, 1 / PHI ** 2]) {
          const way = bowed(label, t, bow, hint).find(
            (way) => (squeeze > 1 || way.length >= hint.length) && !way.along.some(threaded.has),
          );
          if (way) return { label, way };
        }
        return undefined;
      };
      const roam = () => {
        const spots: { label: Box; cost: number }[] = [];
        for (
          let y = box.top + h / 2 + HINT_CLEAR;
          y <= box.bottom - h / 2 - HINT_CLEAR;
          y += HINT_STEP
        ) {
          for (
            let x = box.left + w / 2 + HINT_CLEAR;
            x <= box.right - w / 2 - HINT_CLEAR;
            x += HINT_STEP
          ) {
            const label = {
              left: x - w / 2,
              right: x + w / 2,
              top: y - h / 2,
              bottom: y + h / 2,
            };
            const clear = pad(label);
            const gap = apart(label, t);
            let cost =
              (holds(zone, clear) ? 0 : 5000) +
              Math.max(0, HINT_NEAR - gap) * 4 +
              Math.max(0, gap - HINT_FAR) * 4 +
              covered.covers(clear) * 100 +
              words.covers({
                ...label,
                left: label.left - HINT_BERTH,
                right: label.right + HINT_BERTH,
              }) *
                20;
            for (const r of backdrops) {
              const o = overlap(clear, r);
              cost += Math.min(o, area(clear) - o) * 100;
            }
            spots.push({ label, cost });
          }
        }
        spots.sort((a, b) => a.cost - b.cost);
        // An arc only adds to its spot's cost, so once a spot alone costs more than the best arc
        // so far, no later spot can win.
        let best: (Way & { cost: number }) | undefined;
        for (const { label, cost } of spots.slice(0, 1500)) {
          if (best && cost >= best.cost) break;
          for (const way of bowed(label, t, 1, hint)) {
            const hits = way.along.filter(
              (p) =>
                crossed.has(p) || !holds(zone, { left: p.x, right: p.x, top: p.y, bottom: p.y }),
            ).length;
            const short = way.length < hint.length ? 5000 : 0;
            const total = cost + short + hits * 2000 + way.skew;
            if (!best || total < best.cost) best = { label, way, cost: total };
          }
        }
        return best;
      };
      curved.push({ zone: figure?.dataset.side ?? "copy", t, fits, roam });
    }
    // Both panes of a demo take the same slot when one suits them all, so they read alike.
    const round = spots(hint.reach);
    const tries = SQUEEZES.flatMap((squeeze) => round.map((spot) => [spot, squeeze] as const));
    const shared = tries.find((at) => curved.every((c) => c.fits(...at)));
    for (const { zone, t, fits, roam } of curved) {
      const pick =
        (shared && fits(...shared)) ?? tries.map((at) => fits(...at)).find(Boolean) ?? roam();
      if (!pick) continue;
      const { label, way } = pick;
      const mid = centre(label);
      next.push({
        zone,
        at: { x: mid.x - box.left, y: mid.y - box.top },
        tilt: mid.x < centre(t).x ? "down" : "up",
        ...draw(way),
      });
    }
    render(next);
  };
  // Measuring is costly, so a card measures only near the screen, and never while a page
  // transition plays: that work would hold the old page frozen or drop the dive's frames.
  let near = false;
  let frame = 0;
  const soon = () => {
    cancelAnimationFrame(frame);
    if (!near) return;
    const settle = () => {
      frame = requestAnimationFrame(isTransitioning() ? settle : place);
    };
    settle();
  };
  const resized = new ResizeObserver(soon);
  // Demos below the fold can mount their controls late, so measure again on the way in.
  const entered = new IntersectionObserver(
    ([entry]) => {
      near = entry?.isIntersecting ?? false;
      soon();
    },
    { rootMargin: "50% 0px" },
  );
  resized.observe(card);
  entered.observe(card);
  void document.fonts.ready.then(soon);
  window.addEventListener(ARROWS_CHANGED, soon);
  return () => {
    window.removeEventListener(ARROWS_CHANGED, soon);
    resized.disconnect();
    entered.disconnect();
    cancelAnimationFrame(frame);
  };
}

/** Calls `shown` once the card is well on screen, and `touched` with each zone the reader touches. */
export function watchHintReader(
  card: HTMLElement,
  shown: () => void,
  touched: (zone: string) => void,
) {
  const seen = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      seen.disconnect();
      shown();
    },
    { rootMargin: "0px 0px -30% 0px" },
  );
  seen.observe(card);
  const touch = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const zone =
      event.target.closest<HTMLElement>("figure[data-side]")?.dataset.side ??
      (event.target.closest("[data-hint]") ? "copy" : null);
    if (zone) touched(zone);
  };
  const kinds = ["pointerdown", "keydown", "input"] as const;
  for (const kind of kinds) card.addEventListener(kind, touch, true);
  return () => {
    seen.disconnect();
    for (const kind of kinds) card.removeEventListener(kind, touch, true);
  };
}
