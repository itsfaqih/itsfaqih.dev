import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";

export const marker = stylex.defaultMarker();

// The root's own animation only times the run: its animationend ends the intro.
const hold = stylex.keyframes({ to: { opacity: 1 } });
const slam = stylex.keyframes({
  "0%": { opacity: 0, filter: "blur(8px)", transform: "scale(1.8)" },
  to: { opacity: 1, filter: "none", transform: "none" },
});
const cutIn = stylex.keyframes({
  "0%": { opacity: 1, transform: "translate(-50%,-50%)scale(1.5)skew(-10deg)" },
  to: { opacity: 1, transform: "translate(-50%,-50%)" },
});

export const styles = stylex.create({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    cursor: cursors["--cursor-point"],
    display: { default: "grid", ":is(.no-intro *)": "none" },
    placeItems: "center",
    animationName: { default: null, ":is(.play)": hold },
    animationDuration: { default: null, ":is(.play)": "2000ms" },
    animationTimingFunction: { default: null, ":is(.play)": "linear" },
    animationFillMode: { default: null, ":is(.play)": "forwards" },
  },
  shutter: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#07070a",
    transitionProperty: "transform",
    transitionDuration: "560ms",
    transitionTimingFunction: motion["--cut"],
  },
  top: {
    top: 0,
    borderBottomWidth: "3px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--go"],
    transform: { default: null, [stylex.when.ancestor(":is(.out)")]: "translateY(-101%)" },
  },
  bottom: {
    bottom: 0,
    borderTopWidth: "3px",
    borderTopStyle: "solid",
    borderTopColor: palette["--go"],
    transform: { default: null, [stylex.when.ancestor(":is(.out)")]: "translateY(101%)" },
  },
  stage: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    opacity: { default: null, [stylex.when.ancestor(":is(.out)")]: 0 },
    transitionProperty: "opacity",
    transitionDuration: "120ms",
    transitionTimingFunction: "ease",
  },
  name: {
    font: `900 clamp(36px, 7vw, 84px)/1 ${fonts["--display"]}`,
    color: palette["--text"],
    opacity: 0,
    letterSpacing: "-0.03em",
    animationName: { default: null, [stylex.when.ancestor(":is(.play)")]: slam },
    animationDuration: { default: null, [stylex.when.ancestor(":is(.play)")]: "260ms" },
    animationTimingFunction: {
      default: null,
      [stylex.when.ancestor(":is(.play)")]: motion["--out"],
    },
    animationDelay: { default: null, [stylex.when.ancestor(":is(.play)")]: "150ms" },
    animationFillMode: { default: null, [stylex.when.ancestor(":is(.play)")]: "forwards" },
  },
  slot: {
    position: "relative",
    height: "clamp(56px, 9vw, 110px)",
    marginTop: "18px",
  },
  // Each cut flashes in for a beat, one after another; --i is its place in the run.
  cut: {
    position: "absolute",
    left: "50%",
    top: "50%",
    font: `900 clamp(40px, 8vw, 100px)/1 ${fonts["--display"]}`,
    whiteSpace: "nowrap",
    opacity: 0,
    color: "var(--c)",
    transform: "translate(-50%, -50%)",
    animationName: { default: null, [stylex.when.ancestor(":is(.play)")]: cutIn },
    animationDuration: { default: null, [stylex.when.ancestor(":is(.play)")]: "240ms" },
    animationTimingFunction: {
      default: null,
      [stylex.when.ancestor(":is(.play)")]: motion["--out"],
    },
    animationDelay: {
      default: null,
      [stylex.when.ancestor(":is(.play)")]: "calc(650ms + var(--i) * 260ms)",
    },
  },
  // The last cut holds, longer, until the shutters split.
  lastCut: {
    animationDuration: { default: null, [stylex.when.ancestor(":is(.play)")]: "420ms" },
    animationFillMode: { default: null, [stylex.when.ancestor(":is(.play)")]: "forwards" },
  },
});
