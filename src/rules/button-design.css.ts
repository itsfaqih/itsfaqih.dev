import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
import { under1, under2, under3 } from "../layers.css";
const TABLET = "(max-width: 820px)";
const PHONE = "(max-width: 640px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const SQUINT = when.ancestor(':has([data-toggle="squint"][aria-pressed="true"])');
const RING = when.ancestor(':has([data-toggle="ring"][aria-pressed="true"])');
const HATCH = `repeating-linear-gradient(-45deg, color-mix(in srgb, ${palette["--focus"]} 55%, transparent) 0 2px, transparent 2px 5px)`;
const NOTE_INK = `color-mix(in oklab, ${palette["--cw"]} ${palette["--ink-mix"]}, #000)`;

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
  steps: style({
    display: "flex",
    gap: "10px",
  }),
  off: style({
    boxShadow: `0 4px 0 ${palette["--soft-key-drop"]}`,
    color: palette["--dim"],
    cursor: cursors["--cursor-forbid"],
    vars: {
      "--face": palette["--soft-key"],
    },
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
    transition: "margin-top 200ms ease, row-gap 200ms ease",
    selectors: {
      // Room above each row for the notes Squint pins to the buttons.
      [`&${SQUINT}`]: {
        marginTop: "36px",
        rowGap: "38px",
      },
    },
    "@media": {
      [PHONE]: {
        gap: "6px",
        selectors: {
          [`&${SQUINT}`]: {
            rowGap: "38px",
          },
        },
      },
      [REDUCE]: {
        transition: "none",
      },
    },
  }),
  squinted: style({
    transition: "filter 200ms ease",
    selectors: {
      [`&${SQUINT}`]: {
        filter: "blur(5px)",
      },
    },
    "@media": {
      [REDUCE]: {
        transition: "none",
      },
    },
  }),
  pin: style({
    position: "relative",
    display: "flex",
    flexShrink: 0,
    "@media": {
      [PHONE]: {
        flexGrow: 1,
      },
    },
  }),
  squintNote: style({
    position: "absolute",
    bottom: "calc(100% + 2px)",
    left: "50%",
    display: "grid",
    justifyItems: "center",
    gap: "2px",
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    whiteSpace: "nowrap",
    color: NOTE_INK,
    textShadow: `0 0 3px ${palette["--panel"]}, 0 0 3px ${palette["--panel"]}`,
    pointerEvents: "none",
    visibility: "hidden",
    opacity: 0,
    transform: "translate(-50%, 4px)",
    transition: "opacity 200ms ease, transform 200ms ease, visibility 0s 200ms",
    selectors: {
      [`&${SQUINT}`]: {
        // Inherit, so a note in the hidden pane stays hidden with it.
        visibility: "inherit",
        opacity: 1,
        transform: "translate(-50%, 0)",
        transition: "opacity 220ms ease 120ms, transform 220ms ease 120ms",
      },
    },
    "@media": {
      [REDUCE]: {
        transition: "none",
        selectors: {
          [`&${SQUINT}`]: {
            transition: "none",
          },
        },
      },
    },
  }),
  squintArrow: style({
    width: "14px",
    height: "22px",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeDasharray: 1,
    strokeDashoffset: 1,
    transition: "stroke-dashoffset 0s 200ms",
    selectors: {
      [`&${SQUINT}`]: {
        strokeDashoffset: 0,
        transition: "stroke-dashoffset 500ms ease 220ms",
      },
      // The middle arrow bends the other way, so the three read as drawn by hand.
      [`:nth-child(2) > * > &`]: {
        scale: "-1 1",
      },
    },
    "@media": {
      [REDUCE]: {
        strokeDashoffset: 0,
        transition: "none",
      },
    },
  }),
  squintSay: style({
    display: "none",
    maxWidth: "min(100%, 380px)",
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.45,
    textAlign: "center",
    textWrap: "pretty",
    color: palette["--mute"],
    selectors: {
      [`&${SQUINT}`]: {
        display: "block",
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
  // The same dimension line turned upright, measuring the top padding beside the key.
  dimTop: style({
    position: "absolute",
    top: 0,
    left: "calc(100% + 8px)",
    display: "flex",
    alignItems: "center",
    height: "var(--pv, 11px)",
    paddingLeft: "11px",
    fontWeight: 500,
    fontSize: "10px",
    lineHeight: 1,
    fontFamily: fonts["--mono"],
    color: palette["--focus"],
    pointerEvents: "none",
    userSelect: "none",
    backgroundImage:
      "linear-gradient(currentcolor, currentcolor), linear-gradient(currentcolor, currentcolor), linear-gradient(currentcolor, currentcolor)",
    backgroundPosition: "left top, left bottom, 3px 0",
    backgroundRepeat: "no-repeat",
    backgroundSize: "7px 1px, 7px 1px, 1px 100%",
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
        backgroundImage: HATCH,
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
        backgroundImage: HATCH,
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
  // An icon with no label: its padding sets the height too, so all four sides can match.
  iconOnly: style({
    height: "auto",
    paddingBlock: "var(--pv, 11px)",
  }),
  square: style({
    vars: {
      "--pl": "11px",
      "--pr": "11px",
    },
  }),
  tall: style({
    vars: {
      "--pv": "16px",
    },
  }),
  short: style({
    vars: {
      "--pv": "8px",
      "--pl": "8px",
      "--pr": "8px",
    },
  }),
  // Hatches the padding on all four sides: a hatched layer with the content box cut out.
  ring: style({
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        padding: "inherit",
        borderRadius: "inherit",
        backgroundImage: HATCH,
        maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
        maskClip: "content-box, border-box",
        maskComposite: "exclude",
        opacity: 0,
        transition: "opacity 150ms ease",
        pointerEvents: "none",
      },
      [`&${RING}::before`]: {
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
  end: style({
    justifyContent: "flex-end",
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
  // A button with a drawn cursor resting on its right half.
  hovered: style({
    position: "relative",
    display: "inline-flex",
  }),
  // A hover held still for a picture: stronger than the live one, which motion makes easy to see.
  lit: style({
    backgroundColor: `color-mix(in oklab, ${palette["--soft-key"]} 80%, ${palette["--text"]})`,
  }),
  cursor: style({
    position: "absolute",
    left: "62%",
    top: "52%",
    width: "22px",
    height: "22px",
    pointerEvents: "none",
    filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.35))",
  }),
  ruled: style({
    display: "inline-grid",
    paddingBottom: "26px",
  }),
};
