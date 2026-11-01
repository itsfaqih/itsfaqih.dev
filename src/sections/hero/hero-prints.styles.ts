import * as stylex from "@stylexjs/stylex";
import { palette } from "../../theme.stylex";

export type TopInk = "solid" | "hue" | "outline";

export const pct = (n: number) => `${+n.toFixed(2)}%`;
export const SCENE_MS = 3200;
const SCENE_REST_MS = 1000;
export const SLIDE_MS = SCENE_MS + SCENE_REST_MS;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const INOUT = "cubic-bezier(0.65, 0, 0.35, 1)";
export const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export const TOKEN_COUNT = 4;
export const TOPS: TopInk[] = ["solid", "hue", "outline"];
export const MORPH_MS = 1100;
export const FADE_MS = 180;
export const TOKEN_STAGGER_MS = 60;
export const SCENE_LEAD_MS = MORPH_MS - FADE_MS;

export const REST_DEG = { x: 4, y: -6 };
export const REST_TRANSFORM = `rotateX(${REST_DEG.x}deg) rotateY(${REST_DEG.y}deg)`;

/** Custom properties as an inline style string, each name given without its leading dashes. */
export const vars = (v: Record<string, string | number>) =>
  Object.entries(v)
    .map(([k, value]) => `--${k}:${value}`)
    .join(";");

export const marker = stylex.defaultMarker();

// Every shape and group the prints draw: it holds still while the hero is paused or its layer is
// on the way out, and turns about its own box. The halftone copies carry a transform attribute
// instead, so they take the hold alone.
export const draw = (...more: (stylex.StyleXStyles | false)[]) =>
  stylex.attrs(styles.part, styles.box, ...more);

const SCENE = "var(--scene-duration)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const still = (name: string | null) => ({ default: name, [REDUCE]: "none !important" });

const settle = stylex.keyframes({
  "0%": { transform: "translate(var(--dx), var(--dy)) rotate(var(--r,0deg))" },
});
const ring = stylex.keyframes({
  "0%, 64%": { strokeDashoffset: "1px", animationTimingFunction: "var(--inout)" },
  to: { strokeDashoffset: "0" },
});
const ball = stylex.keyframes({
  "0%": { opacity: 0, animationTimingFunction: "var(--inout)", transform: "translate(40px,160px)" },
  "4%": { opacity: 1 },
  "24%, to": { opacity: 1, transform: "translate(280px,40px)" },
});
const hit = stylex.keyframes({
  "0%, 22%": { opacity: 0, animationTimingFunction: "var(--spring)", transform: "scale(.2)" },
  "30%, to": { opacity: 1, transform: "none" },
});
const float = stylex.keyframes({ to: { transform: "translateY(-2px)" } });
const slip = stylex.keyframes({
  "0%, 56%": {
    animationTimingFunction: "var(--spring)",
    transform: "translate(12px,-14px)rotate(16deg)",
  },
  "70%, to": { transform: "none" },
});
const scan = stylex.keyframes({
  "0%": { opacity: 0, animationTimingFunction: "linear", transform: "none" },
  "2%": { opacity: 1 },
  "40%": { opacity: 1, transform: "translate(280px)" },
  "42%, to": { opacity: 0, transform: "translate(280px)" },
});
const notEqual = stylex.keyframes({
  "0%, 62%": { opacity: 1 },
  "68%, to": { opacity: 0 },
});
const mark = stylex.keyframes({
  "0%, 38%": {
    opacity: 0,
    animationTimingFunction: "var(--spring)",
    transform: "scale(.3)rotate(-45deg)",
  },
  "46%, 58%": { opacity: 1, transform: "none" },
  "66%, to": { opacity: 0, transform: "none" },
});

export const styles = stylex.create({
  // --hue is registered in arcade.css, so a new slide's colour eases in.
  root: {
    display: "block",
    width: "100%",
    maxWidth: "560px",
    "--spring": SPRING,
    "--inout": INOUT,
    "--hue": "var(--c)",
    transitionProperty: "--hue",
    transitionDuration: "600ms",
    transitionTimingFunction: "var(--inout)",
  },
  stage: {
    perspective: "900px",
    padding: "12px 8px 20px",
  },
  card: {
    position: "relative",
    aspectRatio: "16 / 10",
    transformStyle: "preserve-3d",
  },
  svg: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "visible",
  },
  part: {
    animationPlayState: {
      default: null,
      [stylex.when.ancestor(":is([data-paused], [data-leaving])")]: "paused !important",
    },
  },
  box: {
    transformBox: "fill-box",
    transformOrigin: "center",
  },
  viewBox: {
    transformBox: "view-box",
    transformOrigin: "0 0",
  },
  hue: { fill: "var(--hue)" },
  ink: { fill: palette["--text"] },
  hueLine: { stroke: "var(--hue)", fill: "none" },
  inkLine: { stroke: palette["--text"], fill: "none" },
  // Ink in the hue lightens the dark page like a screen print, and darkens the light one.
  screen: { mixBlendMode: { default: "screen", ":is(.light *)": "multiply" } },
  ghost: {
    strokeDasharray: "3 4",
    strokeWidth: "1.4",
    opacity: 0.65,
  },
  // The prints' fades: a layer fades all its ink by --fade, and the shapes the morph picks up stay
  // whole, hidden while the morph carries them.
  layer: {
    fillOpacity: "var(--fade, 1)",
    strokeOpacity: "var(--fade, 1)",
  },
  token: {
    fillOpacity: 1,
    strokeOpacity: 1,
    visibility: { default: null, [stylex.when.ancestor("[data-leaving]")]: "hidden" },
  },
  // Each piece flies in from its own --dx, --dy and --r, one --step after another.
  settle: {
    animationName: still(settle),
    animationDuration: `calc(${SCENE} * var(--span))`,
    animationTimingFunction: "var(--spring)",
    animationDelay: `calc(${SCENE} * var(--step) * var(--i))`,
    animationFillMode: "both",
  },
  ring: {
    strokeDasharray: "1",
    animationName: still(ring),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  cutBall: {
    transform: "translate(280px, 40px)",
    animationName: still(ball),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  cutHit: {
    animationName: still(hit),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  cutGhost: {
    transform: "translate(280px, 40px)",
    animationName: still("hp-ghost"),
    animationDuration: SCENE,
    animationTimingFunction: "linear",
    animationFillMode: "both",
  },
  // Each job names its own keyframes inline.
  queueJob: {
    opacity: 0,
    animationName: still(null),
    animationDuration: SCENE,
    animationTimingFunction: "linear",
    animationFillMode: "both",
  },
  queueWork: {
    transform: "scale(0.72)",
    animationName: still("hp-work"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  queueOut: {
    opacity: 0,
    animationName: still("hp-out"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  queueOutRetry: {
    opacity: 0,
    animationName: still("hp-out-retry"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  queueReject: {
    opacity: 0,
    animationName: still("hp-x"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  float: {
    animationName: still(float),
    animationDuration: "var(--float-ms)",
    animationTimingFunction: "var(--inout)",
    animationDelay: "var(--float-at)",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationFillMode: "both",
  },
  snapSlip: {
    animationName: still(slip),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  snapScan: {
    opacity: 0,
    animationName: still(scan),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  snapNeq: {
    opacity: 0,
    animationName: still(notEqual),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  snapMark: {
    opacity: 0,
    animationName: still(mark),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
});
