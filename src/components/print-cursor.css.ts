import { motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";

// print-cursor.client.ts toggles .on and .down on the root and sets data-mode.
export const styles = {
  root: style({
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 2147483647,
    pointerEvents: "none",
    visibility: "hidden",
    vars: {
      "--pc-hue": palette["--go"],
    },
    selectors: {
      "&:is(.on:not([data-mode='native']))": {
        visibility: "visible",
      },
    },
  }),
  svg: style({
    position: "absolute",
    top: "-24px",
    left: "-24px",
    width: "48px",
    height: "48px",
    overflow: "visible",
  }),
  crisp: style({
    // A computed key: the anti-slop lint rule bans "shape" in identifiers, and this is a CSS name.
    ["shapeRendering"]: "crispEdges",
  }),
  // Every glyph is solid: black on light, white on dark, edged in the page colour.
  ink: style({
    fill: palette["--bg"],
  }),
  fill: style({
    fill: palette["--text"],
  }),
  dot: style({
    fill: "var(--pc-hue)",
    transition: "fill 180ms ease",
  }),
  body: style({
    transformBox: "view-box",
    transformOrigin: "24px 24px",
    transition: `transform 260ms ${motion["--snap"]}`,
    selectors: {
      [`&${when.ancestor(":is(.down)")}`]: {
        transform: "scale(0.88)",
        transitionDuration: "15ms",
        transitionTimingFunction: "linear",
      },
    },
  }),
};
