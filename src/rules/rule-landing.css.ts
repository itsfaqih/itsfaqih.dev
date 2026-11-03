import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { kit, reveal } from "./rule-landing.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { under1, under2, under3, under4, under5 } from "../layers.css";
export const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

export const TABBED = "(max-width: 820px)";

const enter = keyframes({
  from: { opacity: 0.01, translate: "0 12px" },
});

export const said = keyframes({
  from: { opacity: 0, translate: "0 6px" },
});
const stamp = keyframes({
  from: { opacity: 0, scale: 0.6, rotate: "-12deg" },
});
const shake = keyframes({
  "20%": { translate: "-6px 0" },
  "40%": { translate: "6px 0" },
  "60%": { translate: "-4px 0" },
  "80%": { translate: "4px 0" },
});
const burst = keyframes({
  from: { transform: "translate(18px) scale(1)", opacity: 1 },
  to: { transform: "translate(64px) scale(0)", opacity: 0 },
});

// The miss shake is a four-beat wobble, not a state change, so it keeps its own length.
const SHAKE_TIME = "320ms";

const STACKED = "(max-width: 960px)";
const PHONE = "(max-width: 640px)";
const TINY = "(max-width: 400px)";
// Only the rule page itself: when a pager card opens the next rule, the old page holds the card.
// Diving in names the opened page; zooming back out to the index names the page being left.
// Set by the head script (head-script.ts) on a page a rule tile's dive opened.
const DIVED = ":is(html[data-vt='rule-open'] *)";
const RULE_OPEN =
  ":is(html:active-view-transition-type(rule-open, rule-close):not(:has([data-opening])) *)";
const NARROW = "(max-width: 480px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
export const TITLE_TRACKING = -0.05;
export const TITLE_MARK_INSET = 0.06;

