import {
  ARROWS_CHANGED,
  arrowsFor,
  brush,
  looped,
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

// How far a label steps sideways off its edge's middle, per px of reach, so every slot's arrow
// runs about the same length.
const HINT_LEAN = 14 / 26;
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
type Slot = (typeof HINT_SLOTS)[number];

function holds(outer: Box, inner: Box) {
  return (
    inner.left >= outer.left &&
    inner.right <= outer.right &&
    inner.top >= outer.top &&
    inner.bottom <= outer.bottom
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

/** A `w` by `h` label at `slot` round `t`, `gap` off its edge. */
function slot(t: Box, { edge, dir }: Slot, gap: number, w: number, h: number): Box {
  const { x: cx, y: cy } = centre(t);
  const shift = gap * HINT_LEAN;
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
 * angle, to the `side` given, so even a label level with its target draws a curve.
 */
function arc(label: Box, target: Box, side: 1 | -1, look: HintLook) {
  const from = centre(label);
  const to = centre(target);
  const heading = Math.atan2(to.y - from.y, to.x - from.x);
  const turn = Math.atan(side * look.bow);
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
  // How far the head leans off square to the page, plus a hair for an arc that sags rather than
  // arches, so of the two sides the one that lands straighter wins.
  const middle = curve[15] ?? start;
  const sags = middle.y > (start.y + end.y) / 2;
  const skew = 1 - Math.max(Math.abs(into.x), Math.abs(into.y)) + (sags ? 1e-3 : 0);
  return { spine: [...looped(curve, look.loop, look.curl), end], skew };
}

/** The arc to whichever side lands its head squarer. */
function bowed(label: Box, target: Box, look: HintLook) {
  const [a, b] = [arc(label, target, 1, look), arc(label, target, -1, look)];
  return a.skew <= b.skew ? a : b;
}

/** Spots right beside a target, nearest side first, for a label with a short arrow. */
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

/**
 * An arrow to every `[data-hint]` in the card, so readers know the demo takes input. A toggle in
 * the copy gets a short one from right beside it. Anything else gets the first slot round it that
 * stays inside its pane, the same slot in every pane when one fits them all, so the panes read
 * alike. A label may cover other content, since each fades once the reader touches the pane it
 * points into.
 */
export function watchHints(card: HTMLElement, ruler: HTMLElement, render: (hints: Hint[]) => void) {
  const place = () => {
    const { hint, toggle } = arrowsFor(card.dataset.arrows);
    const box = card.getBoundingClientRect();
    const w = ruler.offsetWidth;
    const h = ruler.offsetHeight;
    const next: Hint[] = [];
    const push = (zone: string, label: Box, tilt: Hint["tilt"], way: ReturnType<typeof arc>) => {
      const mid = centre(label);
      next.push({
        zone,
        at: { x: mid.x - box.left, y: mid.y - box.top },
        tilt,
        ...brush(
          way.spine.map((p) => ({ x: p.x - box.left, y: p.y - box.top })),
          hint,
        ),
      });
    };
    const curved: { zone: string; room: Box; t: Box }[] = [];
    for (const target of card.querySelectorAll<HTMLElement>("[data-hint]")) {
      const figure = target.closest<HTMLElement>("figure[data-side]");
      if (figure && getComputedStyle(figure).visibility === "hidden") continue;
      resized.observe(target);
      const t = target.getBoundingClientRect();
      if (t.width === 0) continue;
      const near = figure ? undefined : beside(t, w, h, toggle).find((b) => holds(box, b));
      if (near) {
        const look = { ...hint, labelGap: toggle.labelGap, targetGap: toggle.targetGap };
        push("copy", near, "level", bowed(near, t, look));
        continue;
      }
      curved.push({
        zone: figure?.dataset.side ?? "copy",
        room: (figure ?? card).getBoundingClientRect(),
        t,
      });
    }
    const fits = (s: Slot, { room, t }: (typeof curved)[number]) =>
      holds(room, slot(t, s, hint.reach, w, h));
    const shared = HINT_SLOTS.find((s) => curved.every((c) => fits(s, c)));
    for (const c of curved) {
      const label = slot(
        c.t,
        shared ?? HINT_SLOTS.find((s) => fits(s, c)) ?? HINT_SLOTS[0],
        hint.reach,
        w,
        h,
      );
      push(c.zone, label, centre(label).x < centre(c.t).x ? "down" : "up", bowed(label, c.t, hint));
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
