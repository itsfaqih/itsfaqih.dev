import { cursors, motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
import { under1 } from "../layers.css";
const FINE = "(hover: hover) and (pointer: fine)";

/** Goes on the scrolling box: hides its native bar where the box scrollbar takes over, a fine pointer. */
export const boxScrollbarHost = {
  box: style({
    "@media": {
      [FINE]: {
        scrollbarWidth: "none",
        selectors: {
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      },
    },
  }),
};

const REDUCE = "(prefers-reduced-motion: reduce)";

// watchBoxScrollbar sets data-shown, data-gold and data-dragging on the track.
export const boxScrollbar = {
  track: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        width: "18px",
        pointerEvents: "none",
        vars: {
          "--sb-hue": palette["--go"],
        },
        selectors: {
          "&:is([data-shown])": {
            pointerEvents: "auto",
          },
        },
      },
    },
  }),
  thumb: style({
    position: "absolute",
    top: 0,
    right: "4px",
    width: "5px",
    borderRadius: "2.5px",
    backgroundColor: `color-mix(in oklab, var(--sb-hue) ${palette["--eyebrow-mix"]}, #000)`,
    opacity: 0,
    cursor: cursors["--cursor-grab"],
    transitionProperty: "opacity, width, background-color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      [`&${when.ancestor(":is([data-shown]:hover, [data-dragging])")}`]: {
        width: "8px",
        borderRadius: "4px",
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