export const shell = {
  root: style({
    position: "relative",
    isolation: "isolate",
    overflowWrap: "break-word",
    vars: {
      "--c-ink": `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
      "--key-c": "color-mix(in oklab, var(--c) 60%, #000)",
    },
  }),
  crumbRow: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    gridColumn: "1 / -1",
    justifySelf: "stretch",
    // Stacked, the rows' gap opens for the cover; the crumbs keep closer to the title.
    marginBottom: 0,
    "@media": {
      [TINY]: {
        gap: "6px",
      },
      [STACKED]: {
        marginBottom: "-16px",
      },
    },
  }),
  crumb: style({
    gap: "10px",
    marginBottom: 0,
    fontSize: "0.875rem",
    color: palette["--dim"],
    whiteSpace: "nowrap",
    selectors: {
      "&::before": {
        display: "none",
      },
    },
    "@media": {
      [TINY]: {
        gap: "6px",
      },
    },
  }),
  crumbLink: style({
    userSelect: "none",
    marginBlock: "-12px",
    paddingBlock: "12px",
    transitionProperty: "color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        color: palette["--text"],
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  crumbTag: style({
    fontWeight: 700,
    color: "var(--c-ink)",
  }),
  // On a phone the label hides, so the key turns into a square around its icon.
  share: style({
    "@media": {
      [PHONE]: {
        width: "38px",
        paddingInlineStart: 0,
        paddingInlineEnd: 0,
      },
    },
  }),
  shareLabel: style({
    "@media": {
      [PHONE]: {
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
      },
    },
  }),
  titleScreen: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
    gridTemplateRows: "auto 1fr",
    columnGap: "56px",
    rowGap: "24px",
    alignItems: "center",
    minHeight: "calc(100svh - 72px)",
    paddingTop: "48px",
    paddingBottom: "72px",
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "minmax(0, 1fr)",
        gridTemplateRows: "auto",
        rowGap: "40px",
        minHeight: 0,
        paddingTop: "40px",
      },
    },
  }),
  heroCopy: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    justifyItems: "start",
  }),
  titleFit: style({
    justifySelf: "stretch",
    containerType: "inline-size",
  }),
  title: style({
    width: "fit-content",
    maxWidth: "100%",
    marginBottom: "8px",
    fontWeight: 900,
    // --word-em comes from titleWordEm, so the longest word fits its column at first paint.
    fontSize: "min(clamp(44px, 7vw, 108px), round(down, calc(100cqi / var(--word-em)), 1px))",
    lineHeight: 0.94,
    fontFamily: fonts["--display"],
    letterSpacing: `${TITLE_TRACKING}em`,
    selectors: {
      [`&${RULE_OPEN}`]: {
        viewTransitionName: "rule-title",
      },
    },
  }),
  titleLine: style({
    display: "block",
    selectors: {
      "&:first-child": {
        position: "relative",
        zIndex: 1,
      },
    },
  }),
  titleMark: style({
    paddingInline: `${TITLE_MARK_INSET}em`,
    borderRadius: "0.06em",
  }),
  claim: style({
    maxWidth: "20em",
    fontWeight: 700,
    fontSize: "clamp(21px, 2vw, 28px)",
    lineHeight: 1.25,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.025em",
    color: palette["--text"],
    textWrap: "pretty",
  }),
  lead: style({
    maxWidth: "34em",
    fontSize: "18px",
    lineHeight: 1.6,
    textWrap: "pretty",
  }),
  // The load-in starts at 0.01, not 0: Chrome skips a text paint at opacity 0 for LCP, and a fade runs
  // on the compositor without painting again, so a fully transparent start leaves the lead out of LCP
  // until some unrelated repaint seconds later.
  in: style({
    "@layer": {
      [under1]: {
        animationName: enter,
        animationDuration: "560ms",
        animationTimingFunction: motion["--out"],
        animationFillMode: "both",
        animationDelay: "calc(var(--i, 0) * 60ms + 200ms)",
        "@media": {
          [REDUCE]: {
            animationName: "none",
          },
        },
      },
    },
  }),
  // A dive lands with the tile's art already where the cover sits, so the cover holds still.
  coverIn: style({
    animationName: enter,
    selectors: {
      [`&${DIVED}`]: {
        animationName: "none",
      },
    },
    "@media": {
      [REDUCE]: {
        animationName: "none",
      },
    },
  }),
  first: style({
    vars: {
      "--i": "0",
    },
  }),
  second: style({
    vars: {
      "--i": "1",
    },
  }),
  third: style({
    vars: {
      "--i": "2",
    },
  }),
  // watchReveal marks what starts on screen with data-in, then sets data-rev-on; the rest rises in.
  rev: style({
    selectors: {
      [`&${when.ancestor("[data-rev-on]", reveal)}`]: {
        transition: `opacity ${motion["--t-panel"]} ${motion["--out"]}, translate ${motion["--t-panel"]} ${motion["--out"]}`,
      },
      [`&${when.ancestor("[data-rev-on]", reveal)}:not([data-in])`]: {
        opacity: 0,
        translate: "0 16px",
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          [`&${when.ancestor("[data-rev-on]", reveal)}:not([data-in])`]: {
            translate: "none",
          },
        },
      },
    },
  }),
};

// The arriving glyph takes the whole fast tier and the leaving one its exit, so an appear always
// outlasts a disappear. Both are tweens: a spring would settle early and invert that order.
export const glyphSwap = {
  cell: style({
    display: "inline-grid",
    flexShrink: 0,
  }),
  glyph: style({
    gridArea: "1 / 1",
    transitionProperty: "opacity, scale, filter",
  }),
  shown: style({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: "ease-out",
  }),
  hidden: style({
    opacity: 0,
    scale: 0.6,
    filter: "blur(4px)",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: "ease-in",
  }),
};

const TAB = `${TABBED}`;
const PAIRED = "(max-width: 860px)";
const BAD_PANE = ':is([data-side="bad"])';

export const text = {
  wrap: style({
    "@layer": {
      [under1]: {
        display: "inline-block",
        maxWidth: "100%",
        overflowWrap: "anywhere",
      },
    },
  }),
  chip: style({
    "@layer": {
      [under1]: {
        paddingBlock: "1px",
        paddingInline: "6px",
        borderRadius: "6px",
        backgroundColor: palette["--soft-key"],
        boxShadow: `0 2px 0 ${palette["--soft-key-drop"]}`,
        fontWeight: 600,
        fontSize: "0.86em",
        lineHeight: "normal",
        fontFamily: fonts["--mono"],
        color: palette["--text"],
      },
    },
  }),
  tint: style({
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "6px",
    backgroundColor: palette["--soft-key"],
    fontSize: "0.86em",
    color: palette["--text"],
  }),
  bright: style({
    color: palette["--text"],
  }),
  lesson: style({
    "@layer": {
      [under1]: {
        maxWidth: "62ch",
        fontSize: "16px",
        lineHeight: 1.6,
        color: palette["--dim"],
        textWrap: "pretty",
      },
    },
  }),
  tip: style({
    paddingBlock: "10px",
    paddingInline: "14px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
    fontSize: "14px",
  }),
};

const HINT_BLUE = `color-mix(in oklab, ${palette["--cw"]} ${palette["--ink-mix"]}, #000)`;

export const hintKit = {
  layer: style({
    position: "absolute",
    inset: 0,
    zIndex: 3,
    pointerEvents: "none",
  }),
  svg: style({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "visible",
    transition: `opacity 220ms ease`,
  }),
  arrow: style({
    "@layer": {
      [under1]: {
        fill: "none",
        stroke: HINT_BLUE,
        strokeWidth: 2.25,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeDasharray: 1,
        strokeDashoffset: 1,
        transition: `stroke-dashoffset 700ms ${OUT} 250ms`,
        "@media": {
          [REDUCE]: {
            strokeDashoffset: 0,
            transition: "none",
          },
        },
      },
    },
  }),
  drawn: style({
    strokeDashoffset: 0,
  }),
  label: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        fontWeight: 600,
        fontSize: "13px",
        lineHeight: 1,
        fontFamily: fonts["--display"],
        whiteSpace: "nowrap",
        color: HINT_BLUE,
        textShadow: `0 0 3px ${kit["--code-bg"]}, 0 0 3px ${kit["--code-bg"]}`,
        transition: `opacity 260ms ease 120ms`,
        "@media": {
          [REDUCE]: {
            transition: "none",
          },
        },
      },
    },
  }),
  ruler: style({
    visibility: "hidden",
  }),
  up: style({
    transform: "translate(-50%, -50%) rotate(-4deg)",
  }),
  down: style({
    transform: "translate(-50%, -50%) rotate(4deg)",
  }),
  level: style({
    transform: "translate(-50%, -50%)",
  }),
  onPanel: style({
    textShadow: `0 0 3px ${palette["--panel"]}, 0 0 3px ${palette["--panel"]}`,
  }),
  gone: style({
    opacity: 0,
  }),
};

export const lessonKit = {
  section: style({
    paddingTop: "64px",
    paddingBottom: 0,
    scrollMarginTop: "8px",
  }),
  secHead: style({
    display: "grid",
    gap: "14px",
    marginBottom: "48px",
  }),
  headItem: style({
    justifySelf: "start",
  }),
  secTitle: style({
    fontWeight: 900,
    fontSize: "clamp(32px, 4vw, 52px)",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.04em",
  }),
  secText: style({
    maxWidth: "60ch",
    fontSize: "17px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  }),
  lessons: style({
    display: "grid",
    gap: "24px",
  }),
  lesson: style({
    position: "relative",
    display: "grid",
    gap: "28px",
    paddingTop: "32px",
    paddingRight: "32px",
    paddingBottom: "32px",
    paddingLeft: "36px",
    borderRadius: "20px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 6px 0 ${palette["--drop-ink"]}`,
    "@media": {
      [PHONE]: {
        paddingTop: "20px",
        paddingRight: "20px",
        paddingBottom: "20px",
        paddingLeft: "20px",
      },
    },
  }),
  copy: style({
    display: "grid",
    gap: "12px",
    justifyItems: "start",
  }),
  exception: style({
    paddingBlock: "3px",
    paddingInline: "8px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--c-ink)",
    borderRadius: "6px",
    fontWeight: 900,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--c-ink)",
    rotate: "-3deg",
  }),
  title: style({
    color: palette["--text"],
    fontWeight: 900,
    fontSize: "28px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
    "@media": {
      [PHONE]: {
        fontSize: "24px",
      },
    },
  }),
  demo: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "16px",
    "@media": {
      [TAB]: {
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "12px",
      },
    },
  }),
  well: style({
    borderRadius: "14px",
    backgroundColor: kit["--code-bg"],
    boxShadow: palette["--sink"],
  }),
  pane: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "auto 1fr auto",
    gap: "16px",
    paddingTop: "16px",
    paddingRight: "18px",
    paddingBottom: "18px",
    paddingLeft: "18px",
    "@media": {
      [TAB]: {
        gridTemplateRows: "1fr auto",
        gridArea: "2 / 1",
      },
      [PHONE]: {
        paddingTop: "14px",
        paddingRight: "12px",
        paddingBottom: "14px",
        paddingLeft: "12px",
      },
    },
  }),
  behind: style({
    "@media": {
      [TAB]: {
        visibility: "hidden",
      },
    },
  }),
  caption: style({
    display: "inline-flex",
    justifySelf: "start",
    alignItems: "center",
    gap: "6px",
    minHeight: "34px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderRadius: "9px",
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    "@media": {
      [TAB]: {
        display: "none",
      },
    },
  }),
  mark: style({
    fontSize: "11px",
  }),
  bad: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    backgroundPosition: "initial",
    color: palette["--no-ink"],
  }),
  good: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    backgroundPosition: "initial",
    color: kit["--yes-ink"],
  }),
  flip: style({
    display: "none",
    justifySelf: "start",
    maxWidth: "100%",
    gap: "4px",
    padding: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
    "@media": {
      [TAB]: {
        display: "inline-flex",
      },
    },
  }),
  // `background: transparent` minifies to a 0 0 position; the pressed key's background resets it.
  flipKey: style({
    "@layer": {
      [under1]: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        minHeight: "34px",
        paddingBlock: 0,
        paddingInline: "12px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "9px",
        backgroundColor: "transparent",
        backgroundPosition: "0 0",
        fontWeight: 700,
        fontSize: "13px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        color: palette["--dim"],
        whiteSpace: "nowrap",
        cursor: cursors["--cursor-point"],
        transitionProperty: "background-color, color",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
        selectors: {
          "&:is([aria-pressed='true'])": {
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
        "@media": {
          [PHONE]: {
            minWidth: 0,
            paddingBlock: "6px",
            paddingInline: "10px",
            whiteSpace: "normal",
            textWrap: "balance",
          },
        },
      },
    },
  }),
  costs: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  }),
  cost: style({
    paddingBlock: "3px",
    paddingInline: "8px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
  }),
  costIn: style({
    "@media": {
      [TAB]: {
        animationName: said,
        animationDuration: "200ms",
        animationTimingFunction: motion["--out"],
      },
      [`${TAB} and ${REDUCE}`]: {
        animationName: "none",
      },
    },
  }),
  badCost: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  }),
  goodCost: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  }),
  sheetWrap: style({
    display: "grid",
    gap: "20px",
    marginTop: "72px",
  }),
  sheetTitle: style({
    color: palette["--text"],
    fontWeight: 900,
    fontSize: "28px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
    "@media": {
      [PHONE]: {
        fontSize: "24px",
      },
    },
  }),
  panel: style({
    borderRadius: "20px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 6px 0 ${palette["--drop-ink"]}`,
  }),
  sheet: style({
    display: "grid",
    padding: "8px",
  }),
  sheetRow: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
    gap: "24px",
    alignItems: "baseline",
    paddingBlock: "16px",
    paddingInline: "18px",
    textWrap: "pretty",
    selectors: {
      "&:not(:first-child)": {
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: palette["--hair"],
      },
    },
    "@media": {
      [PAIRED]: {
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "4px",
      },
    },
  }),
  situation: style({
    color: palette["--dim"],
  }),
  answer: style({
    fontWeight: 700,
    fontSize: "17px",
    lineHeight: 1.35,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.015em",
    color: palette["--text"],
  }),
};

