import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { under1, under2, under3 } from "../layers.css";
const TABLET = "(max-width: 820px)";
const PHONE = "(max-width: 640px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";

const stepIn = keyframes({
  from: { opacity: 0, translate: "0 4px" },
});
const fade = keyframes({
  from: { opacity: 0 },
});
const drain = keyframes({
  to: { transform: "scaleX(0)" },
});

export const HOLD_MS = 1200;
export const UNDO_MS = 5000;

export const styles = {
  stage: style({
    "@layer": {
      [under1]: {
        display: "grid",
        placeItems: "center",
        alignContent: "center",
        gap: "18px",
        minHeight: "176px",
        paddingBlock: "8px",
        paddingInline: 0,
        "@media": {
          [TABLET]: {
            minHeight: "200px",
          },
        },
      },
    },
  }),
  key: style({
    "@layer": {
      [under3]: {
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
        vars: {
          // Declared on the key, not the page, so a red key's --c reaches its shadow and ink too.
          "--key": "color-mix(in oklab, var(--c) 60%, #000)",
          "--ink": `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
          "--face": "var(--c)",
          "--lit": "color-mix(in oklab, var(--c) 82%, #fff)",
        },
        selectors: {
          "&:focus-visible": {
            outline: `3px solid ${palette["--focus"]}`,
            outlineOffset: "3px",
          },
        },
      },
    },
  }),
  live: style({
    "@layer": {
      [under2]: {
        backgroundColor: "var(--face)",
        boxShadow: "0 4px 0 var(--key)",
        selectors: {
          "&:active": {
            transform: "translateY(2px) scale(0.97)",
            boxShadow: "0 2px 0 var(--key)",
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                backgroundColor: "var(--lit)",
              },
            },
          },
          [REDUCE]: {
            selectors: {
              "&:active": {
                transform: "none",
              },
            },
          },
        },
      },
    },
  }),
  icon: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "16px",
    height: "16px",
  }),
  sm: style({
    "@layer": {
      [under2]: {
        height: "38px",
        borderRadius: "10px",
        fontSize: "12px",
        vars: {
          "--pl": "16px",
          "--pr": "16px",
        },
      },
    },
  }),
  red: style({
    vars: {
      "--c": palette["--no"],
    },
  }),
  tint: style({
    boxShadow: "none",
    color: "var(--ink)",
    vars: {
      "--face": "color-mix(in srgb, var(--c) 18%, transparent)",
      "--lit": "color-mix(in srgb, var(--c) 28%, transparent)",
    },
  }),
  text: style({
    boxShadow: "none",
    color: palette["--text"],
    vars: {
      "--face": "transparent",
      "--lit": `color-mix(in srgb, ${palette["--text"]} 8%, transparent)`,
    },
  }),
  plain: style({
    "@layer": {
      [under1]: {
        boxShadow: `0 4px 0 ${palette["--soft-key-drop"]}`,
        color: palette["--text"],
        vars: {
          "--face": palette["--soft-key"],
          "--lit": palette["--soft-key-hover"],
        },
        selectors: {
          "&:active": {
            boxShadow: `0 2px 0 ${palette["--soft-key-drop"]}`,
          },
        },
      },
    },
  }),
  // `plain` without its drop, for a key whose drop comes from `live`.
  plainFace: style({
    "@layer": {
      [under1]: {
        color: palette["--text"],
        vars: {
          "--face": palette["--soft-key"],
          "--lit": palette["--soft-key-hover"],
        },
      },
    },
  }),
  hover: style({
    "@layer": {
      [under1]: {
        backgroundColor: "var(--lit)",
      },
    },
  }),
  press: style({
    "@layer": {
      [under1]: {
        transform: "translateY(2px) scale(0.97)",
        boxShadow: "0 2px 0 var(--key)",
        "@media": {
          [REDUCE]: {
            transform: "none",
          },
        },
      },
    },
  }),
  focus: style({
    "@layer": {
      [under1]: {
        outline: `3px solid ${palette["--focus"]}`,
        outlineOffset: "3px",
      },
    },
  }),
  flat: style({
    "@layer": {
      [under2]: {
        transition: "none",
        selectors: {
          "&:focus-visible": {
            outline: "none",
          },
          "&:hover": {
            outline: "none",
          },
          "&:active": {
            outline: "none",
          },
        },
      },
    },
  }),
  flatForced: style({
    backgroundColor: "var(--face)",
    boxShadow: "0 4px 0 var(--key)",
    transform: "none",
    outline: "none",
  }),
  specimens: style({
    display: "grid",
    gridTemplateColumns: "repeat(4, auto)",
    gap: "14px",
    paddingTop: "14px",
    paddingRight: "16px",
    paddingBottom: "10px",
    paddingLeft: "16px",
    borderRadius: "12px",
    backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 60%, transparent)`,
    // Pictures of buttons, so their labels select no more than a real button's do.
    userSelect: "none",
    "@media": {
      [PHONE]: {
        gap: "6px",
        paddingRight: "8px",
        paddingLeft: "8px",
      },
    },
  }),
  specimen: style({
    display: "grid",
    gap: "10px",
    justifyItems: "center",
  }),
  specimenKey: style({
    height: "32px",
    borderRadius: "8px",
    fontSize: "11px",
    transition: "none",
    vars: {
      "--pl": "12px",
      "--pr": "12px",
    },
  }),
  small: style({
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  }),
  fullRow: style({
    gridColumn: "1 / -1",
  }),
  slug: style({
    display: "flex",
    alignItems: "center",
    selectors: {
      "&:focus-within": {
        outline: `3px solid ${palette["--focus"]}`,
        outlineOffset: "1px",
      },
    },
  }),
  slugBase: style({
    color: palette["--mute"],
  }),
  slugInput: style({
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
  }),
  form: style({
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "end",
    justifyItems: "stretch",
    gap: "12px",
    width: "min(100%, 360px)",
    marginInline: "auto",
    "@media": {
      [PHONE]: {
        gridTemplateColumns: "minmax(0, 1fr)",
      },
    },
  }),
  field: style({
    display: "grid",
    gap: "6px",
    minWidth: 0,
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
  }),
  input: style({
    "@layer": {
      [under1]: {
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
        fontSize: "14px",
        lineHeight: "normal",
        fontFamily: fonts["--sans"],
        color: palette["--text"],
        selectors: {
          "&:focus-visible": {
            outline: `3px solid ${palette["--focus"]}`,
            outlineOffset: "1px",
          },
        },
        "@media": {
          [TOUCH]: {
            fontSize: "16px",
          },
        },
      },
    },
  }),
  steps: style({
    display: "flex",
    gap: "10px",
  }),
  formEnd: style({
    "@media": {
      [PHONE]: {
        justifySelf: "start",
      },
    },
  }),
  off: style({
    boxShadow: `0 4px 0 ${palette["--soft-key-drop"]}`,
    color: palette["--dim"],
    cursor: cursors["--cursor-forbid"],
    vars: {
      "--face": palette["--soft-key"],
    },
  }),
  faded: style({
    opacity: 0.35,
    cursor: cursors["--cursor-point"],
  }),
  tip: style({
    position: "relative",
    display: "inline-grid",
  }),
  tooltip: style({
    "@layer": {
      [under1]: {
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
        opacity: 0,
        translate: "-50% 4px",
        transition: `opacity 150ms ease, translate 200ms ${motion["--out"]}`,
        selectors: {
          "&::after": {
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
          [`&${when.siblingBefore(":is(:hover, :focus-visible)")}`]: {
            opacity: 1,
            translate: "-50% 0",
          },
        },
        "@media": {
          [REDUCE]: {
            translate: "-50% 0",
          },
        },
      },
    },
  }),
  tooltipOpen: style({
    opacity: 1,
    translate: "-50% 0",
  }),
  card: style({
    display: "grid",
    gap: "4px",
    width: "min(100%, 380px)",
    paddingBlock: "18px",
    paddingInline: "18px",
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
    transition: "filter 200ms ease",
    selectors: {
      [`&${when.ancestor(':has([data-toggle="squint"][aria-pressed="true"])')}`]: {
        filter: "blur(5px)",
      },
    },
    "@media": {
      [PHONE]: {
        paddingBlock: "14px",
        paddingInline: "14px",
      },
    },
  }),
  cardTitle: style({
    fontWeight: 700,
    fontSize: "15px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  }),
  cardSub: style({
    fontSize: "13px",
    color: palette["--mute"],
  }),
  row: style({
    "@layer": {
      [under1]: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        justifyContent: "flex-end",
      },
    },
  }),
  cardRow: style({
    marginTop: "16px",
    gap: "8px",
    "@media": {
      [PHONE]: {
        gap: "6px",
      },
    },
  }),
  cardRowKey: style({
    vars: {
      "--pl": "16px",
      "--pr": "16px",
    },
    "@media": {
      [PHONE]: {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: "auto",
        vars: {
          "--pl": "12px",
          "--pr": "12px",
        },
      },
    },
  }),
  toggle: style({
    marginTop: "4px",
  }),
  dot: style({
    "@layer": {
      [under1]: {
        width: "10px",
        height: "10px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: palette["--mute"],
        borderRadius: "50%",
        transition: `background-color ${kit["--t-fb"]} ease, border-color ${kit["--t-fb"]} ease`,
      },
    },
  }),
  dotOn: style({
    borderColor: "var(--c-ink)",
    backgroundColor: "var(--c)",
  }),
  project: style({
    "@layer": {
      [under2]: {
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
    },
  }),
  confirm: style({
    "@layer": {
      [under1]: {
        boxShadow: `0 0 0 1.5px color-mix(in srgb, ${palette["--no"]} 55%, transparent)`,
      },
    },
  }),
  deleted: style({
    backgroundColor: "transparent",
    boxShadow: `0 0 0 1.5px ${palette["--hair"]} inset`,
  }),
  stepIn: style({
    animationName: stepIn,
    animationDuration: "200ms",
    animationTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        animationName: fade,
        animationDuration: "160ms",
        animationTimingFunction: "ease",
      },
    },
  }),
  guards: style({
    display: "inline-flex",
    gap: "2px",
    padding: "3px",
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
  }),
  guard: style({
    "@layer": {
      [under1]: {
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
        selectors: {
          "&:focus-visible": {
            outline: `3px solid ${palette["--focus"]}`,
          },
        },
      },
    },
  }),
  guardOn: style({
    color: palette["--text"],
  }),
  guardPill: style({
    borderRadius: "7px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 1px 0 ${palette["--hair"]}, 0 0 0 1px ${palette["--hair"]}`,
  }),
  guardSlide: style({
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
  }),
  hold: style({
    overflow: "hidden",
    isolation: "isolate",
    touchAction: "none",
    userSelect: "none",
    WebkitTouchCallout: "none",
  }),
  holdFill: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        inset: 0,
        zIndex: -1,
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 34%, transparent)`,
        transformOrigin: "left center",
        transform: "scaleX(0)",
        transition: `transform 200ms ${motion["--out"]}`,
      },
    },
  }),
  holdFillOn: style({
    transform: "scaleX(1)",
    transition: `transform ${HOLD_MS}ms linear`,
  }),
  drain: style({
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
  }),
  projectRow: style({
    marginLeft: "auto",
  }),
  projectCopy: style({
    display: "grid",
    gap: "2px",
  }),
  projectName: style({
    "@layer": {
      [under1]: {
        fontWeight: 700,
        fontSize: "14px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        letterSpacing: "-0.02em",
        color: palette["--text"],
      },
    },
  }),
  projectGone: style({
    color: palette["--no-ink"],
  }),
  projectMeta: style({
    fontSize: "13px",
    color: palette["--mute"],
  }),
  icons: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    justifyContent: "center",
    alignItems: "center",
    // Room for the rulers under the keys.
    paddingBottom: "26px",
  }),
  lead: style({
    "@layer": {
      [under1]: {
        vars: {
          "--pl": "12px",
        },
      },
    },
  }),
  trail: style({
    "@layer": {
      [under1]: {
        vars: {
          "--pr": "12px",
        },
      },
    },
  }),
  even: style({
    vars: {
      "--pl": "16px",
      "--pr": "16px",
    },
  }),
  dims: style({
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
  }),
  // A dimension line: a tick at each end joined by a rule, with its length under it.
  dim: style({
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
  }),
  dimLeft: style({
    left: 0,
    width: "var(--pl)",
  }),
  dimRight: style({
    right: 0,
    width: "var(--pr)",
  }),
  pads: style({
    selectors: {
      "&::before": {
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
        opacity: 0,
        transition: "opacity 150ms ease",
      },
      "&::after": {
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
        opacity: 0,
        transition: "opacity 150ms ease",
      },
      [`&${when.ancestor(':has([data-toggle="pads"][aria-pressed="true"])')}::before`]: {
        opacity: 1,
      },
      [`&${when.ancestor(':has([data-toggle="pads"][aria-pressed="true"])')}::after`]: {
        opacity: 1,
      },
    },
  }),
};

export const quiz = {
  mock: style({
    "@layer": {
      [under1]: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "64px",
      },
    },
  }),
  tipRoom: style({
    paddingTop: "40px",
  }),
  end: style({
    justifyContent: "flex-end",
  }),
  hiddenSlot: style({
    width: "84px",
    height: "38px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "10px",
  }),
  screen: style({
    display: "grid",
    gap: "14px",
    justifyItems: "start",
    paddingBlock: "16px",
    paddingInline: "16px",
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
  }),
  bar: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  }),
  pageKey: style({
    height: "32px",
    borderRadius: "8px",
    fontSize: "12px",
    vars: {
      "--pl": "12px",
      "--pr": "12px",
    },
  }),
  ruled: style({
    display: "inline-grid",
    paddingBottom: "26px",
  }),
};
