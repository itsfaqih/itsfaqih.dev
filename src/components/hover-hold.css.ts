import { style } from "@vanilla-extract/css";
import { under2 } from "../layers.css";
const HOVER = "(hover: hover) and (pointer: fine)";

/**
 * For an element that moves on hover or press. Lifted, it slides out from under a pointer resting
 * on its bottom edge, drops back under it and lifts again, flickering. Pressed down, it slides out
 * from under a pointer on its top edge, and the release misses it. While it is hovered, its ::before
 * reaches 8px past it above and below, covering the spot it left, so the pointer stays on it until
 * it truly leaves.
 */
export const hoverHold = {
  lift: style({
    "@layer": {
      [under2]: {
        position: "relative",
        selectors: {
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "-8px -2px",
            // Under the element's content, inside the stacking context its lift transform makes.
            zIndex: -1,
            display: "none",
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover::before": {
                display: "block",
              },
            },
          },
        },
      },
    },
  }),
};
