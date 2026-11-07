import { ARROWS, pixels, unit, type HintLook, type PixelArrow, type Point } from "../arrows";
import { isTransitioning } from "../sections/rule-open";

export type Box = { left: number; top: number; right: number; bottom: number };
/**
 * What a hint's label tells the reader to do, by how its target takes input. A target names one in
 * its `data-hint`.
 */
export const HINT = {
  tap: "Tap it",
  press: "Press it",
  open: "Open it",
  edit: "Edit it",
  drag: "Drag it",
  pick: "Pick one",
  each: "Pick each",
  hover: "Hover it",
} as const;
export type HintSay = (typeof HINT)[keyof typeof HINT];

export type Hint = {
  zone: string;
  say: HintSay;
  at: Point;
  label: Box;
  // What the label and the line take up together.
  bounds: Box;
  ring: { box: Box; radius: number };
} & PixelArrow;

type Slot = { edge: "top" | "right" | "bottom" | "left"; dir: -1 | 0 | 1; lean: number };
// The furthest a label stands from its target looking for a line `length` long.
const HINT_STRETCH = 200;
// The shortest line a hint draws to keep off words and controls, so it still reads as an arrow.
const HINT_SHORTEST = 16;
// The room a label keeps round it from words and controls, widest first: it takes the tighter room
// only where no slot keeps the wider, and lands on words only where no slot keeps either.
const HINT_ROOMS = [8, 2];
// The nearest a label stands to its target, so even the shortest line reads as an arrow.
const HINT_NEAREST = 16;
// The sides a label tries round its target, in order: above right, right, their mirror images,
// level beside it, then below. `dir` is the side of the edge's middle it steps toward.
const HINT_SIDES: readonly Omit<Slot, "lean">[] = [
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
];
// How far a label steps sideways off its edge's middle, per px it stands off. Every side tries
// the first lean, so every slot's arrow runs about the same length, before the wider ones that
// reach past a neighbour.
const HINT_LEANS = [14 / 26, 28 / 26, 42 / 26];
const HINT_SLOTS: readonly Slot[] = HINT_LEANS.flatMap((lean, i) =>
  HINT_SIDES.filter(({ dir }) => i === 0 || dir !== 0).map((side) => ({ ...side, lean })),
);
// The spots a toggle's label tries, level beside it or centred under or over it.
const TOGGLE_SLOTS: readonly Slot[] = (["right", "left", "bottom", "top"] as const).map((edge) => ({
  edge,
  dir: 0,
  lean: 0,
}));

function holds(outer: Box, inner: Box) {
  return (
    inner.left >= outer.left &&
    inner.right <= outer.right &&
    inner.top >= outer.top &&
    inner.bottom <= outer.bottom
  );
}

/** The box grown by `by` on every side. */
const grow = (b: Box, by: number): Box => ({
  left: b.left - by,
  top: b.top - by,
  right: b.right + by,
  bottom: b.bottom + by,
});

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

/** A `w` by `h` label at `slot` round `t`, `gap` off its edge. */
function slot(t: Box, { edge, dir, lean }: Slot, gap: number, w: number, h: number): Box {
  const { x: cx, y: cy } = centre(t);
  // Where the label starts along its edge, from the middle `c` of that side of `t`.
  const along = (c: number, size: number) =>
    dir === 0 ? c - size / 2 : dir > 0 ? c + gap * lean : c - gap * lean - size;
  const [left, top] =
    edge === "top" || edge === "bottom"
      ? [along(cx, w), edge === "top" ? t.top - gap - h : t.bottom + gap]
      : [edge === "right" ? t.right + gap : t.left - gap - w, along(cy, h)];
  return { left, top, right: left + w, bottom: top + h };
}

/** How far a hint's ring sits out from its target. */
const RING_GAP = 4;

// How far inside a label's and a target's edges a line passes, so it never just grazes a corner.
const LABEL_INSET = 4;
const TARGET_INSET = 8;

