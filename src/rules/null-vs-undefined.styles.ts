import * as stylex from "@stylexjs/stylex";
import { arcade } from "../components/arcade";
import { button, buttonVariant } from "../components/button";
import { cursors, fonts, motion, palette } from "../theme.stylex";
import { kit } from "./rule-landing.stylex";
import type { Verdict } from "./null-vs-undefined";

const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"|`[^`]*`)|\b(null)\b|\b(undefined)\b|\b(const|let|function|return|type|await|new)\b/g;
const PHONE = "@media (max-width: 640px)";
const MOTION = "@media (prefers-reduced-motion: no-preference)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";

const flash = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});
const typeIn = stylex.keyframes({
  from: { opacity: 0, transform: "translate(-8px)" },
});
const drop = stylex.keyframes({
  from: { opacity: 1, transform: "translateY(-14px)" },
  "70%": { opacity: 1 },
  to: { opacity: 0, transform: "translateY(16px)" },
});
const land = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});

export const styles = stylex.create({
  kw: { color: "var(--c-ink)" },
  str: { color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)` },
  com: { color: palette["--mute"] },
  nul: {
    paddingBlock: 0,
    paddingInline: "3px",
    borderRadius: "4px",
    backgroundColor: "color-mix(in srgb, var(--c) 20%, transparent)",
    boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--c) 70%, transparent)",
    fontWeight: 700,
    color: "var(--c-ink)",
  },
  und: {
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
  inherit: { color: "inherit" },
  introCode: {
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "6px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "0.88em",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  },
  view: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "14px",
    alignContent: "start",
  },
  code: {
    display: "grid",
    gap: "2px",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  },
  line: {
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
  flow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "10px",
  },
  form: {
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
  },
  label: {
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  },
  field: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "160px",
    gap: "10px",
    alignItems: "center",
    minWidth: 0,
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    height: "38px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":focus-visible": "var(--c)" },
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "14px", [TOUCH]: "16px" },
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: {
      default: null,
      ":focus-visible": "color-mix(in srgb, var(--c) 30%, transparent)",
    },
    outlineOffset: { default: null, ":focus-visible": 0 },
    transition: `border-color ${kit["--t-fb"]} ease`,
  },
  chip: {
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
    boxShadow: `0 2px 0 ${palette["--soft-key-drop"]}`,
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  },
  remove: {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    width: "26px",
    height: "26px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "999px",
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [HOVER]: `color-mix(in srgb, ${palette["--no"]} 18%, transparent)`,
      },
    },
    fontSize: "12px",
    color: { default: palette["--dim"], ":hover": { default: null, [HOVER]: palette["--no-ink"] } },
    cursor: cursors["--cursor-point"],
    transform: { default: null, ":active": "scale(0.92)" },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "1px" },
    transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease, transform ${kit["--t-fb"]} ${motion["--out"]}`,
  },
  none: {
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
  },
  again: {
    marginLeft: "auto",
    opacity: { default: null, ":disabled": 0.5 },
  },
  wire: {
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
  },
  verb: {
    fontWeight: 700,
    color: "var(--c-ink)",
  },
  idle: {
    color: palette["--mute"],
  },
  body: {
    minWidth: 0,
    overflowWrap: "anywhere",
    color: palette["--text"],
  },
  typing: {
    animationName: { default: null, [MOTION]: typeIn },
    animationDuration: { default: null, [MOTION]: "180ms" },
    animationTimingFunction: { default: null, [MOTION]: motion["--out"] },
    animationFillMode: { default: null, [MOTION]: "both" },
  },
  packet: {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    width: "6px",
    height: "6px",
    marginLeft: "-3px",
    backgroundColor: "var(--c)",
    opacity: 0,
  },
  dropping: {
    animationName: { default: null, [MOTION]: drop },
    animationDuration: { default: null, [MOTION]: "260ms" },
    animationTimingFunction: { default: null, [MOTION]: motion["--out"] },
    animationDelay: { default: null, [MOTION]: "180ms" },
    animationFillMode: { default: null, [MOTION]: "both" },
  },
  record: {
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
  },
  cell: {
    position: "relative",
    display: "grid",
    gap: "2px",
    alignContent: "start",
    minWidth: 0,
    paddingBlock: "8px",
    paddingInline: { default: "10px", [PHONE]: "8px" },
    borderRadius: "9px",
    isolation: "isolate",
    "::after": {
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
  cellSaved: {
    "::after": {
      backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 22%, transparent)`,
    },
  },
  cellLost: {
    "::after": {
      backgroundColor: `color-mix(in srgb, ${palette["--no"]} 24%, transparent)`,
    },
  },
  flashing: {
    "::after": {
      animationName: flash,
      animationDuration: "640ms",
      animationTimingFunction: motion["--out"],
      animationDelay: "calc(var(--i) * 40ms)",
      animationFillMode: "both",
    },
  },
  name: {
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  },
  value: {
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
  valueLost: {
    color: palette["--no-ink"],
  },
  landing: {
    animationName: { default: null, [MOTION]: land },
    animationDuration: { default: null, [MOTION]: "240ms" },
    animationTimingFunction: { default: null, [MOTION]: motion["--out"] },
    animationDelay: { default: null, [MOTION]: "calc(var(--i) * 40ms)" },
    animationFillMode: { default: null, [MOTION]: "both" },
  },
  nulLost: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 18%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${palette["--no"]} 70%, transparent)`,
    color: palette["--no-ink"],
  },
  tag: {
    justifySelf: "start",
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "5px",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  tagKept: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  tagLost: {
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  },
  boardCode: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  gap: {
    display: { default: null, [stylex.when.ancestor("[data-off]")]: "none" },
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "3.2em",
    height: "1.1em",
    marginLeft: "8px",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "color-mix(in srgb, var(--c) 55%, transparent)",
  },
});

export const KINDS = [styles.com, styles.str, styles.nul, styles.und, styles.kw];
// Inside an output note the note's tone colours strings and nothings.
export const OUT_KINDS = [
  styles.com,
  [styles.str, styles.inherit],
  [styles.nul, styles.inherit],
  [styles.und, styles.inherit],
  styles.kw,
];

export type Painted = { text: string; class?: string };

/** Colours a line of code: a match of TOKEN's nth capture group gets the class of `kinds[n]`. */
export function paint(source: string, kinds: readonly stylex.StyleXStyles[]): Painted[] {
  const parts: Painted[] = [];
  let at = 0;
  for (const match of source.matchAll(TOKEN)) {
    if (match.index > at) parts.push({ text: source.slice(at, match.index) });
    const kind = kinds[match.slice(1).findIndex((group) => group !== undefined)];
    parts.push({ text: match[0], class: stylex.attrs(kind).class });
    at = match.index + match[0].length;
  }
  if (at < source.length) parts.push({ text: source.slice(at) });
  return parts;
}

const cls = (...rules: stylex.StyleXStyles[]) => stylex.attrs(...rules).class ?? "";

/** Classes the save demo (null-flow.astro) and its element share. */
export const flowView = {
  srOnly: cls(arcade.srOnly),
  again:
    stylex.attrs(button.base, buttonVariant["primary-neutral"], button.sm, styles.again).class ?? "",
  wire: cls(styles.wire),
  verb: cls(styles.verb),
  idle: cls(styles.idle),
  body: (typing: boolean) => cls(styles.body, typing && styles.typing),
  packet: (dropping: boolean) => cls(styles.packet, dropping && styles.dropping),
  record: cls(styles.record),
  cell: (verdict: Verdict | undefined, ran: boolean) =>
    cls(
      styles.cell,
      verdict === "saved" && styles.cellSaved,
      (verdict === "wiped" || verdict === "lost") && styles.cellLost,
      ran && verdict !== undefined && styles.flashing,
    ),
  name: cls(styles.name),
  value: (bad: boolean, landing: boolean) =>
    cls(styles.value, bad && styles.valueLost, landing && styles.landing),
  nul: (bad: boolean) => cls(styles.nul, bad && styles.nulLost),
  tag: (verdict: Verdict) =>
    cls(
      styles.tag,
      (verdict === "saved" || verdict === "kept") && styles.tagKept,
      (verdict === "wiped" || verdict === "lost") && styles.tagLost,
    ),
};
