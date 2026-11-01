import * as stylex from "@stylexjs/stylex";
import { fonts, motion, palette } from "../theme.stylex";
import { chips } from "./chips";
import { iconLit, techBadge } from "./tech-icon.styles";
import { hoverHold } from "../components/hover-hold";
import { loadIn } from "../components/load-in";
import { veil } from "./section";

const STACKED = "@media (max-width: 960px)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const LIGHT = ":is(.light *)";
const LIFT = { default: "translateY(-3px)", [REDUCE]: "none" };
const LIFT_TIME = `${motion["--t-fast"]}, ${motion["--t-moderate"]}`;
const LIFT_EASE = `${motion["--fast"]}, ${motion["--moderate"]}`;
// The panel over a tool's --ring (from techBrand), which shows in the border; a tool with no brand
// colour gets the hairline.
const TOOL_RING = `linear-gradient(${palette["--panel"]}, ${palette["--panel"]}), var(--ring, linear-gradient(${palette["--hair"]}, ${palette["--hair"]}))`;
const WASH = `color-mix(in srgb, ${palette["--panel"]} 86%, transparent)`;

const peekIn = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.96)" },
});

export const styles = stylex.create({
  // The element around the section, which stays a <section>.
  host: {
    display: "contents",
  },
  section: {
    position: "relative",
  },
  filter: {
    marginBottom: "20px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: { default: "220px 1fr", [STACKED]: "1fr" },
    gap: { default: "16px", [STACKED]: "10px" },
    alignItems: "start",
  },
  // Holds the label column beside "All"; stacked, there is no column to hold.
  spacer: {
    display: { default: null, [STACKED]: "none" },
  },
  rowLabel: {
    margin: 0,
    paddingTop: { default: "8px", [STACKED]: 0 },
    font: `500 13px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  chips: {
    marginBottom: "8px",
  },
  chipLogo: {
    width: "16px",
    height: "16px",
  },
  // A pressed company chip takes its logo's colours (ringOf): the ring on its rim, and a wash of
  // the same ring inside, over the panel. Its logo lights while pressed or under the pointer.
  ringChip: {
    "--lit": {
      default: null,
      ":hover": { default: null, [HOVER]: "1" },
      ":focus-visible": "1",
      ':is([aria-pressed="true"])': "1",
    },
    "--ring": { default: "var(--ring-dark)", [LIGHT]: "var(--ring-light)" },
    borderColor: { default: palette["--hair"], ':is([aria-pressed="true"])': "transparent" },
    backgroundImage: {
      default: null,
      ':is([aria-pressed="true"])': `linear-gradient(${WASH}, ${WASH}), var(--ring), var(--ring)`,
    },
    backgroundClip: "padding-box, padding-box, border-box",
    backgroundOrigin: "border-box",
  },
  groups: {
    borderTopWidth: "2px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
  },
  group: {
    display: "grid",
    gridTemplateColumns: { default: "220px 1fr", [STACKED]: "1fr" },
    gap: { default: "16px", [STACKED]: "10px" },
    alignItems: "start",
    paddingBlock: "18px",
    paddingInline: 0,
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
  },
  groupLabel: {
    margin: 0,
    paddingTop: { default: "10px", [STACKED]: 0 },
    font: `700 14px ${fonts["--display"]}`,
    color: palette["--text"],
  },
  tools: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  // Hover and focus key on pseudo-classes, so a [data-cut] badge's class list never changes
  // while its cut-in plays.
  tool: {
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
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: "transparent" },
      ":focus-visible": "transparent",
    },
    backgroundImage: {
      default: null,
      ":hover": { default: null, [HOVER]: TOOL_RING },
      ":focus-visible": TOOL_RING,
    },
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "border-box",
    font: `500 13px ${fonts["--display"]}`,
    color: palette["--text"],
    transform: {
      default: null,
      ":hover": { default: null, [HOVER]: LIFT },
      ":focus-visible": LIFT,
    },
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    transitionProperty: "border-color, transform",
    transitionDuration: {
      default: `${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}`,
      ":hover": { default: null, [HOVER]: LIFT_TIME },
      ":focus-visible": LIFT_TIME,
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: LIFT_EASE },
      ":focus-visible": LIFT_EASE,
    },
  },
  // The card that peeks out of a badge, placed above it or below by usePlaceCard.
  peek: {
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
    boxShadow: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
    pointerEvents: "none",
    transformOrigin: {
      default: null,
      ':is([data-side="bottom"])': "top center",
      ':is([data-side="top"])': "bottom center",
    },
    animationName: peekIn,
    animationDuration: motion["--t-moderate"],
    animationTimingFunction: motion["--moderate"],
  },
  peekHead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "2px 8px",
    font: `700 15px ${fonts["--display"]}`,
    color: palette["--text"],
  },
  peekGroup: {
    flexBasis: "100%",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  peekNote: {
    marginTop: "10px",
    marginInline: 0,
    marginBottom: 0,
    fontSize: "13px",
    color: palette["--dim"],
  },
  useTitle: {
    marginTop: "12px",
    marginInline: 0,
    marginBottom: "6px",
    font: `700 11px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  uses: {
    display: "grid",
    gap: "6px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  use: {
    fontSize: "13px",
    lineHeight: 1.35,
  },
  useName: {
    display: "block",
    fontWeight: 600,
    color: palette["--text"],
  },
  useDetail: {
    color: palette["--dim"],
  },
});

// Before the first filter the groups glitch in (loadIn, with data-cut); after it they slide in.
export const groupLabelClass = (filtered: boolean) =>
  stylex.attrs(!filtered && loadIn.veil, veil.dense, styles.groupLabel).class ?? "";
export const groupWordsClass = (filtered: boolean) =>
  stylex.attrs(!filtered && loadIn.piece, loadIn.words).class ?? "";
export const toolClass = (filtered: boolean) =>
  stylex.attrs(
    !filtered && loadIn.piece,
    techBadge.badge,
    iconLit.hover,
    hoverHold.lift,
    styles.tool,
  ).class ?? "";
export const countClass = (on: boolean) =>
  stylex.attrs(chips.count, on && chips.countOn).class ?? "";
