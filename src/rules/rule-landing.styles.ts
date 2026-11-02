import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";
import { kit, reveal } from "./rule-landing.stylex";

export const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const SNAP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export const TABBED = "(max-width: 820px)";

const enter = stylex.keyframes({ from: { opacity: 0.01, translate: "0 12px" } });

const said = stylex.keyframes({ from: { opacity: 0, translate: "0 6px" } });
const stamp = stylex.keyframes({ from: { opacity: 0, scale: 0.6, rotate: "-12deg" } });
const shake = stylex.keyframes({
  "20%": { translate: "-6px 0" },
  "40%": { translate: "6px 0" },
  "60%": { translate: "-4px 0" },
  "80%": { translate: "4px 0" },
});
const burst = stylex.keyframes({
  from: { transform: "translate(18px) scale(1)", opacity: 1 },
  to: { transform: "translate(64px) scale(0)", opacity: 0 },
});

// The miss shake is a four-beat wobble, not a state change, so it keeps its own length.
const SHAKE_TIME = "320ms";

const STACKED = "@media (max-width: 960px)";
const PHONE = "@media (max-width: 640px)";
const TINY = "@media (max-width: 400px)";
// Only the rule page itself: when a pager card opens the next rule, the old page holds the card.
// Diving in names the opened page; zooming back out to the index names the page being left.
// Set by the head script (head-script.ts) on a page a rule tile's dive opened.
const DIVED = ":is(html[data-vt='rule-open'] *)";
const RULE_OPEN =
  ":is(html:active-view-transition-type(rule-open, rule-close):not(:has([data-opening])) *)";
const NARROW = "@media (max-width: 480px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";

