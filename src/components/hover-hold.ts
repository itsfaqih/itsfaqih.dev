import * as stylex from "@stylexjs/stylex";

/**
 * For an element that lifts on hover. Lifted, it slides out from under a pointer resting on its
 * bottom edge, drops back under it and lifts again, flickering. While it is hovered, its ::before
 * keeps covering the spot it left (8px below, for a lift of a few pixels and a slight tilt), so
 * the pointer stays on it until it truly leaves.
 */
export const hoverHold = stylex.create({
  lift: {
    position: "relative",
    "::before": {
      content: '""',
      position: "absolute",
      inset: "0 -2px -8px",
      // Under the element's content, inside the stacking context its lift transform makes.
      zIndex: -1,
      display: { default: "none", ":hover": "block" },
    },
  },
});
