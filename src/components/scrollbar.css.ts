import { cursors, motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
import { REDUCE } from "../browser/media-query";

// The thumb of both scrollbars. Its track sets --sb-hue, and its size as --sb-width, --sb-wide
// (while hovered or dragged) and --sb-right.
export const scrollbarThumb = style({
  position: "absolute",
  top: 0,
  right: "var(--sb-right)",
  width: "var(--sb-width)",
  borderRadius: "calc(var(--sb-width) / 2)",
  backgroundColor: `color-mix(in oklab, var(--sb-hue) ${palette["--eyebrow-mix"]}, #000)`,
  opacity: 0,
  cursor: cursors["--cursor-grab"],
  // The thumb's width grows in place on a positioned bar, so nothing reflows; reduced motion drops it.
  transitionProperty: "opacity, width, background-color",
  transitionDuration: motion["--t-fast-exit"],
  transitionTimingFunction: motion["--exit"],
  selectors: {
    [`&${when.ancestor(":is([data-shown]:hover, [data-dragging])")}`]: {
      width: "var(--sb-wide)",
      borderRadius: "calc(var(--sb-wide) / 2)",
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
});
