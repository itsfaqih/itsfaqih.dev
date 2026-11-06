import {
  ARROWS_CHANGED,
  arrowsFor,
  pixels,
  walk,
  type HintLook,
  type PixelArrow,
  type Point,
} from "../arrows";
import { isTransitioning } from "../sections/rule-open";

export type Box = { left: number; top: number; right: number; bottom: number };
export type Hint = {
  zone: string;
  at: Point;
  label: Box;
  // What the label and the line take up together.
  bounds: Box;
  // Round the target, 4px out, its corners following the target's.
  ring: { box: Box; radius: number };
} & PixelArrow;

type Slot = { edge: "top" | "right" | "bottom" | "left"; dir: -1 | 0 | 1; lean: number };
// The furthest a label stands from its target looking for a curve `length` long.
const HINT_STRETCH = 200;
// The shortest curve a hint draws to keep off words and controls, so it still reads as a curve.
const HINT_SHORTEST = 24;
// The room a label keeps round it from words and controls, widest first: it takes the tighter room
// only where no slot keeps the wider, and lands on words only where no slot keeps either.
const HINT_ROOMS = [8, 2];
// The nearest a label stands to its target, so even the shortest curve reads as an arrow.
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

/**
 * A hand-drawn arc from the label to the target, its head still to add. It leaves the label on a
 * ray from the label's centre and lands on a ray into the target's centre, so the nock points back
 * at the word and the head at the target. Both rays turn off the line between the centres by the
 * angle whose tangent is `bow`, its sign the side, so even a label level with its target draws a
 * curve. The ray into the target snaps to the nearest 45 degrees, the ways a pixel head can point.
 */
function arc(label: Box, target: Box, bow: number, look: HintLook) {
  const from = centre(label);
  const to = centre(target);
  const heading = Math.atan2(to.y - from.y, to.x - from.x);
  const turn = Math.atan(bow);
  const out = { x: Math.cos(heading + turn), y: Math.sin(heading + turn) };
  const snapped = Math.round((heading - turn) / (Math.PI / 4)) * (Math.PI / 4);
  const into = { x: Math.cos(snapped), y: Math.sin(snapped) };
  const start = exit(label, out, look.labelGap);
  const end = exit(target, { x: -into.x, y: -into.y }, look.targetGap);
  // The head's length runs straight along the ray, so the head sits square on the line.
  const neck = {
    x: end.x - into.x * look.head * look.grid,
    y: end.y - into.y * look.head * look.grid,
  };
  const handle = Math.hypot(neck.x - start.x, neck.y - start.y) * look.handle;
  const c1 = { x: start.x + out.x * handle, y: start.y + out.y * handle };
  const c2 = { x: neck.x - into.x * handle, y: neck.y - into.y * handle };
  // How far the head leans off square to the page, plus a hair for an arc that sags rather than
  // arches, so of the two sides the one that lands straighter wins. The middle is the curve's.
  const sags = (start.y + 3 * c1.y + 3 * c2.y + neck.y) / 8 > (start.y + end.y) / 2;
  const skew = 1 - Math.max(Math.abs(into.x), Math.abs(into.y)) + (sags ? 1e-3 : 0);
  return { start, c1, c2, neck, end, skew };
}

/** The smallest radius a cubic Bézier bends through, sampled along it. */
function tightest(p0: Point, p1: Point, p2: Point, p3: Point) {
  const d = (a: Point, b: Point) => ({ x: b.x - a.x, y: b.y - a.y });
  const [a, b, c] = [d(p0, p1), d(p1, p2), d(p2, p3)];
  const [e, f] = [d(a, b), d(b, c)];
  let least = Infinity;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const u = 1 - t;
    const v = {
      x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
      y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
    };
    const w = { x: u * e.x + t * f.x, y: u * e.y + t * f.y };
    const cross = Math.abs(v.x * w.y - v.y * w.x);
    // The derivatives' factors of 3 and 6 leave the radius |B'|³/|B'×B''| a factor of 3/2.
    if (cross) least = Math.min(least, (1.5 * Math.hypot(v.x, v.y) ** 3) / cross);
  }
  return least;
}