export const shell = stylex.create({
  root: {
    "--c-ink": `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
    "--key-c": "color-mix(in oklab, var(--c) 60%, #000)",
    position: "relative",
    isolation: "isolate",
    overflowWrap: "break-word",
  },
  crumbRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: { default: "16px", [TINY]: "6px" },
    gridColumn: "1 / -1",
    justifySelf: "stretch",
    // Stacked, the rows' gap opens for the cover; the crumbs keep closer to the title.
    marginBottom: { default: 0, [STACKED]: "-16px" },
  },
  crumb: {
    gap: { default: "10px", [TINY]: "6px" },
    marginBottom: 0,
    fontSize: "0.875rem",
    color: palette["--dim"],
    whiteSpace: "nowrap",
    "::before": { display: "none" },
  },
  crumbLink: {
    userSelect: "none",
    marginBlock: "-12px",
    paddingBlock: "12px",
    color: {
      default: null,
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    transitionProperty: "color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
      ":active": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
      ":active": motion["--fast"],
    },
  },
  crumbTag: {
    fontWeight: 700,
    color: "var(--c-ink)",
  },
  // On a phone the label hides, so the key turns into a square around its icon.
  share: {
    width: { default: null, [PHONE]: "38px" },
    paddingInlineStart: { default: null, [PHONE]: 0 },
    paddingInlineEnd: { default: null, [PHONE]: 0 },
  },
  shareLabel: {
    position: { default: null, [PHONE]: "absolute" },
    width: { default: null, [PHONE]: "1px" },
    height: { default: null, [PHONE]: "1px" },
    overflow: { default: null, [PHONE]: "hidden" },
    clipPath: { default: null, [PHONE]: "inset(50%)" },
    whiteSpace: { default: null, [PHONE]: "nowrap" },
  },
  titleScreen: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1.15fr) minmax(0, 1fr)",
      [STACKED]: "minmax(0, 1fr)",
    },
    gridTemplateRows: { default: "auto 1fr", [STACKED]: "auto" },
    columnGap: "56px",
    rowGap: { default: "24px", [STACKED]: "40px" },
    alignItems: "center",
    minHeight: { default: "calc(100svh - 72px)", [STACKED]: 0 },
    paddingTop: { default: "48px", [STACKED]: "40px" },
    paddingBottom: "72px",
  },
  heroCopy: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    justifyItems: "start",
  },
  // watchTitleFit caps the size with --fit.
  title: {
    width: "fit-content",
    maxWidth: "100%",
    marginBottom: "8px",
    fontWeight: 900,
    fontSize: "min(clamp(44px, 7vw, 108px), var(--fit, 108px))",
    lineHeight: 0.94,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.05em",
    viewTransitionName: { default: null, [RULE_OPEN]: "rule-title" },
  },
  titleLine: {
    display: "block",
    position: { default: null, ":first-child": "relative" },
    zIndex: { default: null, ":first-child": 1 },
  },
  titleMark: {
    paddingInline: "0.06em",
    borderRadius: "0.06em",
  },
  claim: {
    maxWidth: "20em",
    fontWeight: 700,
    fontSize: "clamp(21px, 2vw, 28px)",
    lineHeight: 1.25,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.025em",
    color: palette["--text"],
    textWrap: "pretty",
  },
  lead: {
    maxWidth: "34em",
    fontSize: "18px",
    lineHeight: 1.6,
    textWrap: "pretty",
  },
  // The load-in starts at 0.01, not 0: Chrome skips a text paint at opacity 0 for LCP, and a fade runs
  // on the compositor without painting again, so a fully transparent start leaves the lead out of LCP
  // until some unrelated repaint seconds later.
  in: {
    animationName: { default: enter, [REDUCE]: "none" },
    animationDuration: "560ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "both",
    animationDelay: "calc(var(--i, 0) * 60ms + 200ms)",
  },
  // A dive lands with the tile's art already where the cover sits, so the cover holds still.
  coverIn: {
    animationName: { default: enter, [REDUCE]: "none", [DIVED]: "none" },
  },
  first: { "--i": "0" },
  second: { "--i": "1" },
  third: { "--i": "2" },
  // watchReveal marks what starts on screen with data-in, then sets data-rev-on; the rest rises in.
  rev: {
    opacity: {
      default: null,
      [stylex.when.ancestor("[data-rev-on]", reveal)]: { default: null, ":not([data-in])": 0 },
    },
    translate: {
      default: null,
      [stylex.when.ancestor("[data-rev-on]", reveal)]: {
        default: null,
        ":not([data-in])": { default: "0 16px", [REDUCE]: "none" },
      },
    },
    transition: {
      default: null,
      [stylex.when.ancestor("[data-rev-on]", reveal)]:
        `opacity ${motion["--t-panel"]} ${motion["--out"]}, translate ${motion["--t-panel"]} ${motion["--out"]}`,
    },
  },
});

// The arriving glyph takes the whole fast tier and the leaving one its exit, so an appear always
// outlasts a disappear. Both are tweens: a spring would settle early and invert that order.
export const glyphSwap = stylex.create({
  cell: {
    display: "inline-grid",
    flexShrink: 0,
  },
  glyph: {
    gridArea: "1 / 1",
    transitionProperty: "opacity, scale, filter",
  },
  shown: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: "ease-out",
  },
  hidden: {
    opacity: 0,
    scale: 0.6,
    filter: "blur(4px)",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: "ease-in",
  },
});

const TAB = `@media ${TABBED}`;
const PAIRED = "@media (max-width: 860px)";
const BAD_PANE = ':is([data-side="bad"])';

export const text = stylex.create({
  wrap: {
    display: "inline-block",
    maxWidth: "100%",
    overflowWrap: "anywhere",
  },
  chip: {
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
  tint: {
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "6px",
    backgroundColor: palette["--soft-key"],
    fontSize: "0.86em",
    color: palette["--text"],
  },
  bright: {
    color: palette["--text"],
  },
  lesson: {
    maxWidth: "62ch",
    fontSize: "16px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  },
  tip: {
    paddingBlock: "10px",
    paddingInline: "14px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
    fontSize: "14px",
  },
});

const HINT_BLUE = `color-mix(in oklab, ${palette["--cw"]} ${palette["--ink-mix"]}, #000)`;

export const hintKit = stylex.create({
  layer: {
    position: "absolute",
    inset: 0,
    zIndex: 3,
    pointerEvents: "none",
  },
  svg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "visible",
    transition: `opacity 220ms ease`,
  },
  arrow: {
    fill: "none",
    stroke: HINT_BLUE,
    strokeWidth: 2.25,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeDasharray: 1,
    strokeDashoffset: { default: 1, [REDUCE]: 0 },
    transition: { default: `stroke-dashoffset 700ms ${OUT} 250ms`, [REDUCE]: "none" },
  },
  drawn: {
    strokeDashoffset: 0,
  },
  label: {
    position: "absolute",
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    whiteSpace: "nowrap",
    color: HINT_BLUE,
    textShadow: `0 0 3px ${kit["--code-bg"]}, 0 0 3px ${kit["--code-bg"]}`,
    transition: { default: `opacity 260ms ease 120ms`, [REDUCE]: "none" },
  },
  ruler: {
    visibility: "hidden",
  },
  up: {
    transform: "translate(-50%, -50%) rotate(-4deg)",
  },
  down: {
    transform: "translate(-50%, -50%) rotate(4deg)",
  },
  level: {
    transform: "translate(-50%, -50%)",
  },
  onPanel: {
    textShadow: `0 0 3px ${palette["--panel"]}, 0 0 3px ${palette["--panel"]}`,
  },
  gone: {
    opacity: 0,
  },
});

export const lessonKit = stylex.create({
  section: {
    paddingTop: "64px",
    paddingBottom: 0,
    scrollMarginTop: "8px",
  },
  secHead: {
    display: "grid",
    gap: "14px",
    marginBottom: "48px",
  },
  headItem: {
    justifySelf: "start",
  },
  secTitle: {
    fontWeight: 900,
    fontSize: "clamp(32px, 4vw, 52px)",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.04em",
  },
  secText: {
    maxWidth: "60ch",
    fontSize: "17px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  },
  lessons: {
    display: "grid",
    gap: "24px",
  },
  lesson: {
    position: "relative",
    display: "grid",
    gap: "28px",
    paddingTop: { default: "32px", [PHONE]: "20px" },
    paddingRight: { default: "32px", [PHONE]: "20px" },
    paddingBottom: { default: "32px", [PHONE]: "20px" },
    paddingLeft: { default: "36px", [PHONE]: "20px" },
    borderRadius: "20px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 6px 0 ${palette["--drop-ink"]}`,
  },
  copy: {
    display: "grid",
    gap: "12px",
    justifyItems: "start",
  },
  exception: {
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
  },
  title: {
    color: palette["--text"],
    fontWeight: 900,
    fontSize: { default: "28px", [PHONE]: "24px" },
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
  },
  demo: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr) minmax(0, 1fr)", [TAB]: "minmax(0, 1fr)" },
    gap: { default: "16px", [TAB]: "12px" },
  },
  well: {
    borderRadius: "14px",
    backgroundColor: kit["--code-bg"],
    boxShadow: palette["--sink"],
  },
  pane: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: { default: "auto 1fr auto", [TAB]: "1fr auto" },
    gridArea: { default: null, [TAB]: "2 / 1" },
    gap: "16px",
    paddingTop: { default: "16px", [PHONE]: "14px" },
    paddingRight: { default: "18px", [PHONE]: "12px" },
    paddingBottom: { default: "18px", [PHONE]: "14px" },
    paddingLeft: { default: "18px", [PHONE]: "12px" },
  },
  behind: {
    visibility: { default: null, [TAB]: "hidden" },
  },
  caption: {
    display: { default: "inline-flex", [TAB]: "none" },
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
  },
  mark: {
    fontSize: "11px",
  },
  bad: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    backgroundPosition: "initial",
    color: palette["--no-ink"],
  },
  good: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    backgroundPosition: "initial",
    color: kit["--yes-ink"],
  },
  flip: {
    display: { default: "none", [TAB]: "inline-flex" },
    justifySelf: "start",
    maxWidth: "100%",
    gap: "4px",
    padding: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
  },
  // `background: transparent` minifies to a 0 0 position; the pressed key's background resets it.
  flipKey: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    minWidth: { default: null, [PHONE]: 0 },
    minHeight: "34px",
    paddingBlock: { default: 0, [PHONE]: "6px" },
    paddingInline: { default: "12px", [PHONE]: "10px" },
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
    whiteSpace: { default: "nowrap", [PHONE]: "normal" },
    textWrap: { default: null, [PHONE]: "balance" },
    cursor: cursors["--cursor-point"],
    transitionProperty: "background-color, color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([aria-pressed='true'])": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([aria-pressed='true'])": motion["--fast"],
    },
  },
  costs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  cost: {
    paddingBlock: "3px",
    paddingInline: "8px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
  },
  costIn: {
    animationName: { default: null, [TAB]: { default: said, [REDUCE]: "none" } },
    animationDuration: { default: null, [TAB]: "200ms" },
    animationTimingFunction: { default: null, [TAB]: motion["--out"] },
  },
  badCost: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  },
  goodCost: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  sheetWrap: {
    display: "grid",
    gap: "20px",
    marginTop: "72px",
  },
  sheetTitle: {
    color: palette["--text"],
    fontWeight: 900,
    fontSize: { default: "28px", [PHONE]: "24px" },
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
  },
  panel: {
    borderRadius: "20px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 6px 0 ${palette["--drop-ink"]}`,
  },
  sheet: {
    display: "grid",
    padding: "8px",
  },
  sheetRow: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) minmax(0, 1.2fr)",
      [PAIRED]: "minmax(0, 1fr)",
    },
    gap: { default: "24px", [PAIRED]: "4px" },
    alignItems: "baseline",
    paddingBlock: "16px",
    paddingInline: "18px",
    borderTopWidth: { default: null, ":not(:first-child)": "1px" },
    borderTopStyle: { default: null, ":not(:first-child)": "solid" },
    borderTopColor: { default: null, ":not(:first-child)": palette["--hair"] },
    textWrap: "pretty",
  },
  situation: {
    color: palette["--dim"],
  },
  answer: {
    fontWeight: 700,
    fontSize: "17px",
    lineHeight: 1.35,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.015em",
    color: palette["--text"],
  },
});

