export type Point = { x: number; y: number };

/**
 * How every arrow on the site looks, by family, in px. A hint is drawn in `grid` px cells and ends
 * in a pixel head `head` rows deep. Hero arrows are marker strokes: `tail` wide at the nock,
 * swelling to `body`, under a solid head `head` long and `barb` wide whose back is cut `notch` deep.
 */
export const ARROWS = {
  /** Hint arrows in a demo pane. Toggle and quiz arrows draw with the same cells. */
  hint: {
    grid: 3,
    head: 3,
    // How long the line runs before the head. A label steps out from its target until its line is
    // this long. Where that lands on words or controls it tries shorter lines, then longer ones.
    length: 22,
    labelGap: 6,
    targetGap: 6,
  },
  toggle: {
    reach: 41,
    labelGap: 4,
    targetGap: 5,
  },
  /** The ghost arrows in the hero's queue scene. */
  hero: {
    tail: 0.6,
    body: 1.8,
    head: 7,
    barb: 7,
    notch: 2,
  },
};

export type HintLook = typeof ARROWS.hint;

/** The width of the outline that rounds a brush arrow's filled edges. */
export const OUTLINE = 0.6;

export type Brush = { tail: number; body: number; head: number; barb: number; notch: number };

/** How far along its centreline the brush reaches full width. */
const SWELL = 0.7;
// Longer segments split so the body's width eases along them rather than jumping at each end.
const STEP = 2;

const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
export const unit = (x: number, y: number): Point => {
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
};

/** A polyline with the distance walked to each of its points, and the point at any distance. */
export function walk(points: Point[]) {
  const s: number[] = [];
  points.reduce((sum, p, i) => {
    const q = points[i - 1] ?? p;
    const next = sum + Math.hypot(p.x - q.x, p.y - q.y);
    s.push(next);
    return next;
  }, 0);
  const total = s.at(-1) ?? 0;
  const at = (d: number) => {
    const found = s.findIndex((v) => v >= d);
    const i = found < 0 ? points.length - 1 : Math.max(1, found);
    const a = points[i - 1] ?? { x: 0, y: 0 };
    const b = points[i] ?? a;
    const span = (s[i] ?? 0) - (s[i - 1] ?? 0);
    return {
      p: lerp(a, b, span ? (d - (s[i - 1] ?? 0)) / span : 0),
      dir: unit(b.x - a.x, b.y - a.y),
    };
  };
  return { s, total, at };
}

const octant = (angle: number) => Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

export const fmt = (p: Point) => `${+p.x.toFixed(2)} ${+p.y.toFixed(2)}`;

/**
 * A marker arrow along `spine`, a centreline that ends at the tip and runs straight for its last
 * `head` px. `ink` outlines the tapered body and the notched head, to fill. `spine` is the
 * centreline, to stroke `reveal` wide in a mask that draws the arrow in.
 */
export function brush(spine: Point[], look: Brush) {
  const fine = spine.flatMap((p, i) => {
    const q = spine[i - 1];
    if (!q) return [p];
    const n = Math.ceil(Math.hypot(p.x - q.x, p.y - q.y) / STEP);
    return Array.from({ length: n }, (_, k) => lerp(q, p, (k + 1) / n));
  });
  const { s, total, at } = walk(fine);
  const tip = fine.at(-1) ?? { x: 0, y: 0 };
  const { dir } = at(total);
  const across = { x: -dir.y, y: dir.x };
  // The body runs on into the notch so the two overlap and no seam shows between them.
  const stop = total - look.head + look.notch;
  const body = [...fine.filter((_, i) => (s[i] ?? 0) < stop), at(stop).p];
  const reach = [...s.filter((v) => v < stop), stop];
  const left: Point[] = [];
  const right: Point[] = [];
  body.forEach((p, i) => {
    const ahead = body[i + 1] ?? p;
    const behind = body[i - 1] ?? p;
    const t = unit(ahead.x - behind.x, ahead.y - behind.y);
    const swell = Math.sin(
      (Math.min((reach[i] ?? 0) / Math.max(stop, 1) / SWELL, 1) * Math.PI) / 2,
    );
    const half = (look.tail + (look.body - look.tail) * swell) / 2;
    left.push({ x: p.x - t.y * half, y: p.y + t.x * half });
    right.push({ x: p.x + t.y * half, y: p.y - t.x * half });
  });
  const outline = [...left, ...right.reverse()];
  const hw = look.barb / 2;
  const back = look.notch / 2;
  const base = { x: tip.x - dir.x * (look.head + back), y: tip.y - dir.y * (look.head + back) };
  const barb = (side: number) => ({
    x: base.x + across.x * hw * side,
    y: base.y + across.y * hw * side,
  });
  const notch = {
    x: tip.x - dir.x * (look.head - look.notch),
    y: tip.y - dir.y * (look.head - look.notch),
  };
  // Each side of the notch bows toward the tip, like the cut a marker leaves.
  const bow = (b: Point) => {
    const mid = lerp(b, notch, 0.5);
    return { x: mid.x + (dir.x * look.notch) / 3, y: mid.y + (dir.y * look.notch) / 3 };
  };
  // The head winds the same way as the body, so where they overlap stays filled under nonzero.
  const [r, l] = [barb(-1), barb(1)];
  const head = `M${fmt(tip)} L${fmt(r)} Q${fmt(bow(r))} ${fmt(notch)} Q${fmt(bow(l))} ${fmt(l)} Z`;
  return {
    ink: `M${outline.map(fmt).join(" L")} Z ${head}`,
    spine: `M${spine.map(fmt).join(" L")}`,
    reveal: +(look.barb + 2).toFixed(2),
  };
}

