import { cursors, motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
const REDUCE = "(prefers-reduced-motion: reduce)";

// One bar in the hue of the section being read, no track, shown while scrolling or within reach.
// page-scrollbar.client.ts sets data-shown, data-gold and data-dragging on the track.
export const styles = {
  track: style({
    position: "fixed",
    top: 0,
    right: "env(safe-area-inset-right, 0px)",
    bottom: 0,
    zIndex: 2147483646,
    width: "24px",
    pointerEvents: "none",
    vars: {
      "--sb-hue": palette["--go"],
    },
    selectors: {
      "&:is([data-shown])": {
        pointerEvents: "auto",
      },
    },
  }),
  thumb: style({
    position: "absolute",
    top: 0,
    right: "6px",
    width: "6px",
    borderRadius: "3px",
    backgroundColor: `color-mix(in oklab, var(--sb-hue) ${palette["--eyebrow-mix"]}, #000)`,
    opacity: 0,
    cursor: cursors["--cursor-grab"],
    // The thumb's width grows in place on a fixed bar, so nothing reflows; reduced motion drops it.
    transitionProperty: "opacity, width, background-color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      [`&${when.ancestor(":is([data-shown]:hover, [data-dragging])")}`]: {
        width: "10px",
        borderRadius: "5px",
      },
      [`&${when.ancestor("[data-dragging]")}`]: {
        cursor: cursors["--cursor-grabbing"],
      },
      [`&${when.ancestor("[data-gold]")}`]: {
        backgroundColor: palette["--go-ink"],
      },
      [`&${when.ancestor("[data-shown]")}`]: {
        opacity: 1,
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      "(forced-colors: active)": {
        backgroundColor: "CanvasText",
        selectors: {
          [`&${when.ancestor("[data-gold]")}`]: {
            backgroundColor: palette["--go-ink"],
          },
        },
      },
      [REDUCE]: {
        transitionProperty: "opacity, background-color",
      },
    },
  }),
};