export const tree = stylex.create({
  list: {
    display: "grid",
    gap: "4px",
    fontSize: "13px",
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
  },
  inPane: {
    alignContent: "start",
    minHeight: { default: null, [TAB]: "calc(var(--rows) * 32px)" },
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "28px",
    paddingLeft: { default: "calc(var(--d) * 20px)", [PHONE]: "calc(var(--d) * 14px)" },
    color: palette["--text"],
    textWrap: "pretty",
  },
  dir: { color: palette["--dim"] },
  comp: { color: "var(--c-ink)" },
  more: { color: palette["--mute"] },
  moved: {
    paddingBlock: "3px",
    paddingInline: "10px",
    borderRadius: "8px",
    backgroundColor: {
      default: "var(--c)",
      [stylex.when.ancestor(BAD_PANE)]:
        `color-mix(in srgb, ${palette["--no"]} 22%, ${palette["--panel-2"]})`,
    },
    boxShadow: {
      default: "0 3px 0 var(--key-c)",
      [stylex.when.ancestor(BAD_PANE)]:
        `0 3px 0 color-mix(in srgb, ${palette["--no"]} 40%, ${palette["--drop-ink"]})`,
    },
    fontWeight: 600,
    color: {
      default: "var(--on-c)",
      [stylex.when.ancestor(BAD_PANE)]: palette["--no-ink"],
    },
  },
  calls: {
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
  },
});

