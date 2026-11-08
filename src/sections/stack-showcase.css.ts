import { drop } from "../bevel";
import { fonts, motion, palette } from "../theme.vars.css";

import { style, keyframes } from "@vanilla-extract/css";
import { HOVER, REDUCE } from "../browser/media-query";
const STACKED = "(max-width: 960px)";
const LIGHT = ":is(.light *)";

const LIFT_TIME = `${motion["--t-fast"]}, ${motion["--t-moderate"]}`;
const LIFT_EASE = `${motion["--fast"]}, ${motion["--moderate"]}`;
// The panel over a tool's --ring (from techBrand), which shows in the border; a tool with no brand
// colour gets the hairline.
const TOOL_RING = `linear-gradient(${palette["--panel"]}, ${palette["--panel"]}), var(--ring, linear-gradient(${palette["--hair"]}, ${palette["--hair"]}))`;
const WASH = `color-mix(in srgb, ${palette["--panel"]} 86%, transparent)`;

const peekIn = keyframes({
  from: { opacity: 0, transform: "scale(0.96)" },
});

export const styles = {
  // The element around the section, which stays a <section>.
  host: style({
    display: "contents",
  }),
  section: style({
    position: "relative",
  }),
  filter: style({
    marginBottom: "20px",
  }),
  row: style({
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "16px",
    alignItems: "start",
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "1fr",
        gap: "10px",
      },
    },
  }),
  // Holds the label column beside "All"; stacked, there is no column to hold.
  spacer: style({
    "@media": {
      [STACKED]: {
        display: "none",
      },
    },
  }),
  rowLabel: style({
    margin: 0,
    paddingTop: "8px",
    font: `500 13px ${fonts["--display"]}`,
    color: palette["--mute"],
    "@media": {
      [STACKED]: {
        paddingTop: 0,
      },
    },
  }),
  chips: style({
    marginBottom: "8px",
  }),
  chipLogo: style({
    width: "16px",
    height: "16px",
  }),
  // A pressed company chip takes its logo's colours (ringOf): the ring on its rim, and a wash of
  // the same ring inside, over the panel. Its logo lights while pressed or under the pointer.
  ringChip: style({
    borderColor: palette["--hair"],
    backgroundClip: "padding-box, padding-box, border-box",
    backgroundOrigin: "border-box",
    vars: {
      "--ring": "var(--ring-dark)",
    },
    selectors: {
      "&:focus-visible": {
        vars: {
          "--lit": "1",
        },
      },
      [`&${LIGHT}`]: {
        vars: {
          "--ring": "var(--ring-light)",
        },
      },
      '&:is([aria-pressed="true"])': {
        borderColor: "transparent",
        backgroundImage: `linear-gradient(${WASH}, ${WASH}), var(--ring), var(--ring)`,
        vars: {
          "--lit": "1",
        },
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            vars: {
              "--lit": "1",
            },
          },
        },
      },
    },
  }),
  groups: style({
    borderTopWidth: "2px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
  }),
  group: style({
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "16px",
    alignItems: "start",
    paddingBlock: "18px",
    paddingInline: 0,
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "1fr",
        gap: "10px",
      },
    },
  }),
  groupLabel: style({
    margin: 0,
    paddingTop: "10px",
    font: `700 14px ${fonts["--display"]}`,
    color: palette["--text"],
    "@media": {
      [STACKED]: {
        paddingTop: 0,
      },
    },
  }),
  tools: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  }),
  // Hover and focus key on pseudo-classes, so a [data-cut] badge's class list never changes
  // while its cut-in plays.
  tool: style({
    paddingTop: "8px",
    paddingRight: "14px",
    paddingBottom: "8px",
    paddingLeft: "11px",
    borderRadius: "999px",
    borderWidth: "2px",
    borderStyle: "solid",
    backgroundColor: palette["--panel"],
    // Under the pointer and keyboard focus the hairline gives way to the logo's ring. The ring is
    // drawn only then: under the hairline, its colour would fringe the rounded edge.
    borderColor: palette["--hair"],
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "border-box",
    font: `500 13px ${fonts["--display"]}`,
    color: palette["--text"],
    transitionProperty: "border-color, transform",
    transitionDuration: `${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}`,
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:focus-visible": {
        borderColor: "transparent",
        backgroundImage: TOOL_RING,
        transform: "translateY(-3px)",
        outline: `3px solid ${palette["--focus"]}`,
        outlineOffset: "2px",
        transitionDuration: LIFT_TIME,
        transitionTimingFunction: LIFT_EASE,
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            borderColor: "transparent",
            backgroundImage: TOOL_RING,
            transitionDuration: LIFT_TIME,
            transitionTimingFunction: LIFT_EASE,
          },
          "&&:hover": {
            transform: "translateY(-3px)",
          },
        },
      },
      [`${HOVER} and ${REDUCE}`]: {
        selectors: {
          "&&:hover": {
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
    },
  }),
  // The card that peeks out of a badge, placed above it or below by usePlaceCard.
  peek: style({
    position: "absolute",
    zIndex: 20,
    width: "290px",
    paddingTop: "14px",
    paddingInline: "16px",
    paddingBottom: "16px",
    borderRadius: "16px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundImage: TOOL_RING,
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "border-box",
    boxShadow: `${palette["--raise"]}, ${drop(4, palette["--drop-ink"])}`,
    pointerEvents: "none",
    animationName: peekIn,
    animationDuration: motion["--t-moderate"],
    animationTimingFunction: motion["--moderate"],
    selectors: {
      '&&:is([data-side="bottom"])': {
        transformOrigin: "top center",
      },
      '&:is([data-side="top"])': {
        transformOrigin: "bottom center",
      },
    },
  }),
  peekHead: style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "2px 8px",
    font: `700 15px ${fonts["--display"]}`,
    color: palette["--text"],
  }),
  peekGroup: style({
    flexBasis: "100%",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--mute"],
  }),
  peekNote: style({
    marginTop: "10px",
    marginInline: 0,
    marginBottom: 0,
    fontSize: "13px",
    color: palette["--dim"],
  }),
  useTitle: style({
    marginTop: "12px",
    marginInline: 0,
    marginBottom: "6px",
    font: `700 11px ${fonts["--display"]}`,
    color: palette["--mute"],
  }),
  uses: style({
    display: "grid",
    gap: "6px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  }),
  use: style({
    fontSize: "13px",
    lineHeight: 1.35,
  }),
  useName: style({
    display: "block",
    fontWeight: 600,
    color: palette["--text"],
  }),
  useDetail: style({
    color: palette["--dim"],
  }),
};
