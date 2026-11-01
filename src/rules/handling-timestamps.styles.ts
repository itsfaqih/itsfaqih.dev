import * as stylex from "@stylexjs/stylex";
import { arcade } from "../components/arcade";
import { fonts, palette } from "../theme.stylex";
import type { Fate } from "./handling-timestamps";
import { kit } from "./rule-landing.stylex";

const PHONE = "@media (max-width: 640px)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";
const LIGHT = ":is(.light *)";

export const styles = stylex.create({
  view: {
    display: "grid",
    gap: "14px",
    alignContent: "start",
  },
  costs: {
    alignContent: "end",
  },
  wire: {
    display: "grid",
    gap: "2px",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  },
  line: {
    minHeight: "24px",
    paddingBlock: "2px",
    paddingInline: "8px",
    borderRadius: "6px",
    color: palette["--text"],
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  note: {
    color: palette["--mute"],
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
  str: {
    display: "inline-block",
    maxWidth: "100%",
    color: {
      default: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)`,
      [stylex.when.ancestor("[data-note]")]: "inherit",
    },
  },
  readers: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fit, minmax(190px, 1fr))",
      [PHONE]: "minmax(0, 1fr)",
    },
    gap: "10px",
  },
  reader: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    rowGap: "4px",
    columnGap: "12px",
    alignItems: "center",
    paddingBlock: "12px",
    paddingInline: "12px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 2px 0 ${palette["--drop-ink"]}`,
  },
  read: {
    display: "grid",
    minWidth: 0,
  },
  who: {
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  },
  time: {
    fontWeight: 700,
    fontSize: { default: "20px", [PHONE]: "18px" },
    lineHeight: 1.25,
    fontFamily: fonts["--mono"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
  date: {
    fontSize: "13px",
    color: palette["--dim"],
  },
  should: {
    marginTop: "2px",
    fontSize: "12.5px",
    fontWeight: 600,
    color: kit["--yes-ink"],
  },
  off: {
    color: palette["--no-ink"],
  },
  clock: {
    position: "relative",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: kit["--code-bg"],
    boxShadow: `inset 0 0 0 1.5px ${palette["--hair"]}`,
    "::before": {
      content: '""',
      position: "absolute",
      top: "3px",
      right: "3px",
      bottom: "3px",
      left: "3px",
      borderRadius: "50%",
      backgroundImage: `repeating-conic-gradient(from -3deg, ${palette["--mute"]} 0 6deg, transparent 6deg 90deg)`,
      maskImage: "radial-gradient(circle, transparent 17px, #000 17.5px)",
    },
    "::after": {
      content: '""',
      position: "absolute",
      top: "calc(50% - 3px)",
      right: "calc(50% - 3px)",
      bottom: "calc(50% - 3px)",
      left: "calc(50% - 3px)",
      borderRadius: "50%",
      backgroundColor: palette["--text"],
    },
  },
  hand: {
    position: "absolute",
    bottom: "50%",
    left: "calc(50% - 1.5px)",
    width: "3px",
    height: "13px",
    borderRadius: "2px",
    backgroundColor: palette["--text"],
    transform: "rotate(var(--a))",
    transformOrigin: "50% 100%",
  },
  minuteHand: {
    left: "calc(50% - 1px)",
    width: "2px",
    height: "19px",
    backgroundColor: palette["--dim"],
  },
  hourOff: {
    backgroundColor: palette["--no-ink"],
  },
  ghost: {
    backgroundColor: kit["--yes-ink"],
    opacity: 0.5,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
  },
  th: {
    paddingBlock: "6px",
    paddingInline: "8px",
    borderBottomWidth: "1.5px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
    textAlign: "left",
  },
  td: {
    paddingBlock: "8px",
    paddingInline: "8px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: `color-mix(in srgb, ${palette["--hair"]} 60%, transparent)`,
    color: palette["--text"],
  },
  at: {
    whiteSpace: "nowrap",
    color: {
      default: palette["--text"],
      [stylex.when.ancestor('[data-side="bad"]')]: palette["--no-ink"],
    },
  },
  sum: {
    textWrap: "pretty",
    fontSize: "14px",
    color: palette["--dim"],
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  formHead: {
    flexBasis: "100%",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  },
  input: {
    minHeight: "38px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: palette["--hair-hover"] },
      ":focus-visible": "var(--c-ink)",
    },
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    fontStyle: "normal",
    fontWeight: 600,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "14px", [TOUCH]: "16px" },
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    colorScheme: { default: "dark", [LIGHT]: "light" },
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    transition: `border-color ${kit["--t-fb"]} ease`,
  },
  orders: {
    display: "grid",
    gap: "4px",
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  },
  order: {
    textWrap: "pretty",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    gap: "10px",
    alignItems: "center",
    minHeight: "40px",
    paddingBlock: "4px",
    paddingInline: "10px",
    borderRadius: "8px",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.3,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    transition: `opacity ${kit["--t-fb"]} ease, background-color ${kit["--t-fb"]} ease`,
  },
  orderOut: {
    opacity: 0.45,
  },
  orderShown: {
    backgroundColor: "color-mix(in srgb, var(--c) 8%, transparent)",
  },
  orderWrong: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 8%, transparent)`,
    boxShadow: `inset 2px 0 0 ${palette["--no"]}`,
  },
  orderId: {
    color: palette["--mute"],
  },
  when: {
    display: "grid",
  },
  whenMissed: {
    textDecorationLine: "line-through",
    textDecorationColor: `color-mix(in srgb, ${palette["--no"]} 60%, transparent)`,
  },
  utc: {
    fontSize: "11px",
    color: palette["--mute"],
  },
  fate: {
    paddingBlock: "2px",
    paddingInline: "7px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    whiteSpace: "nowrap",
  },
  fateShown: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  fateWrong: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  },
});

const cls = (...rules: stylex.StyleXStyles[]) => stylex.attrs(...rules).class ?? "";

/** Class names for what the custom elements draw and redraw. */
export const tsView = {
  srOnly: cls(arcade.srOnly),
  // The marker lets a quoted string ask whether its line is a note.
  line: (note: boolean, hot: boolean) =>
    cls(styles.line, note && styles.note, hot && styles.hot, stylex.defaultMarker()),
  ghost: cls(styles.hand, styles.ghost),
  minute: `ts-min ${cls(styles.hand, styles.minuteHand)}`,
  hour: (off: boolean) => `ts-hour ${cls(styles.hand, off && styles.hourOff)}`,
  time: (off: boolean) => cls(styles.time, off && styles.off),
  should: cls(styles.should),
  order: (fate: Fate) =>
    cls(
      styles.order,
      fate === "out" && styles.orderOut,
      fate === "shown" && styles.orderShown,
      (fate === "missed" || fate === "extra") && styles.orderWrong,
    ),
  when: (fate: Fate) => cls(styles.when, fate === "missed" && styles.whenMissed),
  fate: (fate: Fate) =>
    cls(
      styles.fate,
      fate === "shown" && styles.fateShown,
      (fate === "missed" || fate === "extra") && styles.fateWrong,
    ),
};

/** The quiz boards: tables and responses set as cards, and day lanes laid against one UTC axis. */
export const quiz = stylex.create({
  stack: {
    display: "grid",
    gap: "10px",
  },
  // Every height on these boards is whole pixels. A fraction here leaves each later quiz on a new
  // sub-pixel offset, and their behavior screenshots then shift by a pixel from run to run. So the
  // cards draw their own 17px caption, not QuizChoice's 16.9px one.
  card: {
    display: "grid",
    gap: "10px",
  },
  caption: {
    lineHeight: "17px",
  },
  table: {
    display: "grid",
    gridTemplateColumns: "max-content max-content minmax(0, 1fr)",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: "18px",
    fontFamily: fonts["--mono"],
  },
  cell: {
    paddingBlock: "6px",
    whiteSpace: "nowrap",
  },
  head: {
    borderBottomWidth: "1px",
    lineHeight: "16px",
  },
  line: {
    display: "block",
  },
  // styles.str dims inside any [data-note], and every QuizChoice carries one.
  str: {
    display: "inline-block",
    whiteSpace: "nowrap",
    color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)`,
  },
  screen: {
    display: "grid",
    gap: "6px",
    paddingBlock: "18px",
    paddingInline: { default: "16px", [PHONE]: "12px" },
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
  },
  // A spot's border and padding, so the axis rows line up with the lanes inside the spots.
  rule: {
    paddingInline: "4.5px",
  },
  lane: {
    display: "grid",
    gridTemplateColumns: { default: "118px minmax(0, 1fr)", [PHONE]: "minmax(0, 1fr)" },
    gap: { default: "10px", [PHONE]: "4px" },
    alignItems: "center",
  },
  who: {
    display: "grid",
    paddingInline: { default: 0, [PHONE]: "2px" },
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "15px",
    fontFamily: fonts["--display"],
    color: palette["--text"],
    whiteSpace: "nowrap",
  },
  where: {
    fontWeight: 600,
    fontSize: "11px",
    color: palette["--dim"],
  },
  axisWho: {
    display: { default: null, [PHONE]: "none" },
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "16px",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  },
  track: {
    position: "relative",
    display: "block",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: kit["--code-bg"],
    // Midnight UTC on Jan 10 and Jan 11, a quarter and three quarters of the way along.
    backgroundImage: `linear-gradient(90deg, transparent calc(25% - 0.5px), ${palette["--hair"]} calc(25% - 0.5px) calc(25% + 0.5px), transparent calc(25% + 0.5px) calc(75% - 0.5px), ${palette["--hair"]} calc(75% - 0.5px) calc(75% + 0.5px), transparent calc(75% + 0.5px))`,
  },
  ticks: {
    position: "relative",
    display: "block",
    height: "16px",
  },
  tick: {
    position: "absolute",
    top: 0,
    left: "var(--at)",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "16px",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
    whiteSpace: "nowrap",
    transform: "translateX(-50%)",
  },
  asked: {
    paddingLeft: "6px",
    borderLeftWidth: "2px",
    borderLeftStyle: "solid",
    borderLeftColor: "var(--c-ink)",
    color: "var(--c-ink)",
    transform: "translateX(-1px)",
  },
  day: {
    position: "absolute",
    top: "5px",
    bottom: "5px",
    left: "var(--at)",
    display: "grid",
    placeItems: "center",
    width: "50%",
    borderRadius: "5px",
    backgroundColor: `color-mix(in srgb, ${palette["--text"]} 16%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${palette["--text"]} 22%, transparent)`,
    fontWeight: 600,
    fontSize: "11px",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  },
  mark: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "calc(var(--at) - 1px)",
    width: "2px",
    backgroundColor: "var(--c-ink)",
  },
});
