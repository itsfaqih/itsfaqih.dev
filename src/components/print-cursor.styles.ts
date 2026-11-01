import * as stylex from "@stylexjs/stylex";
import { motion, palette } from "../theme.stylex";

const REDUCE = "@media (prefers-reduced-motion: reduce)";

// print-cursor.client.ts toggles .on and .down on the root and sets data-mode.
export const styles = stylex.create({
  root: {
    "--pc-hue": palette["--go"],
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 2147483647,
    pointerEvents: "none",
    visibility: { default: "hidden", ":is(.on:not([data-mode='native']))": "visible" },
  },
  svg: {
    position: "absolute",
    top: "-24px",
    left: "-24px",
    width: "48px",
    height: "48px",
    overflow: "visible",
  },
  crisp: {
    // Kebab-case: the anti-slop lint rule bans "shape" in identifiers, and this is a CSS name.
    "shape-rendering": "crispEdges",
  },
  // Every glyph is solid: black on light, white on dark, edged in the page colour.
  ink: {
    fill: palette["--bg"],
  },
  fill: {
    fill: palette["--text"],
  },
  dot: {
    fill: "var(--pc-hue)",
    transition: "fill 180ms ease",
  },
  body: {
    transformBox: "view-box",
    transformOrigin: "24px 24px",
    transform: {
      default: null,
      [stylex.when.ancestor(":is(.down)")]: { default: "scale(0.88)", [REDUCE]: null },
    },
    transition: `transform 260ms ${motion["--snap"]}`,
    transitionDuration: { default: null, [stylex.when.ancestor(":is(.down)")]: "15ms" },
    transitionTimingFunction: { default: null, [stylex.when.ancestor(":is(.down)")]: "linear" },
  },
});

export const marker = stylex.defaultMarker();
