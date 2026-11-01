import { isTransitioning } from "../sections/rule-open";

type Point = { x: number; y: number };
type Box = { left: number; top: number; right: number; bottom: number };
export type Hint = { zone: string; at: Point; tilt: "up" | "down" | "level"; path: string };

const HINT_STEP = 10;
const HINT_CLEAR = 8;
const HINT_NEAR = 56;
const HINT_FAR = 130;
// How far a toggle in the copy sits from its label, which points at it in a straight line.
const HINT_SHORT = 26;
// A label's gap from its target's edge, and how far it steps sideways off the edge's middle, so
// every curved arrow has the same length and bend.
const HINT_GAP = 26;
const HINT_SHIFT = 14;
// The room a label keeps from words level with it, so it never reads as part of a line of text.
const HINT_BERTH = 40;
// Wider rings a label falls back to when every slot at HINT_GAP is taken.
const HINT_RINGS = [HINT_GAP, 44, 64];
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

/** Where a ray from the box's centre toward `to` leaves the box, pushed `gap` further out. */
function exit(b: Box, to: Point, gap: number): Point {
  const cx = (b.left + b.right) / 2;
  const cy = (b.top + b.bottom) / 2;
  const dx = to.x - cx;
  const dy = to.y - cy;
  const length = Math.hypot(dx, dy) || 1;
  const reach = Math.min(
    dx ? (b.right - b.left) / 2 / Math.abs(dx) : Infinity,
    dy ? (b.bottom - b.top) / 2 / Math.abs(dy) : Infinity,
  );
  return { x: cx + dx * reach + (dx / length) * gap, y: cy + dy * reach + (dy / length) * gap };
}

type Edge = (typeof HINT_SLOTS)[number]["edge"];
type Spot = { edge: Edge; dir: -1 | 0 | 1; gap: number; shift: number };
// Further steps off an edge's middle for when a neighbour blocks every slot, so the label slides
// past it along the same edge.
const HINT_REACH = [30, 48, 72, 100, 130, 160];
// Every place a label tries round its target, nearest first.
const HINT_SPOTS: Spot[] = [
  ...HINT_RINGS.flatMap((gap) =>
    HINT_SLOTS.map(({ edge, dir }) => ({ edge, dir, gap, shift: (HINT_SHIFT * gap) / HINT_GAP })),
  ),
  ...HINT_REACH.flatMap((shift) =>
    HINT_RINGS.flatMap((gap) =>
      HINT_SLOTS.filter(({ dir }) => dir !== 0).map(({ edge, dir }) => ({ edge, dir, gap, shift })),
    ),
  ),
];
type Way = { label: Box; way: ReturnType<typeof arc> };

/** Where an arrow lands on its target: just off the middle of one edge, never a corner. */
function landing(t: Box, edge: Edge): Point {
  const cx = (t.left + t.right) / 2;
  const cy = (t.top + t.bottom) / 2;
  if (edge === "top") return { x: cx, y: t.top - 6 };
  if (edge === "bottom") return { x: cx, y: t.bottom + 6 };
  if (edge === "left") return { x: t.left - 6, y: cy };
  return { x: t.right + 6, y: cy };
}

/** A `w` by `h` label at one of the HINT_SPOTS round `t`. */
function slot(t: Box, { edge, dir, gap, shift }: Spot, w: number, h: number): Box {
  const cx = (t.left + t.right) / 2;
  const cy = (t.top + t.bottom) / 2;
  if (edge === "top" || edge === "bottom") {
    const left = dir > 0 ? cx + shift : cx - shift - w;
    const top = edge === "top" ? t.top - gap - h : t.bottom + gap;
    return { left, right: left + w, top, bottom: top + h };
  }
  const left = edge === "right" ? t.right + gap : t.left - gap - w;
  const top = dir === 0 ? cy - h / 2 : dir > 0 ? cy + shift : cy - shift - h;
  return { left, right: left + w, top, bottom: top + h };
}

/** How far an arc bows out past the edge it lands on, rather than back across the target. */
const OUTWARD: Record<Edge, (way: ReturnType<typeof arc>) => number> = {
  top: (way) => -way.ny,
  bottom: (way) => way.ny,
  left: (way) => -way.nx,
  right: (way) => way.nx,
};

