import { palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { scrollbarThumb } from "./scrollbar.css";
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
          "--sb-width": "5px",
          "--sb-wide": "8px",
          "--sb-right": "4px",
        },
        selectors: {
          "&:is([data-shown])": {
            pointerEvents: "auto",
          },
        },
      },
    },
  }),
  thumb: scrollbarThumb,
};
