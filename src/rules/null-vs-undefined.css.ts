import { drop } from "../bevel";
import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { under1, under2 } from "../layers.css";
import { hoverHold } from "../components/hover-hold.css";
const PHONE = "(max-width: 640px)";
const MOTION = "(prefers-reduced-motion: no-preference)";
const HOVER = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";

const flash = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});
const typeIn = keyframes({
  from: { opacity: 0, transform: "translate(-8px)" },
});
const fall = keyframes({
  from: { opacity: 1, transform: "translateY(-14px)" },
  "70%": { opacity: 1 },
  to: { opacity: 0, transform: "translateY(16px)" },
});
const wobble = keyframes({
  "25%": { translate: "-4px 0" },
  "50%": { translate: "4px 0" },
  "75%": { translate: "-2px 0" },
});
const land = keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});

export const styles = {
  kw: style({
    color: "var(--c-ink)",
  }),
  str: style({
    "@layer": {
      [under1]: {
        color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)`,
      },
    },
  }),
  com: style({
    color: palette["--mute"],
  }),
  nul: style({
    "@layer": {
      [under1]: {
        paddingBlock: 0,
        paddingInline: "3px",
        borderRadius: "4px",
        backgroundColor: "color-mix(in srgb, var(--c) 20%, transparent)",
        boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--c) 70%, transparent)",
        fontWeight: 700,
        color: "var(--c-ink)",
      },
    },
  }),
  und: style({
    "@layer": {
      [under1]: {
        paddingBlock: 0,
        paddingInline: "3px",
        borderRadius: "4px",
        outlineWidth: "1px",
        outlineStyle: "dashed",
        outlineColor: palette["--mute"],
        outlineOffset: "-1px",
        fontWeight: 700,
        color: palette["--dim"],
      },
    },
  }),
  inherit: style({
    color: "inherit",
  }),
  introCode: style({
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "6px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "0.88em",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  }),
  view: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "14px",
    alignContent: "start",
  }),
  code: style({
    display: "grid",
    gap: "2px",
    fontSize: "12.5px",
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
    "@media": {
      [PHONE]: {
        fontSize: "12px",
      },
    },
  }),
  line: style({
    "@layer": {
      [under1]: {
        display: "flex",
        flexWrap: "wrap",
        rowGap: "2px",
        columnGap: "12px",
        alignItems: "center",
        minHeight: "26px",
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
      [under2]: {
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
    "@layer": {
      [under1]: {
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
        color: palette["--no-ink"],
      },
    },
  }),
  outYes: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  }),
  flow: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "10px",
  }),
  form: style({
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "10px",
    alignItems: "center",
    minHeight: "58px",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: palette["--raise"],
  }),
  label: style({
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  }),
  field: style({
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "160px",
    gap: "10px",
    alignItems: "center",
    minWidth: 0,
  }),
  input: style({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    height: "38px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
    transition: `border-color ${kit["--t-fb"]} ease`,
    selectors: {
      "&:focus-visible": {
        borderColor: "var(--c)",
        outlineWidth: "3px",
        outlineStyle: "solid",
        outlineColor: "color-mix(in srgb, var(--c) 30%, transparent)",
        outlineOffset: 0,
      },
    },
    "@media": {
      [TOUCH]: {
        fontSize: "16px",
      },
    },
  }),
  chip: style({
    display: "inline-flex",
    gap: "4px",
    alignItems: "center",
    height: "34px",
    paddingTop: 0,
    paddingRight: "4px",
    paddingBottom: 0,
    paddingLeft: "12px",
    borderRadius: "999px",
    backgroundColor: palette["--soft-key"],
    boxShadow: drop(2, palette["--soft-key-drop"]),
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  }),
  remove: style([
    hoverHold.lift,
    {
      display: "grid",
      alignItems: "center",
      justifyItems: "center",
      width: "26px",
      height: "26px",
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "currentcolor",
      borderRadius: "999px",
      backgroundColor: "transparent",
      fontSize: "12px",
      color: palette["--dim"],
      cursor: cursors["--cursor-point"],
      transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease, transform ${kit["--t-fb"]} ${motion["--out"]}`,
      selectors: {
        "&:focus-visible": {
          outlineWidth: "3px",
          outlineStyle: "solid",
          outlineColor: palette["--focus"],
          outlineOffset: "1px",
        },
        "&:active": {
          transform: "scale(0.92)",
        },
      },
      "@media": {
        [HOVER]: {
          selectors: {
            "&:hover": {
              backgroundColor: `color-mix(in srgb, ${palette["--no"]} 18%, transparent)`,
              color: palette["--no-ink"],
            },
          },
        },
      },
    },
  ]),
  none: style({
    display: "inline-flex",
    alignItems: "center",
    height: "34px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "999px",
    fontSize: "14px",
    color: palette["--mute"],
  }),
  button: style({
    marginLeft: "auto",
    selectors: {
      "&:disabled, &[aria-disabled=true]": {
        opacity: 0.5,
        cursor: cursors["--cursor-forbid"],
      },
    },
  }),
  // Sits under the record, apart from the form, so the form's own button only ever saves.
  ctl: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
  wire: style({
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "4px",
    columnGap: "10px",
    alignItems: "baseline",
    minHeight: "38px",
    paddingBlock: "8px",
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "10px",
    fontSize: "12px",
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  }),
  verb: style({
    fontWeight: 700,
    color: "var(--c-ink)",
  }),
  idle: style({
    color: palette["--mute"],
  }),
  body: style({
    minWidth: 0,
    overflowWrap: "anywhere",
    color: palette["--text"],
  }),
  typing: style({
    "@media": {
      [MOTION]: {
        animationName: typeIn,
        animationDuration: "180ms",
        animationTimingFunction: motion["--out"],
        animationFillMode: "both",
      },
    },
  }),
  packet: style({
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    width: "6px",
    height: "6px",
    marginLeft: "-3px",
    backgroundColor: "var(--c)",
    opacity: 0,
  }),
  dropping: style({
    "@media": {
      [MOTION]: {
        animationName: fall,
        animationDuration: "260ms",
        animationTimingFunction: motion["--out"],
        animationDelay: "180ms",
        animationFillMode: "both",
      },
    },
  }),
  record: style({
    display: "grid",
    gridAutoColumns: "minmax(0, 1fr)",
    gridAutoFlow: "column",
    gap: "2px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: "4px",
    paddingInline: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
  }),
  cell: style({
    position: "relative",
    display: "grid",
    gap: "2px",
    alignContent: "start",
    minWidth: 0,
    paddingBlock: "8px",
    paddingInline: "10px",
    borderRadius: "9px",
    isolation: "isolate",
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: -1,
        borderRadius: "inherit",
        opacity: 0,
      },
    },
    "@media": {
      [PHONE]: {
        paddingInline: "8px",
      },
    },
  }),
  cellSaved: style({
    selectors: {
      "&::after": {
        backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 22%, transparent)`,
      },
    },
  }),
  cellLost: style({
    selectors: {
      "&::after": {
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 24%, transparent)`,
      },
    },
  }),
  flashing: style({
    selectors: {
      "&::after": {
        animationName: flash,
        animationDuration: "640ms",
        animationTimingFunction: motion["--out"],
        animationDelay: "calc(var(--i) * 40ms)",
        animationFillMode: "both",
      },
    },
  }),
  name: style({
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  }),
  value: style({
    "@layer": {
      [under1]: {
        minHeight: "21px",
        marginBlock: 0,
        marginInline: 0,
        fontWeight: 600,
        fontSize: "13px",
        lineHeight: 1.6,
        fontFamily: fonts["--mono"],
        color: palette["--text"],
        overflowWrap: "anywhere",
      },
    },
  }),
  valueLost: style({
    color: palette["--no-ink"],
  }),
  landing: style({
    "@media": {
      [MOTION]: {
        animationName: land,
        animationDuration: "240ms",
        animationTimingFunction: motion["--out"],
        animationDelay: "calc(var(--i) * 40ms)",
        animationFillMode: "both",
      },
    },
  }),
  nulLost: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 18%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${palette["--no"]} 70%, transparent)`,
    color: palette["--no-ink"],
  }),
  tag: style({
    justifySelf: "start",
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "5px",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  }),
  tagKept: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  }),
  tagLost: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  }),
  boardCode: style({
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  }),
  // Choices that are a line of code each, stacked so the line stays whole.
  choiceStack: style({
    display: "grid",
    gap: "10px",
  }),
  choiceCode: style({
    display: "grid",
    fontSize: "13px",
    lineHeight: 1.6,
    fontFamily: fonts["--mono"],
  }),
  gap: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "3.2em",
    height: "1.1em",
    marginLeft: "8px",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "color-mix(in srgb, var(--c) 55%, transparent)",
    selectors: {
      [`&${when.ancestor("[data-off]")}`]: {
        display: "none",
      },
    },
  }),
  // A pick board (null-pick-board.astro): the code, a picker per field, and Check.
  pickBoard: style({
    display: "grid",
    gap: "14px",
  }),
  pickCode: style({
    display: "grid",
    gap: "6px",
    fontSize: "13px",
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
  }),
  pickLine: style({
    minHeight: "28px",
    display: "flex",
    alignItems: "center",
    whiteSpace: "pre",
    color: palette["--text"],
  }),
  pickIn: style({
    paddingLeft: "20px",
    "@media": {
      [PHONE]: {
        paddingLeft: "14px",
      },
    },
  }),
  pickRow: style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    rowGap: "6px",
    columnGap: "12px",
  }),
  pickSeg: style({
    display: "inline-flex",
    gap: "4px",
    paddingBlock: "4px",
    paddingInline: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
    "@media": {
      [PHONE]: {
        marginLeft: "14px",
      },
    },
  }),
  pickKey: style({
    "@layer": {
      [under1]: {
        minHeight: "32px",
        paddingBlock: 0,
        paddingInline: "10px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "9px",
        backgroundColor: "transparent",
        backgroundPosition: "0px 0px",
        fontWeight: 600,
        fontSize: "12px",
        lineHeight: "normal",
        fontFamily: fonts["--mono"],
        color: palette["--dim"],
        whiteSpace: "nowrap",
        cursor: cursors["--cursor-point"],
        transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease, box-shadow ${kit["--t-fb"]} ease`,
        selectors: {
          "&:focus-visible": {
            outlineWidth: "3px",
            outlineStyle: "solid",
            outlineColor: palette["--focus"],
            outlineOffset: "2px",
          },
          "&:disabled": {
            cursor: "default",
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover:enabled": {
                color: palette["--text"],
              },
            },
          },
        },
      },
    },
  }),
  pickKeyOn: style({
    backgroundColor: "var(--c)",
    backgroundPosition: "initial",
    boxShadow: drop(3, "var(--key-c)"),
    color: "var(--on-c)",
  }),
  pickFoot: style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  }),
  pickLeft: style({
    fontWeight: 600,
    fontSize: "12px",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
    selectors: {
      "&[data-missed]": {
        color: palette["--no-ink"],
      },
    },
  }),
  // The quiz sets data-state on Check: missed shakes it, seated wears the tick.
  pickCheck: style({
    position: "relative",
    marginLeft: "auto",
    "@media": {
      [MOTION]: {
        selectors: {
          '&[data-state="missed"]': {
            animationName: wobble,
            animationDuration: "320ms",
            animationTimingFunction: motion["--cut"],
          },
        },
      },
    },
  }),
  // A board with records shows the task before, the task wanted, and what Check left.
  pickRecords: style({
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    "@media": {
      [PHONE]: {
        gridTemplateColumns: "minmax(0, 1fr)",
      },
    },
  }),
  pickRecord: style({
    display: "grid",
    alignContent: "start",
    gap: "4px",
    minWidth: 0,
  }),
  pickRecordHead: style({
    margin: 0,
    fontWeight: 600,
    fontSize: "12px",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
  }),
  pickRecordCode: style({
    display: "grid",
    fontSize: "12px",
    lineHeight: 1.6,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  }),
  pickRecordLine: style({
    paddingInline: "4px",
    marginInline: "-4px",
    borderRadius: "4px",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  }),
  pickHit: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 22%, transparent)`,
  }),
  pickMiss: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 24%, transparent)`,
  }),
  pickUnsent: style({
    color: palette["--mute"],
  }),
};
