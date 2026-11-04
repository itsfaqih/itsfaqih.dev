import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
// The dots sit on a halftone screen like the hero's prints: a square grid turned by atan(1/3),
// about 18°. At that angle the screen repeats every ten steps of U, so it still tiles.
export const U = 5;
export const TILE = U * 10;

export const styles = {
  // The custom element that holds the screen's template takes no box.
  host: style({
    display: "none",
  }),
  root: style({
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    // Fade the grid toward the middle so it frames the content instead of sitting under copy.
    mask: "radial-gradient(ellipse 75% 65% at 50% 45%, rgb(0 0 0 / 0.45), #000)",
  }),
  layer: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      },
    },
  }),
  // The resting screen in the theme's --dot, under the canvas's lit dots. It is one tile taller, so
  // sliding it up by a part of a tile never bares the bottom edge.
  grid: style({
    height: `calc(100% + ${TILE}px)`,
    willChange: "transform",
    backgroundPosition: "0 0",
    backgroundSize: `${TILE}px ${TILE}px`,
  }),
};
