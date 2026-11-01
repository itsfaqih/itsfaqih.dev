import * as stylex from "@stylexjs/stylex";
import { motion } from "../theme.stylex";

const REDUCE = "@media (prefers-reduced-motion: reduce)";

/**
 * One hover highlight per group of alternatives (Fluid Functionalism's fluid hover). The pointer
 * lights the `[data-fluid-item]` under it, and a single highlight springs to that item's box, so it
 * glides from item to item instead of blinking off and on. It holds its place across the gaps
 * between items; another link or button, or leaving the group, puts it out. A fresh entry fades in
 * where it lands instead of sliding in from the last item.
 *
 * The group takes `fluidHover.group` and the highlight `fluidHover.highlight`. Items keep their own
 * colour change on hover but no hover background. Call the returned `clear` when the items move
 * under a resting pointer.
 */
export function watchFluidHover(group: HTMLElement, highlight: HTMLElement, signal: AbortSignal) {
  let litItem: HTMLElement | null = null;

  const clear = () => {
    litItem = null;
    highlight.removeAttribute("data-on");
  };

  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const item =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-fluid-item]")
        : null;
    if (!item || !group.contains(item)) {
      if (event.target instanceof Element && event.target.closest("a, button")) clear();
      return;
    }
    if (item.getAttribute("aria-disabled") === "true") {
      clear();
      return;
    }
    if (item === litItem) return;
    litItem = item;
    const area = group.getBoundingClientRect();
    const box = item.getBoundingClientRect();
    placeHighlight(highlight, {
      x: box.left - area.left,
      y: box.top - area.top,
      w: box.width,
      h: box.height,
    });
  };

  group.addEventListener("pointerover", onPointerOver, { signal });
  group.addEventListener("pointerleave", clear, { signal });
  return clear;
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