export const tree = {
  list: style({
    display: "grid",
    gap: "4px",
    fontSize: "13px",
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
  }),
  inPane: style({
    alignContent: "start",
    "@media": {
      [TAB]: {
        minHeight: "calc(var(--rows) * 32px)",
      },
    },
  }),
  row: style({
    "@layer": {
      [under1]: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minHeight: "28px",
        paddingLeft: "calc(var(--d) * 20px)",
        color: palette["--text"],
        textWrap: "pretty",
        "@media": {
          [PHONE]: {
            paddingLeft: "calc(var(--d) * 14px)",
          },
        },
      },
    },
  }),
  dir: style({
    color: palette["--dim"],
  }),
  comp: style({
    color: "var(--c-ink)",
  }),
  more: style({
    color: palette["--mute"],
  }),
  moved: style({
    paddingBlock: "3px",
    paddingInline: "10px",
    borderRadius: "8px",
    backgroundColor: "var(--c)",
    boxShadow: "0 3px 0 var(--key-c)",
    fontWeight: 600,
    color: "var(--on-c)",
    selectors: {
      [`&${when.ancestor(BAD_PANE)}`]: {
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 22%, ${palette["--panel-2"]})`,
        boxShadow: `0 3px 0 color-mix(in srgb, ${palette["--no"]} 40%, ${palette["--drop-ink"]})`,
        color: palette["--no-ink"],
      },
    },
  }),
  calls: style({
    paddingBlock: "2px",
    paddingInline: "6px",
    borderRadius: "5px",
    backgroundColor: "color-mix(in srgb, var(--c) 18%, transparent)",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--c-ink)",
    whiteSpace: "nowrap",
  }),
};

const ON = "var(--c)";
const ON_TINT = "color-mix(in srgb, var(--c) 16%, transparent)";

export const quizKit = {
  stars: style({
    display: "inline-flex",
    gap: "1px",
    fontSize: "13px",
    whiteSpace: "nowrap",
  }),
  star: style({
    "@layer": {
      [under1]: {
        fontStyle: "normal",
        color: palette["--hair"],
      },
    },
  }),
  starOn: style({
    color: "var(--c-ink)",
  }),
  level: style({
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.92fr) minmax(0, 1.08fr)",
    gap: "32px",
    paddingTop: "28px",
    paddingRight: "28px",
    paddingBottom: "28px",
    paddingLeft: "28px",
    scrollMarginTop: "24px",
    "@media": {
      [PAIRED]: {
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "24px",
      },
      [PHONE]: {
        paddingTop: "18px",
        paddingRight: "18px",
        paddingBottom: "18px",
        paddingLeft: "18px",
      },
      "(min-width: 640.01px) and (max-width: 860px)": {
        paddingTop: "22px",
        paddingRight: "22px",
        paddingBottom: "22px",
        paddingLeft: "22px",
      },
    },
  }),
  copy: style({
    display: "grid",
    gap: "14px",
    alignContent: "start",
  }),
  levelHead: style({
    display: "flex",
    gap: "10px",
    alignItems: "center",
    minHeight: "28px",
  }),
  badge: style({
    paddingBlock: "5px",
    paddingInline: "9px",
    borderRadius: "8px",
    backgroundColor: ON,
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--on-c)",
  }),
  stamp: style({
    paddingBlock: "3px",
    paddingInline: "8px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: kit["--yes-ink"],
    borderRadius: "6px",
    fontWeight: 900,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: kit["--yes-ink"],
    rotate: "-4deg",
    animationName: stamp,
    animationDuration: motion["--t-pop"],
    animationTimingFunction: motion["--snap"],
    "@media": {
      [REDUCE]: {
        animationName: "none",
        animationDuration: "0s",
        animationTimingFunction: "ease",
      },
    },
  }),
  title: style({
    color: palette["--text"],
    fontWeight: 900,
    fontSize: "26px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
    "@media": {
      [PHONE]: {
        fontSize: "22px",
      },
    },
  }),
  prompt: style({
    maxWidth: "42ch",
    fontSize: "17px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  }),
  say: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gap: "10px",
        alignContent: "start",
        minHeight: "84px",
        marginTop: "4px",
        paddingBlock: "14px",
        paddingInline: "16px",
        borderRadius: "12px",
        backgroundColor: palette["--panel-2"],
      },
    },
  }),
  sayNo: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  }),
  sayYes: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  }),
  said: style({
    "@layer": {
      [under1]: {
        fontSize: "15px",
        lineHeight: 1.5,
        color: palette["--dim"],
        textWrap: "pretty",
        animationName: said,
        animationDuration: motion["--t-moderate"],
        animationTimingFunction: motion["--moderate"],
        "@media": {
          [REDUCE]: {
            animationName: "none",
            animationDuration: "0s",
            animationTimingFunction: "ease",
          },
        },
      },
    },
  }),
  saidToned: style({
    color: "inherit",
  }),
  board: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "14px",
        alignContent: "start",
        padding: "18px",
        "@media": {
          [PHONE]: {
            padding: "14px",
          },
        },
      },
    },
  }),
  leadRow: style({
    flexWrap: "wrap",
  }),
  lead: style({
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    color: palette["--dim"],
  }),
  // `background: transparent` minifies to a 0 0 position; each tinted state's background resets it.
  slot: style({
    "@layer": {
      [under5]: {
        position: "relative",
        display: "flex",
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0%",
        alignItems: "center",
        minWidth: 0,
        minHeight: "36px",
        paddingBlock: "6px",
        paddingInline: "12px",
        borderWidth: "1.5px",
        borderStyle: "dashed",
        borderColor: palette["--hair"],
        borderRadius: "10px",
        backgroundColor: "transparent",
        backgroundPosition: "0 0",
        font: "inherit",
        color: palette["--mute"],
        textAlign: "left",
        overflowWrap: "anywhere",
        textWrap: "pretty",
        transitionProperty: "border-color, background-color, color, opacity, transform",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
      },
    },
  }),
  slotAfterLead: style({
    flexBasis: "7em",
  }),
  slotOpen: style({
    "@layer": {
      [under4]: {
        borderStyle: "dashed",
        borderColor: `color-mix(in srgb, ${ON} 60%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${ON} 6%, transparent)`,
        backgroundPosition: "initial",
        color: palette["--text"],
        cursor: cursors["--cursor-point"],
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
        selectors: {
          "&:focus-visible": {
            borderStyle: "solid",
            borderColor: ON,
            backgroundColor: ON_TINT,
            transform: "scale(1.03)",
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                borderStyle: "solid",
                borderColor: ON,
                backgroundColor: ON_TINT,
                transitionDuration: motion["--t-fast"],
                transitionTimingFunction: motion["--fast"],
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
      },
    },
  }),
  slotNear: style({
    "@layer": {
      [under3]: {
        borderStyle: "solid",
        borderColor: ON,
        backgroundColor: ON_TINT,
        backgroundPosition: "initial",
        transform: "scale(1.03)",
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
        "@media": {
          [REDUCE]: {
            transform: "none",
          },
        },
      },
    },
  }),
  slotMiss: style({
    "@layer": {
      [under2]: {
        borderColor: palette["--no"],
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 10%, transparent)`,
        backgroundPosition: "initial",
        color: palette["--no-ink"],
        animationName: shake,
        animationDuration: SHAKE_TIME,
        animationTimingFunction: motion["--cut"],
        "@media": {
          [REDUCE]: {
            animationName: "none",
            animationDuration: "0s",
            animationTimingFunction: "ease",
          },
        },
      },
    },
  }),
  // A missed slot that takes the piece again: hover and focus still outrank the miss tint.
  slotMissOpen: style({
    "@layer": {
      [under2]: {
        borderColor: palette["--no"],
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 10%, transparent)`,
        backgroundPosition: "initial",
        color: palette["--no-ink"],
        animationName: shake,
        animationDuration: SHAKE_TIME,
        animationTimingFunction: motion["--cut"],
        selectors: {
          "&:focus-visible": {
            borderColor: ON,
            backgroundColor: ON_TINT,
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                borderColor: ON,
                backgroundColor: ON_TINT,
              },
            },
          },
          [REDUCE]: {
            animationName: "none",
            animationDuration: "0s",
            animationTimingFunction: "ease",
          },
        },
      },
    },
  }),
  slotOff: style({
    "@layer": {
      [under1]: {
        borderColor: "transparent",
        opacity: 0.4,
        textDecoration: "line-through",
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
  }),
  slotSeat: style({
    paddingBlock: "4px",
    paddingInline: "4px",
    borderStyle: "solid",
    borderColor: kit["--yes-ink"],
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 10%, transparent)`,
    backgroundPosition: "initial",
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: motion["--fast"],
  }),
  tray: style({
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "14px",
    alignItems: "center",
    minHeight: "60px",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "12px",
  }),
  trayNote: style({
    fontSize: "13px",
    color: palette["--mute"],
  }),
  piece: style({
    "@layer": {
      [under2]: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        height: "38px",
        paddingBlock: 0,
        paddingInline: "14px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "10px",
        backgroundColor: ON,
        boxShadow: "0 4px 0 var(--key-c)",
        fontWeight: 600,
        fontSize: "14px",
        lineHeight: "normal",
        fontFamily: fonts["--mono"],
        color: "var(--on-c)",
        whiteSpace: "nowrap",
        cursor: cursors["--cursor-grab"],
        touchAction: "none",
        userSelect: "none",
        transitionProperty: "box-shadow, translate",
        transitionDuration: motion["--t-moderate-exit"],
        transitionTimingFunction: motion["--exit"],
        "@media": {
          [PHONE]: {
            height: "auto",
            minHeight: "38px",
            maxWidth: "100%",
            whiteSpace: "normal",
          },
        },
      },
    },
  }),
  picked: style({
    "@layer": {
      [under1]: {
        translate: "0 -4px",
        boxShadow: `0 8px 0 var(--key-c), 0 14px 28px ${palette["--lift"]}`,
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
    },
  }),
  dragging: style({
    zIndex: 30,
    boxShadow: `0 10px 0 var(--key-c), 0 20px 36px ${palette["--lift"]}`,
    cursor: cursors["--cursor-grabbing"],
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
  }),
  seated: style({
    height: "30px",
    paddingInline: "12px",
    fontSize: "13px",
    boxShadow: "0 3px 0 var(--key-c)",
    cursor: "inherit",
  }),
  burst: style({
    position: "absolute",
    top: "50%",
    left: "50%",
    pointerEvents: "none",
  }),
  spark: style({
    position: "absolute",
    width: "6px",
    height: "6px",
    margin: "-3px",
    backgroundColor: ON,
    rotate: "var(--a)",
    animationName: burst,
    animationDuration: "600ms",
    animationDelay: "300ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "both",
  }),
  chooseBoard: style({
    alignContent: "center",
  }),
  trio: style({
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    "@media": {
      [PHONE]: {
        gridTemplateColumns: "minmax(0, 1fr)",
      },
    },
  }),
  stack: style({
    display: "grid",
    gap: "10px",
  }),
  choice: style({
    "@layer": {
      [under3]: {
        position: "relative",
        display: "grid",
        gap: "10px",
        alignContent: "start",
        minWidth: 0,
        paddingBlock: "12px",
        paddingInline: "12px",
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: palette["--hair"],
        borderRadius: "14px",
        backgroundColor: palette["--panel"],
        font: "inherit",
        color: palette["--text"],
        textAlign: "left",
        cursor: cursors["--cursor-point"],
        transitionProperty:
          "border-color, background-color, opacity, filter, translate, box-shadow",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
      },
    },
  }),
  spot: style({
    "@layer": {
      [under3]: {
        position: "relative",
        display: "grid",
        minWidth: 0,
        paddingBlock: "3px",
        paddingInline: "3px",
        borderWidth: "1.5px",
        borderStyle: "dashed",
        borderColor: `color-mix(in srgb, ${ON} 55%, transparent)`,
        borderRadius: "12px",
        backgroundColor: `color-mix(in srgb, ${ON} 5%, transparent)`,
        font: "inherit",
        color: "inherit",
        textAlign: "inherit",
        cursor: cursors["--cursor-point"],
        transitionProperty: "border-color, background-color, opacity, filter, scale",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
      },
    },
  }),
  choiceLive: style({
    "@layer": {
      [under2]: {
        borderStyle: "solid",
        borderColor: palette["--hair"],
        backgroundColor: palette["--panel"],
        outline: "none",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
        selectors: {
          "&:focus-visible": {
            borderColor: ON,
            backgroundColor: ON_TINT,
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                borderColor: ON,
                backgroundColor: ON_TINT,
                translate: "0 -2px",
                transitionDuration: motion["--t-fast"],
                transitionTimingFunction: motion["--fast"],
              },
            },
          },
        },
      },
    },
  }),
  spotLive: style({
    "@layer": {
      [under2]: {
        borderStyle: "dashed",
        borderColor: `color-mix(in srgb, ${ON} 55%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${ON} 5%, transparent)`,
        outline: "none",
        selectors: {
          "&:focus-visible": {
            borderStyle: "solid",
            borderColor: ON,
            backgroundColor: ON_TINT,
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                borderStyle: "solid",
                borderColor: ON,
                backgroundColor: ON_TINT,
              },
            },
          },
        },
      },
    },
  }),
  choiceMiss: style({
    "@layer": {
      [under1]: {
        borderStyle: "solid",
        borderColor: palette["--no"],
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 10%, ${palette["--panel"]})`,
        animationName: shake,
        animationDuration: SHAKE_TIME,
        animationTimingFunction: motion["--cut"],
        "@media": {
          [REDUCE]: {
            animationName: "none",
            animationDuration: "0s",
            animationTimingFunction: "ease",
          },
        },
      },
    },
  }),
  choiceOff: style({
    "@layer": {
      [under1]: {
        opacity: 0.4,
        filter: "grayscale(0.7)",
        cursor: "default",
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
    },
  }),
  choiceSeat: style({
    borderStyle: "solid",
    borderColor: kit["--yes-ink"],
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 10%, ${palette["--panel"]})`,
    cursor: "default",
  }),
  choiceBody: style({
    display: "grid",
    minWidth: 0,
    pointerEvents: "none",
  }),
  caption: style({
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "17px",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
    textWrap: "pretty",
  }),
  tick: style({
    position: "absolute",
    top: "-11px",
    right: "-11px",
    zIndex: 2,
    display: "grid",
    placeItems: "center",
    width: "26px",
    height: "26px",
    borderRadius: "999px",
    backgroundColor: kit["--yes-ink"],
    boxShadow: `0 0 0 3px ${palette["--panel-2"]}`,
    fontWeight: 900,
    fontSize: "14px",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    color: palette["--panel"],
    animationName: stamp,
    animationDuration: motion["--t-pop"],
    animationTimingFunction: motion["--snap"],
    "@media": {
      [REDUCE]: {
        animationName: "none",
        animationDuration: "0s",
        animationTimingFunction: "ease",
      },
    },
  }),
};

