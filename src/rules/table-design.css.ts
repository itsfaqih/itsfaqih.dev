import { drop } from "../bevel";
import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { row, tipped } from "./table-design.markers";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { under1, under2 } from "../layers.css";
import { hoverHold } from "../components/hover-hold.css";
const PHONE = "(max-width: 640px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";

const flash = keyframes({
  to: { opacity: 0 },
});
const beat = keyframes({
  "50%": { opacity: 0.35 },
});
const turn = keyframes({
  to: { transform: "rotate(1turn)" },
});
const pulse = keyframes({
  to: { opacity: 0.45 },
});

export const styles = {
  costs: style({
    alignSelf: "end",
  }),
  card: style({
    display: "grid",
    alignSelf: "start",
    alignContent: "start",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}, ${drop(3, palette["--drop-ink"])}`,
    overflow: "hidden",
  }),
  table: style({
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: "14px",
    lineHeight: "20px",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  }),
  th: style({
    "@layer": {
      [under1]: {
        height: "36px",
        paddingBlock: 0,
        paddingInline: "14px",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: palette["--hair"],
        backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
        fontWeight: 600,
        fontSize: "12px",
        lineHeight: "16px",
        fontFamily: fonts["--sans"],
        color: palette["--mute"],
        textAlign: "left",
        "@media": {
          [PHONE]: {
            paddingInline: "10px",
          },
        },
      },
    },
  }),
  td: style({
    "@layer": {
      [under1]: {
        position: "relative",
        isolation: "isolate",
        height: "40px",
        paddingBlock: 0,
        paddingInline: "14px",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: `color-mix(in srgb, ${palette["--hair"]} 70%, transparent)`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: `background-color ${kit["--t-fb"]} ease`,
        selectors: {
          [`&${when.ancestor(":first-child", row)}`]: {
            borderTopWidth: 0,
            borderTopStyle: "none",
            borderTopColor: "currentcolor",
          },
        },
        "@media": {
          [PHONE]: {
            paddingInline: "10px",
          },
          [HOVER]: {
            selectors: {
              [`&${when.ancestor(":hover", row)}`]: {
                backgroundColor: `color-mix(in srgb, ${palette["--text"]} 3%, transparent)`,
              },
            },
          },
        },
      },
    },
  }),
  still: style({
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${when.ancestor(":hover", row)}`]: {
            backgroundColor: "transparent",
          },
        },
      },
    },
  }),
  editing: style({
    backgroundColor: "color-mix(in srgb, var(--c) 10%, transparent)",
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${when.ancestor(":hover", row)}`]: {
            backgroundColor: `color-mix(in srgb, ${palette["--text"]} 3%, transparent)`,
          },
        },
      },
    },
  }),
  num: style({
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  }),
  ragged: style({
    fontVariantNumeric: "proportional-nums",
  }),
  dim: style({
    color: palette["--dim"],
  }),
  overflowing: style({
    overflow: "visible",
  }),
  colRole: style({
    width: "84px",
    "@media": {
      [PHONE]: {
        width: "70px",
      },
    },
  }),
  colActs: style({
    width: "76px",
  }),
  colMoney: style({
    width: "52%",
  }),
  flash: style({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
    backgroundColor: "color-mix(in srgb, var(--c) 22%, transparent)",
    pointerEvents: "none",
    animationName: flash,
    animationDuration: "1100ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "both",
  }),
  reels: style({
    display: "inline-flex",
    verticalAlign: "top",
  }),
  reel: style({
    display: "inline-block",
    height: "20px",
    overflow: "hidden",
  }),
  strip: style({
    display: "grid",
    transform: "translateY(calc(var(--n) * -20px))",
    transition: `transform 320ms ${motion["--out"]}`,
    "@media": {
      [REDUCE]: {
        transition: "none",
      },
    },
  }),
  digit: style({
    height: "20px",
  }),
  ring: style({
    selectors: {
      "&:focus-visible": {
        outlineWidth: "3px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "2px",
      },
    },
  }),
  live: style({
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    minHeight: "34px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "9px",
    backgroundColor: palette["--soft-key"],
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    transition: `background-color ${kit["--t-fb"]} ease`,
    selectors: {
      "&:active": {
        backgroundColor: palette["--soft-key-hover"],
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
    },
  }),
  liveIcon: style({
    width: "13px",
    height: "13px",
    color: palette["--dim"],
  }),
  dot: style({
    "@layer": {
      [under1]: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: palette["--mute"],
      },
    },
  }),
  dotOn: style({
    backgroundColor: "var(--c)",
    animationName: beat,
    animationDuration: "1600ms",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    "@media": {
      [REDUCE]: {
        animationName: "none",
        animationDuration: "0s",
        animationTimingFunction: "ease",
        animationIterationCount: 1,
      },
    },
  }),
  seg: style({
    display: "inline-flex",
    flexWrap: "wrap",
    gap: "4px",
    paddingBlock: "4px",
    paddingInline: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
    "@media": {
      [PHONE]: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      },
    },
  }),
  segButton: style({
    "@layer": {
      [under1]: {
        minHeight: "34px",
        paddingBlock: 0,
        paddingInline: "12px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "9px",
        backgroundColor: "transparent",
        backgroundPosition: "0px 0px",
        fontWeight: 700,
        fontSize: "13px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        color: palette["--dim"],
        whiteSpace: "nowrap",
        cursor: cursors["--cursor-point"],
        transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease, box-shadow ${kit["--t-fb"]} ease`,
        selectors: {
          "&:active": {
            color: palette["--text"],
          },
        },
        "@media": {
          [PHONE]: {
            paddingInline: "6px",
          },
          [HOVER]: {
            selectors: {
              "&:hover": {
                color: palette["--text"],
              },
            },
          },
        },
      },
    },
  }),
  segOn: style({
    backgroundColor: "var(--c)",
    backgroundPosition: "initial",
    boxShadow: drop(3, "var(--key-c)"),
    color: "var(--on-c)",
  }),
  bar: style({
    display: "flex",
    gap: "8px",
    alignItems: "center",
    paddingBlock: "10px",
    paddingInline: "10px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
  }),
  search: style({
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    gap: "8px",
    alignItems: "center",
    minWidth: 0,
    height: "34px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderRadius: "8px",
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    color: palette["--mute"],
    transition: `box-shadow ${kit["--t-fb"]} ease`,
    selectors: {
      "&:focus-within": {
        boxShadow: "inset 0 0 0 2px var(--c)",
      },
    },
  }),
  searchIcon: style({
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "14px",
    height: "14px",
  }),
  searchInput: style({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    outlineWidth: 0,
    outlineStyle: "none",
    outlineColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundPosition: "0px 0px",
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: "14px",
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
  }),
  blank: style({
    height: "56px",
    color: palette["--mute"],
    textAlign: "center",
    whiteSpace: "normal",
  }),
  said: style({
    display: "grid",
    gap: "4px",
    placeContent: "center",
    justifyItems: "center",
    minHeight: "calc(40px * 4)",
    paddingBlock: "8px",
    paddingInline: 0,
  }),
  saidTitle: style({
    "@layer": {
      [under1]: {
        fontWeight: 700,
        fontSize: "14px",
        lineHeight: "20px",
        fontFamily: fonts["--sans"],
        color: palette["--text"],
      },
    },
  }),
  saidError: style({
    color: palette["--no-ink"],
  }),
  saidHint: style({
    fontSize: "13px",
    lineHeight: "18px",
    color: palette["--dim"],
  }),
  saidButton: style({
    marginTop: "10px",
  }),
  spin: style({
    display: "inline-block",
    width: "18px",
    height: "18px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderTopColor: palette["--dim"],
    borderRadius: "50%",
    verticalAlign: "middle",
    animationName: turn,
    animationDuration: "800ms",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    "@media": {
      [REDUCE]: {
        animationName: "none",
        animationDuration: "0s",
        animationTimingFunction: "ease",
        animationIterationCount: 1,
      },
    },
  }),
  bone: style({
    display: "block",
    width: "var(--w)",
    maxWidth: "100%",
    height: "10px",
    borderRadius: "5px",
    backgroundColor: palette["--panel-2"],
    animationName: pulse,
    animationDuration: "1200ms",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    "@media": {
      [REDUCE]: {
        animationName: "none",
        animationDuration: "0s",
        animationTimingFunction: "ease",
        animationIterationCount: 1,
        animationDirection: "normal",
      },
    },
  }),
  btn: style([
    hoverHold.lift,
    {
      "@layer": {
        [under1]: {
          display: "inline-flex",
          gap: "6px",
          alignItems: "center",
          height: "32px",
          paddingBlock: 0,
          paddingInline: "12px",
          borderWidth: 0,
          borderStyle: "none",
          borderColor: "currentcolor",
          borderRadius: "8px",
          backgroundColor: palette["--soft-key"],
          boxShadow: drop(3, palette["--soft-key-drop"]),
          fontWeight: 700,
          fontSize: "12px",
          lineHeight: "normal",
          fontFamily: fonts["--display"],
          color: palette["--text"],
          cursor: cursors["--cursor-point"],
          transition: `transform 150ms ${motion["--out"]}, box-shadow 150ms ease, background-color ${kit["--t-fb"]} ease`,
          selectors: {
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
          },
        },
      },
    },
  ]),
  go: style({
    backgroundColor: "var(--c)",
    boxShadow: drop(3, "var(--key-c)"),
    color: "var(--on-c)",
    selectors: {
      "&:active": {
        boxShadow: drop(1, "var(--key-c)"),
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            filter: "brightness(1.06)",
          },
        },
      },
    },
  }),
  btnIcon: style({
    width: "14px",
    height: "14px",
  }),
  icons: style({
    display: "inline-flex",
    gap: "2px",
    verticalAlign: "middle",
  }),
  tipped: style({
    position: "relative",
    display: "inline-flex",
  }),
  icon: style({
    "@layer": {
      [under2]: {
        display: "grid",
        placeItems: "center",
        width: "30px",
        height: "30px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "8px",
        backgroundColor: "transparent",
        backgroundPosition: "0px 0px",
        color: palette["--dim"],
        cursor: cursors["--cursor-point"],
        transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease`,
        selectors: {
          '&:disabled, &[aria-disabled="true"]': {
            opacity: 0.4,
            cursor: cursors["--cursor-forbid"],
          },
          '&:active:enabled:not([aria-disabled="true"])': {
            backgroundColor: "color-mix(in srgb, var(--c) 16%, transparent)",
            backgroundPosition: "initial",
            color: "var(--c-ink)",
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              '&:hover:enabled:not([aria-disabled="true"])': {
                backgroundColor: "color-mix(in srgb, var(--c) 16%, transparent)",
                backgroundPosition: "initial",
                color: "var(--c-ink)",
              },
            },
          },
        },
      },
    },
  }),
  iconPressed: style({
    backgroundColor: "color-mix(in srgb, var(--c) 16%, transparent)",
    backgroundPosition: "initial",
    color: "var(--c-ink)",
  }),
  iconDanger: style({
    "@layer": {
      [under1]: {
        backgroundColor: "transparent",
        color: palette["--dim"],
        selectors: {
          "&:active": {
            backgroundColor: `color-mix(in srgb, ${palette["--no"]} 14%, transparent)`,
            color: palette["--no-ink"],
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                backgroundColor: `color-mix(in srgb, ${palette["--no"]} 14%, transparent)`,
                color: palette["--no-ink"],
              },
            },
          },
        },
      },
    },
  }),
  iconGlyph: style({
    width: "16px",
    height: "16px",
  }),
  tip: style({
    position: "absolute",
    top: "50%",
    right: "calc(100% + 6px)",
    zIndex: 2,
    paddingBlock: "3px",
    paddingInline: "8px",
    borderRadius: "6px",
    backgroundColor: palette["--text"],
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "16px",
    fontFamily: fonts["--sans"],
    fontVariantNumeric: "normal",
    color: palette["--bg"],
    whiteSpace: "nowrap",
    opacity: 0,
    translate: "4px -50%",
    pointerEvents: "none",
    transition: `opacity 120ms ease, translate 160ms ${motion["--out"]}`,
    selectors: {
      [`&${when.ancestor(":is(:hover, :has(:focus-visible))", tipped)}`]: {
        opacity: 1,
        translate: "0 -50%",
      },
    },
    "@media": {
      [REDUCE]: {
        translate: "0 -50%",
      },
    },
  }),
  inline: style({
    display: "inline-flex",
    gap: "2px",
    marginLeft: "6px",
    verticalAlign: "middle",
    opacity: 0,
    transition: "opacity 120ms ease",
    selectors: {
      [`&${when.ancestor(":is(:hover, :focus-within)", row)}`]: {
        opacity: 1,
      },
    },
  }),
  inlineButton: style({
    "@layer": {
      [under1]: {
        paddingBlock: "2px",
        paddingInline: "6px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "6px",
        backgroundColor: "transparent",
        backgroundPosition: "0px 0px",
        fontWeight: 600,
        fontSize: "12px",
        lineHeight: "18px",
        fontFamily: fonts["--sans"],
        color: "var(--c-ink)",
        cursor: cursors["--cursor-point"],
        selectors: {
          "&:active": {
            backgroundColor: palette["--panel-2"],
            backgroundPosition: "initial",
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover": {
                backgroundColor: palette["--panel-2"],
                backgroundPosition: "initial",
              },
            },
          },
        },
      },
    },
  }),
  inlineDelete: style({
    color: palette["--no-ink"],
  }),
  foot: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "40px",
    paddingTop: 0,
    paddingRight: "8px",
    paddingBottom: 0,
    paddingLeft: "14px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
  }),
  link: style({
    paddingBlock: "4px",
    paddingInline: "8px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "6px",
    backgroundColor: "transparent",
    backgroundPosition: "0px 0px",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: "var(--c-ink)",
    cursor: cursors["--cursor-point"],
    selectors: {
      "&:active": {
        backgroundColor: palette["--panel-2"],
        backgroundPosition: "initial",
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            backgroundColor: palette["--panel-2"],
            backgroundPosition: "initial",
          },
        },
      },
    },
  }),
  pager: style({
    display: "flex",
    gap: "8px",
    justifyContent: "space-between",
    alignItems: "center",
    height: "48px",
    paddingTop: 0,
    paddingRight: "8px",
    paddingBottom: 0,
    paddingLeft: "14px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
    whiteSpace: "nowrap",
  }),
  pages: style({
    display: "flex",
    gap: "2px",
  }),
  page: style({
    "@layer": {
      [under1]: {
        display: "grid",
        placeItems: "center",
        minWidth: "30px",
        height: "30px",
        paddingBlock: 0,
        paddingInline: "6px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "8px",
        backgroundColor: "transparent",
        backgroundPosition: "0px 0px",
        fontWeight: 600,
        fontSize: "12px",
        lineHeight: "normal",
        fontFamily: fonts["--sans"],
        fontVariantNumeric: "tabular-nums",
        color: palette["--dim"],
        cursor: cursors["--cursor-point"],
        transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease`,
        selectors: {
          "&:disabled": {
            opacity: 0.35,
            cursor: cursors["--cursor-forbid"],
          },
          "&:active:enabled": {
            backgroundColor: palette["--panel-2"],
            backgroundPosition: "initial",
            color: palette["--text"],
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              "&:hover:enabled": {
                backgroundColor: palette["--panel-2"],
                backgroundPosition: "initial",
                color: palette["--text"],
              },
            },
          },
        },
      },
    },
  }),
  pageOn: style({
    backgroundColor: "var(--c)",
    backgroundPosition: "initial",
    color: "var(--on-c)",
    selectors: {
      "&:active:enabled": {
        backgroundColor: palette["--panel-2"],
        color: palette["--text"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover:enabled": {
            backgroundColor: palette["--panel-2"],
            color: palette["--text"],
          },
        },
      },
    },
  }),
  pageIcon: style({
    width: "12px",
    height: "12px",
  }),
  address: style({
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    alignItems: "center",
    minWidth: 0,
    height: "30px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderRadius: "15px",
    backgroundColor: palette["--panel-2"],
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    whiteSpace: "nowrap",
    overflow: "hidden",
  }),
  host: style({
    color: palette["--mute"],
  }),
  query: style({
    fontWeight: 600,
    color: "var(--c-ink)",
  }),
  body: style({
    transition: "opacity 120ms ease",
  }),
  reloading: style({
    opacity: 0.3,
  }),
  note: style({
    textWrap: "pretty",
    paddingTop: "10px",
    paddingRight: "14px",
    paddingBottom: "12px",
    paddingLeft: "14px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    fontSize: "12px",
    lineHeight: "18px",
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
  }),
};

