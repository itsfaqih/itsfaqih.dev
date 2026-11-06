// The rules every drawn arrow keeps, as the user stated them while the arrows were tuned. Each check
// takes an arrow in page px and returns what is wrong, or undefined. src/arrows.test.ts runs them
// over the Squint and hero arrows, and tests/visual/arrows.test.ts over the hint and toggle arrows
// the rule pages draw. CODE_STRUCTURE.md ("Arrows") lists every kind and where it is drawn.

export type Point = { x: number; y: number };
export type Box = { left: number; top: number; right: number; bottom: number };

/**
 * One drawn arrow: `spine` runs from the nock to the tip, `ink` is the filled outline `brush()`
 * drew along it, ending in the head, and `matrix` maps both from their SVG units to page px.
 */
export type Drawn = { spine: Point[]; ink: string; matrix?: number[] };

/** The shortest arrow, in px, nock to tip (hints.ts HINT_SHORTEST is its curve before the head). */
export const SHORTEST = 24;
/** How far a head may lean off the stroke it ends. a5a5128 fixed heads up to 34° off to 2.4°. */
export const HEAD_LEAN = 2.4;
// A head's ray passes through its target's middle, a nock's back through its word's: within a
// quarter of the box's shorter side of its centre, so it hits the item and not its edge.
const AIM = 1 / 4;
// Coordinates come rounded to 0.01px, so a curve this far off its chord still reads as straight.
const STRAIGHT = 1;