/** The eight ways a pixel line steps evenly, every 45 degrees, as unit vectors. */
const OCTANTS = Array.from({ length: 8 }, (_, i) =>
  unit(Math.round(Math.cos((i * Math.PI) / 4)), Math.round(Math.sin((i * Math.PI) / 4))),
);

/** The four of them that run level or upright, for a line that must meet the middle of a side. */
const AXES = OCTANTS.filter((_, i) => i % 2 === 0);

/** The span of `b` measured along the unit vector `n`, `inset` in from each end. */
function across(b: Box, n: Point, inset: number): [number, number] {
  const spans = [b.left, b.right].flatMap((x) => [b.top, b.bottom].map((y) => n.x * x + n.y * y));
  return [Math.min(...spans) + inset, Math.max(...spans) - inset];
}

/** How far along the line through `p` in direction `u` it enters and leaves `b`. */
function within(b: Box, p: Point, u: Point): [number, number] {
  // Where the line crosses the two edges `lo` and `hi` of one axis, its position `o` and step `d`.
  const slab = (lo: number, hi: number, o: number, d: number): [number, number] => {
    if (!d) return [-Infinity, Infinity];
    const [a, c] = [(lo - o) / d, (hi - o) / d];
    return [Math.min(a, c), Math.max(a, c)];
  };
  const [x0, x1] = slab(b.left, b.right, p.x, u.x);
  const [y0, y1] = slab(b.top, b.bottom, p.y, u.y);
  return [Math.max(x0, y0), Math.min(x1, y1)];
}

/**
 * A straight line from the label to the target, as the spine the pixels follow. It runs at a
 * multiple of 45 degrees, the angles a pixel line steps evenly at, through the middle of the band
 * the label and the target share across it. Of the lines that fit, the one nearest the line between
 * the centres wins. Where none fits, as when a label sits off every diagonal, the line between the
 * centres stands in and the way is not `even`.
 */
function shot(label: Box, target: Box, look: HintLook, ways: readonly Point[]) {
  const from = centre(label);
  const to = centre(target);
  const heading = Math.atan2(to.y - from.y, to.x - from.x);
  const neck = look.head * look.grid;
  const lines = ways.flatMap((u) => {
    const n = { x: -u.y, y: u.x };
    const [a, b] = across(label, n, LABEL_INSET);
    const [c, d] = across(target, n, TARGET_INSET);
    const [lo, hi] = [Math.max(a, c), Math.min(b, d)];
    if (lo > hi) return [];
    const band = (lo + hi) / 2;
    const base = { x: n.x * band, y: n.y * band };
    const leaves = within(label, base, u)[1] + look.labelGap;
    const lands = within(target, base, u)[0] - RING_GAP - look.targetGap;
    if (lands - leaves <= neck) return [];
    const at = (s: number) => ({ x: base.x + u.x * s, y: base.y + u.y * s });
    const off = Math.atan2(u.y, u.x) - heading;
    return [
      {
        start: at(leaves),
        end: at(lands),
        off: Math.abs(Math.atan2(Math.sin(off), Math.cos(off))),
      },
    ];
  });
  const best = lines.sort((p, q) => p.off - q.off)[0];
  const dir = unit(to.x - from.x, to.y - from.y);
  const start = best?.start ?? exit(label, dir, look.labelGap);
  const end = best?.end ?? exit(target, { x: -dir.x, y: -dir.y }, RING_GAP + look.targetGap);
  return {
    spine: [start, end],
    length: Math.hypot(end.x - start.x, end.y - start.y) - neck,
    even: best !== undefined,
  };
}

