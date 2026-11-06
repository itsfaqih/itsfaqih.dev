export type Point = { x: number; y: number };

/** The golden ratio. A hint's curve takes its proportions from it. */
const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * How every arrow on the site looks, by family, in px. Each family's brush is a marker stroke:
 * `tail` wide at the nock, swelling to `body`, under a solid head `head` long and `barb` wide whose
 * back is cut `notch` deep. The dev-only tuner edits these in place and redraws, so read them at
 * draw time, never into a module constant.
 */
export const ARROWS = {
  /** "Try it" arrows in a demo pane. */
  hint: {
    tail: 0.7,
    body: 2.7,
    head: 10,
    barb: 10,
    notch: 3,
    // A curve at least `loop` long before its neck curls once, `curl` in radius; 0 never curls.
    loop: 64,
    curl: 7,
    // How long the curve runs before the head. A label steps out from its target until its curve
    // is this long. Where that lands on words or controls it tries shorter curves, then longer ones.
    length: 48,
    // Each end turns off the line between the centres by the angle whose tangent is 1/φ², and each
    // control point sits 1/φ² of the curve out from its end.
    bow: 1 / PHI ** 2,
    handle: 1 / PHI ** 2,
    // The tightest a curve may bend, as a radius. A bow that would bend tighter eases off.
    bend: 20,
    labelGap: 6,
    targetGap: 6,
  },
  /** "Try it" arrows beside a toggle in a lesson's copy. They share the hint's brush. */
  toggle: {
    reach: 41,
    labelGap: 4,
    targetGap: 5,
  },
  /** The arrows under Squint's notes. */
  squint: {
    tail: 0.6,
    body: 2.2,
    head: 5.5,
    barb: 6.5,
    notch: 1.6,
    length: 12,
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

export type ArrowFamily = keyof typeof ARROWS;
export type HintLook = typeof ARROWS.hint;
type ToggleLook = typeof ARROWS.toggle;
type SectionArrows = { hint?: Partial<HintLook>; toggle?: Partial<ToggleLook> };

/**
 * A lesson's own hint arrows, keyed by sectionKey(), over the values above. Squint and hero
 * arrows each appear in one section, so their values above are already that section's.
 */
export const SECTIONS = new Map<string, SectionArrows>([]);

/** The hint arrows of the lesson `section`, or the site's when it has none of its own. */
export function arrowsFor(section: string | undefined) {
  const own = section === undefined ? undefined : SECTIONS.get(section);
  return {
    hint: { ...ARROWS.hint, ...own?.hint },
    toggle: { ...ARROWS.toggle, ...own?.toggle },
  };
}

/** A lesson's key in SECTIONS: its page and title, as in "button-design/give-every-state-a-look". */
export function sectionKey(path: string, title: string) {
  const page =
    path
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/\.html$/, "") ?? "";
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${page}/${slug}`;
}

/** The window event the tuner fires after it edits ARROWS, so drawn arrows redraw. */
export const ARROWS_CHANGED = "arrows";

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

/**
 * The centreline with one hand-drawn curl, a prolate cycloid `curl` in radius, centred 42% along
 * it on the outside of its bend. A line shorter than `loop`, or a `loop` of 0, comes back as it was.
 */
export function looped(points: Point[], loop: number, curl: number) {
  const { s, total, at } = walk(points);
  if (!loop || total < loop) return points;
  const span = Math.PI * curl;
  const from = total * 0.42 - span / 2;
  const { p: mid, dir } = at(from + span / 2);
  const first = points[0] ?? mid;
  const last = points.at(-1) ?? mid;
  const chord = { x: last.x - first.x, y: last.y - first.y };
  // Which side of the chord the curve bows to, then that side of the direction of travel.
  const bulge = chord.x * (mid.y - first.y) - chord.y * (mid.x - first.x);
  const out = bulge * (chord.x * dir.x + chord.y * dir.y) >= 0 ? 1 : -1;
  const side = { x: -dir.y * out, y: dir.x * out };
  // The cycloid's phase starts where it moves forward, so the curl leaves and rejoins the line along
  // its tangent rather than doubling back on it.
  const curled = Array.from({ length: 41 }, (_, k) => {
    const u = k / 40;
    const { p } = at(from + span * u);
    const turn = 2 * Math.PI * u;
    const ahead = curl * Math.sin(turn);
    const off = curl * (1 - Math.cos(turn));
    return { x: p.x + ahead * dir.x + off * side.x, y: p.y + ahead * dir.y + off * side.y };
  });
  return [
    ...points.filter((_, i) => (s[i] ?? 0) < from),
    ...curled,
    ...points.filter((_, i) => (s[i] ?? 0) > from + span),
  ];
}

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

export type BrushArrow = ReturnType<typeof brush>;

/** A marker arrow `length` long pointing down, in a box that just fits it. */
export function downArrow(look: typeof ARROWS.squint) {
  const pad = 1;
  const x = look.barb / 2 + pad;
  const arrow = brush(
    [
      { x, y: pad },
      { x, y: pad + look.length },
    ],
    look,
  );
  return { ...arrow, width: +(2 * x).toFixed(2), height: +(look.length + 2 * pad).toFixed(2) };
}
