import * as stylex from "@stylexjs/stylex";
import { fonts, palette } from "../theme.stylex";
import { kit } from "./rule-landing.stylex";

const PHONE = "@media (max-width: 640px)";

/** How far apart, in ms, tsc reaches each line. */
export const STEP = 110;

export const styles = stylex.create({
  kw: { color: "var(--c-ink)" },
  ty: { color: palette["--text"], fontWeight: 600 },
  str: { color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)` },
  quiet: { color: palette["--mute"] },
  view: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    gap: "14px",
  },
  code: {
    position: "relative",
    display: "grid",
    gap: "2px",
    alignContent: "start",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  },
  line: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "2px",
    columnGap: "12px",
    alignItems: "center",
    minHeight: "26px",
    paddingBlock: "1px",
    paddingInline: { default: "8px", [PHONE]: "6px" },
    borderRadius: "6px",
  },
  hot: {
    backgroundColor: {
      default: null,
      [stylex.when.ancestor('[data-side="bad"]')]:
        `color-mix(in srgb, ${palette["--no"]} 10%, transparent)`,
      [stylex.when.ancestor('[data-side="good"]')]: "color-mix(in srgb, var(--c) 10%, transparent)",
    },
    boxShadow: {
      default: null,
      [stylex.when.ancestor('[data-side="bad"]')]: `inset 2px 0 0 ${palette["--no"]}`,
      [stylex.when.ancestor('[data-side="good"]')]: "inset 2px 0 0 var(--c)",
    },
  },
  source: {
    position: "relative",
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    color: palette["--text"],
  },
  out: {
    maxWidth: "100%",
    marginLeft: "auto",
    paddingBlock: "1px",
    paddingInline: "8px",
    borderRadius: "6px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "11.5px",
    lineHeight: 1.6,
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
    overflowWrap: "anywhere",
    "::before": {
      content: '"→ "',
      color: palette["--mute"],
    },
  },
  outNo: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  },
  outYes: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  // A squiggle under the line, drawn by a mask so it takes the tone's colour.
  squiggle: {
    position: "absolute",
    right: 0,
    bottom: "-3px",
    left: 0,
    height: "4px",
    backgroundColor: palette["--no"],
    transformOrigin: "left",
    pointerEvents: "none",
    maskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4'%3E%3Cpath d='M0 3 1.5 1 3 3 4.5 1 6 3' fill='none' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E\")",
    maskRepeat: "repeat-x",
    maskPosition: "left",
    maskSize: "6px 4px",
  },
  squiggleYes: {
    backgroundColor: "var(--c)",
  },
  cursor: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: "26px",
    borderRadius: "6px",
    backgroundColor: "color-mix(in srgb, var(--c) 14%, transparent)",
    boxShadow: "inset 0 -2px 0 var(--c)",
    opacity: 0,
    transformOrigin: "top",
    pointerEvents: "none",
  },
  unrun: {
    opacity: 0,
  },
  term: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "10px",
    alignItems: "center",
    paddingTop: "12px",
    borderTopWidth: "1.5px",
    borderTopStyle: "dashed",
    borderTopColor: palette["--hair"],
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
  },
  command: {
    color: "var(--c-ink)",
  },
  summary: {
    color: palette["--dim"],
  },
  run: {
    marginLeft: "auto",
    opacity: { default: null, ":disabled": 0.5 },
  },
  boardCode: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  holds: {
    color: {
      default: palette["--dim"],
      [stylex.when.ancestor(":enabled")]: palette["--text"],
    },
  },
  gap: {
    display: { default: null, [stylex.when.ancestor("[data-off]")]: "none" },
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "3.2em",
    height: "1.1em",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "color-mix(in srgb, var(--c) 55%, transparent)",
  },
});

export const view = {
  /** Hides a line's squiggle and output until tsc first reaches it. */
  unrun: stylex.attrs(styles.unrun).class ?? "",
};

/** The choose boards: code versions stacked full width, each a card. */
export const quiz = stylex.create({
  stack: {
    display: "grid",
    gap: "10px",
  },
  snippet: {
    paddingInline: "4px",
  },
  // The code every version builds on, set above the cards.
  given: {
    paddingBlock: "4px",
    paddingInline: "17.5px",
  },
});
