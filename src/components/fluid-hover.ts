import * as stylex from "@stylexjs/stylex";
import { useRef, type PointerEvent } from "react";
import { motion } from "../theme.stylex";

const REDUCE = "@media (prefers-reduced-motion: reduce)";

/**
 * One hover highlight per group of alternatives (Fluid Functionalism's fluid hover). The pointer
 * lights the `[data-fluid-item]` under it, and a single highlight springs to that item's box, so it
 * glides from item to item instead of blinking off and on. It holds its place across the gaps
 * between items; another link or button, or leaving the group, puts it out. A fresh entry fades in
 * where it lands instead of sliding in from the last item.
 *
 * The group takes `fluidHover.group` and `handlers`, and renders the highlight with
 * `ref={highlightRef}`. Items keep their own colour change on hover but no hover background. Call
 * `clear` when the items move under a resting pointer.
 */
export function useFluidHover() {
  const highlightRef = useRef<HTMLSpanElement>(null);
  const litItem = useRef<HTMLElement | null>(null);

  const out = () => {
    litItem.current = null;
    highlightRef.current?.removeAttribute("data-on");
  };

  const onPointerOver = (event: PointerEvent<HTMLElement>) => {
    const highlight = highlightRef.current;
    if (!highlight || event.pointerType === "touch") return;
    const item =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-fluid-item]")
        : null;
    if (!item || !event.currentTarget.contains(item)) {
      if (event.target instanceof Element && event.target.closest("a, button")) out();
      return;
    }
    if (item.getAttribute("aria-disabled") === "true") {
      out();
      return;
    }
    if (item === litItem.current) return;
    litItem.current = item;
    const group = event.currentTarget.getBoundingClientRect();
    const box = item.getBoundingClientRect();
    placeHighlight(highlight, {
      x: box.left - group.left,
      y: box.top - group.top,
      w: box.width,
      h: box.height,
    });
  };

  return { highlightRef, clear: out, handlers: { onPointerOver, onPointerLeave: out } };
}

/**
 * Moves a `fluidHover.highlight` onto a box in its group's coordinates and lights it. An unlit
 * highlight jumps there and fades in; a lit one springs over. Axes left out keep their value.
 */
export function placeHighlight(
  highlight: HTMLElement,
  box: { x?: number; y: number; w?: number; h: number },
) {
  const fresh = !highlight.hasAttribute("data-on");
  if (fresh) highlight.setAttribute("data-fresh", "");
  for (const [axis, value] of Object.entries(box)) {
    highlight.style.setProperty(`--${axis}`, `${value}px`);
  }
  if (fresh) {
    // Commit the jump before the transitions come back, so a fresh entry only fades.
    highlight.getBoundingClientRect();
    highlight.removeAttribute("data-fresh");
  }
  highlight.setAttribute("data-on", "");
}

export const fluidHover = stylex.create({
  group: {
    position: "relative",
    isolation: "isolate",
  },
  // Sized from the item's box on a leaf with nothing inside, so it reflows nothing around it.
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
    width: "var(--w, 0px)",
    height: "var(--h, 0px)",
    transform: "translate(var(--x, 0px), var(--y, 0px))",
    pointerEvents: "none",
    opacity: { default: 0, ":is([data-on])": 1 },
    transitionProperty: {
      default: "opacity, transform, width, height",
      ":is([data-fresh])": "opacity",
      [REDUCE]: "opacity",
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([data-on])": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-on])": motion["--fast"],
    },
  },
});
