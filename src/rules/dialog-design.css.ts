import { drop } from "../bevel";
import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1, under2 } from "../layers.css";
const PHONE = "(max-width: 640px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";
const LIGHT = ":is(.light *)";

const ringIn = keyframes({
  from: { opacity: 0, transform: "scale(1.12)" },
});

export const styles = {
  stage: style({
    display: "grid",
    gap: "12px",
    alignContent: "start",
  }),
  screen: style({
    position: "relative",
    isolation: "isolate",
    overflow: "hidden",
    height: "260px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    fontWeight: 500,
    fontSize: "13px",
    lineHeight: 1.35,
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  }),
  page: style({
    display: "grid",
    gap: "12px",
    alignContent: "start",
    height: "100%",
    paddingBlock: "14px",
    paddingInline: "14px",
    "@media": {
      [PHONE]: {
        paddingBlock: "12px",
        paddingInline: "12px",
      },
    },
  }),
  checkout: style({
    gridTemplateRows: "auto auto 1fr",
  }),
  spread: style({
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  spreadInCard: style({
    alignItems: "center",
    justifyContent: "space-between",
  }),
  logo: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    backgroundColor: "var(--c)",
  }),
  ghost: style({
    display: "block",
    width: "var(--w, 60%)",
    height: "8px",
    borderRadius: "4px",
    backgroundColor: `color-mix(in srgb, ${palette["--text"]} 12%, transparent)`,
  }),
  card: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gap: "10px",
        paddingBlock: "12px",
        paddingInline: "12px",
        borderRadius: "10px",
        backgroundColor: palette["--panel-2"],
      },
    },
  }),
  gone: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 14%, ${palette["--panel-2"]})`,
  }),
  strong: style({
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  }),
  goneName: style({
    color: palette["--no-ink"],
  }),
  price: style({
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
  }),
  row: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  }),
  pay: style({
    alignSelf: "end",
    justifyContent: "flex-end",
  }),
  link: style({
    justifySelf: "start",
    marginBlock: "-4px",
    marginInline: "-6px",
    paddingBlock: "6px",
    paddingInline: "6px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundImage: "none",
    backgroundPosition: "0px 0px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    textDecorationLine: "underline",
    textUnderlineOffset: "3px",
    color: palette["--dim"],
    cursor: cursors["--cursor-point"],
  }),
  pill: style({
    height: "26px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "13px",
    backgroundColor: "color-mix(in srgb, var(--c) 18%, transparent)",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--c-ink)",
    cursor: cursors["--cursor-point"],
  }),
  mail: style({
    display: "flex",
    gap: "10px",
    alignItems: "center",
    height: "22px",
  }),
  dot: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--c)",
  }),
  tag: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "30px",
    height: "14px",
    borderRadius: "7px",
    backgroundColor: "color-mix(in srgb, var(--c) 30%, transparent)",
  }),
  project: style({
    display: "grid",
    gap: "2px",
    minWidth: 0,
  }),
  meta: style({
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  }),
  article: style({
    "@layer": {
      [under1]: {
        overflowY: "auto",
        overscrollBehavior: "contain",
        scrollbarGutter: "stable",
        scrollbarWidth: "thin",
      },
    },
  }),
  locked: style({
    overflowY: "hidden",
  }),
  para: style({
    display: "grid",
    gap: "7px",
  }),
  figure: style({
    height: "64px",
    marginBottom: "4px",
    borderRadius: "8px",
    backgroundColor: `color-mix(in srgb, var(--c) 16%, ${palette["--panel-2"]})`,
  }),
  scrim: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        zIndex: 2,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgb(6 6 10 / 0.55)",
        opacity: 0,
        pointerEvents: "none",
        transition: `opacity 180ms ${motion["--out"]}`,
        selectors: {
          [`&${LIGHT}`]: {
            backgroundColor: "rgb(20 20 30 / 0.32)",
          },
        },
      },
    },
  }),
  scrimTop: style({
    zIndex: 5,
  }),
  scrimOn: style({
    opacity: 1,
    pointerEvents: "auto",
  }),
  dialog: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        zIndex: 4,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: "grid",
        gap: "10px",
        width: "min(300px, 100% - 24px)",
        height: "fit-content",
        marginBlock: "auto",
        marginInline: "auto",
        paddingBlock: "14px",
        paddingInline: "14px",
        borderRadius: "14px",
        backgroundColor: palette["--panel"],
        boxShadow: `0 0 0 1px ${palette["--hair"]}, 0 14px 32px rgb(0 0 0 / 0.35)`,
        opacity: 0,
        visibility: "hidden",
        transform: "translateY(8px) scale(0.97)",
        transition: "opacity 140ms ease, transform 140ms ease, visibility 0s 140ms",
        "@media": {
          [PHONE]: {
            paddingBlock: "12px",
            paddingInline: "12px",
          },
          [REDUCE]: {
            transform: "none",
          },
        },
      },
    },
  }),
  dialogTop: style({
    zIndex: 6,
    width: "min(270px, 100% - 40px)",
  }),
  dialogOpen: style({
    opacity: 1,
    // inherit, not visible: on a phone the hidden pane must keep its open dialog hidden too.
    visibility: "inherit",
    transform: "none",
    transition: `opacity 200ms ${motion["--out"]}, transform 240ms ${motion["--out"]}, visibility 0s`,
  }),
  head: style({
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "28px",
  }),
  title: style({
    textWrap: "pretty",
    marginBlock: 0,
    marginInline: 0,
    fontWeight: 700,
    fontSize: "15px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  }),
  body: style({
    textWrap: "pretty",
    marginTop: "-4px",
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    fontSize: "12.5px",
    lineHeight: 1.45,
    color: palette["--dim"],
  }),
  field: style({
    display: "grid",
    gap: "5px",
    selectors: {
      "&:focus-visible": {
        outline: "none",
      },
    },
  }),
  label: style({
    fontWeight: 600,
    fontSize: "11.5px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
  }),
  inputWrap: style({
    position: "relative",
    display: "block",
  }),
  input: style({
    "@layer": {
      [under1]: {
        width: "100%",
        height: "34px",
        paddingBlock: 0,
        paddingInline: "10px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: palette["--hair"],
        borderRadius: "8px",
        backgroundColor: palette["--bg"],
        fontWeight: 500,
        // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
        fontSize: "13px",
        lineHeight: "normal",
        fontFamily: fonts["--sans"],
        color: palette["--text"],
        selectors: {
          "&::placeholder": {
            color: palette["--mute"],
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
  acts: style({
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
  }),
  share: style({
    display: "flex",
    gap: "8px",
    alignItems: "center",
  }),
  url: style({
    overflow: "hidden",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    height: "32px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderRadius: "8px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "32px",
    fontFamily: fonts["--mono"],
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: palette["--dim"],
  }),
  btn: style({
    "@layer": {
      [under2]: {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "auto",
        height: "32px",
        paddingBlock: 0,
        paddingInline: "12px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "9px",
        backgroundColor: "var(--c)",
        fontWeight: 700,
        fontSize: "12px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        whiteSpace: "nowrap",
        color: "var(--on-c)",
        cursor: cursors["--cursor-point"],
      },
    },
  }),
  soft: style({
    "@layer": {
      [under1]: {
        backgroundColor: palette["--panel"],
        boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
        color: palette["--text"],
        selectors: {
          "&:active": {
            backgroundColor: palette["--soft-hover"],
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                backgroundColor: palette["--soft-hover"],
              },
            },
          },
        },
      },
    },
  }),
  softInCard: style({
    backgroundColor: palette["--bg"],
    selectors: {
      "&:active": {
        backgroundColor: palette["--soft-hover"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            backgroundColor: palette["--soft-hover"],
          },
        },
      },
    },
  }),
  plain: style({
    "@layer": {
      [under1]: {
        backgroundColor: "transparent",
        backgroundPosition: "0px 0px",
        color: palette["--text"],
        selectors: {
          "&:active": {
            backgroundColor: palette["--soft-hover"],
            backgroundPosition: "initial",
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                backgroundColor: palette["--soft-hover"],
                backgroundPosition: "initial",
              },
            },
          },
        },
      },
    },
  }),
  red: style({
    vars: {
      "--c": palette["--no"],
    },
  }),
  redTint: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  }),
  close: style({
    "@layer": {
      [under1]: {
        display: "grid",
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "auto",
        placeItems: "center",
        width: "28px",
        height: "28px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "8px",
        backgroundColor: "transparent",
        backgroundPosition: "0px 0px",
        color: palette["--dim"],
        cursor: cursors["--cursor-point"],
        selectors: {
          "&:active": {
            backgroundColor: palette["--soft-hover"],
            backgroundPosition: "initial",
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                backgroundColor: palette["--soft-hover"],
                backgroundPosition: "initial",
              },
            },
          },
        },
      },
    },
  }),
  closeIcon: style({
    width: "14px",
    height: "14px",
  }),
  // Every focus stop in the window: the demo draws its own ring, so the browser's stays off.
  stop: style({
    position: "relative",
    selectors: {
      "&:focus-visible": {
        outline: "none",
      },
    },
  }),
  ring: style({
    "@layer": {
      [under1]: {
        selectors: {
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-4px",
            right: "-4px",
            bottom: "-4px",
            left: "-4px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: palette["--focus"],
            borderRadius: "12px",
            pointerEvents: "none",
            animationName: ringIn,
            animationDuration: "220ms",
            animationTimingFunction: motion["--out"],
          },
        },
        "@media": {
          [REDUCE]: {
            selectors: {
              "&::after": {
                animationName: "none",
                animationDuration: "0s",
                animationTimingFunction: "ease",
              },
            },
          },
        },
      },
    },
  }),
  ringBehind: style({
    zIndex: 3,
    selectors: {
      "&::after": {
        borderStyle: "dashed",
        borderColor: palette["--no"],
      },
    },
  }),
  bar: style({
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "34px",
  }),
  keys: style({
    display: "flex",
    gap: "6px",
  }),
  key: style({
    minWidth: "46px",
    height: "30px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "8px",
    backgroundColor: palette["--soft-key"],
    boxShadow: drop(3, palette["--soft-key-drop"]),
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    transition: `transform 120ms ${motion["--out"]}, box-shadow 120ms ${motion["--out"]}`,
    selectors: {
      "&:focus-visible": {
        outlineWidth: "2px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "2px",
      },
      "&:active": {
        boxShadow: drop(1, palette["--soft-key-drop"]),
        transform: "translateY(2px)",
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            backgroundColor: palette["--soft-key-hover"],
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
  }),
  read: style({
    "@layer": {
      [under2]: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "140px",
        fontWeight: 600,
        fontSize: "12px",
        lineHeight: 1.4,
        fontFamily: fonts["--mono"],
        textAlign: "right",
        color: palette["--dim"],
      },
    },
  }),
  readNo: style({
    "@layer": {
      [under1]: {
        color: palette["--no-ink"],
      },
    },
  }),
  readYes: style({
    color: kit["--yes-ink"],
  }),
  speech: style({
    display: "inline-flex",
    gap: "6px",
    alignItems: "baseline",
    textAlign: "left",
  }),
  speaker: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "13px",
    height: "13px",
    translate: "0 2px",
  }),
};

const SCRIM = { default: "rgb(6 6 10 / 0.55)", [LIGHT]: "rgb(20 20 30 / 0.32)" };

export const quiz = {
  screen: style({
    display: "grid",
    overflow: "hidden",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    fontWeight: 500,
    fontSize: "13px",
    lineHeight: 1.35,
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  }),
  tall: style({
    minHeight: "320px",
  }),
  dimmed: style({
    placeItems: "center",
    paddingBlock: "28px",
    paddingInline: "28px",
    backgroundImage: `linear-gradient(${SCRIM.default}, ${SCRIM.default})`,
    selectors: {
      [`&${LIGHT}`]: {
        backgroundImage: `linear-gradient(${SCRIM[LIGHT]}, ${SCRIM[LIGHT]})`,
      },
    },
    "@media": {
      [PHONE]: {
        paddingBlock: "20px",
        paddingInline: "14px",
      },
    },
  }),
  layer: style({
    gridArea: "1 / 1",
  }),
  page: style({
    justifyItems: "stretch",
  }),
  scrim: style({
    zIndex: 1,
    backgroundColor: "rgb(6 6 10 / 0.55)",
    pointerEvents: "none",
    selectors: {
      [`&${LIGHT}`]: {
        backgroundColor: "rgb(20 20 30 / 0.32)",
      },
    },
  }),
  panel: style({
    "@layer": {
      [under1]: {
        zIndex: 2,
        display: "grid",
        gap: "10px",
        width: "min(300px, 100%)",
        paddingBlock: "14px",
        paddingInline: "14px",
        borderRadius: "14px",
        backgroundColor: palette["--panel"],
        boxShadow: `0 0 0 1px ${palette["--hair"]}, 0 14px 32px rgb(0 0 0 / 0.35)`,
        "@media": {
          [PHONE]: {
            paddingBlock: "12px",
            paddingInline: "12px",
          },
        },
      },
    },
  }),
  low: style({
    alignSelf: "end",
    justifySelf: "center",
    width: "min(300px, 100% - 24px)",
    marginBottom: "14px",
  }),
  wrap: style({
    flexWrap: "wrap",
  }),
  nav: style({
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    gap: "6px",
    justifyContent: "flex-end",
    overflow: "hidden",
    minWidth: 0,
  }),
  navLink: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "24px",
    height: "8px",
    borderRadius: "4px",
    backgroundColor: `color-mix(in srgb, ${palette["--text"]} 12%, transparent)`,
  }),
  key: style({
    display: "inline-flex",
    alignItems: "center",
    cursor: "inherit",
  }),
  softInCard: style({
    backgroundColor: palette["--bg"],
  }),
  plain: style({
    backgroundColor: "transparent",
  }),
  close: style({
    backgroundColor: "transparent",
    cursor: "inherit",
  }),
  input: style({
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    fontSize: "13px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    cursor: "inherit",
  }),
  placeholder: style({
    color: palette["--mute"],
  }),
  mini: style({
    position: "relative",
    display: "grid",
    placeItems: "center",
    minHeight: "150px",
    paddingTop: "12px",
    paddingRight: "8px",
    paddingBottom: "34px",
    paddingLeft: "8px",
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
    backgroundImage: `linear-gradient(${SCRIM.default}, ${SCRIM.default})`,
    selectors: {
      [`&${LIGHT}`]: {
        backgroundImage: `linear-gradient(${SCRIM[LIGHT]}, ${SCRIM[LIGHT]})`,
      },
    },
  }),
  miniPanel: style({
    display: "grid",
    gap: "8px",
    width: "100%",
    maxWidth: "220px",
    paddingBlock: "10px",
    paddingInline: "9px",
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}, 0 8px 20px rgb(0 0 0 / 0.3)`,
  }),
  miniHead: style({
    display: "flex",
    gap: "6px",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  }),
  miniTitle: style({
    overflow: "hidden",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  }),
  miniX: style({
    flexShrink: 0,
    width: "11px",
    height: "11px",
    color: palette["--dim"],
  }),
  miniField: style({
    overflow: "hidden",
    height: "24px",
    paddingInline: "7px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "6px",
    backgroundColor: palette["--bg"],
    fontSize: "11px",
    lineHeight: "22px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  }),
  miniFigure: style({
    height: "46px",
    borderRadius: "6px",
    backgroundColor: `color-mix(in srgb, var(--c) 22%, ${palette["--panel-2"]})`,
  }),
  miniActs: style({
    display: "flex",
    gap: "6px",
    justifyContent: "flex-end",
  }),
  miniBtn: style({
    "@layer": {
      [under1]: {
        height: "22px",
        paddingInline: "8px",
        borderRadius: "6px",
        backgroundColor: "var(--c)",
        fontWeight: 700,
        fontSize: "11px",
        lineHeight: "22px",
        fontFamily: fonts["--display"],
        color: "var(--on-c)",
      },
    },
  }),
  miniPlain: style({
    backgroundColor: "transparent",
    color: palette["--text"],
  }),
  click: style({
    position: "absolute",
    bottom: "11px",
    left: "12px",
    display: "inline-flex",
    gap: "7px",
    alignItems: "center",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: "rgb(255 255 255 / 0.85)",
  }),
  clickDot: style({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "rgb(255 255 255 / 0.9)",
    boxShadow: "0 0 0 4px rgb(255 255 255 / 0.25)",
  }),
  layers: style({
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    alignItems: "end",
    paddingBlock: "8px",
    paddingInline: "12px",
    "@media": {
      [PHONE]: {
        gap: "8px",
        paddingInline: "0px",
      },
    },
  }),
  layerCol: style({
    display: "grid",
    gap: "12px",
    justifyItems: "center",
    alignContent: "end",
    minWidth: 0,
  }),
  tilt: style({
    display: "grid",
    width: "100%",
    maxWidth: "150px",
    transform: "perspective(600px) rotateY(28deg)",
  }),
  slab: style({
    "@layer": {
      [under1]: {
        position: "relative",
        display: "grid",
        gap: "6px",
        alignContent: "start",
        aspectRatio: "3 / 4",
        paddingBlock: "10px",
        paddingInline: "10px",
        borderRadius: "8px",
        backgroundColor: palette["--panel-2"],
        boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
        overflow: "hidden",
      },
    },
  }),
  slabScrim: style({
    backgroundColor: "rgb(6 6 10 / 0.55)",
    selectors: {
      [`&${LIGHT}`]: {
        backgroundColor: "rgb(20 20 30 / 0.32)",
      },
    },
  }),
  slabPanel: style({
    aspectRatio: "auto",
    gap: "8px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}, 0 10px 24px rgb(0 0 0 / 0.3)`,
  }),
  slabFigure: style({
    flexShrink: 0,
    height: "28px",
    borderRadius: "5px",
    backgroundColor: `color-mix(in srgb, var(--c) 16%, ${palette["--panel"]})`,
  }),
  thumb: style({
    position: "absolute",
    top: "22%",
    right: "3px",
    width: "4px",
    height: "22%",
    borderRadius: "2px",
    backgroundColor: palette["--mute"],
  }),
  layerName: style({
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: 1.3,
    fontFamily: fonts["--mono"],
    textAlign: "center",
    color: palette["--dim"],
  }),
  transcript: style({
    display: "grid",
    gap: "6px",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  }),
};