const ON = "var(--c)";
const ON_TINT = "color-mix(in srgb, var(--c) 16%, transparent)";

export const quizKit = stylex.create({
  stars: {
    display: "inline-flex",
    gap: "1px",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  star: {
    fontStyle: "normal",
    color: palette["--hair"],
  },
  starOn: {
    color: "var(--c-ink)",
  },
  level: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 0.92fr) minmax(0, 1.08fr)",
      [PAIRED]: "minmax(0, 1fr)",
    },
    gap: { default: "32px", [PAIRED]: "24px" },
    paddingTop: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    paddingRight: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    paddingBottom: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    paddingLeft: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    scrollMarginTop: "24px",
  },
  copy: {
    display: "grid",
    gap: "14px",
    alignContent: "start",
  },
  levelHead: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    minHeight: "28px",
  },
  badge: {
    paddingBlock: "5px",
    paddingInline: "9px",
    borderRadius: "8px",
    backgroundColor: ON,
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--on-c)",
  },
  stamp: {
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
    animationName: { default: stamp, [REDUCE]: "none" },
    animationDuration: { default: motion["--t-pop"], [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--snap"], [REDUCE]: "ease" },
  },
  title: {
    color: palette["--text"],
    fontWeight: 900,
    fontSize: { default: "26px", [PHONE]: "22px" },
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
  },
  prompt: {
    maxWidth: "42ch",
    fontSize: "17px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  },
  say: {
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
  sayNo: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  },
  sayYes: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  said: {
    fontSize: "15px",
    lineHeight: 1.5,
    color: palette["--dim"],
    textWrap: "pretty",
    animationName: { default: said, [REDUCE]: "none" },
    animationDuration: { default: motion["--t-moderate"], [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--moderate"], [REDUCE]: "ease" },
  },
  saidToned: {
    color: "inherit",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "14px",
    alignContent: "start",
    padding: { default: "18px", [PHONE]: "14px" },
  },
  leadRow: {
    flexWrap: "wrap",
  },
  lead: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    color: palette["--dim"],
  },
  // `background: transparent` minifies to a 0 0 position; each tinted state's background resets it.
  slot: {
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
  slotAfterLead: {
    flexBasis: "7em",
  },
  slotOpen: {
    borderStyle: {
      default: "dashed",
      ":focus-visible": "solid",
      ":hover": { default: null, [HOVER]: "solid" },
    },
    borderColor: {
      default: `color-mix(in srgb, ${ON} 60%, transparent)`,
      ":focus-visible": ON,
      ":hover": { default: null, [HOVER]: ON },
    },
    backgroundColor: {
      default: `color-mix(in srgb, ${ON} 6%, transparent)`,
      ":focus-visible": ON_TINT,
      ":hover": { default: null, [HOVER]: ON_TINT },
    },
    backgroundPosition: "initial",
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    transform: {
      default: null,
      ":focus-visible": { default: "scale(1.03)", [REDUCE]: "none" },
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":focus-visible": motion["--t-fast"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":focus-visible": motion["--fast"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
    },
  },
  slotNear: {
    borderStyle: "solid",
    borderColor: ON,
    backgroundColor: ON_TINT,
    backgroundPosition: "initial",
    transform: { default: "scale(1.03)", [REDUCE]: "none" },
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: motion["--fast"],
  },
  slotMiss: {
    borderColor: palette["--no"],
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 10%, transparent)`,
    backgroundPosition: "initial",
    color: palette["--no-ink"],
    animationName: { default: shake, [REDUCE]: "none" },
    animationDuration: { default: SHAKE_TIME, [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--cut"], [REDUCE]: "ease" },
  },
  // A missed slot that takes the piece again: hover and focus still outrank the miss tint.
  slotMissOpen: {
    borderColor: {
      default: palette["--no"],
      ":focus-visible": ON,
      ":hover": { default: null, [HOVER]: ON },
    },
    backgroundColor: {
      default: `color-mix(in srgb, ${palette["--no"]} 10%, transparent)`,
      ":focus-visible": ON_TINT,
      ":hover": { default: null, [HOVER]: ON_TINT },
    },
    backgroundPosition: "initial",
    color: palette["--no-ink"],
    animationName: { default: shake, [REDUCE]: "none" },
    animationDuration: { default: SHAKE_TIME, [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--cut"], [REDUCE]: "ease" },
  },
  slotOff: {
    borderColor: "transparent",
    opacity: 0.4,
    textDecoration: "line-through",
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: motion["--fast"],
  },
  slotSeat: {
    paddingBlock: "4px",
    paddingInline: "4px",
    borderStyle: "solid",
    borderColor: kit["--yes-ink"],
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 10%, transparent)`,
    backgroundPosition: "initial",
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: motion["--fast"],
  },
  tray: {
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
  },
  trayNote: {
    fontSize: "13px",
    color: palette["--mute"],
  },
  piece: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    height: { default: "38px", [PHONE]: "auto" },
    minHeight: { default: null, [PHONE]: "38px" },
    maxWidth: { default: null, [PHONE]: "100%" },
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
    whiteSpace: { default: "nowrap", [PHONE]: "normal" },
    cursor: cursors["--cursor-grab"],
    touchAction: "none",
    userSelect: "none",
    transitionProperty: "box-shadow, translate",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
  },
  picked: {
    translate: "0 -4px",
    boxShadow: `0 8px 0 var(--key-c), 0 14px 28px ${palette["--lift"]}`,
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
  },
  dragging: {
    zIndex: 30,
    boxShadow: `0 10px 0 var(--key-c), 0 20px 36px ${palette["--lift"]}`,
    cursor: cursors["--cursor-grabbing"],
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
  },
  seated: {
    height: "30px",
    paddingInline: "12px",
    fontSize: "13px",
    boxShadow: "0 3px 0 var(--key-c)",
    cursor: "inherit",
  },
  burst: {
    position: "absolute",
    top: "50%",
    left: "50%",
    pointerEvents: "none",
  },
  spark: {
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
  },
  chooseBoard: {
    alignContent: "center",
  },
  // Choose boards: versions side by side, or one above the next when each is wide.
  trio: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [PHONE]: "minmax(0, 1fr)" },
    gap: "10px",
  },
  stack: {
    display: "grid",
    gap: "10px",
  },
  // A choose level's candidate: a version set beside the others, or a spot on a mock screen.
  choice: {
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
    transitionProperty: "border-color, background-color, opacity, filter, translate, box-shadow",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
  },
  spot: {
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
  // Hover and focus ring the candidate in the rule's colour, while it can still be picked.
  choiceLive: {
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":focus-visible": ON,
      ":hover": { default: null, [HOVER]: ON },
    },
    backgroundColor: {
      default: palette["--panel"],
      ":focus-visible": ON_TINT,
      ":hover": { default: null, [HOVER]: ON_TINT },
    },
    translate: {
      default: null,
      ":hover": { default: null, [HOVER]: { default: "0 -2px", [REDUCE]: null } },
    },
    outline: "none",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":focus-visible": motion["--t-fast"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":focus-visible": motion["--fast"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
    },
  },
  spotLive: {
    borderStyle: {
      default: "dashed",
      ":focus-visible": "solid",
      ":hover": { default: null, [HOVER]: "solid" },
    },
    borderColor: {
      default: `color-mix(in srgb, ${ON} 55%, transparent)`,
      ":focus-visible": ON,
      ":hover": { default: null, [HOVER]: ON },
    },
    backgroundColor: {
      default: `color-mix(in srgb, ${ON} 5%, transparent)`,
      ":focus-visible": ON_TINT,
      ":hover": { default: null, [HOVER]: ON_TINT },
    },
    outline: "none",
  },
  choiceMiss: {
    borderStyle: "solid",
    borderColor: palette["--no"],
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 10%, ${palette["--panel"]})`,
    animationName: { default: shake, [REDUCE]: "none" },
    animationDuration: { default: SHAKE_TIME, [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--cut"], [REDUCE]: "ease" },
  },
  choiceOff: {
    opacity: 0.4,
    filter: "grayscale(0.7)",
    cursor: "default",
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
  },
  choiceSeat: {
    borderStyle: "solid",
    borderColor: kit["--yes-ink"],
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 10%, ${palette["--panel"]})`,
    cursor: "default",
  },
  choiceBody: {
    display: "grid",
    minWidth: 0,
    pointerEvents: "none",
  },
  caption: {
    fontWeight: 700,
    fontSize: "13px",
    // Whole pixels, so a board's height never leaves the quizzes below it on a sub-pixel.
    lineHeight: "17px",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
    textWrap: "pretty",
  },
  // The check a chosen candidate wears once the level clears.
  tick: {
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
    animationName: { default: stamp, [REDUCE]: "none" },
    animationDuration: { default: motion["--t-pop"], [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--snap"], [REDUCE]: "ease" },
  },
});

export const takeKit = stylex.create({
  section: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) minmax(0, 1.1fr)",
      [PAIRED]: "minmax(0, 1fr)",
    },
    gap: "40px",
    alignItems: "center",
    paddingTop: { default: "128px", [PHONE]: "88px" },
    paddingBottom: { default: "160px", [PHONE]: "96px" },
  },
  copy: {
    display: "grid",
    gap: "16px",
  },
  title: {
    fontWeight: 900,
    fontSize: { default: "40px", [PHONE]: "30px" },
    lineHeight: 1.05,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.035em",
    textWrap: "balance",
  },
  text: {
    marginBottom: "8px",
    textWrap: "pretty",
  },
  acts: {
    rowGap: "14px",
    columnGap: "14px",
    alignItems: "center",
  },
});

