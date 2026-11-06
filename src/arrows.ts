export type Point = { x: number; y: number };

/**
 * How every arrow on the site looks, by family. Lengths are px, angles degrees. The dev-only tuner
 * edits these in place and redraws, so read them at draw time, never into a module constant.
 */
export const ARROWS = {
  /** "Try it" arrows in a demo pane. */
  hint: {
    stroke: 2.25,
    wing: 8,
    spread: (0.5 * 180) / Math.PI,
    reach: 26,
    bend: 40,
    bow: 0.32,
    tail: 0.2,
    knee: 0.72,
    labelGap: 6,
    targetGap: 6,
  },
  /** "Try it" arrows beside a toggle in a lesson's copy. They share the hint's stroke and head. */
  toggle: {
    reach: 26,
    labelGap: 4,
    targetGap: 5,
  },
  /** The arrows under Squint's notes. */
  squint: {
    stroke: 2,
    length: 12,
    wing: 5,
    spread: (Math.atan2(3, 4) * 180) / Math.PI,
  },
  /** The ghost arrows in the hero's queue scene. */
  hero: {
    wing: 6,
    spread: 45,
  },
};

export type ArrowFamily = keyof typeof ARROWS;
export type HintLook = typeof ARROWS.hint;
export type ToggleLook = typeof ARROWS.toggle;
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

/** The CSS variable that carries a family's stroke width, so the tuner can change it live. */
export const strokeVar = (family: "hint" | "squint") => `--arrow-${family}-stroke`;

/** The two strokes of a head at `tip`, for a line arriving from `from`. */
export function head(from: Point, tip: Point, wing: number, spread: number): [Point, Point] {
  const heading = Math.atan2(tip.y - from.y, tip.x - from.x);
  const turn = (spread * Math.PI) / 180;
  const barb = (side: number) => ({
    x: tip.x - wing * Math.cos(heading + side * turn),
    y: tip.y - wing * Math.sin(heading + side * turn),
  });
  return [barb(1), barb(-1)];
}

/** A straight arrow pointing down, sized to fit its own stroke. */
export function downArrow({ stroke, length, wing, spread }: typeof ARROWS.squint) {
  const turn = (spread * Math.PI) / 180;
  const half = wing * Math.sin(turn);
  const width = 2 * (half + stroke);
  const height = length + stroke;
  const x = width / 2;
  const top = stroke / 2;
  const [a, b] = head({ x, y: top }, { x, y: top + length }, wing, spread);
  const n = (v: number) => +v.toFixed(2);
  return {
    width: n(width),
    height: n(height),
    d: `M${n(x)} ${n(top)}v${n(length)}M${n(a.x)} ${n(a.y)}L${n(x)} ${n(top + length)}L${n(b.x)} ${n(b.y)}`,
  };
}
