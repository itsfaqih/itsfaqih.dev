import * as stylex from "@stylexjs/stylex";
import { fonts, motion, palette } from "../theme.stylex";

const STACKED = "@media (max-width: 960px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const LIFT = "translateY(-4px) rotate(-1deg)";
// The lift and press ride the moderate spring and the rim the fast one; they leave on the exits.
const LIFT_TIME = `${motion["--t-moderate"]}, ${motion["--t-moderate"]}, ${motion["--t-fast"]}`;
const LIFT_EASE = `${motion["--moderate"]}, ${motion["--moderate"]}, ${motion["--fast"]}`;

const marquee = stylex.keyframes({ to: { transform: "translate(-50%)" } });

export const styles = stylex.create({
  // A tinted key over the backdrop's lit dots: blurred, so its label doesn't read through them.
  overDots: {
    backdropFilter: "blur(8px)",
  },
  // The custom element stands in for the block the root used to be.
  root: {
    display: "block",
  },
  ticker: {
    overflow: "hidden",
    backgroundColor: palette["--go"],
    color: palette["--on-accent"],
  },
  // Three sets per half (see TICKER_RUN) at the speed two sets once ran in 26s.
  tickerTrack: {
    display: "flex",
    width: "max-content",
    animationName: marquee,
    animationDuration: "64s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    userSelect: "none",
  },
  // Tiles butt edge to edge so the band reads as one striped bar.
  tickerTile: {
    font: `900 22px/56px ${fonts["--display"]}`,
    paddingBlock: 0,
    paddingInline: "28px",
    backgroundColor: "var(--c)",
    whiteSpace: "nowrap",
  },
  // watchCutIns sets .paused on the band while it is off screen (loadIn.piece pauses the band itself).
  pausable: {
    animationPlayState: { default: null, ":is(.paused *)": "paused !important" },
  },
  projects: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(4, 1fr)", [STACKED]: "1fr 1fr" },
    gap: "10px",
  },
  // A [data-cut] piece: hover, focus and press key on pseudo-classes, so its class list never
  // changes. It tilts up off its key, and sinks onto it while pressed.
  project: {
    position: "relative",
    borderRadius: "16px",
    padding: "16px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: "var(--c)" },
      ":focus-visible": "var(--c)",
      ":active": "var(--c)",
    },
    boxShadow: {
      default: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
      ":hover": { default: null, [HOVER]: `${palette["--raise"]}, 0 8px 0 var(--key)` },
      ":focus-visible": `${palette["--raise"]}, 0 8px 0 var(--key)`,
      // Repeated under the media query, which would otherwise let hovering outrank pressing.
      ":active": {
        default: `${palette["--raise"]}, 0 1px 0 var(--key)`,
        [HOVER]: `${palette["--raise"]}, 0 1px 0 var(--key)`,
      },
    },
    transform: {
      default: null,
      ":hover": { default: null, [HOVER]: { default: LIFT, [REDUCE]: "none" } },
      ":focus-visible": { default: LIFT, [REDUCE]: "none" },
      ":active": {
        default: "translateY(3px)",
        [REDUCE]: "none",
        [HOVER]: { default: "translateY(3px)", [REDUCE]: "none" },
      },
    },
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transitionProperty: "transform, box-shadow, border-color",
    transitionDuration: {
      default: `${motion["--t-moderate-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}`,
      ":hover": { default: null, [HOVER]: LIFT_TIME },
      ":focus-visible": LIFT_TIME,
      ":active": LIFT_TIME,
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: LIFT_EASE },
      ":focus-visible": LIFT_EASE,
      ":active": LIFT_EASE,
    },
  },
  projectKind: {
    font: `700 11px ${fonts["--display"]}`,
    color: `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
  },
  projectTitle: {
    marginTop: "4px",
    marginInline: 0,
    marginBottom: "2px",
    font: `700 17px ${fonts["--display"]}`,
    color: palette["--text"],
  },
  projectSummary: {
    margin: 0,
    fontSize: "14px",
  },
  // Purple, the hue of its eyebrow and of its two keys.
  contact: {
    "--c": palette["--ax"],
    marginTop: "24px",
    marginInline: 0,
    marginBottom: "48px",
    borderRadius: "28px",
    padding: { default: "48px", [STACKED]: "28px" },
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--c)",
    boxShadow: `${palette["--raise"]}, 0 5px 0 color-mix(in oklab, var(--c) 62%, #000)`,
  },
  footer: {
    fontSize: "13px",
    color: palette["--mute"],
    paddingBottom: "32px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: {
      default: null,
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
  },
});