const numbers = (d: string) => (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
const pairs = (n: number[]) =>
  Array.from({ length: Math.floor(n.length / 2) }, (_, i) => ({ x: n[2 * i]!, y: n[2 * i + 1]! }));

/** The points of an `M x y L x y …` path. */
export const polyline = (d: string) => pairs(numbers(d));

export function transform(p: Point, m?: number[]): Point {
  if (!m) return p;
  const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = m;
  return { x: a * p.x + c * p.y + e, y: b * p.x + d * p.y + f };
}

/** The head `brush()` closes the ink with: its tip, both barbs and the notch between them. */
export function head({ ink, matrix }: Drawn) {
  const last = ink.slice(ink.lastIndexOf("M"));
  const [tip, r, , notch, , l] = pairs(numbers(last)).map((p) => transform(p, matrix));
  if (!tip || !r || !notch || !l) return undefined;
  return { tip, r, notch, l };
}

export const spineOf = ({ spine, matrix }: Drawn) => spine.map((p) => transform(p, matrix));

const sub = (a: Point, b: Point) => ({ x: a.x - b.x, y: a.y - b.y });
const len = (v: Point) => Math.hypot(v.x, v.y);
/** The angle between two directions, in degrees. */
export function angle(u: Point, v: Point) {
  const cos = (u.x * v.x + u.y * v.y) / (len(u) * len(v) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** The polyline's length, and the point `d` px along it. */
export function measure(points: Point[]) {
  const s = [0];
  for (let i = 1; i < points.length; i++) s.push(s[i - 1]! + len(sub(points[i]!, points[i - 1]!)));
  const total = s.at(-1) ?? 0;
  const at = (d: number): Point => {
    const found = s.findIndex((v) => v >= d);
    const i = found < 0 ? points.length - 1 : Math.max(1, found);
    const a = points[i - 1]!;
    const b = points[i] ?? a;
    const span = s[i]! - s[i - 1]!;
    const t = span ? (d - s[i - 1]!) / span : 0;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };
  return { total, at };
}

export const centre = (b: Box): Point => ({ x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 });

/** How far a point lies outside a box, 0 inside it. */
export function outside(p: Point, b: Box) {
  const dx = Math.max(b.left - p.x, 0, p.x - b.right);
  const dy = Math.max(b.top - p.y, 0, p.y - b.bottom);
  return Math.hypot(dx, dy);
}

/** How far `p` lies from the ray that leaves `from` along `dir`, or Infinity behind it. */
function wide(from: Point, dir: Point, p: Point) {
  const d = sub(p, from);
  const l = len(dir) || 1;
  const ahead = (d.x * dir.x + d.y * dir.y) / l;
  return ahead <= 0 ? Infinity : Math.abs(dir.x * d.y - dir.y * d.x) / l;
}

const middle = (b: Box) => AIM * Math.min(b.right - b.left, b.bottom - b.top);

/** The head stops no more than `gap` off its target, on a ray through the target's middle. */
export function aimsAt(points: Point[], target: Box, gap: number) {
  const { total, at } = measure(points);
  const tip = at(total);
  const off = wide(tip, sub(tip, at(total - 4)), centre(target));
  const miss = outside(tip, target);
  if (off > middle(target) || miss > gap + 2 || miss === 0)
    return `head's ray passes ${off.toFixed(1)}px from its target's centre (up to ${middle(target).toFixed(1)}) and stops ${miss.toFixed(1)}px from it (gap ${gap})`;
  return undefined;
}

/** The nock leaves no more than `gap` off its word, on a ray back through the word's middle. */
export function leaves(points: Point[], source: Box, gap: number) {
  const { at } = measure(points);
  const nock = at(0);
  const off = wide(nock, sub(nock, at(3)), centre(source));
  const miss = outside(nock, source);
  if (off > middle(source) || miss > gap + 2)
    return `nock's ray passes ${off.toFixed(1)}px from its word's centre (up to ${middle(source).toFixed(1)}) and leaves ${miss.toFixed(1)}px from it (gap ${gap})`;
  return undefined;
}

export function longEnough(points: Point[]) {
  const { total } = measure(points);
  return total + 1e-6 < SHORTEST ? `${total.toFixed(1)}px long, under ${SHORTEST}px` : undefined;
}

/**
 * The tightest radius the line bends through: at each pixel along it, the circle through the
 * points `H` px behind and ahead. Spanning several px keeps a polyline's corners (hints.ts draws
 * each curve as 30 straight pieces) and rounding to 0.01px from reading as sharp bends. A curl (a
 * loop the line makes on purpose, `looped()` in arrows.ts) turns most of a circle and is left
 * out: the rule is the arc's.
 */
export function tightest(points: Point[], bend: number) {
  const H = 6;
  const { total, at } = measure(points);
  const n = Math.floor(total);
  if (n < 2 * H + 1) return undefined;
  const p = Array.from({ length: n + 1 }, (_, i) => at(i));
  const radius = (a: Point, b: Point, c: Point) => {
    const cross = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    return cross > 1e-9
      ? (len(sub(b, a)) * len(sub(c, b)) * len(sub(c, a))) / (2 * cross)
      : Infinity;
  };
  const heading = (i: number) => Math.atan2(p[i + 1]!.y - p[i]!.y, p[i + 1]!.x - p[i]!.x);
  const swept = (from: number, to: number) => {
    let sum = 0;
    for (let i = Math.max(0, from); i < Math.min(n - 1, to); i++) {
      let d = heading(i + 1) - heading(i);
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      sum += d;
    }
    return Math.abs(sum);
  };
  const r = p.map((q, i) => (i < H || i > n - H ? Infinity : radius(p[i - H]!, q, p[i + H]!)));
  let least = Infinity;
  for (let i = 0; i < r.length;) {
    if (r[i]! >= bend) {
      i++;
      continue;
    }
    let j = i;
    while (j < r.length && r[j]! < bend) j++;
    if (swept(i - H, j + H) < 1.5 * Math.PI) least = Math.min(least, ...r.slice(i, j));
    i = j;
  }
  return least < bend ? `bends through a ${least.toFixed(1)}px radius, under ${bend}px` : undefined;
}

/** How far the line strays from the straight line between its ends. */
export function sag(points: Point[]) {
  const a = points[0]!;
  const b = points.at(-1)!;
  const d = sub(b, a);
  const l = len(d) || 1;
  return Math.max(...points.map((p) => Math.abs(d.x * (p.y - a.y) - d.y * (p.x - a.x)) / l));
}

/**
 * Where the word sits level with its target, or square above or below it, a straight arrow fits
 * between them, so the arrow is straight.
 */
export function straightWhereItFits(points: Point[], source: Box, target: Box) {
  const s = centre(source);
  const t = centre(target);
  const aligned = Math.abs(s.y - t.y) <= 1 || Math.abs(s.x - t.x) <= 1;
  const off = sag(points);
  return aligned && off > STRAIGHT
    ? `curves ${off.toFixed(1)}px off straight though its word sits square to its target`
    : undefined;
}

/**
 * The head sits square on the stroke: its axis runs along the line's last stretch and both barbs
 * reach as far. A head that leans reads as a check mark, the "ugly head" a5a5128 fixed.
 */
export function squareHead(drawn: Drawn) {
  const h = head(drawn);
  if (!h) return "has no head";
  const points = spineOf(drawn);
  const { total, at } = measure(points);
  const reach = len(sub(h.tip, h.notch));
  const stroke = sub(h.tip, at(Math.max(0, total - reach - 2)));
  const axis = sub(h.tip, { x: (h.r.x + h.l.x) / 2, y: (h.r.y + h.l.y) / 2 });
  const lean = angle(axis, stroke);
  const lopsided = Math.abs(len(sub(h.tip, h.r)) - len(sub(h.tip, h.l)));
  const off = len(sub(h.tip, at(total)));
  if (lean > HEAD_LEAN || lopsided > 0.3 || off > 0.5)
    return `head leans ${lean.toFixed(1)}° off its stroke, barbs differ by ${lopsided.toFixed(2)}px, tip ${off.toFixed(2)}px off the line's end`;
  return undefined;
}

/**
 * The same rule for a head built of `grid` px cells (the pixel hints on feat/pixel-arrows): the
 * line's last stretch runs along one of the eight ways a pixel head can point, and the head's cells
 * mirror each other across it. `cells` are the cells' top-left corners, in the spine's units, and
 * `head` how many rows deep the head is.
 */
export function squarePixelHead(spine: Point[], cells: Point[], grid: number, head: number) {
  if (!cells.length) return "has no head";
  const { total, at } = measure(spine);
  const end = at(total);
  const stroke = sub(end, at(Math.max(0, total - head * grid)));
  const octant = Math.round(Math.atan2(stroke.y, stroke.x) / (Math.PI / 4)) * (Math.PI / 4);
  const u = { x: Math.cos(octant), y: Math.sin(octant) };
  const lean = angle(stroke, u);
  const centreOf = (c: Point) => ({ x: c.x + grid / 2, y: c.y + grid / 2 });
  const tip = centreOf({ x: Math.floor(end.x / grid) * grid, y: Math.floor(end.y / grid) * grid });
  const centres = cells.map(centreOf);
  // The head's own rows: `head` deep along a diagonal, `head - 1` along an axis, as pixels() builds
  // it. The trail's cells behind them are the line's, and a diagonal line's staircase sits to one
  // side by nature.
  const diagonal = Math.abs(u.x) > 0.1 && Math.abs(u.y) > 0.1;
  const deep = (diagonal ? head / Math.SQRT2 + 0.25 : head - 0.5) * grid;
  const near = centres.filter((c) => {
    const d = sub(c, tip);
    const along = d.x * u.x + d.y * u.y;
    return along >= -deep && along <= grid / 2 && len(d) <= (head + 0.5) * grid * Math.SQRT2;
  });
  const unmatched = near.filter((c) => {
    const d = sub(c, tip);
    const along = d.x * u.x + d.y * u.y;
    const mirror = { x: tip.x + 2 * along * u.x - d.x, y: tip.y + 2 * along * u.y - d.y };
    return !centres.some((q) => len(sub(q, mirror)) < grid / 4);
  });
  if (lean > HEAD_LEAN || unmatched.length || !near.length)
    return `pixel head leans ${lean.toFixed(1)}° off its stroke, ${unmatched.length} of its ${near.length} cells without a mirror`;
  return undefined;
}

export const intersects = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

export const grow = (b: Box, by: number): Box => ({
  left: b.left - by,
  top: b.top - by,
  right: b.right + by,
  bottom: b.bottom + by,
});

/** Every point 1px apart along the line. */
export function samples(points: Point[]) {
  const { total, at } = measure(points);
  return Array.from({ length: Math.ceil(total) + 1 }, (_, i) => at(Math.min(i, total)));
}

/** Whether a line `ink` px wide each side, or a label, touches a box. */
export const touches = (line: Point[], label: Box | undefined, box: Box, ink: number) =>
  (label !== undefined && intersects(label, box)) ||
  samples(line).some((p) => outside(p, box) < ink);

/** Whether two lines come within `ink` of each other, each `ink` px wide each side. */
export const crosses = (a: Point[], b: Point[], ink: number) => {
  const bs = samples(b);
  return samples(a).some((p) => bs.some((q) => len(sub(p, q)) < 2 * ink));
};