/** The label at slot `s` round `t` at each gap out from it, until its line runs `longest`. */
function reach(
  t: Box,
  s: Slot,
  w: number,
  h: number,
  look: HintLook,
  longest: number,
  ways: readonly Point[],
) {
  const steps: { label: Box; way: ReturnType<typeof shot> }[] = [];
  for (let gap = HINT_NEAREST; ; gap += 2) {
    const label = slot(t, s, gap, w, h);
    const step = { label, way: shot(label, t, look, ways) };
    steps.push(step);
    if ((step.way.even && step.way.length >= longest) || gap >= HINT_STRETCH)
      return { steps, last: step };
  }
}

/** The nearest label of a `reach` whose line runs `length` before the head at an even angle. */
const pitch = ({ steps, last }: ReturnType<typeof reach>, length: number) =>
  steps.find(({ way }) => way.even && way.length >= length) ?? last;

/** Whether an element paints a fill, as a skeleton bar standing in for a line of text does. */
const painted = ({ backgroundColor, backgroundImage }: CSSStyleDeclaration) =>
  backgroundImage !== "none" || !/^rgba\(.*,\s*0\)$|\/\s*0\)$/.test(backgroundColor);

/**
 * The words, controls and pictures shown in the card, which a hint stays off when it can. Text
 * counts line by line where its glyphs are, so a wide paragraph keeps the space beside its lines.
 * A part waiting at no opacity, as a control shown only on hover does, counts as empty. A part
 * marked `data-hint-solid` counts whole whatever it shows now, as a screen whose rows paint on their
 * own clock does: a label in the gap between its words, or over rows not painted yet, still sits on
 * it. The walk starts under the card, so a card still fading in as a whole keeps its content.
 */
function survey(card: HTMLElement) {
  const marks: { e: Element; box: Box }[] = [];
  const range = document.createRange();
  const visit = (parent: Element) => {
    for (const e of parent.children) {
      const style = getComputedStyle(e);
      if (style.display === "none" || style.opacity === "0" || e.matches('[data-part="hints"]'))
        continue;
      const shown = e.checkVisibility({ visibilityProperty: true });
      if (
        e.matches("button, input, select, textarea, svg, img, [data-hint-solid]") ||
        (!e.firstChild && painted(style))
      ) {
        const box = e.getBoundingClientRect();
        // A screen-reader-only box is 1px.
        if (shown && box.width > 1 && box.height > 1) marks.push({ e, box });
        continue;
      }
      for (const n of shown ? e.childNodes : []) {
        if (n.nodeType !== Node.TEXT_NODE || !n.textContent?.trim()) continue;
        range.selectNodeContents(n);
        for (const box of range.getClientRects()) if (box.width > 1) marks.push({ e, box });
      }
      visit(e);
    }
  };
  visit(card);
  return marks;
}

/** Whether two boxes have no area in common. */
const parted = (a: Box, b: Box) =>
  a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;

/** The box round a point, `by` out on every side. */
const dot = ({ x, y }: Point, by: number): Box =>
  grow({ left: x, top: y, right: x, bottom: y }, by);

/** The box `b` stretched over every point, each `by` out. */
const span = (points: Point[], b: Box, by = 0): Box =>
  points.reduce(
    (a, p) => ({
      left: Math.min(a.left, p.x - by),
      top: Math.min(a.top, p.y - by),
      right: Math.max(a.right, p.x + by),
      bottom: Math.max(a.bottom, p.y + by),
    }),
    b,
  );

/**
 * Whether a label, `by` round it, and the line drawn from it, `ink` wide each side, keep off every
 * box in `marks`.
 */
function clear(label: Box, spine: Point[], marks: Box[], ink: number, by: number) {
  const room = grow(label, by);
  const all = span(spine, room, ink);
  return marks.every(
    (m) => parted(all, m) || (parted(room, m) && spine.every((p) => parted(dot(p, ink), m))),
  );
}

/**
 * What a target's ring wraps: the parts of it marked `data-hint-cover` together, as every answer
 * of a quiz is, or else the target alone.
 */