/** How far a bow eases off the golden turn, a step at a time, when it would bend too tight. */
const EASES = [1, 3 / 4, 1 / 2, 1 / 4];

/**
 * The arc to whichever side lands its head squarer, as the centreline the pixels follow. Where both
 * sides bend tighter than the look allows, the bow eases until one does not. Where none does, as
 * when a label sits too near its target to leave room for the head, the gentlest arc stands in and
 * the way is not `gentle`.
 */
function bowed(label: Box, target: Box, look: HintLook) {
  let best: (ReturnType<typeof arc> & { bend: number }) | undefined;
  search: for (const ease of EASES) {
    const sides = [1, -1]
      .map((side) => arc(label, target, side * ease * look.bow, look))
      .sort((a, b) => a.skew - b.skew);
    for (const a of sides) {
      const bend = tightest(a.start, a.c1, a.c2, a.neck);
      if (!best || bend > best.bend) best = { ...a, bend };
      if (bend >= look.bend) break search;
    }
  }
  const { start, c1, c2, neck, end, bend } = best!;
  const curve = Array.from({ length: 31 }, (_, i) => {
    const t = i / 30;
    const u = 1 - t;
    return {
      x: u ** 3 * start.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * neck.x,
      y: u ** 3 * start.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * neck.y,
    };
  });
  return { curve, end, length: walk(curve).total, gentle: bend >= look.bend };
}

/** The label at slot `s` round `t` at each gap out from it, until its curve runs `longest`. */
function reach(t: Box, s: Slot, w: number, h: number, look: HintLook, longest: number) {
  const steps: { label: Box; way: ReturnType<typeof bowed> }[] = [];
  for (let gap = HINT_NEAREST; ; gap += 2) {
    const label = slot(t, s, gap, w, h);
    const step = { label, way: bowed(label, t, look) };
    steps.push(step);
    if ((step.way.gentle && step.way.length >= longest) || gap >= HINT_STRETCH)
      return { steps, last: step };
  }
}

/** The nearest label of a `reach` whose curve runs `length` before the head without a hook. */
const pitch = ({ steps, last }: ReturnType<typeof reach>, length: number) =>
  steps.find(({ way }) => way.gentle && way.length >= length) ?? last;

/** Whether an element paints a fill, as a skeleton bar standing in for a line of text does. */
const painted = ({ backgroundColor, backgroundImage }: CSSStyleDeclaration) =>
  backgroundImage !== "none" || !/^rgba\(.*,\s*0\)$|\/\s*0\)$/.test(backgroundColor);

/**
 * The words, controls and pictures shown in the card, which a hint stays off when it can. Text
 * counts line by line where its glyphs are, so a wide paragraph keeps the space beside its lines.
 * A part waiting at no opacity, as a control shown only on hover does, counts as empty. The walk
 * starts under the card, so a card still fading in as a whole keeps its content.
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
        e.matches("button, input, select, textarea, svg, img") ||
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
 * An arrow to every `[data-hint]` in the card, so readers know the demo takes input. A toggle in
 * the copy gets a short one from right beside it, or a curved one where only that keeps it clear.
 * Anything else gets one from a slot round it inside its pane, the same slot in every pane when one
 * suits them all, so the panes read alike. A label and arrow keep off the words and controls when
 * any slot allows it, at the hint's full length or, failing that, a shorter or longer one. When
 * none does the label covers some at full length, as each fades once the reader touches its pane.
 */