const LIFTED = "translateY(-4px)";
const PRESSED = "translateY(3px)";
const ACCENT = `var(--c, ${palette["--go"]})`;

export const pager = stylex.create({
  nav: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
  },
  gap: {
    display: "none",
  },
  card: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBlock: "10px",
    paddingInline: "10px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: ACCENT },
      ":focus-visible": ACCENT,
      ":active": ACCENT,
    },
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
    backgroundColor: palette["--panel"],
    boxShadow: {
      default: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
      ":hover": { default: null, [HOVER]: `${palette["--raise"]}, 0 8px 0 var(--key)` },
      ":focus-visible": `${palette["--raise"]}, 0 8px 0 var(--key)`,
      // Repeated under the media query, which would otherwise let hovering outrank pressing.
      ":active": {
        default: `${palette["--raise"]}, 0 1px 0 var(--key)`,
        [HOVER]: `${palette["--raise"]}, 0 1px 0 var(--key)`,
      },
    },
    transform: {
      default: null,
      ":hover": { default: null, [HOVER]: { default: LIFTED, [REDUCE]: "none" } },
      ":focus-visible": { default: LIFTED, [REDUCE]: "none" },
      ":active": {
        default: PRESSED,
        [REDUCE]: "none",
        [HOVER]: { default: PRESSED, [REDUCE]: "none" },
      },
    },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transitionProperty: "transform, box-shadow, border-color",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":focus-visible": motion["--t-moderate"],
      ":active": motion["--t-moderate"],
    },
    transitionDelay: "0s, 0s, 0s",
    transitionBehavior: "normal, normal, normal",
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":focus-visible": motion["--moderate"],
      ":active": motion["--moderate"],
    },
  },
  next: {
    flexDirection: "row-reverse",
    textAlign: "right",
  },
  all: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: "6px",
    minHeight: "92px",
    textAlign: "right",
  },
  thumb: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: { default: "112px", "@media (max-width: 720px)": "96px" },
  },
  meta: {
    display: "grid",
    gap: "4px",
    minWidth: 0,
  },
  dir: {
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--mute"],
  },
  number: {
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
  },
  title: {
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: 1.2,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
});

