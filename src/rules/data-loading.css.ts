import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { under1, under2 } from "../layers.css";
const PHONE = "(max-width: 640px)";
const REDUCE = "(prefers-reduced-motion: reduce)";

const turn = keyframes({
  to: { transform: "rotate(1turn)" },
});
export const fresh = keyframes({
  from: { opacity: 0.25, transform: "translateY(4px)" },
});
export const sweep = keyframes({
  to: { transform: "translate(calc(100% + 12px))" },
});
const mark = keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});
const pulse = keyframes({
  to: { opacity: 0.45 },
});
const toast = keyframes({
  "0%": { opacity: 0, transform: "translateY(10px)" },
  "8%, 86%": { opacity: 1, transform: "none" },
  "100%": { opacity: 0, transform: "none" },
});
const fade = keyframes({
  from: { opacity: 0 },
});
const jump = keyframes({
  "from, 40%": { color: palette["--no-ink"] },
});
const wobble = keyframes({
  "25%": { translate: "-4px 0" },
  "50%": { translate: "4px 0" },
  "75%": { translate: "-2px 0" },
});
const toastFade = keyframes({
  "0%, 100%": { opacity: 0 },
  "8%, 86%": { opacity: 1 },
});

export const styles = {
  view: style({
    display: "grid",
    gridTemplateRows: "1fr auto",
    gap: "14px",
    minWidth: 0,
  }),
  ctl: style({
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTopWidth: "1.5px",
    borderTopStyle: "dashed",
    borderTopColor: palette["--hair"],
  }),
  ctlButton: style({
    selectors: {
      "&:disabled": {
        opacity: 0.55,
        cursor: cursors["--cursor-forbid"],
      },
    },
  }),
  note: style({
    display: "inline-flex",
    flexWrap: "wrap",
    rowGap: "4px",
    columnGap: "6px",
    alignItems: "center",
    fontSize: "13px",
    color: palette["--mute"],
  }),
  pair: style({
    display: "flex",
    gap: "8px",
  }),
  card: style({
    "@layer": {
      [under1]: {
        position: "relative",
        display: "grid",
        gap: "12px",
        alignContent: "start",
        paddingTop: "14px",
        paddingInline: "16px",
        paddingBottom: "16px",
        borderRadius: "12px",
        backgroundColor: palette["--panel"],
        boxShadow: `${palette["--raise"]}, 0 3px 0 ${palette["--drop-ink"]}`,
        overflow: "hidden",
        "@media": {
          [PHONE]: {
            paddingTop: "12px",
            paddingInline: "12px",
            paddingBottom: "14px",
          },
        },
      },
    },
  }),
  head: style({
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "22px",
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--text"],
  }),
  status: style({
    "@layer": {
      [under1]: {
        display: "inline-flex",
        gap: "6px",
        alignItems: "center",
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "normal",
        fontFamily: fonts["--mono"],
        color: palette["--mute"],
        whiteSpace: "nowrap",
      },
    },
  }),
  offline: style({
    color: palette["--no-ink"],
  }),
  online: style({
    color: kit["--yes-ink"],
  }),
  spin: style({
    "@layer": {
      [under1]: {
        display: "inline-block",
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "auto",
        width: "24px",
        height: "24px",
        borderWidth: "3px",
        borderStyle: "solid",
        borderColor: palette["--panel-2"],
        borderTopColor: "var(--c)",
        borderRadius: "50%",
        animationName: turn,
        animationDuration: "700ms",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        "@media": {
          [REDUCE]: {
            animationName: pulse,
            animationTimingFunction: "ease-in-out",
            animationDirection: "alternate",
          },
        },
      },
    },
  }),
  spinSmall: style({
    width: "12px",
    height: "12px",
    borderWidth: "2px",
  }),
  spinInFigure: style({
    justifySelf: "start",
    marginBlock: "6px",
    marginInline: 0,
  }),
  wf: style({
    display: "grid",
    gridTemplateColumns: "92px minmax(0, 1fr)",
    rowGap: "6px",
    columnGap: "10px",
    alignContent: "start",
    "@media": {
      [PHONE]: {
        gridTemplateColumns: "82px minmax(0, 1fr)",
        columnGap: "8px",
      },
    },
  }),
  lanes: style({
    display: "grid",
    gridAutoRows: "26px",
    gap: "4px",
    minHeight: "116px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  }),
  label: style({
    textWrap: "pretty",
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    fontSize: "11.5px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
    whiteSpace: "nowrap",
    "@media": {
      [PHONE]: {
        fontSize: "10.5px",
      },
    },
  }),
  // Layered, so the slide quiz's plot can show its overflow.
  plot: style({
    "@layer": {
      [under1]: {
        position: "relative",
        paddingBottom: "30px",
        borderRadius: "6px",
        overflow: "hidden",
      },
    },
  }),
  lane: style({
    textWrap: "pretty",
    position: "relative",
  }),
  bar: style({
    "@layer": {
      [under2]: {
        position: "absolute",
        top: "7px",
        minWidth: "4px",
        height: "12px",
        borderRadius: "4px",
      },
    },
  }),
  code: style({
    backgroundColor: palette["--hair"],
  }),
  render: style({
    backgroundColor: palette["--dim"],
  }),
  req: style({
    backgroundColor: "var(--c)",
    boxShadow: "0 2px 0 var(--key-c)",
    selectors: {
      [`&${when.ancestor('[data-side="bad"]')}`]: {
        backgroundColor: palette["--no"],
        boxShadow: `0 2px 0 ${palette["--no-shadow"]}`,
      },
    },
  }),
  defer: style({
    backgroundImage:
      "repeating-linear-gradient(135deg, color-mix(in srgb, var(--c) 50%, transparent) 0 4px, transparent 4px 8px)",
    boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--c) 75%, transparent)",
  }),
  paint: style({
    position: "absolute",
    top: 0,
    bottom: "4px",
    zIndex: 4,
    width: "2px",
    marginLeft: "-1px",
    borderRadius: "1px",
    backgroundColor: palette["--text"],
  }),
  paintArmed: style({
    opacity: 0,
  }),
  paintRun: style({
    animationName: mark,
    animationDuration: "260ms",
    animationTimingFunction: motion["--snap"],
    animationDelay: "var(--at)",
    animationFillMode: "backwards",
    "@media": {
      [REDUCE]: {
        animationName: "none",
        animationDuration: "0s",
        animationTimingFunction: "ease",
        animationDelay: "0s",
        animationFillMode: "none",
      },
    },
  }),
  paintTag: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        bottom: 0,
        left: "6px",
        paddingBlock: "3px",
        paddingInline: "7px",
        borderRadius: "6px",
        backgroundColor: palette["--text"],
        fontWeight: 700,
        fontSize: "11px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        color: palette["--bg"],
        whiteSpace: "nowrap",
      },
    },
  }),
  paintTagEnd: style({
    right: "6px",
    left: "auto",
  }),
  long: style({
    "@media": {
      [PHONE]: {
        display: "none",
      },
    },
  }),
  grid: style({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: "30px",
    left: 0,
    zIndex: 3,
    pointerEvents: "none",
    backgroundImage: `linear-gradient(90deg, ${kit["--grid"]} 1px, transparent 1px)`,
    backgroundSize: "25% 100%",
  }),
  cover: style({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    display: "none",
    backgroundColor: kit["--code-bg"],
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        bottom: "30px",
        left: 0,
        width: "2px",
        backgroundColor: "var(--c)",
        boxShadow: "0 0 10px var(--c)",
      },
    },
  }),
  coverShown: style({
    display: "block",
    "@media": {
      [REDUCE]: {
        display: "none",
      },
    },
  }),
  coverRun: style({
    animationName: sweep,
    animationDuration: "var(--sweep)",
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
  }),
  axis: style({
    position: "relative",
    gridColumn: 2,
    height: "14px",
    fontWeight: 500,
    fontSize: "10.5px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  }),
  tick: style({
    position: "absolute",
    fontStyle: "normal",
    transform: "translateX(-50%)",
    selectors: {
      "&:first-child": {
        transform: "none",
      },
      "&:last-child": {
        transform: "translateX(-100%)",
      },
    },
  }),
  key: style({
    display: "inline-block",
    width: "14px",
    height: "8px",
    marginLeft: "4px",
    borderRadius: "3px",
    selectors: {
      "&:first-child": {
        marginLeft: 0,
      },
    },
  }),
  keyReq: style({
    backgroundColor: "var(--c)",
    selectors: {
      [`&${when.ancestor('[data-side="bad"]')}`]: {
        backgroundColor: palette["--no"],
      },
    },
  }),
  keyCode: style({
    backgroundColor: palette["--hair"],
  }),
  keyDefer: style({
    backgroundColor: "color-mix(in srgb, var(--c) 45%, transparent)",
    boxShadow: "inset 0 0 0 1.5px var(--c)",
  }),
  figure: style({
    display: "grid",
    gap: "4px",
    alignContent: "center",
    minHeight: "82px",
  }),
  amount: style({
    fontWeight: 900,
    fontSize: "34px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    color: palette["--text"],
    fontVariantNumeric: "tabular-nums",
    "@media": {
      [PHONE]: {
        fontSize: "28px",
      },
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  amountFresh: style({
    animationName: fresh,
    animationDuration: "320ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  sub: style({
    fontSize: "13px",
    color: kit["--yes-ink"],
  }),
  hidden: style({
    visibility: "hidden",
  }),
  mail: style({
    display: "grid",
    gap: "10px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  }),
  mailRow: style({
    textWrap: "pretty",
    display: "grid",
    gridTemplateColumns: "28px minmax(0, 1fr)",
    gap: "10px",
    alignItems: "center",
    animationName: fresh,
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  mailRowStill: style({
    animationName: "none",
    animationDuration: "0s",
    animationTimingFunction: "ease",
  }),
  avatar: style({
    "@layer": {
      [under1]: {
        display: "grid",
        placeItems: "center",
        width: "28px",
        height: "28px",
        borderRadius: "9px",
        backgroundColor: palette["--panel-2"],
        fontWeight: 700,
        fontSize: "12px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        fontStyle: "normal",
        color: palette["--dim"],
      },
    },
  }),
  mailText: style({
    display: "grid",
    justifyItems: "start",
    gap: "2px",
    minWidth: 0,
    fontSize: "13px",
    lineHeight: 1.35,
  }),
  mailLine: style({
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  mailFrom: style({
    fontWeight: 600,
    color: palette["--text"],
  }),
  mailSubject: style({
    fontStyle: "normal",
    color: palette["--dim"],
  }),
  bone: style({
    borderRadius: "6px",
    backgroundColor: palette["--panel-2"],
    color: "transparent",
    animationName: pulse,
    animationDuration: "900ms",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
  }),
  said: style({
    textWrap: "pretty",
    minHeight: "2.9em",
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: 1.45,
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
  }),
  body: style({
    display: "grid",
    placeItems: "center",
    minHeight: "132px",
  }),
  people: style({
    display: "grid",
    gap: "10px",
    justifySelf: "stretch",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
    animationName: fresh,
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  person: style({
    textWrap: "pretty",
    display: "grid",
    gridTemplateColumns: "28px auto minmax(0, 1fr)",
    gap: "10px",
    alignItems: "center",
    fontSize: "14px",
  }),
  personName: style({
    fontWeight: 600,
    color: palette["--text"],
  }),
  personRole: style({
    justifySelf: "end",
    fontSize: "13px",
    color: palette["--mute"],
  }),
  error: style({
    display: "grid",
    gap: "6px",
    justifyItems: "center",
    maxWidth: "30ch",
    textAlign: "center",
    animationName: fresh,
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  errorTitle: style({
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--no-ink"],
  }),
  errorText: style({
    fontSize: "13px",
    lineHeight: 1.45,
    color: palette["--dim"],
  }),
  errorButton: style({
    marginTop: "4px",
  }),
  errorCode: style({
    fontSize: "11px",
    color: palette["--mute"],
  }),
  empty: style({
    textWrap: "pretty",
    fontSize: "14px",
    color: palette["--mute"],
  }),
  toast: style({
    "@layer": {
      [under1]: {
        textWrap: "pretty",
        position: "absolute",
        bottom: "12px",
        left: "50%",
        paddingBlock: "8px",
        paddingInline: "14px",
        borderRadius: "10px",
        backgroundColor: palette["--text"],
        boxShadow: `0 8px 20px ${palette["--lift"]}`,
        fontSize: "13px",
        fontWeight: 600,
        color: palette["--bg"],
        whiteSpace: "nowrap",
        translate: "-50% 0",
        opacity: 0,
        animationName: toast,
        animationDuration: "3s",
        animationTimingFunction: motion["--out"],
        animationFillMode: "forwards",
        "@media": {
          [REDUCE]: {
            animationName: toastFade,
          },
        },
      },
    },
  }),
  source: style({
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: "12px",
    paddingInline: "14px",
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: 1.65,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  }),
  comment: style({
    color: palette["--mute"],
  }),
  mark: style({
    paddingBlock: 0,
    paddingInline: "3px",
    borderRadius: "4px",
    backgroundColor: "color-mix(in srgb, var(--c) 26%, transparent)",
    color: "inherit",
  }),
  result: style({
    placeItems: "center",
    minHeight: "96px",
  }),
  profile: style({
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifySelf: "start",
    animationName: fresh,
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  profileAvatar: style({
    width: "36px",
    height: "36px",
    borderRadius: "11px",
    backgroundColor: "var(--c)",
    color: "var(--on-c)",
  }),
  profileName: style({
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--text"],
  }),
  city: style({
    paddingBlock: "2px",
    paddingInline: "8px",
    borderRadius: "6px",
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: kit["--yes-ink"],
  }),
  crash: style({
    display: "grid",
    gap: "6px",
    justifySelf: "stretch",
    paddingBlock: "12px",
    paddingInline: "14px",
    borderRadius: "10px",
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 12%, transparent)`,
    boxShadow: `inset 3px 0 0 ${palette["--no"]}`,
    animationName: fade,
    animationDuration: "200ms",
    animationTimingFunction: "ease-out",
  }),
  crashTitle: style({
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--no-ink"],
  }),
  crashCode: style({
    fontSize: "12px",
    lineHeight: 1.5,
    color: palette["--no-ink"],
    overflowWrap: "anywhere",
  }),
  balance: style({
    display: "grid",
    gap: "2px",
    minHeight: "62px",
    alignContent: "center",
  }),
  balanceLabel: style({
    fontSize: "12px",
    color: palette["--dim"],
  }),
  balanceValue: style({
    "@layer": {
      [under1]: {
        fontWeight: 900,
        fontSize: "30px",
        lineHeight: 1.15,
        fontFamily: fonts["--display"],
        letterSpacing: "-0.03em",
        color: palette["--text"],
        fontVariantNumeric: "tabular-nums",
        animationName: fresh,
        animationDuration: "320ms",
        animationTimingFunction: motion["--out"],
        "@media": {
          [REDUCE]: {
            animationName: fade,
          },
        },
      },
    },
  }),
  balanceJump: style({
    animationName: `${fresh}, ${jump}`,
    animationDuration: "320ms, 1400ms",
    animationTimingFunction: `${motion["--out"]}, ease-out`,
    "@media": {
      [REDUCE]: {
        animationName: `${fade}, ${jump}`,
        animationTimingFunction: "ease-out, ease-out",
      },
    },
  }),
  balanceWait: style({
    fontWeight: 600,
    fontSize: "15px",
    lineHeight: 1.5,
    fontFamily: fonts["--sans"],
    fontVariantNumeric: "normal",
    letterSpacing: 0,
    color: palette["--mute"],
    animationName: "none",
    animationDuration: "0s",
    animationTimingFunction: "ease",
  }),
  hist: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gap: "8px",
        paddingTop: "10px",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: palette["--hair"],
      },
    },
  }),
  histHead: style({
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "22px",
    fontSize: "12px",
    color: palette["--dim"],
  }),
  stamp: style({
    paddingBlock: "2px",
    paddingInline: "7px",
    borderRadius: "6px",
    backgroundColor: "color-mix(in srgb, var(--c) 18%, transparent)",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: "var(--c-ink)",
    whiteSpace: "nowrap",
  }),
  histList: style({
    display: "grid",
    gap: "6px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  }),
  histRow: style({
    textWrap: "pretty",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "13px",
    color: palette["--dim"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  histRowNew: style({
    animationName: fresh,
    animationDuration: "320ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  histAmount: style({
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  }),
  time: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    minWidth: "54px",
    fontWeight: 700,
    color: "var(--c-ink)",
    "@media": {
      [PHONE]: {
        minWidth: "46px",
      },
    },
  }),
};

export const quiz = {
  slide: style({
    display: "grid",
    gap: "14px",
  }),
  // Room under the paint tag; the lanes stay the waterfall's.
  slidePlot: style({
    overflow: "visible",
  }),
  track: style({
    cursor: cursors["--cursor-point"],
    touchAction: "none",
    selectors: {
      [`&${when.ancestor("[data-locked]")}`]: {
        cursor: "default",
      },
    },
  }),
  // The request is the one bar that moves: taller, with a grip, and a wider reach than it draws.
  handle: style({
    top: "3px",
    height: "20px",
    borderRadius: "6px",
    cursor: cursors["--cursor-grab"],
    outline: "none",
    transitionProperty: "left, box-shadow",
    transitionDuration: "90ms",
    transitionTimingFunction: "linear",
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        inset: "-8px -4px",
      },
      "&::after": {
        content: '"⇆"',
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        fontSize: "12px",
        lineHeight: 1,
        color: "var(--on-c, #111)",
      },
      "&:focus-visible": {
        outline: `3px solid ${palette["--focus"]}`,
        outlineOffset: "2px",
      },
      [`&${when.ancestor("[data-dragging]")}`]: {
        cursor: cursors["--cursor-grabbing"],
        transitionDuration: "0s",
      },
      [`&${when.ancestor("[data-locked]")}`]: {
        cursor: "default",
      },
    },
  }),
  slideFoot: style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  }),
  readout: style({
    fontWeight: 600,
    fontSize: "12px",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
  }),
  // The quiz sets data-state on Check: missed shakes it, seated wears the tick.
  check: style({
    position: "relative",
    selectors: {
      '&[data-state="missed"]': {
        animationName: wobble,
        animationDuration: "320ms",
        animationTimingFunction: motion["--cut"],
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          '&[data-state="missed"]': {
            animationName: "none",
          },
        },
      },
    },
  }),
  prices: style({
    display: "grid",
    gridTemplateRows: "auto 52px auto",
    gap: "8px",
  }),
  rows: style({
    display: "grid",
    gap: "4px",
    alignContent: "center",
  }),
  row: style({
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    fontSize: "13px",
    color: palette["--dim"],
  }),
  still: style({
    animationName: "none",
  }),
  bigSpin: style({
    alignSelf: "center",
    justifySelf: "center",
  }),
  screen: style({
    position: "relative",
    isolation: "isolate",
    display: "grid",
    gap: "12px",
    paddingBlock: "14px",
    paddingInline: "14px",
    "@media": {
      [PHONE]: {
        paddingInline: "12px",
      },
    },
  }),
  backdrop: style({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
    display: "grid",
  }),
  through: style({
    pointerEvents: "none",
  }),
  tiles: style({
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
  }),
  wide: style({
    gridColumn: "1 / -1",
    display: "grid",
    pointerEvents: "auto",
  }),
  tile: style({
    display: "grid",
    gap: "2px",
    alignContent: "start",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 2px 0 ${palette["--drop-ink"]}`,
    pointerEvents: "none",
  }),
  tileLabel: style({
    fontSize: "12px",
    color: palette["--dim"],
  }),
  tileValue: style({
    fontWeight: 800,
    fontSize: "18px",
    lineHeight: 1.2,
    fontFamily: fonts["--display"],
    color: palette["--text"],
    fontVariantNumeric: "tabular-nums",
  }),
  missingChart: style({
    height: "44px",
  }),
  toastSpot: style({
    justifySelf: "center",
    display: "grid",
  }),
  toast: style({
    position: "static",
    translate: "none",
    opacity: 1,
    animationName: "none",
  }),
  wallet: style({
    overflow: "visible",
  }),
  inset: style({
    paddingTop: "6px",
    paddingRight: "9px",
    paddingBottom: "6px",
    paddingLeft: "9px",
    borderTopWidth: 0,
  }),
  rate: style({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
    fontSize: "12px",
    color: palette["--dim"],
  }),
};