function covered(target: HTMLElement) {
  const parts = [...target.querySelectorAll<HTMLElement>("[data-hint-cover]")];
  return parts.length > 0 ? parts : [target];
}

const SAYS: readonly string[] = Object.values(HINT);
const isSay = (say: string): say is HintSay => SAYS.includes(say);
function sayOf(target: HTMLElement): HintSay {
  const say = target.dataset.hint ?? "";
  if (!isSay(say)) throw new Error(`data-hint "${say}" is not one of HINT`);
  return say;
}

/**
 * An arrow to every `[data-hint]` in the card, so readers know the demo takes input. A toggle in
 * the copy gets a short one from right beside it, or a longer one where only that keeps it clear.
 * Anything else gets one from a slot round it inside its pane, the same slot in every pane when one
 * suits them all, so the panes read alike. A label and arrow keep off the words and controls when
 * any slot allows it, at the hint's full length or, failing that, a shorter or longer one. When
 * none does the label covers some at full length, as each fades once the reader touches its pane.
 * With `middle`, every line runs level or upright into the middle of a side of its ring, so a ring
 * round a whole group of answers reads as pointing at all of them rather than one.
 */
export function watchHints(
  card: HTMLElement,
  ruler: HTMLElement,
  render: (hints: Hint[]) => void,
  middle = false,
) {
  const place = () => {
    const { hint, toggle } = ARROWS;
    const box = card.getBoundingClientRect();
    const marks = survey(card);
    const clearance = hint.grid / 2 + 1;
    const next: Hint[] = [];
    const local = (b: Box): Box => ({
      left: b.left - box.left,
      top: b.top - box.top,
      right: b.right - box.left,
      bottom: b.bottom - box.top,
    });
    const push = (
      zone: string,
      say: HintSay,
      label: Box,
      spine: Point[],
      t: Box,
      edge: Element,
    ) => {
      const points = spine.map((p) => ({ x: p.x - box.left, y: p.y - box.top }));
      const own = local(label);
      next.push({
        zone,
        say,
        at: centre(own),
        label: own,
        bounds: span(points, own),
        ring: {
          box: grow(local(t), RING_GAP),
          radius: (parseFloat(getComputedStyle(edge).borderRadius) || 0) + RING_GAP,
        },
        ...pixels(points, hint),
      });
    };
    const lengths = [
      hint.length,
      (hint.length + HINT_SHORTEST) / 2,
      HINT_SHORTEST,
      hint.length * 1.5,
      hint.length * 2,
    ];
    // A label and its line, with the widest room it keeps off the marks: 0 when it lands on one,
    // and -1 when it leaves its pane or its line runs at an uneven angle.
    type Way = { label: Box; spine: Point[]; keeps: number };
    const weigh = (label: Box, way: ReturnType<typeof shot>, room: Box, others: Box[]): Way => {
      const { spine } = way;
      const keeps =
        way.even && holds(room, label)
          ? (HINT_ROOMS.find((by) => clear(label, spine, others, clearance, by)) ?? 0)
          : -1;
      return { label, spine, keeps };
    };
    const keeps = (by: number) => (way: Way) => way.keeps >= by;
    // Every slot at every length round `t`.
    const [slots, ways] = middle ? [TOGGLE_SLOTS, AXES] : [HINT_SLOTS, OCTANTS];
    const tiers = (t: Box, room: Box, others: Box[], w: number, h: number) => {
      const reaches = slots.map((s) => reach(t, s, w, h, hint, Math.max(...lengths), ways));
      return lengths.map((length) =>
        reaches.map((r) => {
          const { label, way } = pitch(r, length);
          return weigh(label, way, room, others);
        }),
      );
    };
    const placed: {
      zone: string;
      say: HintSay;
      t: Box;
      edge: Element;
      tiers: ReturnType<typeof tiers>;
    }[] = [];
    for (const target of card.querySelectorAll<HTMLElement>("[data-hint]")) {
      const figure = target.closest<HTMLElement>("figure[data-side]");
      if (figure && getComputedStyle(figure).visibility === "hidden") continue;
      resized.observe(target);
      const parts = covered(target);
      const [edge] = parts;
      const t = parts
        .map((part) => part.getBoundingClientRect())
        .reduce<Box>(
          (all, b) => ({
            left: Math.min(all.left, b.left),
            top: Math.min(all.top, b.top),
            right: Math.max(all.right, b.right),
            bottom: Math.max(all.bottom, b.bottom),
          }),
          { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
        );
      if (t.right <= t.left) continue;
      const say = sayOf(target);
      ruler.lastChild!.textContent = say;
      const w = ruler.offsetWidth;
      const h = ruler.offsetHeight;
      const others = marks
        .filter((m) => !holds(t, m.box) && !holds(m.box, t) && !parts.some((p) => p.contains(m.e)))
        .map((m) => m.box);
      if (!figure) {
        // A toggle's label sits level beside it, or points in from further off where that alone
        // keeps it clear.
        const look = { ...hint, labelGap: toggle.labelGap, targetGap: toggle.targetGap };
        const near = TOGGLE_SLOTS.map((s) => slot(t, s, toggle.reach, w, h))
          .filter((label) => holds(box, label))
          .map((label) => weigh(label, shot(label, t, look, ways), box, others));
        let far: Way[] | undefined;
        const pick =
          HINT_ROOMS.map(
            (by) =>
              near.find(keeps(by)) ?? (far ??= tiers(t, box, others, w, h).flat()).find(keeps(by)),
          ).find(Boolean) ?? near[0];
        if (pick) {
          push("copy", say, pick.label, pick.spine, t, edge!);
          continue;
        }
      }
      const room = (figure ?? card).getBoundingClientRect();
      placed.push({
        zone: figure?.dataset.side ?? "copy",
        say,
        t,
        edge: edge!,
        tiers: tiers(t, room, others, w, h),
      });
    }
    // A clear slot at the full length first, then at each shorter length, then at each longer one,
    // first with the wider room and then the tighter, then any slot in the pane at the full length.
    // In each round a slot every pane shares comes before a pane's own.
    const rounds = [
      ...HINT_ROOMS.flatMap((by) => lengths.map((_, i) => ({ i, by }))),
      { i: 0, by: 0 },
    ].map(({ i, by }) => {
      const ok = keeps(by);
      const shared = HINT_SLOTS.findIndex((_, k) =>
        placed.every((c) => {
          const way = c.tiers[i]?.[k];
          return way !== undefined && ok(way);
        }),
      );
      return { i, ok, shared };
    });
    for (const c of placed) {
      const pick =
        rounds
          .map(({ i, ok, shared }) => c.tiers[i]?.[shared] ?? c.tiers[i]?.find(ok))
          .find(Boolean) ?? c.tiers[0]?.[0];
      if (!pick) continue;
      push(c.zone, c.say, pick.label, pick.spine, c.t, c.edge);
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

/** Calls `shown` once the card is well on screen, and `touched` with each zone the reader touches, or hovers where a hint asks to be hovered. */
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
      (event.target.closest("[data-hint], [data-hint-zone]") ? "copy" : null);
    if (zone) touched(zone);
  };
  // A target that asks to be hovered is done with as soon as the pointer is on it.
  const hover = (event: Event) => {
    if (event.target instanceof Element && event.target.closest(`[data-hint="${HINT.hover}"]`))
      touch(event);
  };
  const kinds = ["pointerdown", "keydown", "input"] as const;
  for (const kind of kinds) card.addEventListener(kind, touch, true);
  card.addEventListener("pointerover", hover, true);
  return () => {
    seen.disconnect();
    for (const kind of kinds) card.removeEventListener(kind, touch, true);
    card.removeEventListener("pointerover", hover, true);
  };
}
