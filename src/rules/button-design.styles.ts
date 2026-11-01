import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";
import { kit } from "./rule-landing.stylex";

const TABLET = "@media (max-width: 820px)";
const PHONE = "@media (max-width: 640px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";

const stepIn = stylex.keyframes({ from: { opacity: 0, translate: "0 4px" } });
const fade = stylex.keyframes({ from: { opacity: 0 } });
const drain = stylex.keyframes({ to: { transform: "scaleX(0)" } });

export const HOLD_MS = 1200;
export const UNDO_MS = 5000;
/** A slug an older post already holds, so this one can't publish under it. */
export const TAKEN = "spring-launch";

export const styles = stylex.create({
  stage: {
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: "18px",
    minHeight: { default: "176px", [TABLET]: "200px" },
    paddingBlock: "8px",
    paddingInline: 0,
  },
  key: {
    // Declared on the key, not the page, so a red key's --c reaches its shadow and ink too.
    "--key": "color-mix(in oklab, var(--c) 60%, #000)",
    "--ink": `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
    "--face": "var(--c)",
    "--lit": "color-mix(in oklab, var(--c) 82%, #fff)",
    position: "relative",
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    paddingTop: 0,
    paddingRight: "var(--pr, 20px)",
    paddingBottom: 0,
    paddingLeft: "var(--pl, 20px)",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "12px",
    backgroundColor: "var(--face)",
    boxShadow: "0 4px 0 var(--key)",
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
    color: "var(--on-c)",
    cursor: cursors["--cursor"],
    transition: `transform 150ms ${motion["--out"]}, background-color 150ms ease, box-shadow 150ms ease`,
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "3px" },
  },
  live: {
    backgroundColor: { default: "var(--face)", ":hover": { default: null, [HOVER]: "var(--lit)" } },
    transform: {
      default: null,
      ":active": { default: "translateY(2px) scale(0.97)", [REDUCE]: "none" },
    },
    boxShadow: { default: "0 4px 0 var(--key)", ":active": "0 2px 0 var(--key)" },
  },
  icon: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "16px",
    height: "16px",
  },
  sm: {
    "--pl": "16px",
    "--pr": "16px",
    height: "38px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  red: {
    "--c": palette["--no"],
  },
  tint: {
    "--face": "color-mix(in srgb, var(--c) 18%, transparent)",
    "--lit": "color-mix(in srgb, var(--c) 28%, transparent)",
    boxShadow: "none",
    color: "var(--ink)",
  },
  text: {
    "--face": "transparent",
    "--lit": `color-mix(in srgb, ${palette["--text"]} 8%, transparent)`,
    boxShadow: "none",
    color: palette["--text"],
  },
  plain: {
    "--face": palette["--soft-key"],
    "--lit": palette["--soft-key-hover"],
    boxShadow: {
      default: `0 4px 0 ${palette["--soft-key-drop"]}`,
      ":active": `0 2px 0 ${palette["--soft-key-drop"]}`,
    },
    color: palette["--text"],
  },
  hover: {
    backgroundColor: "var(--lit)",
  },
  press: {
    transform: { default: "translateY(2px) scale(0.97)", [REDUCE]: "none" },
    boxShadow: "0 2px 0 var(--key)",
  },
  focus: {
    outline: `3px solid ${palette["--focus"]}`,
    outlineOffset: "3px",
  },
  flat: {
    transition: "none",
    outline: { default: null, ":hover": "none", ":active": "none", ":focus-visible": "none" },
  },
  flatForced: {
    backgroundColor: "var(--face)",
    boxShadow: "0 4px 0 var(--key)",
    transform: "none",
    outline: "none",
  },
  specimens: {
    display: "grid",
    gridTemplateColumns: "repeat(4, auto)",
    gap: { default: "14px", [PHONE]: "6px" },
    paddingTop: "14px",
    paddingRight: { default: "16px", [PHONE]: "8px" },
    paddingBottom: "10px",
    paddingLeft: { default: "16px", [PHONE]: "8px" },
    borderRadius: "12px",
    backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 60%, transparent)`,
    // Pictures of buttons, so their labels select no more than a real button's do.
    userSelect: "none",
  },
  specimen: {
    display: "grid",
    gap: "10px",
    justifyItems: "center",
  },
  specimenKey: {
    "--pl": "12px",
    "--pr": "12px",
    height: "32px",
    borderRadius: "8px",
    fontSize: "11px",
    transition: "none",
  },
  small: {
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  },
  fullRow: {
    gridColumn: "1 / -1",
  },
  slug: {
    display: "flex",
    alignItems: "center",
    outline: { default: null, ":focus-within": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-within": "1px" },
  },
  slugBase: {
    color: palette["--mute"],
  },
  slugInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontWeight: "inherit",
    fontSize: "inherit",
    fontFamily: "inherit",
    color: "inherit",
    outline: "none",
  },
  form: {
    gridTemplateColumns: { default: "minmax(0, 1fr) auto", [PHONE]: "minmax(0, 1fr)" },
    alignItems: "end",
    justifyItems: "stretch",
    gap: "12px",
    width: "min(100%, 360px)",
    marginInline: "auto",
  },
  field: {
    display: "grid",
    gap: "6px",
    minWidth: 0,
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
  },
  input: {
    height: "38px",
    minWidth: 0,
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    fontWeight: 500,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "14px", [TOUCH]: "16px" },
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "1px" },
  },
  steps: {
    display: "flex",
    gap: "10px",
  },
  formEnd: {
    justifySelf: { default: null, [PHONE]: "start" },
  },
  off: {
    "--face": palette["--soft-key"],
    boxShadow: `0 4px 0 ${palette["--soft-key-drop"]}`,
    color: palette["--dim"],
    cursor: cursors["--cursor-forbid"],
  },
  faded: {
    opacity: 0.35,
    cursor: cursors["--cursor-point"],
  },
  tip: {
    position: "relative",
    display: "inline-grid",
  },
  tooltip: {
    position: "absolute",
    bottom: "calc(100% + 12px)",
    left: "50%",
    zIndex: 2,
    paddingBlock: "6px",
    paddingInline: "10px",
    borderRadius: "8px",
    backgroundColor: palette["--text"],
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    whiteSpace: "nowrap",
    color: palette["--bg"],
    pointerEvents: "none",
    opacity: { default: 0, [stylex.when.siblingBefore(":is(:hover, :focus-visible)")]: 1 },
    translate: {
      default: "-50% 4px",
      [REDUCE]: "-50% 0",
      [stylex.when.siblingBefore(":is(:hover, :focus-visible)")]: "-50% 0",
    },
    transition: `opacity 150ms ease, translate 200ms ${motion["--out"]}`,
    "::after": {
      content: '""',
      position: "absolute",
      top: "100%",
      left: "50%",
      translate: "-50% 0",
      borderWidth: "5px",
      borderStyle: "solid",
      borderColor: "transparent",
      borderTopColor: palette["--text"],
    },
  },
  tooltipOpen: {
    opacity: 1,
    translate: "-50% 0",
  },
  card: {
    display: "grid",
    gap: "4px",
    width: "min(100%, 380px)",
    paddingBlock: { default: "18px", [PHONE]: "14px" },
    paddingInline: { default: "18px", [PHONE]: "14px" },
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
    transition: "filter 200ms ease",
    filter: {
      default: null,
      [stylex.when.ancestor(':has([data-toggle="squint"][aria-pressed="true"])')]: "blur(5px)",
    },
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: "15px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
  cardSub: {
    fontSize: "13px",
    color: palette["--mute"],
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "flex-end",
  },
  cardRow: {
    marginTop: "16px",
    gap: { default: "8px", [PHONE]: "6px" },
  },
  cardRowKey: {
    "--pl": { default: "16px", [PHONE]: "12px" },
    "--pr": { default: "16px", [PHONE]: "12px" },
    flexGrow: { default: null, [PHONE]: 1 },
    flexShrink: { default: null, [PHONE]: 0 },
    flexBasis: { default: null, [PHONE]: "auto" },
  },
  toggle: {
    marginTop: "4px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--mute"],
    borderRadius: "50%",
    transition: `background-color ${kit["--t-fb"]} ease, border-color ${kit["--t-fb"]} ease`,
  },
  dotOn: {
    borderColor: "var(--c-ink)",
    backgroundColor: "var(--c)",
  },
  project: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "14px",
    columnGap: "20px",
    alignItems: "center",
    justifyContent: "space-between",
    width: "min(100%, 420px)",
    minHeight: "80px",
    paddingBlock: "16px",
    paddingInline: "18px",
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
  },
  confirm: {
    boxShadow: `0 0 0 1.5px color-mix(in srgb, ${palette["--no"]} 55%, transparent)`,
  },
  deleted: {
    backgroundColor: "transparent",
    boxShadow: `0 0 0 1.5px ${palette["--hair"]} inset`,
  },
  stepIn: {
    animationName: { default: stepIn, [REDUCE]: fade },
    animationDuration: { default: "200ms", [REDUCE]: "160ms" },
    animationTimingFunction: { default: motion["--out"], [REDUCE]: "ease" },
  },
  guards: {
    display: "inline-flex",
    gap: "2px",
    padding: "3px",
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
  },
  guard: {
    height: "28px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderRadius: "7px",
    backgroundColor: "transparent",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
    cursor: cursors["--cursor"],
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
  },
  guardOn: {
    color: palette["--text"],
  },
  // The pill under the pressed guard. The server paints it on the Confirm button itself, and the
  // client moves it onto the one highlight that slides between guards (fluid-hover.ts).
  guardPill: {
    borderRadius: "7px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 1px 0 ${palette["--hair"]}, 0 0 0 1px ${palette["--hair"]}`,
  },
  // It answers a click rather than chasing the pointer, so it takes the moderate spring over
  // hover's fast one.
  guardSlide: {
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
  },
  hold: {
    overflow: "hidden",
    isolation: "isolate",
    touchAction: "none",
    userSelect: "none",
    WebkitTouchCallout: "none",
  },
  holdFill: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 34%, transparent)`,
    transformOrigin: "left center",
    transform: "scaleX(0)",
    transition: `transform 200ms ${motion["--out"]}`,
  },
  holdFillOn: {
    transform: "scaleX(1)",
    transition: `transform ${HOLD_MS}ms linear`,
  },
  drain: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
    height: "3px",
    backgroundColor: palette["--no"],
    transformOrigin: "left center",
    animationName: drain,
    animationDuration: `${UNDO_MS}ms`,
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
  },
  projectRow: {
    marginLeft: "auto",
  },
  projectCopy: {
    display: "grid",
    gap: "2px",
  },
  projectName: {
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
  projectGone: {
    color: palette["--no-ink"],
  },
  projectMeta: {
    fontSize: "13px",
    color: palette["--mute"],
  },
  icons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    justifyContent: "center",
    alignItems: "center",
    // Room for the rulers under the keys.
    paddingBottom: "26px",
  },
  lead: {
    "--pl": "12px",
  },
  trail: {
    "--pr": "12px",
  },
  even: {
    "--pl": "16px",
    "--pr": "16px",
  },
  dims: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    left: 0,
    fontWeight: 500,
    fontSize: "10px",
    lineHeight: 1,
    fontFamily: fonts["--mono"],
    color: palette["--focus"],
    pointerEvents: "none",
    userSelect: "none",
  },
  // A dimension line: a tick at each end joined by a rule, with its length under it.
  dim: {
    position: "absolute",
    top: 0,
    display: "flex",
    justifyContent: "center",
    paddingTop: "11px",
    whiteSpace: "nowrap",
    backgroundImage:
      "linear-gradient(currentcolor, currentcolor), linear-gradient(currentcolor, currentcolor), linear-gradient(currentcolor, currentcolor)",
    backgroundPosition: "left top, right top, 0 3px",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1px 7px, 1px 7px, 100% 1px",
  },
  dimLeft: {
    left: 0,
    width: "var(--pl)",
  },
  dimRight: {
    right: 0,
    width: "var(--pr)",
  },
  pads: {
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: "var(--pl)",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: "10px",
      backgroundImage: `repeating-linear-gradient(-45deg, color-mix(in srgb, ${palette["--focus"]} 55%, transparent) 0 2px, transparent 2px 5px)`,
      opacity: {
        default: 0,
        [stylex.when.ancestor(':has([data-toggle="pads"][aria-pressed="true"])')]: 1,
      },
      transition: "opacity 150ms ease",
    },
    "::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: "var(--pr)",
      borderTopLeftRadius: 0,
      borderTopRightRadius: "10px",
      borderBottomRightRadius: "10px",
      borderBottomLeftRadius: 0,
      backgroundImage: `repeating-linear-gradient(-45deg, color-mix(in srgb, ${palette["--focus"]} 55%, transparent) 0 2px, transparent 2px 5px)`,
      opacity: {
        default: 0,
        [stylex.when.ancestor(':has([data-toggle="pads"][aria-pressed="true"])')]: 1,
      },
      transition: "opacity 150ms ease",
    },
  },
});

export const marker = stylex.defaultMarker();

export type Step = "idle" | "confirm" | "undo" | "deleted";

/** Classes the demos' elements switch between, shared by their markup and their clients. */
export const view = {
  dot: (on: boolean) => stylex.attrs(styles.dot, on && styles.dotOn).class ?? "",
  publish: (careful: boolean, ready: boolean) =>
    (careful
      ? stylex.attrs(styles.key, ready && styles.live, styles.sm, !ready && styles.off, marker)
      : stylex.attrs(
          styles.key,
          ready && styles.live,
          styles.sm,
          styles.formEnd,
          !ready && styles.faded,
        )
    ).class ?? "",
  tooltip: (open: boolean) => stylex.attrs(styles.tooltip, open && styles.tooltipOpen).class ?? "",
  guard: (on: boolean) => stylex.attrs(styles.guard, on && styles.guardOn).class ?? "",
  project: (step: Step) =>
    stylex.attrs(
      styles.project,
      step === "confirm" && styles.confirm,
      (step === "deleted" || step === "undo") && styles.deleted,
    ).class ?? "",
  projectName: (gone: boolean) =>
    stylex.attrs(styles.projectName, gone && styles.projectGone).class ?? "",
  /** The key after the project's name: Delete (or Hold to delete) while idle, then Undo or Reset. */
  action: (step: Step, held: boolean) =>
    (step === "idle"
      ? stylex.attrs(
          styles.key,
          styles.sm,
          styles.live,
          styles.red,
          styles.tint,
          held && styles.hold,
          styles.stepIn,
        )
      : stylex.attrs(styles.key, styles.sm, styles.live, styles.text, styles.stepIn)
    ).class ?? "",
  holdFill: (holding: boolean) =>
    stylex.attrs(styles.holdFill, holding && styles.holdFillOn).class ?? "",
};