export const takeKit = {
  section: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
    gap: "40px",
    alignItems: "center",
    paddingTop: "128px",
    paddingBottom: "160px",
    "@media": {
      [PAIRED]: {
        gridTemplateColumns: "minmax(0, 1fr)",
      },
      [PHONE]: {
        paddingTop: "88px",
        paddingBottom: "96px",
      },
    },
  }),
  copy: style({
    display: "grid",
    gap: "16px",
  }),
  title: style({
    fontWeight: 900,
    fontSize: "40px",
    lineHeight: 1.05,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.035em",
    textWrap: "balance",
    "@media": {
      [PHONE]: {
        fontSize: "30px",
      },
    },
  }),
  text: style({
    marginBottom: "8px",
    textWrap: "pretty",
  }),
  acts: style({
    rowGap: "14px",
    columnGap: "14px",
    alignItems: "center",
  }),
};

const LIFTED = "translateY(-4px)";
const PRESSED = "translateY(3px)";
const ACCENT = `var(--c, ${palette["--go"]})`;

export const pager = {
  nav: style({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
  }),
  gap: style({
    display: "none",
  }),
  card: style({
    "@layer": {
      [under1]: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        paddingBlock: "10px",
        paddingInline: "10px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: palette["--hair"],
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        borderBottomLeftRadius: "16px",
        borderBottomRightRadius: "16px",
        backgroundColor: palette["--panel"],
        boxShadow: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
        transitionProperty: "transform, box-shadow, border-color",
        transitionDuration: motion["--t-moderate-exit"],
        transitionDelay: "0s, 0s, 0s",
        transitionBehavior: "normal, normal, normal",
        transitionTimingFunction: motion["--exit"],
        selectors: {
          "&:focus-visible": {
            borderColor: ACCENT,
            boxShadow: `${palette["--raise"]}, 0 8px 0 var(--key)`,
            transform: LIFTED,
            outlineWidth: "3px",
            outlineStyle: "solid",
            outlineColor: palette["--focus"],
            outlineOffset: "3px",
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
          },
          "&:active": {
            borderColor: ACCENT,
            // Repeated under the media query, which would otherwise let hovering outrank pressing.
            boxShadow: `${palette["--raise"]}, 0 1px 0 var(--key)`,
            transform: PRESSED,
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
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
                borderColor: ACCENT,
                boxShadow: `${palette["--raise"]}, 0 8px 0 var(--key)`,
                transform: LIFTED,
                transitionDuration: motion["--t-moderate"],
                transitionTimingFunction: motion["--moderate"],
              },
              "&:active": {
                boxShadow: `${palette["--raise"]}, 0 1px 0 var(--key)`,
              },
              "&&:active": {
                transform: PRESSED,
              },
            },
          },
        },
      },
    },
  }),
  next: style({
    flexDirection: "row-reverse",
    textAlign: "right",
  }),
  all: style({
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: "6px",
    minHeight: "92px",
    textAlign: "right",
  }),
  thumb: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "112px",
    "@media": {
      "(max-width: 720px)": {
        width: "96px",
      },
    },
  }),
  meta: style({
    display: "grid",
    gap: "4px",
    minWidth: 0,
  }),
  dir: style({
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--mute"],
  }),
  number: style({
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
  }),
  title: style({
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: 1.2,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  }),
};

