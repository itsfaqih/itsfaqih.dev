type Pt = readonly [number, number];
export type Outline = Pt[];
/** The coordinates a print is drawn in, on the scene. Its halftone's dots turn and scale with it. */
export type Frame = { deg: number; scale: number; x: number; y: number };

export const shifted = (x = 0, y = 0): Frame => ({ deg: 0, scale: 1, x, y });

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

const arcPoints = (
  cx: number,
  cy: number,
  r: number,
  fromDeg: number,
  toDeg: number,
  steps: number,
) =>
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

export const collapsed = (outline: Outline): Outline => {
  const [x, y] = centroid(outline);
  return dot(x, y);
};

export const dot = (x: number, y: number): Outline =>
  Array.from({ length: OUTLINE_POINTS }, () => [x, y]);

export function boxCentre(outline: Outline): Pt {
  const xs = outline.map(([x]) => x);
  const ys = outline.map(([, y]) => y);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

const turnOf = ({ deg, scale }: Frame) => {
  const a = (deg * Math.PI) / 180;
  return [scale * Math.cos(a), scale * Math.sin(a)] as const;
};

export function movedFrame(outline: Outline, dx: number, dy: number, deg = 0): Frame {
  const [cx, cy] = boxCentre(outline);
  const [cos, sin] = turnOf({ deg, scale: 1, x: 0, y: 0 });
  return { deg, scale: 1, x: cx + dx - cx * cos + cy * sin, y: cy + dy - cx * sin - cy * cos };
}

export function moved(outline: Outline, dx: number, dy: number, deg = 0): Outline {
  const frame = movedFrame(outline, dx, dy, deg);
  const [cos, sin] = turnOf(frame);
  return outline.map(([x, y]) => [frame.x + x * cos - y * sin, frame.y + x * sin + y * cos]);
}

export const frameOf = ({ a, b, e, f }: DOMMatrixReadOnly): Frame => ({
  deg: (Math.atan2(b, a) * 180) / Math.PI,
  scale: Math.hypot(a, b),
  x: e,
  y: f,
});

export const blendFrame = (from: Frame, to: Frame, t: number): Frame => ({
  deg: from.deg + (to.deg - from.deg) * t,
  scale: from.scale + (to.scale - from.scale) * t,
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

/** The outline in the frame's own coordinates, so whatever fills it lies in that frame. */
export function inFrame(outline: Outline, frame: Frame): Outline {
  const [cos, sin] = turnOf(frame);
  const area = cos * cos + sin * sin;
  return outline.map(([x, y]) => {
    const [ox, oy] = [x - frame.x, y - frame.y];
    return [(ox * cos + oy * sin) / area, (oy * cos - ox * sin) / area];
  });
}

export const frameTransform = ({ deg, scale, x, y }: Frame) =>
  `translate(${x} ${y}) rotate(${deg}) scale(${scale})`;

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