/**
 * The cell that joins two cells meeting only at a corner, which would read as a gap in the line:
 * whichever of the two the trail, at `p`, passed nearer to.
 */
function bridge(from: Point, to: Point, p: Point, grid: number) {
  const off = (q: Point) => Math.hypot((q.x + 0.5) * grid - p.x, (q.y + 0.5) * grid - p.y);
  const across = { x: to.x, y: from.y };
  const down = { x: from.x, y: to.y };
  return off(across) <= off(down) ? across : down;
}

export function pixels(spine: Point[], look: { grid: number; head: number }) {
  const { grid, head } = look;
  const { total, at } = walk(spine);
  const cell = (p: Point) => ({ x: Math.floor(p.x / grid), y: Math.floor(p.y / grid) });
  const stop = total - head * grid;
  const steps = Math.ceil((stop / grid) * 4);
  const path: Point[] = [];
  for (let k = 0; stop > 0 && k <= steps; k++) {
    const { p } = at((stop * k) / steps);
    const c = cell(p);
    const last = path.at(-1);
    if (last && last.x === c.x && last.y === c.y) continue;
    if (last && last.x !== c.x && last.y !== c.y) path.push(bridge(last, c, p, grid));
    path.push(c);
  }
  const { dir } = at(total);
  const turn = octant(Math.atan2(dir.y, dir.x));
  const d = { x: Math.round(Math.cos(turn)), y: Math.round(Math.sin(turn)) };
  const tip = cell(spine.at(-1)!);
  const arrowhead: Point[] = [];
  for (let r = head; r >= 0; r--) {
    if (d.x && d.y) {
      for (let i = 0; i <= r; i++) arrowhead.push({ x: tip.x - d.x * i, y: tip.y - d.y * (r - i) });
    } else if (r < head) {
      for (let w = -r; w <= r; w++)
        arrowhead.push({ x: tip.x - d.x * r - d.y * w, y: tip.y - d.y * r + d.x * w });
    }
  }
  const taken = new Set(arrowhead.map((c) => `${c.x},${c.y}`));
  return {
    grid,
    cells: [...path.filter((c) => !taken.has(`${c.x},${c.y}`)), ...arrowhead].map((c) => ({
      x: c.x * grid,
      y: c.y * grid,
    })),
    spine: `M${spine.map(fmt).join(" L")}`,
  };
}

export type PixelArrow = ReturnType<typeof pixels>;

/**
 * How a hint moves, in ms. Its label pops in over `popFor`. Its trail shoots out from `trailAt` over
 * `trailFor`, fast off the label and slowing into the target, then its ring pulses `ringGrows` px
 * out. It leaves the way it came: the trail pulls back from the tip into the label over
 * `retractFor`, and the label fades from `labelLeavesAt` over `labelLeavesFor`.
 */
export const HINT_MOTION = {
  popFor: 260,
  trailAt: 140,
  trailFor: 420,
  ringGrows: 10,
  retractFor: 200,
  labelLeavesAt: 140,
  labelLeavesFor: 180,
};

/** How long a hint takes to leave, label and all. */
export const HINT_LEAVE = HINT_MOTION.labelLeavesAt + HINT_MOTION.labelLeavesFor;

// Where an ease-out has a run of `count` steps by step `i`, from 0 to 1, so it starts fast and settles.
const eased = (i: number, count: number) => 1 - Math.sqrt(1 - i / Math.max(1, count - 1));

/**
 * When trail cell `i` of `count` shows on the way in (`at`), the label end first, and hides on the
 * way out (`out`), the tip first.
 */
export const cellTimes = (i: number, count: number) => ({
  at: HINT_MOTION.trailAt + eased(i, count) * HINT_MOTION.trailFor,
  out: eased(count - 1 - i, count) * HINT_MOTION.retractFor,
});