export const cover = {
  box: style({
    position: "relative",
    perspective: "1200px",
    vars: {
      "--rx": "0deg",
      "--ry": "0deg",
    },
    "@media": {
      "(max-width: 720px)": {
        justifySelf: "start",
        width: "min(100%, 280px)",
        marginLeft: "6px",
      },
      [STACKED]: {
        maxWidth: "520px",
      },
    },
  }),
  card: style({
    position: "relative",
    borderRadius: "18px",
    transform: "rotate(-1.5deg) rotateX(var(--rx)) rotateY(var(--ry))",
    transitionProperty: "transform",
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
    // The sheet's mask would clip its own box-shadow, and a box-shadow on a layer behind it ignores
    // the notches, so they read as bumps. A drop-shadow follows the masked sheet's alpha, so the
    // drop and the lift are cut through at the notches too.
    filter: `drop-shadow(0 8px 0 ${palette["--drop-ink"]}) drop-shadow(0 30px 60px ${palette["--lift"]})`,
    "@media": {
      [REDUCE]: {
        transitionProperty: "none",
        transitionDuration: "0s",
        transitionTimingFunction: "ease",
      },
    },
  }),
  sheet: style({
    position: "relative",
    paddingTop: "12px",
    paddingInline: "12px",
    borderRadius: "inherit",
    backgroundColor: palette["--panel"],
    backgroundImage: `radial-gradient(circle at 0 var(--notch), transparent 10px, ${palette["--hair"]} 10.5px, ${palette["--hair"]} 11.5px, transparent 12px), radial-gradient(circle at 100% var(--notch), transparent 10px, ${palette["--hair"]} 10.5px, ${palette["--hair"]} 11.5px, transparent 12px)`,
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    maskImage:
      "radial-gradient(circle at 0 var(--notch), transparent 10px, #000 10.5px), radial-gradient(circle at 100% var(--notch), transparent 10px, #000 10.5px)",
    maskComposite: "intersect",
    vars: {
      "--stub": "62px",
      "--notch": "calc(100% - var(--stub) - 1px)",
    },
    "@media": {
      [PHONE]: {
        paddingTop: "10px",
        paddingInline: "10px",
        vars: {
          "--stub": "52px",
        },
      },
    },
  }),
  thumb: style({
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    selectors: {
      [`&${RULE_OPEN}`]: {
        viewTransitionName: "rule-thumb",
      },
    },
  }),
  tear: style({
    height: "26px",
    marginInline: "2px",
    borderBottomWidth: "2px",
    borderBottomStyle: "dashed",
    borderBottomColor: palette["--hair"],
    "@media": {
      [PHONE]: {
        height: "20px",
      },
    },
  }),
  stub: style({
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "10px",
    height: "var(--stub)",
    paddingInline: "6px",
    fontWeight: 800,
    fontSize: "14px",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    "@media": {
      [PHONE]: {
        gap: "6px",
        paddingInline: "2px",
        fontSize: "12px",
      },
    },
  }),
  was: style({
    color: palette["--mute"],
    textDecorationLine: "line-through",
    textDecorationThickness: "2px",
  }),
  to: style({
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
  }),
  now: style({
    justifySelf: "end",
    paddingBlock: "7px",
    paddingInline: "10px",
    borderRadius: "8px",
    color: "var(--on-c)",
    backgroundColor: "var(--c)",
    "@media": {
      [PHONE]: {
        paddingBlock: "6px",
        paddingInline: "8px",
      },
    },
  }),
};

