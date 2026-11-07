import { drop } from "../bevel";
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
const blink = keyframes({ "50%": { opacity: 0 } });
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
const gone = keyframes({
  "from, to": { visibility: "hidden" },
});

const MOVES = "(prefers-reduced-motion: no-preference)";
const screenArmed = style({});
const screenRun = style({});
const armed = `${screenArmed} &`;
const run = `${screenRun} &`;
/** Shows a part from the moment in `at` on: its first frame is blank until then. */
const arrives = (at: string) =>
  ({
    animationName: fade,
    animationDuration: "220ms",
    animationTimingFunction: "ease-out",
    animationDelay: at,
    animationFillMode: "backwards",
  }) as const;
/** Shows a part until the moment in `at`. */
const leaves = (at: string) =>
  ({
    visibility: "visible",
    animationName: gone,
    animationDuration: "1ms",
    animationDelay: at,
    animationFillMode: "forwards",
  }) as const;

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
      '&:disabled, &[aria-disabled="true"]': {
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
        boxShadow: `${palette["--raise"]}, ${drop(3, palette["--drop-ink"])}`,
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
    flexWrap: "wrap",
    rowGap: "4px",
    columnGap: "12px",
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
    boxShadow: drop(2, "var(--key-c)"),
    selectors: {
      [`&${when.ancestor('[data-side="bad"]')}`]: {
        backgroundColor: palette["--no"],
        boxShadow: drop(2, palette["--no-shadow"]),
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
    // Dark --panel-2 sits one step above the card, and the pulse dims it to almost nothing.
    selectors: {
      "&:is(.dark *)": {
        backgroundColor: "#3d3d54",
      },
    },
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
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        paddingBlock: "8px",
        paddingLeft: "10px",
        paddingRight: "14px",
        borderRadius: "10px",
        backgroundColor: palette["--panel-2"],
        boxShadow: `inset 0 0 0 1px ${palette["--hair"]}, 0 8px 20px ${palette["--lift"]}`,
        fontSize: "13px",
        fontWeight: 500,
        color: palette["--text"],
        whiteSpace: "nowrap",
        selectors: {
          "&::before": {
            content: '"!"',
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: palette["--no"],
            fontSize: "11px",
            fontWeight: 800,
            lineHeight: 1,
            color: palette["--on-accent"],
          },
        },
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
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
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
  screen: style({
    gridColumn: "1 / -1",
    marginTop: "10px",
  }),
  screenArmed,
  screenRun,
  wait: style({
    gridArea: "1 / 1",
    placeSelf: "center",
    visibility: "hidden",
    "@media": {
      [MOVES]: {
        selectors: {
          [armed]: { visibility: "visible" },
          [run]: leaves("var(--shell)"),
        },
      },
    },
  }),
  page: style({
    gridArea: "1 / 1",
    display: "grid",
    gap: "8px",
    "@media": {
      [MOVES]: {
        selectors: {
          [armed]: { visibility: "hidden" },
          [run]: arrives("var(--shell)"),
        },
      },
    },
  }),
  order: style({
    display: "grid",
  }),
  orderBones: style({
    gridArea: "1 / 1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    visibility: "hidden",
    "@media": {
      [MOVES]: {
        selectors: {
          [run]: leaves("var(--rows)"),
        },
      },
    },
  }),
  boneItem: style({
    width: "46%",
    height: "11px",
  }),
  boneTotal: style({
    width: "28px",
    height: "11px",
  }),
  orderRow: style({
    gridArea: "1 / 1",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "13px",
    lineHeight: 1.45,
    color: palette["--dim"],
    "@media": {
      [MOVES]: {
        selectors: {
          [run]: arrives("var(--rows)"),
        },
      },
    },
  }),
  orderItem: style({
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  review: style({
    display: "grid",
    flexShrink: 0,
  }),
  orderTotal: style({
    marginLeft: "auto",
  }),
  reviewBone: style({
    gridArea: "1 / 1",
    display: "grid",
    visibility: "hidden",
    "@media": {
      [MOVES]: {
        selectors: {
          [run]: leaves("var(--reviews)"),
        },
      },
    },
  }),
  reviewStars: style({
    gridArea: "1 / 1",
    "@media": {
      [MOVES]: {
        selectors: {
          [run]: arrives("var(--reviews)"),
        },
      },
    },
  }),
  frame: style({
    display: "grid",
    gap: "4px",
    alignContent: "center",
    minHeight: "76px",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderRadius: "9px",
    backgroundColor: palette["--panel-2"],
  }),
  frameBlank: style({
    backgroundImage: `repeating-linear-gradient(135deg, ${palette["--hair"]} 0 1px, transparent 1px 9px)`,
  }),
  lampTitle: style({
    fontWeight: 800,
    fontSize: "18px",
    lineHeight: 1.2,
    fontFamily: fonts["--display"],
    color: palette["--text"],
  }),
  lampPrice: style({
    fontSize: "13px",
    color: palette["--dim"],
  }),
  lampShown: style({
    animationName: fresh,
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  box: style({
    "@layer": {
      [under1]: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        minHeight: "36px",
        paddingInline: "12px",
        borderRadius: "9px",
        backgroundColor: palette["--panel-2"],
        boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
        fontSize: "14px",
        color: palette["--text"],
      },
    },
  }),
  boxGlass: style({
    flexShrink: 0,
    width: "10px",
    height: "10px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--mute"],
    borderRadius: "50%",
  }),
  caret: style({
    "@layer": {
      [under1]: {
        width: "2px",
        height: "16px",
        marginLeft: "-6px",
        backgroundColor: "var(--c)",
      },
    },
    "@media": {
      [MOVES]: {
        animation: `${blink} 1s steps(1) infinite`,
      },
    },
  }),
  results: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: "8px",
        alignItems: "center",
        minHeight: "22px",
        fontSize: "13px",
        color: palette["--dim"],
      },
    },
  }),
  resultsWrong: style({
    color: palette["--no-ink"],
  }),
  log: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gridTemplateRows: "repeat(4, 20px)",
        gap: "4px",
        marginBlock: 0,
        marginInline: 0,
        paddingTop: "10px",
        paddingInline: 0,
        paddingBottom: 0,
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: palette["--hair"],
        listStyle: "none",
      },
    },
  }),
  logRow: style({
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    whiteSpace: "nowrap",
    animationName: fresh,
    animationDuration: "220ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  logCanceled: style({
    color: palette["--mute"],
    textDecorationLine: "line-through",
  }),
  fate: style({
    "@layer": {
      [under1]: {
        display: "inline-flex",
        gap: "6px",
        alignItems: "center",
        paddingBlock: "1px",
        paddingInline: "7px",
        borderRadius: "6px",
        backgroundColor: palette["--panel-2"],
        fontWeight: 600,
        fontSize: "11px",
        color: palette["--mute"],
        textDecorationLine: "none",
      },
    },
  }),
  fateShown: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  }),
  fateStale: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  }),
};

