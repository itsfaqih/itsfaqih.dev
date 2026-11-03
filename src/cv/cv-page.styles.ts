import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";

const PHONE = "@media (max-width: 639px)";
const PRINT = "@media print";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

// The switch's mode, which the page's script sets on <cv-page>. Its rules nest inside the media
// queries they share a property with, because StyleX lets a media query beat a bare selector.
const ATS = ":is([data-ats] *)";
const PLAIN = "Arial, Helvetica, sans-serif";
const INK = "#000";

export const styles = stylex.create({
  // The custom element stands in for the block the root would be.
  root: {
    display: "block",
    paddingTop: {
      default: "20px",
      [PRINT]: { default: "10mm", ":is([data-ats])": 0 },
    },
    paddingBottom: {
      default: "80px",
      [PHONE]: "48px",
      [PRINT]: { default: "10mm", ":is([data-ats])": 0 },
    },
    paddingInline: { default: null, [PRINT]: { default: "10mm", ":is([data-ats])": 0 } },
    boxDecorationBreak: { default: null, [PRINT]: "clone" },
  },
  // The root holds the page's margin on paper, so the design's ground reaches the paper's edge.
  column: {
    paddingInline: { default: null, [PRINT]: 0 },
  },
  // Paper has nothing to press.
  bar: {
    display: { default: "flex", [PRINT]: "none" },
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px 20px",
    maxWidth: "860px",
    marginInline: "auto",
    marginBottom: "16px",
  },
  // Without the page's script the switch couldn't do anything.
  switch: {
    display: { default: "none", ":is(.js *)": "inline-flex" },
    alignItems: "center",
    gap: "10px",
    font: `700 14px ${fonts["--display"]}`,
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    userSelect: "none",
  },
  track: {
    appearance: "none",
    flexShrink: 0,
    position: "relative",
    width: "44px",
    height: "26px",
    margin: 0,
    borderRadius: "999px",
    backgroundColor: { default: palette["--soft-key"], ":checked": palette["--go"] },
    cursor: "inherit",
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transitionProperty: "background-color",
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
    "::before": {
      content: '""',
      position: "absolute",
      top: "3px",
      left: "3px",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#fff",
      boxShadow: "0 1px 2px rgb(0 0 0 / 0.3)",
      transform: { default: null, ":checked": "translateX(18px)" },
      transitionProperty: { default: "transform", [REDUCE]: "none" },
      transitionDuration: motion["--t-moderate"],
      transitionTimingFunction: motion["--moderate"],
    },
  },
  // On paper each page gets its own whole card rather than a slice of one.
  sheet: {
    maxWidth: { default: "860px", [PRINT]: "none" },
    marginInline: { default: "auto", [PRINT]: 0 },
    padding: {
      default: "48px",
      [PHONE]: "24px",
      [PRINT]: { default: "32px", [ATS]: 0 },
    },
    boxDecorationBreak: { default: null, [PRINT]: "clone" },
    borderRadius: { default: "28px", [PHONE]: "20px", [PRINT]: { default: "20px", [ATS]: 0 } },
    borderWidth: { default: "1px", [PRINT]: { default: "1px", [ATS]: 0 } },
    borderStyle: "solid",
    borderColor: palette["--hair"],
    backgroundColor: { default: palette["--panel"], [ATS]: "#fff" },
    boxShadow: { default: palette["--raise"], [PRINT]: "none" },
    color: { default: null, [ATS]: INK },
    font: { default: null, [ATS]: `400 14px/1.45 ${PLAIN}` },
  },
  designOnly: {
    display: { default: "inline", [ATS]: "none" },
  },
  atsOnly: {
    display: { default: "none", [ATS]: "inline" },
  },
  head: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "20px",
  },
  name: {
    margin: 0,
    font: {
      default: `900 34px/1.05 ${fonts["--display"]}`,
      [ATS]: `700 26px/1.2 ${PLAIN}`,
      [PHONE]: {
        default: `900 26px/1.1 ${fonts["--display"]}`,
        [ATS]: `700 22px/1.2 ${PLAIN}`,
      },
    },
    letterSpacing: { default: "-0.03em", [ATS]: "normal" },
    color: { default: palette["--text"], [ATS]: INK },
  },
  role: {
    margin: "8px 0 0",
    font: { default: `700 15px ${fonts["--display"]}`, [ATS]: `700 15px ${PLAIN}` },
    color: { default: palette["--text"], [ATS]: INK },
  },
  line: {
    margin: "8px 0 0",
    fontSize: { default: "15px", [ATS]: "14px" },
  },
  section: {
    marginTop: { default: "36px", [PRINT]: { default: "24px", [ATS]: "18px" } },
  },
  heading: {
    margin: "0 0 14px",
    paddingBottom: { default: "8px", [ATS]: "4px" },
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: { default: palette["--hair"], [ATS]: INK },
    font: { default: `800 18px ${fonts["--display"]}`, [ATS]: `700 16px ${PLAIN}` },
    letterSpacing: { default: "-0.01em", [ATS]: "normal" },
    color: { default: palette["--text"], [ATS]: INK },
    breakAfter: "avoid",
  },
  entry: {
    marginTop: { default: "20px", [ATS]: "14px" },
  },
  entryTitle: {
    margin: "0 0 6px",
    breakInside: "avoid",
    font: { default: `700 15px/1.4 ${fonts["--display"]}`, [ATS]: `700 14px/1.4 ${PLAIN}` },
    color: { default: palette["--text"], [ATS]: INK },
    breakAfter: "avoid",
  },
  text: {
    margin: "0 0 10px",
  },
  label: {
    fontWeight: 600,
    color: { default: palette["--text"], [ATS]: INK },
  },
  list: {
    margin: 0,
    paddingLeft: "20px",
    // A typed bullet stays in the PDF's text, where a parser sees the list; a disc is only drawn.
    listStyleType: { default: "disc", [ATS]: '"\\2022  "' },
  },
  point: {
    marginBottom: { default: "6px", [ATS]: "4px" },
    breakInside: "avoid",
  },
  link: {
    color: { default: palette["--text"], [ATS]: INK },
    textDecorationLine: { default: "underline", [ATS]: "none" },
    textUnderlineOffset: "3px",
    overflowWrap: "anywhere",
  },
});