// The live activity this page lends the header island: a back link, a label that trades the
// page's tags for its title once the heading leaves the viewport (watchTitleSwap), and Share.
export const island = {
  activity: style({
    display: "flex",
    alignItems: "center",
    gap: "2px",
  }),
  action: style({
    "@layer": {
      [under1]: {
        userSelect: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        height: "36px",
        minWidth: "36px",
        padding: "0 10px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "999px",
        backgroundColor: "transparent",
        // `background: none` minifies to a 0 0 position at rest, and the hover's background shorthand
        // resets it to 0% 0%. StyleX would minify a literal 0% 0% back to 0 0, so hover sets initial.
        backgroundPosition: "0 0",
        color: palette["--dim"],
        font: "inherit",
        whiteSpace: "nowrap",
        cursor: cursors["--cursor-point"],
        transitionProperty: "background-color, color",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
        selectors: {
          "&:focus-visible": {
            outline: `2px solid ${palette["--focus"]}`,
            outlineOffset: "-2px",
          },
          "&:active": {
            backgroundColor: palette["--panel-2"],
            backgroundPosition: "initial",
            color: palette["--text"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                backgroundColor: palette["--panel-2"],
                backgroundPosition: "initial",
                color: palette["--text"],
                transitionDuration: motion["--t-fast"],
                transitionTimingFunction: motion["--fast"],
              },
            },
          },
        },
      },
    },
  }),
  // Phones: the back link keeps its name for screen readers and shows only the arrow.
  back: style({
    padding: "0 10px",
    "@media": {
      [PHONE]: {
        padding: 0,
      },
    },
  }),
  backText: style({
    "@media": {
      [PHONE]: {
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
      },
    },
  }),
  // A long rule title would push the island past the screen on narrow phones: the label takes what
  // is left after the back link, Share, the tools, the menu and the island's padding, and ends in an
  // ellipsis.
  label: style({
    display: "grid",
    padding: "0 8px",
    whiteSpace: "nowrap",
    "@media": {
      [NARROW]: {
        maxWidth: "calc(100vw - 206px)",
        padding: "0 4px",
      },
    },
  }),
  labelPart: style({
    gridArea: "1 / 1",
    alignSelf: "center",
    transitionProperty: "opacity, filter, translate",
    "@media": {
      [NARROW]: {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
  }),
  tags: style({
    display: "flex",
    gap: "8px",
    color: palette["--mute"],
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: "ease-out",
    selectors: {
      [`&${when.ancestor("[data-swap]")}`]: {
        opacity: 0,
        filter: "blur(2px)",
        translate: "0 -6px",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: "ease-in",
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          [`&${when.ancestor("[data-swap]")}`]: {
            filter: "none",
            translate: "none",
          },
        },
      },
    },
  }),
  title: style({
    fontWeight: 900,
    fontSize: "0.875rem",
    opacity: 0,
    filter: "blur(2px)",
    translate: "0 6px",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: "ease-in",
    selectors: {
      [`&${when.ancestor("[data-swap]")}`]: {
        opacity: 1,
        filter: "none",
        translate: "0 0",
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: "ease-out",
      },
    },
    "@media": {
      [REDUCE]: {
        filter: "none",
        translate: "none",
        selectors: {
          [`&${when.ancestor("[data-swap]")}`]: {
            translate: "none",
          },
        },
      },
    },
  }),
};

// The custom elements of rule-landing.astro: the page root stands in for the block it was, and the
// lesson and quiz hosts keep their native articles as the boxes.
export const host = {
  block: style({
    display: "block",
  }),
  contents: style({
    display: "contents",
  }),
};
