/* Outline geometry for the morph between hero scenes. Every outline is resampled to the same
   number of points, clockwise from the point nearest twelve o'clock, so any two outlines
   blend point by point without twisting. */

type Pt = readonly [number, number];
export type Outline = Pt[];

const OUTLINE_POINTS = 64;

const centroid = (pts: readonly Pt[]): Pt => [
  pts.reduce((sum, [x]) => sum + x, 0) / pts.length,
  pts.reduce((sum, [, y]) => sum + y, 0) / pts.length,
];

const signedArea = (pts: readonly Pt[]) =>
  pts.reduce((sum, [x, y], k) => {
    const [nx, ny] = pts[(k + 1) % pts.length]!;
    return sum + x * ny - nx * y;
  }, 0);

function resample(vertices: readonly Pt[]): Outline {
  const ring = signedArea(vertices) < 0 ? [...vertices].reverse() : [...vertices];
  const edges = ring.map((from, k) => {
    const to = ring[(k + 1) % ring.length]!;
    return { from, to, length: Math.hypot(to[0] - from[0], to[1] - from[1]) };
  });
  const perimeter = edges.reduce((sum, edge) => sum + edge.length, 0);
  const out: Pt[] = [];
  let edge = 0;
  let walked = 0;
  for (let k = 0; k < OUTLINE_POINTS; k++) {
    const at = (k / OUTLINE_POINTS) * perimeter;
    while (walked + edges[edge]!.length < at) walked += edges[edge++]!.length;
    const { from, to, length } = edges[edge]!;
    const t = length ? (at - walked) / length : 0;
    out.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
  }
  const [cx, cy] = centroid(out);
  const offTop = ([x, y]: Pt) => Math.abs(Math.atan2(x - cx, cy - y));
  const start = out.reduce((best, pt, k) => (offTop(pt) < offTop(out[best]!) ? k : best), 0);
  return [...out.slice(start), ...out.slice(0, start)];
}

const arcPoints = (cx: number, cy: number, r: number, fromDeg: number, toDeg: number, steps: number) =>
  Array.from({ length: steps + 1 }, (_, k): Pt => {
    const a = ((fromDeg + ((toDeg - fromDeg) * k) / steps) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

export const circle = (cx: number, cy: number, r: number) =>
  resample(arcPoints(cx, cy, r, -90, 270, OUTLINE_POINTS).slice(0, -1));

export const rect = (x: number, y: number, w: number, h: number) =>
  resample([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

export const polygon = (...vertices: Pt[]) => resample(vertices);

export const sector = (cx: number, cy: number, r: number, fromDeg: number, toDeg: number) =>
  resample([[cx, cy], ...arcPoints(cx, cy, r, fromDeg, toDeg, 24)]);

/** The outline shrunk to a point at its centre, for a token whose drawing is hidden. */
export const collapsed = (outline: Outline): Outline => {
  const [x, y] = centroid(outline);
  return dot(x, y);
};

export const dot = (x: number, y: number): Outline => Array.from({ length: OUTLINE_POINTS }, () => [x, y]);

/** Applies a CSS `translate(dx, dy) rotate(deg)` turned about the outline's own centre, the
    way the scenes' fill-box transforms do. */
export function moved(outline: Outline, dx: number, dy: number, deg = 0, scale = 1): Outline {
  const xs = outline.map(([x]) => x);
  const ys = outline.map(([, y]) => y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const a = (deg * Math.PI) / 180;
  const [cos, sin] = [Math.cos(a), Math.sin(a)];
  return outline.map(([x, y]) => {
    const [ox, oy] = [(x - cx) * scale, (y - cy) * scale];
    return [cx + dx + ox * cos - oy * sin, cy + dy + ox * sin + oy * cos];
  });
}

/** Traces a drawing the browser has rendered, carried through `matrix` into the outline's space. */
export function traced(drawing: SVGGeometryElement, matrix: DOMMatrixReadOnly): Outline {
  const length = drawing.getTotalLength();
  const samples = OUTLINE_POINTS * 4;
  return resample(
    Array.from({ length: samples }, (_, k): Pt => {
      const { x, y } = drawing.getPointAtLength((k / samples) * length);
      const { a, b, c, d, e, f } = matrix;
      return [a * x + c * y + e, b * x + d * y + f];
    }),
  );
}

export const blend = (from: Outline, to: Outline, t: number): Outline =>
  from.map(([x, y], k) => [x + (to[k]![0] - x) * t, y + (to[k]![1] - y) * t]);

export const toPath = (outline: Outline) =>
  `M${outline.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