const EDGES = ["top", "bottom", "left", "right"] as const;

/**
 * A hand-drawn arc from the label to `end`, bowed to one side by `bow` (-1 to 1, straight at 0),
 * with its head.
 */
function arc(label: Box, end: Point, bow: number) {
  const start = exit(label, end, 6);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const nx = -dy * 0.32 * bow;
  const ny = dx * 0.32 * bow;
  const c1 = { x: start.x + dx * 0.2 + nx, y: start.y + dy * 0.2 + ny };
  const c2 = { x: start.x + dx * 0.72 + nx * 0.55, y: start.y + dy * 0.72 + ny * 0.55 };
  const along = Array.from({ length: 29 }, (_, i) => {
    const t = (i + 1) / 30;
    const u = 1 - t;
    return {
      x: u ** 3 * start.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * end.x,
      y: u ** 3 * start.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * end.y,
    };
  });
  return { start, c1, c2, end, wings: wings(c2, end), along, nx, ny };
}

/** The two strokes of an arrowhead at `end`, for a line arriving from `from`. */
function wings(from: Point, end: Point) {
  const length = Math.hypot(end.x - from.x, end.y - from.y) || 1;
  const ux = (end.x - from.x) / length;
  const uy = (end.y - from.y) / length;
  const wing = (turn: number) => ({
    x: end.x - (ux * Math.cos(turn) - uy * Math.sin(turn)) * 8,
    y: end.y - (ux * Math.sin(turn) + uy * Math.cos(turn)) * 8,
  });
  return [wing(0.5), wing(-0.5)] as const;
}

/** Spots right beside a target, nearest side first, for a label with a short straight arrow. */
function beside(t: Box, w: number, h: number): Box[] {
  const cx = (t.left + t.right) / 2;
  const cy = (t.top + t.bottom) / 2;
  return [
    {
      left: t.right + HINT_SHORT,
      right: t.right + HINT_SHORT + w,
      top: cy - h / 2,
      bottom: cy + h / 2,
    },
    {
      left: t.left - HINT_SHORT - w,
      right: t.left - HINT_SHORT,
      top: cy - h / 2,
      bottom: cy + h / 2,
    },
    {
      left: cx - w / 2,
      right: cx + w / 2,
      top: t.bottom + HINT_SHORT,
      bottom: t.bottom + HINT_SHORT + h,
    },
    {
      left: cx - w / 2,
      right: cx + w / 2,
      top: t.top - HINT_SHORT - h,
      bottom: t.top - HINT_SHORT,
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
    // Bare text, and text in a table cell, counts only where its glyphs are, so a wide cell keeps
    // its empty space.
    if (words.length) {
      const range = document.createRange();
      const glyphs = words.flatMap((n) => {
        range.selectNodeContents(n);
        const r = range.getBoundingClientRect();
        return r.width ? [{ e, box: r, kind: "content" as const, glyphs: true as const }] : [];
      });
      return surface ? [...glyphs, { e, box, kind: "surface" }] : glyphs;
    }
    return [{ e, box, kind: surface ? "surface" : e.childElementCount === 0 ? "leaf" : "frame" }];
  });
}


/**
 * An arrow to every `[data-hint]` in the card, so readers know the demo takes input. A toggle in
 * the copy gets a short straight one from right beside it. Anything else gets a short curve from
 * the first clear spot in HINT_SPOTS, landing on the middle of an edge, so every pane reads the
 * same. Only when no spot is clear does the label search the pane for empty space. Each fades
 * once the reader touches the pane it points into.
 */
