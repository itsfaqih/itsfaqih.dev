import { palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { scrollbarThumb } from "./scrollbar.css";

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
      "--sb-width": "6px",
      "--sb-wide": "10px",
      "--sb-right": "6px",
    },
    selectors: {
      "&:is([data-shown])": {
        pointerEvents: "auto",
      },
    },
  }),
  thumb: scrollbarThumb,
};