export const cover = stylex.create({
  box: {
    "--rx": "0deg",
    "--ry": "0deg",
    position: "relative",
    justifySelf: { default: null, "@media (max-width: 720px)": "start" },
    width: { default: null, "@media (max-width: 720px)": "min(100%, 280px)" },
    maxWidth: { default: null, [STACKED]: "520px" },
    marginLeft: { default: null, "@media (max-width: 720px)": "6px" },
    perspective: "1200px",
  },
  card: {
    position: "relative",
    borderRadius: "18px",
    transform: "rotate(-1.5deg) rotateX(var(--rx)) rotateY(var(--ry))",
    transitionProperty: { default: "transform", [REDUCE]: "none" },
    transitionDuration: { default: motion["--t-panel"], [REDUCE]: "0s" },
    transitionTimingFunction: { default: motion["--out"], [REDUCE]: "ease" },
    // The sheet's mask would clip its own box-shadow, and a box-shadow on a layer behind it ignores
    // the notches, so they read as bumps. A drop-shadow follows the masked sheet's alpha, so the
    // drop and the lift are cut through at the notches too.
    filter: `drop-shadow(0 8px 0 ${palette["--drop-ink"]}) drop-shadow(0 30px 60px ${palette["--lift"]})`,
  },
  sheet: {
    "--stub": { default: "62px", [PHONE]: "52px" },
    "--notch": "calc(100% - var(--stub) - 1px)",
    position: "relative",
    paddingTop: { default: "12px", [PHONE]: "10px" },
    paddingInline: { default: "12px", [PHONE]: "10px" },
    borderRadius: "inherit",
    backgroundColor: palette["--panel"],
    backgroundImage: `radial-gradient(circle at 0 var(--notch), transparent 10px, ${palette["--hair"]} 10.5px, ${palette["--hair"]} 11.5px, transparent 12px), radial-gradient(circle at 100% var(--notch), transparent 10px, ${palette["--hair"]} 10.5px, ${palette["--hair"]} 11.5px, transparent 12px)`,
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    maskImage:
      "radial-gradient(circle at 0 var(--notch), transparent 10px, #000 10.5px), radial-gradient(circle at 100% var(--notch), transparent 10px, #000 10.5px)",
    maskComposite: "intersect",
  },
  thumb: {
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    viewTransitionName: { default: null, [RULE_OPEN]: "rule-thumb" },
  },
  tear: {
    height: { default: "26px", [PHONE]: "20px" },
    marginInline: "2px",
    borderBottomWidth: "2px",
    borderBottomStyle: "dashed",
    borderBottomColor: palette["--hair"],
  },
  stub: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: { default: "10px", [PHONE]: "6px" },
    height: "var(--stub)",
    paddingInline: { default: "6px", [PHONE]: "2px" },
    fontWeight: 800,
    fontSize: { default: "14px", [PHONE]: "12px" },
    lineHeight: 1,
    fontFamily: fonts["--display"],
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  was: {
    color: palette["--mute"],
    textDecorationLine: "line-through",
    textDecorationThickness: "2px",
  },
  to: {
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
  },
  now: {
    justifySelf: "end",
    paddingBlock: { default: "7px", [PHONE]: "6px" },
    paddingInline: { default: "10px", [PHONE]: "8px" },
    borderRadius: "8px",
    color: "var(--on-c)",
    backgroundColor: "var(--c)",
  },
});