export function watchHints(card: HTMLElement, ruler: HTMLElement, render: (hints: Hint[]) => void) {
  const place = () => {
    const { hint, toggle } = arrowsFor(card.dataset.arrows);
    const box = card.getBoundingClientRect();
    const w = ruler.offsetWidth;
    const h = ruler.offsetHeight;
    const marks = survey(card);
    // The cells are wider than the centreline, so a line keeps off by half a cell and a hair.
    const ink = hint.grid / 2 + 1;
    const next: Hint[] = [];
    const local = (b: Box): Box => ({
      left: b.left - box.left,
      top: b.top - box.top,
      right: b.right - box.left,
      bottom: b.bottom - box.top,
    });
    const push = (zone: string, label: Box, spine: Point[], target: HTMLElement) => {
      const points = spine.map((p) => ({ x: p.x - box.left, y: p.y - box.top }));
      const own = local(label);
      next.push({
        zone,
        at: centre(own),
        label: own,
        bounds: span(points, own),
        ring: {
          box: grow(local(target.getBoundingClientRect()), 4),
          radius: (parseFloat(getComputedStyle(target).borderRadius) || 0) + 4,
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
    // and -1 when it leaves its pane or its curve hooks.
    type Way = { label: Box; spine: Point[]; keeps: number };
    const weigh = (label: Box, way: ReturnType<typeof bowed>, room: Box, others: Box[]): Way => {
      const spine = [...way.curve, way.end];
      const keeps =
        way.gentle && holds(room, label)
          ? (HINT_ROOMS.find((by) => clear(label, spine, others, ink, by)) ?? 0)
          : -1;
      return { label, spine, keeps };
    };
    const keeps = (by: number) => (way: Way) => way.keeps >= by;
    // Every slot at every length round `t`.
    const tiers = (t: Box, room: Box, others: Box[]) => {
      const reaches = HINT_SLOTS.map((s) => reach(t, s, w, h, hint, Math.max(...lengths)));
      return lengths.map((length) =>
        reaches.map((r) => {
          const { label, way } = pitch(r, length);
          return weigh(label, way, room, others);
        }),
      );
    };
    const curved: { zone: string; target: HTMLElement; tiers: ReturnType<typeof tiers> }[] = [];
    for (const target of card.querySelectorAll<HTMLElement>("[data-hint]")) {
      const figure = target.closest<HTMLElement>("figure[data-side]");
      if (figure && getComputedStyle(figure).visibility === "hidden") continue;
      resized.observe(target);
      const t = target.getBoundingClientRect();
      if (t.width === 0) continue;
      const others = marks
        .filter((m) => !target.contains(m.e) && !holds(m.box, t))
        .map((m) => m.box);
      if (!figure) {
        // A toggle's label sits level beside it, or curves in from further off where that alone
        // keeps it clear.
        const look = { ...hint, labelGap: toggle.labelGap, targetGap: toggle.targetGap };
        const near = TOGGLE_SLOTS.map((s) => slot(t, s, toggle.reach, w, h))
          .filter((label) => holds(box, label))
          .map((label) => weigh(label, bowed(label, t, look), box, others));
        let far: Way[] | undefined;
        const pick =
          HINT_ROOMS.map(
            (by) => near.find(keeps(by)) ?? (far ??= tiers(t, box, others).flat()).find(keeps(by)),
          ).find(Boolean) ?? near[0];
        if (pick) {
          push("copy", pick.label, pick.spine, target);
          continue;
        }
      }
      const room = (figure ?? card).getBoundingClientRect();
      curved.push({ zone: figure?.dataset.side ?? "copy", target, tiers: tiers(t, room, others) });
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
        curved.every((c) => {
          const way = c.tiers[i]?.[k];
          return way !== undefined && ok(way);
        }),
      );
      return { i, ok, shared };
    });
    for (const c of curved) {
      const pick =
        rounds
          .map(({ i, ok, shared }) => c.tiers[i]?.[shared] ?? c.tiers[i]?.find(ok))
          .find(Boolean) ?? c.tiers[0]?.[0];
      if (!pick) continue;
      push(c.zone, pick.label, pick.spine, c.target);
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
