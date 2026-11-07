import { fonts, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
import { under1 } from "../layers.css";
const PHONE = "(max-width: 640px)";
/** A code line's least height in px, which tsc's cursor matches and stretches from. */
export const LINE_HEIGHT = 26;

export const styles = {
  kw: style({
    color: "var(--c-ink)",
  }),
  ty: style({
    color: palette["--text"],
    fontWeight: 600,
  }),
  str: style({
    color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)`,
  }),
  quiet: style({
    color: palette["--mute"],
  }),
  view: style({
    display: "grid",
    gridTemplateRows: "1fr auto",
    gap: "14px",
  }),
  code: style({
    position: "relative",
    display: "grid",
    gap: "2px",
    alignContent: "start",
    fontSize: "12.5px",
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
    "@media": {
      [PHONE]: {
        fontSize: "12px",
      },
    },
  }),
  // Layered, so `hot` squares the left corners of this radius.
  line: style({
    "@layer": {
      [under1]: {
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        rowGap: "2px",
        columnGap: "12px",
        alignItems: "center",
        minHeight: `${LINE_HEIGHT}px`,
        paddingBlock: "1px",
        paddingInline: "8px",
        borderRadius: "6px",
        "@media": {
          [PHONE]: {
            paddingInline: "6px",
          },
        },
      },
    },
  }),
  hot: style({
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    selectors: {
      [`&${when.ancestor('[data-side="bad"]')}`]: {
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 10%, transparent)`,
        boxShadow: `inset 2px 0 0 ${palette["--no"]}`,
      },
      [`&${when.ancestor('[data-side="good"]')}`]: {
        backgroundColor: "color-mix(in srgb, var(--c) 10%, transparent)",
        boxShadow: "inset 2px 0 0 var(--c)",
      },
    },
  }),
  source: style({
    position: "relative",
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    color: palette["--text"],
  }),
  out: style({
    "@layer": {
      [under1]: {
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
        selectors: {
          "&::before": {
            content: '"→ "',
            color: palette["--mute"],
          },
        },
      },
    },
  }),
  outNo: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  }),
  outYes: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  }),
  // A squiggle under the line, drawn by a mask so it takes the tone's colour.
  squiggle: style({
    "@layer": {
      [under1]: {
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
    },
  }),
  squiggleYes: style({
    backgroundColor: "var(--c)",
  }),
  cursor: style({
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: `${LINE_HEIGHT}px`,
    borderRadius: "6px",
    backgroundColor: "color-mix(in srgb, var(--c) 14%, transparent)",
    boxShadow: "inset 0 -2px 0 var(--c)",
    opacity: 0,
    transformOrigin: "top",
    pointerEvents: "none",
  }),
  unrun: style({
    opacity: 0,
  }),
  term: style({
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
  }),
  command: style({
    color: "var(--c-ink)",
  }),
  summary: style({
    color: palette["--dim"],
  }),
  run: style({
    marginLeft: "auto",
    selectors: {
      '&:disabled, &[aria-disabled="true"]': {
        opacity: 0.5,
      },
    },
  }),
  boardCode: style({
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  }),
  holds: style({
    color: palette["--dim"],
    selectors: {
      [`&${when.ancestor(":enabled")}`]: {
        color: palette["--text"],
      },
    },
  }),
  gap: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "3.2em",
    height: "1.1em",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "color-mix(in srgb, var(--c) 55%, transparent)",
    selectors: {
      [`&${when.ancestor("[data-off]")}`]: {
        display: "none",
      },
    },
  }),
};

export const quiz = {
  snippet: style({
    paddingInline: "4px",
  }),
  given: style({
    paddingBlock: "4px",
    paddingInline: "17.5px",
  }),
};
