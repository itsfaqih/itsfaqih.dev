import { palette } from "../../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../../when";
import { under1 } from "../../layers.css";
export const INOUT = "cubic-bezier(0.65, 0, 0.35, 1)";
export const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const SCENE = "var(--scene-duration)";
const REDUCE = "(prefers-reduced-motion: reduce)";

const settle = keyframes({
  "0%": { transform: "translate(var(--dx), var(--dy)) rotate(var(--r,0deg))" },
});
const ring = keyframes({
  "0%, 64%": { strokeDashoffset: "1px", animationTimingFunction: "var(--inout)" },
  to: { strokeDashoffset: "0" },
});
const ball = keyframes({
  "0%": { opacity: 0, animationTimingFunction: "var(--inout)", transform: "translate(40px,160px)" },
  "4%": { opacity: 1 },
  "24%, to": { opacity: 1, transform: "translate(280px,40px)" },
});
const hit = keyframes({
  "0%, 22%": { opacity: 0, animationTimingFunction: "var(--spring)", transform: "scale(.2)" },
  "30%, to": { opacity: 1, transform: "none" },
});
// A sine wave: it leaves rest already moving, so a piece the morph just set down doesn't stall.
const SWAY_OUT = "cubic-bezier(0.61, 1, 0.88, 1)";
const SWAY_IN = "cubic-bezier(0.12, 0, 0.39, 0)";
const float = keyframes({
  "0%": { animationTimingFunction: SWAY_OUT },
  "25%": { animationTimingFunction: SWAY_IN, transform: "translateY(-2px)" },
  "50%": { animationTimingFunction: SWAY_OUT, transform: "none" },
  "75%": { animationTimingFunction: SWAY_IN, transform: "translateY(2px)" },
});
const slip = keyframes({
  "0%, 56%": {
    animationTimingFunction: "var(--spring)",
    transform: "translate(12px,-14px)rotate(16deg)",
  },
  "70%, to": { transform: "none" },
});
const scan = keyframes({
  "0%": { opacity: 0, animationTimingFunction: "linear", transform: "none" },
  "2%": { opacity: 1 },
  "40%": { opacity: 1, transform: "translate(280px)" },
  "42%, to": { opacity: 0, transform: "translate(280px)" },
});
const notEqual = keyframes({
  "0%, 62%": { opacity: 1 },
  "68%, to": { opacity: 0 },
});
const mark = keyframes({
  "0%, 38%": {
    opacity: 0,
    animationTimingFunction: "var(--spring)",
    transform: "scale(.3)rotate(-45deg)",
  },
  "46%, 58%": { opacity: 1, transform: "none" },
  "66%, to": { opacity: 0, transform: "none" },
});

export const styles = {
  // --hue is registered in arcade.css, so a new slide's colour eases in.
  root: style({
    display: "block",
    width: "100%",
    maxWidth: "560px",
    transitionProperty: "--hue",
    transitionDuration: "600ms",
    transitionTimingFunction: "var(--inout)",
    vars: {
      "--spring": SPRING,
      "--inout": INOUT,
      "--hue": "var(--c)",
    },
  }),
  stage: style({
    perspective: "900px",
    padding: "12px 8px 20px",
  }),
  card: style({
    position: "relative",
    aspectRatio: "16 / 10",
    transformStyle: "preserve-3d",
  }),
  svg: style({
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "visible",
  }),
  part: style({
    selectors: {
      [`&${when.ancestor(":is([data-paused], [data-leaving])")}`]: {
        animationPlayState: "paused !important",
      },
    },
  }),
  box: style({
    "@layer": {
      [under1]: {
        transformBox: "fill-box",
        transformOrigin: "center",
      },
    },
  }),
  viewBox: style({
    transformBox: "view-box",
    transformOrigin: "0 0",
  }),
  hue: style({
    fill: "var(--hue)",
  }),
  ink: style({
    fill: palette["--text"],
  }),
  hueLine: style({
    stroke: "var(--hue)",
    fill: "none",
  }),
  inkLine: style({
    stroke: palette["--text"],
    fill: "none",
  }),
  // Ink in the hue lightens the dark page like a screen print, and darkens the light one.
  screen: style({
    mixBlendMode: "screen",
    selectors: {
      "&:is(.light *)": {
        mixBlendMode: "multiply",
      },
    },
  }),
  ghost: style({
    strokeDasharray: "3 4",
    strokeWidth: "1.4",
    opacity: 0.65,
  }),
  // The prints' fades: a layer fades all its ink by --fade, and the shapes the morph picks up stay
  // whole, hidden while the morph carries them.
  layer: style({
    fillOpacity: "var(--fade, 1)",
    strokeOpacity: "var(--fade, 1)",
  }),
  token: style({
    fillOpacity: 1,
    strokeOpacity: 1,
    selectors: {
      [`&${when.ancestor("[data-leaving]")}`]: {
        visibility: "hidden",
      },
    },
  }),
  // Each piece flies in from its own --dx, --dy and --r, one --step after another.
  settle: style({
    animationName: settle,
    animationDuration: `calc(${SCENE} * var(--span))`,
    animationTimingFunction: "var(--spring)",
    animationDelay: `calc(${SCENE} * var(--step) * var(--i))`,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  ring: style({
    strokeDasharray: "1",
    animationName: ring,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  cutBall: style({
    transform: "translate(280px, 40px)",
    animationName: ball,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  cutHit: style({
    animationName: hit,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  cutGhost: style({
    transform: "translate(280px, 40px)",
    animationName: "hp-ghost",
    animationDuration: SCENE,
    animationTimingFunction: "linear",
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  // Each job, work square and output names its own keyframes inline.
  queueJob: style({
    opacity: 0,
    animationDuration: SCENE,
    animationTimingFunction: "linear",
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  queueWork: style({
    transform: "scale(0.72)",
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  queueOut: style({
    opacity: 0,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  queueOutRetry: style({
    opacity: 0,
    animationName: "hp-out-retry",
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  queueReject: style({
    opacity: 0,
    animationName: "hp-x",
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  float: style({
    animationName: float,
    animationDuration: "calc(var(--float-ms) * 3)",
    animationIterationCount: "infinite",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  snapSlip: style({
    animationName: slip,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  snapScan: style({
    opacity: 0,
    animationName: scan,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  snapNeq: style({
    opacity: 0,
    animationName: notEqual,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
  snapMark: style({
    opacity: 0,
    animationName: mark,
    animationDuration: SCENE,
    animationFillMode: "both",
    "@media": {
      [REDUCE]: {
        animationName: "none !important",
      },
    },
  }),
};
