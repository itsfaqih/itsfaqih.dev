import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { under1 } from "../layers.css";
// The root's own animation only times the run: its animationend ends the intro.
const hold = keyframes({
  to: { opacity: 1 },
});
const slam = keyframes({
  "0%": { opacity: 0, filter: "blur(8px)", transform: "scale(1.8)" },
  to: { opacity: 1, filter: "none", transform: "none" },
});
const cutIn = keyframes({
  "0%": { opacity: 1, transform: "translate(-50%,-50%)scale(1.5)skew(-10deg)" },
  to: { opacity: 1, transform: "translate(-50%,-50%)" },
});

export const styles = {
  root: style({
    position: "fixed",
    inset: 0,
    zIndex: 100,
    cursor: cursors["--cursor-point"],
    display: "grid",
    placeItems: "center",
    selectors: {
      "&:is(.no-intro *)": {
        display: "none",
      },
      "&:is(.play)": {
        animationName: hold,
        animationDuration: "2000ms",
        animationTimingFunction: "linear",
        animationFillMode: "forwards",
      },
    },
  }),
  shutter: style({
    position: "absolute",
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#07070a",
    transitionProperty: "transform",
    transitionDuration: "560ms",
    transitionTimingFunction: motion["--cut"],
  }),
  top: style({
    top: 0,
    borderBottomWidth: "3px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--go"],
    selectors: {
      [`&${when.ancestor(":is(.out)")}`]: {
        transform: "translateY(-101%)",
      },
    },
  }),
  bottom: style({
    bottom: 0,
    borderTopWidth: "3px",
    borderTopStyle: "solid",
    borderTopColor: palette["--go"],
    selectors: {
      [`&${when.ancestor(":is(.out)")}`]: {
        transform: "translateY(101%)",
      },
    },
  }),
  stage: style({
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    transitionProperty: "opacity",
    transitionDuration: "120ms",
    transitionTimingFunction: "ease",
    selectors: {
      [`&${when.ancestor(":is(.out)")}`]: {
        opacity: 0,
      },
    },
  }),
  name: style({
    font: `900 clamp(36px, 7vw, 84px)/1 ${fonts["--display"]}`,
    color: palette["--text"],
    opacity: 0,
    letterSpacing: "-0.03em",
    selectors: {
      [`&${when.ancestor(":is(.play)")}`]: {
        animationName: slam,
        animationDuration: "260ms",
        animationTimingFunction: motion["--out"],
        animationDelay: "150ms",
        animationFillMode: "forwards",
      },
    },
  }),
  slot: style({
    position: "relative",
    height: "clamp(56px, 9vw, 110px)",
    marginTop: "18px",
  }),
  // Each cut flashes in for a beat, one after another; --i is its place in the run.
  cut: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        left: "50%",
        top: "50%",
        font: `900 clamp(40px, 8vw, 100px)/1 ${fonts["--display"]}`,
        whiteSpace: "nowrap",
        opacity: 0,
        color: "var(--c)",
        transform: "translate(-50%, -50%)",
        selectors: {
          [`&${when.ancestor(":is(.play)")}`]: {
            animationName: cutIn,
            animationDuration: "240ms",
            animationTimingFunction: motion["--out"],
            animationDelay: "calc(650ms + var(--i) * 260ms)",
          },
        },
      },
    },
  }),
  // The last cut holds, longer, until the shutters split.
  lastCut: style({
    selectors: {
      [`&${when.ancestor(":is(.play)")}`]: {
        animationDuration: "420ms",
        animationFillMode: "forwards",
      },
    },
  }),
};