export function watchHints(card: HTMLElement, ruler: HTMLElement, render: (hints: Hint[]) => void) {
  const place = () => {
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
    const x = (p: Point) => `${(p.x - box.left).toFixed(1)} ${(p.y - box.top).toFixed(1)}`;
    const pad = (b: Box) => ({
      left: b.left - HINT_CLEAR,
      right: b.right + HINT_CLEAR,
      top: b.top - HINT_CLEAR,
      bottom: b.bottom + HINT_CLEAR,
    });
    const curved: {
      zone: string;
      t: Box;
      fits: (spot: Spot, snug: boolean) => Way | undefined;
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
        : beside(t, w, h).find((b) => holds(box, pad(b)) && covered.covers(pad(b)) === 0);
      if (near) {
        const mid = { x: (near.left + near.right) / 2, y: (near.top + near.bottom) / 2 };
        const start = exit(near, { x: (t.left + t.right) / 2, y: (t.top + t.bottom) / 2 }, 4);
        const end = exit(t, mid, 5);
        const [a, b] = wings(start, end);
        next.push({
          zone: "copy",
          at: { x: mid.x - box.left, y: mid.y - box.top },
          tilt: "level",
          path: `M${x(start)} L${x(end)} M${x(a)} L${x(end)} L${x(b)}`,
        });
        continue;
      }
      const crossed = raster(box, [...solid.filter((r) => !holds(r, t)), t]);
      const blocked = raster(box, [...firm, t]);
      const words = raster(
        box,
        marks.filter((m) => m.glyphs && !target.contains(m.e)).map((m) => m.box),
      );
      const threaded = raster(box, [...firm.filter((r) => !holds(r, t)), t]);
      const cells = [...(figure ?? card).querySelectorAll("td, th")].map((e) =>
        e.getBoundingClientRect(),
      );
      // A label in a slot may sit on a card or off it, never across its edge. It sits in a table's
      // cells only when `snug`, as nothing else fits.
      const fits = (spot: Spot, snug: boolean) => {
        const { edge, dir } = spot;
        const label = slot(t, spot, w, h);
        const clear = pad(label);
        const level = {
          ...label,
          left: label.left - HINT_BERTH,
          right: label.right + HINT_BERTH,
        };
        const sits =
          holds(zone, clear) &&
          blocked.covers(clear) === 0 &&
          words.covers(level) === 0 &&
          (snug || cells.every((r) => overlap(label, r) === 0)) &&
          sheets.every((r) => {
            const o = overlap(label, r);
            return o === 0 || o === area(label);
          });
        if (!sits) return undefined;
        const end = landing(t, edge);
        // A full bend first, away from the target, then half a bend when a neighbour sits close.
        const way = (
          dir === 0
            ? [[0]]
            : [
                [1, -1],
                [0.5, -0.5],
              ]
        )
          .flatMap((bows) =>
            bows
              .map((bow) => arc(label, end, bow))
              .sort((a, b) => OUTWARD[edge](b) - OUTWARD[edge](a)),
          )
          .find((way) => !way.along.some(threaded.has));
        return way && { label, way };
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
        return spots
          .filter((spot, i, all) => i < 1500 && spot.cost < (all[0]?.cost ?? 0) + 600)
          .flatMap(({ label, cost }) =>
            EDGES.flatMap((edge) =>
              ([1, -1] as const).map((bow) => {
                const way = arc(label, landing(t, edge), bow);
                const hits = way.along.filter(
                  (p) =>
                    crossed.has(p) ||
                    !holds(zone, { left: p.x, right: p.x, top: p.y, bottom: p.y }),
                ).length;
                return { label, way, cost: cost + hits * 500 + (way.ny > 0 ? 1 : 0) };
              }),
            ),
          )
          .reduce<(Way & { cost: number }) | undefined>(
            (a, b) => (a && a.cost <= b.cost ? a : b),
            undefined,
          );
      };
      curved.push({ zone: figure?.dataset.side ?? "copy", t, fits, roam });
    }
    // Both panes of a demo take the same slot when one suits them all, so they read alike.
    const tries = [false, true].flatMap((snug) =>
      HINT_SPOTS.map((spot) => [spot, snug] as const),
    );
    const shared = tries.find((at) => curved.every((c) => c.fits(...at)));
    for (const { zone, t, fits, roam } of curved) {
      const pick =
        (shared && fits(...shared)) ?? tries.map((at) => fits(...at)).find(Boolean) ?? roam();
      if (!pick) continue;
      const { label, way } = pick;
      const cx = (label.left + label.right) / 2;
      next.push({
        zone,
        at: { x: cx - box.left, y: (label.top + label.bottom) / 2 - box.top },
        tilt: cx < t.left + (t.right - t.left) / 2 ? "down" : "up",
        path: `M${x(way.start)} C${x(way.c1)} ${x(way.c2)} ${x(way.end)} M${x(way.wings[0])} L${x(way.end)} L${x(way.wings[1])}`,
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
  return () => {
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