// The live activity this page lends the header island: a back link, a label that trades the
// page's tags for its title once the heading leaves the viewport (watchTitleSwap), and Share.
export const island = stylex.create({
  activity: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },
  action: {
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
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: palette["--panel-2"] },
      ":active": palette["--panel-2"],
    },
    // `background: none` minifies to a 0 0 position at rest, and the hover's background shorthand
    // resets it to 0% 0%. StyleX would minify a literal 0% 0% back to 0 0, so hover sets initial.
    backgroundPosition: {
      default: "0 0",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    font: "inherit",
    whiteSpace: "nowrap",
    cursor: cursors["--cursor-point"],
    outline: { default: null, ":focus-visible": `2px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "-2px" },
    transitionProperty: "background-color, color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
      ":active": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
      ":active": motion["--fast"],
    },
  },
  // Phones: the back link keeps its name for screen readers and shows only the arrow.
  back: {
    padding: { default: "0 10px", [PHONE]: 0 },
  },
  backText: {
    position: { default: null, [PHONE]: "absolute" },
    width: { default: null, [PHONE]: "1px" },
    height: { default: null, [PHONE]: "1px" },
    overflow: { default: null, [PHONE]: "hidden" },
    clipPath: { default: null, [PHONE]: "inset(50%)" },
    whiteSpace: { default: null, [PHONE]: "nowrap" },
  },
  // A long rule title would push the island past the screen on narrow phones: the label takes what
  // is left after the back link, Share, the tools, the menu and the island's padding, and ends in an
  // ellipsis.
  label: {
    display: "grid",
    maxWidth: { default: null, [NARROW]: "calc(100vw - 206px)" },
    padding: { default: "0 8px", [NARROW]: "0 4px" },
    whiteSpace: "nowrap",
  },
  labelPart: {
    gridArea: "1 / 1",
    alignSelf: "center",
    minWidth: { default: null, [NARROW]: 0 },
    overflow: { default: null, [NARROW]: "hidden" },
    textOverflow: { default: null, [NARROW]: "ellipsis" },
    transitionProperty: "opacity, filter, translate",
  },
  tags: {
    display: "flex",
    gap: "8px",
    color: palette["--mute"],
    opacity: { default: null, [stylex.when.ancestor("[data-swap]")]: 0 },
    filter: {
      default: null,
      [stylex.when.ancestor("[data-swap]")]: { default: "blur(2px)", [REDUCE]: "none" },
    },
    translate: {
      default: null,
      [stylex.when.ancestor("[data-swap]")]: { default: "0 -6px", [REDUCE]: "none" },
    },
    transitionDuration: {
      default: motion["--t-fast"],
      [stylex.when.ancestor("[data-swap]")]: motion["--t-fast-exit"],
    },
    transitionTimingFunction: {
      default: "ease-out",
      [stylex.when.ancestor("[data-swap]")]: "ease-in",
    },
  },
  title: {
    fontWeight: 900,
    fontSize: "0.875rem",
    opacity: { default: 0, [stylex.when.ancestor("[data-swap]")]: 1 },
    filter: {
      default: "blur(2px)",
      [stylex.when.ancestor("[data-swap]")]: "none",
      [REDUCE]: "none",
    },
    translate: {
      default: "0 6px",
      [stylex.when.ancestor("[data-swap]")]: { default: "0 0", [REDUCE]: "none" },
      [REDUCE]: "none",
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [stylex.when.ancestor("[data-swap]")]: motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: "ease-in",
      [stylex.when.ancestor("[data-swap]")]: "ease-out",
    },
  },
});

// The custom elements of rule-landing.astro: the page root stands in for the block it was, and the
// lesson and quiz hosts keep their native articles as the boxes.
export const host = stylex.create({
  block: {
    display: "block",
  },
  contents: {
    display: "contents",
  },
});

export type SideKey = "bad" | "good";
export type Tone = "plain" | "wrap" | "chip" | "prompt" | "take";

/** How inline code reads where the kit puts it: a chip in lesson copy, a tint in a quiz prompt. */
export const codeTone = (tone: Tone) => [
  tone !== "plain" && text.wrap,
  tone === "chip" && text.chip,
  tone === "prompt" && text.tint,
  tone === "take" && text.bright,
];

export const landingView = {
  label: stylex.attrs(island.label, stylex.defaultMarker()).class ?? "",
  glyph: (shown: boolean) =>
    stylex.attrs(glyphSwap.glyph, shown ? glyphSwap.shown : glyphSwap.hidden).class ?? "",
};

export const lessonView = {
  article: `lesson ${stylex.attrs(lessonKit.lesson, shell.rev, stylex.defaultMarker()).class ?? ""}`,
  flipKey: (key: SideKey, on: boolean) =>
    stylex.attrs(lessonKit.flipKey, on && lessonKit[key]).class ?? "",
  pane: (on: boolean) =>
    stylex.attrs(lessonKit.well, lessonKit.pane, !on && lessonKit.behind, stylex.defaultMarker())
      .class ?? "",
  hintSvg: (gone: boolean) => stylex.attrs(hintKit.svg, gone && hintKit.gone).class ?? "",
  hintArrow: (drawn: boolean) => stylex.attrs(hintKit.arrow, drawn && hintKit.drawn).class ?? "",
  hintLabel: (tilt: "up" | "down" | "level", onPanel: boolean, gone: boolean) =>
    stylex.attrs(hintKit.label, hintKit[tilt], onPanel && hintKit.onPanel, gone && hintKit.gone)
      .class ?? "",
};

export type SlotState = {
  lead: boolean;
  open: boolean;
  near: boolean;
  missed: boolean;
  cleared: boolean;
  seated: boolean;
};

type ChoiceState = Pick<SlotState, "missed" | "cleared" | "seated">;

export const quizView = {
  slot: ({ lead, open, near, missed, cleared, seated }: SlotState) =>
    stylex.attrs(
      quizKit.slot,
      lead ? quizKit.slotAfterLead : null,
      open && quizKit.slotOpen,
      near && quizKit.slotNear,
      missed && (open ? quizKit.slotMissOpen : quizKit.slotMiss),
      cleared && !seated && quizKit.slotOff,
      seated && quizKit.slotSeat,
      stylex.defaultMarker(),
    ).class ?? "",
  piece: (picked: boolean, dragging: boolean) =>
    stylex.attrs(quizKit.piece, picked && quizKit.picked, dragging && quizKit.dragging).class ?? "",
  say: (cleared: boolean, said: boolean) =>
    stylex.attrs(quizKit.say, cleared ? quizKit.sayYes : said && quizKit.sayNo).class ?? "",
  said: (said: boolean) => stylex.attrs(quizKit.said, said && quizKit.saidToned).class ?? "",
  star: (on: boolean) => stylex.attrs(quizKit.star, on && quizKit.starOn).class ?? "",
  choice: (look: "card" | "spot", { missed, cleared, seated }: ChoiceState) =>
    stylex.attrs(
      look === "card" ? quizKit.choice : quizKit.spot,
      !cleared && (look === "card" ? quizKit.choiceLive : quizKit.spotLive),
      missed && quizKit.choiceMiss,
      cleared && !seated && quizKit.choiceOff,
      seated && quizKit.choiceSeat,
      stylex.defaultMarker(),
    ).class ?? "",
};