export const quiz = {
  sheet: style({
    "@layer": {
      [under1]: {
        display: "grid",
        alignContent: "start",
        overflow: "hidden",
        borderRadius: "10px",
        backgroundColor: palette["--panel"],
        boxShadow: `0 0 0 1px ${palette["--hair"]}`,
        fontSize: "12px",
        lineHeight: "16px",
        fontFamily: fonts["--sans"],
        color: palette["--text"],
      },
    },
  }),
  people: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
  }),
  money: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
  }),
  th: style({
    display: "flex",
    alignItems: "center",
    height: "28px",
    paddingInline: "10px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
    fontWeight: 600,
    fontSize: "11px",
    color: palette["--mute"],
  }),
  td: style({
    "@layer": {
      [under1]: {
        display: "flex",
        alignItems: "center",
        minWidth: 0,
        height: "30px",
        paddingInline: "10px",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: `color-mix(in srgb, ${palette["--hair"]} 70%, transparent)`,
        whiteSpace: "nowrap",
        overflow: "hidden",
      },
    },
  }),
  top: style({
    borderTopWidth: 0,
  }),
  left: style({
    justifyContent: "flex-start",
    fontVariantNumeric: "proportional-nums",
  }),
  center: style({
    justifyContent: "center",
    fontVariantNumeric: "proportional-nums",
  }),
  right: style({
    justifyContent: "flex-end",
    fontVariantNumeric: "tabular-nums",
  }),
  dim: style({
    color: palette["--dim"],
  }),
  clip: style({
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  more: style({
    color: palette["--mute"],
    fontSize: "11px",
  }),
  bar: style({
    display: "flex",
    alignItems: "center",
    paddingBlock: "6px",
    paddingInline: "6px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
  }),
  search: style({
    display: "flex",
    flexGrow: 1,
    gap: "6px",
    alignItems: "center",
    minWidth: 0,
    height: "24px",
    paddingInline: "8px",
    borderRadius: "6px",
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    color: palette["--mute"],
    fontSize: "11px",
    whiteSpace: "nowrap",
  }),
  typed: style({
    color: palette["--text"],
  }),
  glyph: style({
    flexShrink: 0,
    width: "12px",
    height: "12px",
  }),
  said: style({
    display: "grid",
    gap: "3px",
    justifyItems: "center",
    alignContent: "center",
    minHeight: "120px",
    paddingBlock: "12px",
    paddingInline: "10px",
    textAlign: "center",
    textWrap: "balance",
  }),
  saidTitle: style({
    fontWeight: 700,
    fontSize: "12px",
  }),
  saidHint: style({
    fontSize: "11px",
    lineHeight: "15px",
    color: palette["--dim"],
  }),
  error: style({
    color: palette["--no-ink"],
  }),
  key: style({
    display: "inline-flex",
    alignItems: "center",
    height: "24px",
    marginTop: "8px",
    paddingInline: "10px",
    borderRadius: "7px",
    backgroundColor: "var(--c)",
    boxShadow: drop(2, "var(--key-c)"),
    fontWeight: 700,
    fontSize: "11px",
    fontFamily: fonts["--display"],
    color: "var(--on-c)",
    whiteSpace: "nowrap",
  }),
  ghostPager: style({
    display: "flex",
    gap: "6px",
    justifyContent: "flex-end",
    alignItems: "center",
    height: "26px",
    marginBlock: "6px",
    marginInline: "6px",
    paddingInline: "8px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "7px",
    color: palette["--mute"],
  }),
  ghostPage: style({
    display: "grid",
    placeItems: "center",
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    backgroundColor: palette["--panel-2"],
  }),
  screen: style({
    overflow: "hidden",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}, ${drop(3, palette["--drop-ink"])}`,
    fontSize: "13px",
    lineHeight: "18px",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  }),
  row: style({
    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto",
    alignItems: "stretch",
    "@media": {
      [PHONE]: {
        gridTemplateColumns: "auto 1fr auto",
      },
    },
  }),
  roomy: style({
    display: "flex",
    "@media": {
      [PHONE]: {
        display: "none",
      },
    },
  }),
  head: style({
    "@layer": {
      [under1]: {
        display: "flex",
        alignItems: "center",
        height: "34px",
        paddingInline: "12px",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: palette["--hair"],
        backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
        fontWeight: 600,
        fontSize: "12px",
        color: palette["--mute"],
        "@media": {
          [PHONE]: {
            paddingInline: "8px",
          },
        },
      },
    },
  }),
  cell: style({
    "@layer": {
      [under1]: {
        display: "flex",
        gap: "6px",
        alignItems: "center",
        minWidth: 0,
        minHeight: "52px",
        paddingInline: "12px",
        whiteSpace: "nowrap",
        "@media": {
          [PHONE]: {
            paddingInline: "6px",
          },
        },
      },
    },
  }),
  ghostKeys: style({
    display: "inline-flex",
    gap: "4px",
    paddingBlock: "4px",
    paddingInline: "4px",
    color: palette["--mute"],
  }),
  ghostKey: style({
    width: "14px",
    height: "14px",
  }),
  chrome: style({
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    gap: "8px",
    alignItems: "center",
    paddingBlock: "8px",
    paddingInline: "8px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
  }),
  reload: style({
    display: "grid",
    placeItems: "center",
    width: "28px",
    height: "28px",
    color: palette["--dim"],
  }),
  address: style({
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    height: "28px",
    paddingInline: "12px",
    borderRadius: "14px",
    backgroundColor: palette["--panel-2"],
    fontSize: "12px",
    fontFamily: fonts["--mono"],
    whiteSpace: "nowrap",
    overflow: "hidden",
  }),
  host: style({
    color: palette["--mute"],
  }),
  page: style({
    display: "grid",
    paddingBlock: "8px",
    paddingInline: "8px",
  }),
  pager: style({
    display: "flex",
    gap: "8px",
    justifyContent: "space-between",
    alignItems: "center",
    height: "36px",
    paddingInline: "10px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    fontSize: "11px",
    color: palette["--mute"],
    whiteSpace: "nowrap",
  }),
  pages: style({
    display: "flex",
    gap: "2px",
  }),
  pageKey: style({
    "@layer": {
      [under1]: {
        display: "grid",
        placeItems: "center",
        minWidth: "22px",
        height: "22px",
        borderRadius: "6px",
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        color: palette["--dim"],
      },
    },
  }),
  pageOn: style({
    backgroundColor: "var(--c)",
    color: "var(--on-c)",
  }),
  drawer: style({
    display: "grid",
    paddingBlock: "8px",
    paddingInline: "8px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 40%, transparent)`,
  }),
  drawerTitle: style({
    paddingTop: "2px",
    paddingInline: "4px",
    paddingBottom: "6px",
    fontWeight: 600,
    fontSize: "11px",
    color: palette["--mute"],
  }),
  store: style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
    fontSize: "11px",
    fontFamily: fonts["--mono"],
  }),
};