const PILL = "76px";
const ALONG = `calc(var(--at) * (100% - ${PILL}))`;

export const quiz = {
  slide: style({
    display: "grid",
    gap: "14px",
  }),
  // Room above the lanes for the "Code loaded" label.
  slideWf: style({
    paddingTop: "22px",
  }),
  // Room under the paint tag; the lanes stay the waterfall's.
  slidePlot: style({
    overflow: "visible",
  }),
  // Where app.js finishes: a line down the lanes, drawn under the bars, and its label above them.
  slideMark: style({
    position: "absolute",
    top: "-22px",
    bottom: "30px",
    width: "2px",
    marginLeft: "-1px",
    borderRadius: "1px",
    backgroundColor: palette["--mute"],
  }),
  slideMarkLabel: style({
    position: "absolute",
    top: "-22px",
    marginLeft: "8px",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "16px",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
    whiteSpace: "nowrap",
  }),
  // Mono, as the marks are, and narrow enough to fit beside the line at either end of a phone's track.
  slideTag: style({
    fontFamily: fonts["--mono"],
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
  // Layered, so the skeleton quiz's foot can sit at the end.
  slideFoot: style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    "@layer": { [under1]: { justifyContent: "space-between" } },
  }),
  readout: style({
    fontWeight: 600,
    fontSize: "12px",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
  }),
  // Quiz 4's skeleton board. Everything on its track sits `--at` along a run that stops one marker
  // short of the lane's end, so the marker's left edge, the moment it stands for, reaches 1.
  skel: style({
    display: "grid",
    gap: "14px",
  }),
  // The lane from the top: the slow reply's label, the fast reply's, the rail, and the marker hanging
  // under it, so neither the marker nor the playhead ever covers a mark.
  skelLane: style({
    position: "relative",
    height: "80px",
  }),
  skelRail: style({
    position: "absolute",
    top: "42px",
    right: 0,
    left: 0,
    height: "2px",
    borderRadius: "1px",
    backgroundColor: palette["--hair"],
  }),
  skelMark: style({
    position: "absolute",
    top: "var(--top)",
    left: ALONG,
    width: "2px",
    height: "calc(50px - var(--top))",
    marginLeft: "-1px",
    borderRadius: "1px",
    backgroundColor: palette["--mute"],
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "16px",
    fontFamily: fonts["--mono"],
    fontStyle: "normal",
    color: palette["--mute"],
    whiteSpace: "nowrap",
  }),
  // Layered, so a label before its mark can move to the right.
  skelMarkLabel: style({
    position: "absolute",
    top: 0,
    "@layer": { [under1]: { left: "8px" } },
  }),
  skelMarkLabelBefore: style({
    right: "8px",
    left: "auto",
  }),
  // No display of its own, so the `hidden` it starts with keeps it out until the first play.
  skelHead: style({
    position: "absolute",
    top: "34px",
    bottom: 0,
    left: ALONG,
    zIndex: 2,
    width: "2px",
    marginLeft: "-1px",
    borderRadius: "1px",
    backgroundColor: palette["--text"],
  }),
  // The marker's square left edge, and the stem up from it to the rail, are its moment; the rest of
  // it is grip and label.
  skelHandle: style({
    position: "absolute",
    top: "52px",
    left: ALONG,
    zIndex: 1,
    display: "grid",
    placeItems: "center",
    width: PILL,
    height: "24px",
    borderRadius: "2px 7px 7px 7px",
    backgroundColor: "var(--c)",
    boxShadow: drop(2, "var(--key-c)"),
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: 1,
    fontFamily: fonts["--mono"],
    color: "var(--on-c, #111)",
    cursor: cursors["--cursor-grab"],
    outline: "none",
    transitionProperty: "left",
    transitionDuration: "90ms",
    transitionTimingFunction: "linear",
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        inset: "-12px -4px -8px",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "100%",
        left: 0,
        width: "2px",
        height: "8px",
        backgroundColor: "var(--c)",
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
  skelBar: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  seg: style({
    display: "inline-flex",
    gap: "4px",
    paddingBlock: "4px",
    paddingInline: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
  }),
  // Layered, so the picked key's colours win.
  segKey: style({
    "@layer": { [under1]: { backgroundColor: "transparent", color: palette["--dim"] } },
    minHeight: "30px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: "9px",
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    whiteSpace: "nowrap",
    cursor: cursors["--cursor-point"],
    selectors: {
      "&:focus-visible": {
        outline: `3px solid ${palette["--focus"]}`,
        outlineOffset: "2px",
      },
    },
    "@media": {
      [PHONE]: {
        paddingInline: "7px",
      },
    },
  }),
  segOn: style({
    backgroundColor: "var(--c)",
    boxShadow: drop(3, "var(--key-c)"),
    color: "var(--on-c)",
  }),
  skelPreview: style({
    gap: "10px",
  }),
  // The rows' colour sits here, so a bone's transparent text wins on the row itself.
  skelFound: style({
    display: "grid",
    gap: "6px",
    justifyItems: "start",
    color: palette["--dim"],
  }),
  skelMatch: style({
    fontSize: "13px",
    lineHeight: 1.4,
  }),
  skelFresh: style({
    animationName: fresh,
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
      },
    },
  }),
  skelFoot: style({
    justifyContent: "flex-end",
  }),
  // The swept preview shows what played, so with motion this line is only for screen readers.
  skelSaid: style({
    marginBlock: 0,
    marginRight: "auto",
    fontWeight: 600,
    fontSize: "12px",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
    "@media": {
      [MOVES]: {
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
      },
    },
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
    boxShadow: `${palette["--raise"]}, ${drop(2, palette["--drop-ink"])}`,
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
  // Quiz 5's board: the search box as a fix leaves it, above the fixes. A long fix's name wraps
  // under the box's title.
  fix: style({
    display: "grid",
    gap: "12px",
  }),
  fixSays: style({
    whiteSpace: "normal",
    textWrap: "balance",
  }),
  fixChips: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  }),
  fixChip: style({
    paddingBlock: "3px",
    paddingInline: "8px",
    fontSize: "12px",
    fontFamily: fonts["--mono"],
    boxShadow: "inset 0 0 0 1px color-mix(in srgb, currentColor 40%, transparent)",
  }),
  fixLabel: style({
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: 1.35,
  }),
  // Quiz 7's path from the response to the crash. A spot's border and padding add up to the
  // response's own, so the text of every step lines up.
  path: style({
    display: "grid",
  }),
  response: style({
    display: "grid",
    gap: "4px",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dotted",
    borderColor: palette["--hair"],
    borderRadius: "12px",
  }),
  node: style({
    display: "grid",
    gap: "4px",
    justifyItems: "start",
    paddingBlock: "7px",
    paddingInline: "9px",
  }),
  nodeName: style({
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: 1.3,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  }),
  nodeDoes: style({
    fontSize: "12px",
    lineHeight: 1.4,
    color: palette["--dim"],
  }),
  json: style({
    fontSize: "12px",
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    overflowWrap: "anywhere",
  }),
  hole: style({
    paddingInline: "4px",
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: palette["--no"],
    borderRadius: "4px",
    color: palette["--no-ink"],
  }),
  link: style({
    position: "relative",
    justifySelf: "center",
    width: "2px",
    height: "18px",
    backgroundColor: palette["--hair"],
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-1px",
        left: "-4px",
        borderWidth: "5px 5px 0",
        borderStyle: "solid",
        borderColor: `${palette["--hair"]} transparent transparent`,
      },
    },
  }),
  crashed: style({
    marginTop: "2px",
    paddingBlock: "3px",
    fontFamily: fonts["--mono"],
  }),
};
