import * as stylex from "@stylexjs/stylex";
import { cursors, motion, palette } from "../theme.stylex";

const REDUCE = "@media (prefers-reduced-motion: reduce)";

// One bar in the hue of the section being read, no track, shown while scrolling or within reach.
// page-scrollbar.client.ts sets data-shown, data-gold and data-dragging on the track.
export const styles = stylex.create({
  track: {
    "--sb-hue": palette["--go"],
    position: "fixed",
    top: 0,
    right: "env(safe-area-inset-right, 0px)",
    bottom: 0,
    zIndex: 2147483646,
    width: "24px",
    pointerEvents: { default: "none", ":is([data-shown])": "auto" },
  },
  thumb: {
    position: "absolute",
    top: 0,
    right: "6px",
    width: {
      default: "6px",
      [stylex.when.ancestor(":is([data-shown]:hover, [data-dragging])")]: "10px",
    },
    borderRadius: {
      default: "3px",
      [stylex.when.ancestor(":is([data-shown]:hover, [data-dragging])")]: "5px",
    },
    backgroundColor: {
      default: `color-mix(in oklab, var(--sb-hue) ${palette["--eyebrow-mix"]}, #000)`,
      [stylex.when.ancestor("[data-gold]")]: palette["--go-ink"],
      "@media (forced-colors: active)": {
        default: "CanvasText",
        [stylex.when.ancestor("[data-gold]")]: palette["--go-ink"],
      },
    },
    opacity: { default: 0, [stylex.when.ancestor("[data-shown]")]: 1 },
    cursor: {
      default: cursors["--cursor-grab"],
      [stylex.when.ancestor("[data-dragging]")]: cursors["--cursor-grabbing"],
    },
    // The thumb's width grows in place on a fixed bar, so nothing reflows; reduced motion drops it.
    transitionProperty: {
      default: "opacity, width, background-color",
      [REDUCE]: "opacity, background-color",
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [stylex.when.ancestor("[data-shown]")]: motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor("[data-shown]")]: motion["--fast"],
    },
  },
});

export const marker = stylex.defaultMarker();
