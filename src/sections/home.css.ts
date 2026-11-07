import { drop } from "../bevel";
import { fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
const STACKED = "(max-width: 960px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const LIFT = "translateY(-4px) rotate(-1deg)";
// The lift and press ride the moderate spring and the rim the fast one; they leave on the exits.
const LIFT_TIME = `${motion["--t-moderate"]}, ${motion["--t-moderate"]}, ${motion["--t-fast"]}`;
const LIFT_EASE = `${motion["--moderate"]}, ${motion["--moderate"]}, ${motion["--fast"]}`;

const marquee = keyframes({
  to: { transform: "translate(-50%)" },
});

export const styles = {
  // A tinted key over the backdrop's lit dots: blurred, so its label doesn't read through them.
  overDots: style({
    backdropFilter: "blur(8px)",
  }),
  // The custom element stands in for the block the root used to be.
  root: style({
    display: "block",
  }),
  ticker: style({
    overflow: "hidden",
    backgroundColor: palette["--go"],
    color: palette["--on-accent"],
  }),
  // Three sets per half (see TICKER_RUN) at the speed two sets once ran in 26s.
  tickerTrack: style({
    display: "flex",
    width: "max-content",
    animationName: marquee,
    animationDuration: "64s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    userSelect: "none",
  }),
  // Tiles butt edge to edge so the band reads as one striped bar.
  tickerTile: style({
    font: `900 22px/56px ${fonts["--display"]}`,
    paddingBlock: 0,
    paddingInline: "28px",
    backgroundColor: "var(--c)",
    whiteSpace: "nowrap",
  }),
  // watchCutIns sets .paused on the band while it is off screen (loadIn.piece pauses the band itself).
  pausable: style({
    selectors: {
      "&:is(.paused *)": {
        animationPlayState: "paused !important",
      },
    },
  }),
  projects: style({
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "1fr 1fr",
      },
    },
  }),
  // A [data-cut] piece: hover, focus and press key on pseudo-classes, so its class list never
  // changes. It tilts up off its key, and sinks onto it while pressed.
  project: style({
    position: "relative",
    borderRadius: "16px",
    padding: "16px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    boxShadow: `${palette["--raise"]}, ${drop(4, palette["--drop-ink"])}`,
    transitionProperty: "transform, box-shadow, border-color",
    transitionDuration: `${motion["--t-moderate-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}`,
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:focus-visible": {
        borderColor: "var(--c)",
        boxShadow: `${palette["--raise"]}, ${drop(8, "var(--key)")}`,
        transform: LIFT,
        outline: `3px solid ${palette["--focus"]}`,
        outlineOffset: "3px",
        transitionDuration: LIFT_TIME,
        transitionTimingFunction: LIFT_EASE,
      },
      "&:active": {
        borderColor: "var(--c)",
        // Repeated under the media query, which would otherwise let hovering outrank pressing.
        boxShadow: `${palette["--raise"]}, ${drop(1, "var(--key)")}`,
        transform: "translateY(3px)",
        transitionDuration: LIFT_TIME,
        transitionTimingFunction: LIFT_EASE,
      },
    },
    "@media": {
      [`${HOVER} and ${REDUCE}`]: {
        selectors: {
          "&&&:hover": {
            transform: "none",
          },
          "&&&:active": {
            transform: "none",
          },
        },
      },
      [REDUCE]: {
        selectors: {
          "&:focus-visible": {
            transform: "none",
          },
        },
      },
      [`${REDUCE} and (not (${HOVER}))`]: {
        selectors: {
          "&&:active": {
            transform: "none",
          },
        },
      },
      [HOVER]: {
        selectors: {
          "&:hover": {
            borderColor: "var(--c)",
            boxShadow: `${palette["--raise"]}, ${drop(8, "var(--key)")}`,
            transform: LIFT,
            transitionDuration: LIFT_TIME,
            transitionTimingFunction: LIFT_EASE,
          },
          "&:active": {
            boxShadow: `${palette["--raise"]}, ${drop(1, "var(--key)")}`,
          },
          "&&:active": {
            transform: "translateY(3px)",
          },
        },
      },
    },
  }),
  projectKind: style({
    font: `700 11px ${fonts["--display"]}`,
    color: `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
  }),
  projectTitle: style({
    marginTop: "4px",
    marginInline: 0,
    marginBottom: "2px",
    font: `700 17px ${fonts["--display"]}`,
    color: palette["--text"],
  }),
  projectSummary: style({
    margin: 0,
    fontSize: "14px",
  }),
  // Purple, the hue of its eyebrow and of its two keys.
  contact: style({
    marginTop: "24px",
    marginInline: 0,
    marginBottom: "48px",
    borderRadius: "28px",
    padding: "48px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--c)",
    boxShadow: `${palette["--raise"]}, ${drop(5, "color-mix(in oklab, var(--c) 62%, #000)")}`,
    vars: {
      "--c": palette["--ax"],
    },
    "@media": {
      [STACKED]: {
        padding: "28px",
      },
    },
  }),
  footer: style({
    fontSize: "13px",
    color: palette["--mute"],
    paddingBottom: "32px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  }),
  footerLink: style({
    selectors: {
      "&:active": {
        color: palette["--text"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
          },
        },
      },
    },
  }),
};
