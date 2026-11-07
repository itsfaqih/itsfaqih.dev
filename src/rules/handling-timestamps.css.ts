import { drop } from "../bevel";
import { fonts, palette } from "../theme.vars.css";
import { kit } from "./rule-landing.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
import { under1 } from "../layers.css";
import { HOVER, TOUCH } from "../browser/media-query";
const PHONE = "(max-width: 640px)";
const LIGHT = ":is(.light *)";

export const styles = {
  view: style({
    display: "grid",
    gap: "14px",
    alignContent: "start",
  }),
  costs: style({
    alignContent: "end",
  }),
  wire: style({
    display: "grid",
    gap: "2px",
    fontSize: "12.5px",
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
    "@media": {
      [PHONE]: {
        fontSize: "12px",
      },
    },
  }),
  line: style({
    "@layer": {
      [under1]: {
        minHeight: "24px",
        paddingBlock: "2px",
        paddingInline: "8px",
        borderRadius: "6px",
        color: palette["--text"],
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      },
    },
  }),
  note: style({
    color: palette["--mute"],
  }),
  hot: style({
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    selectors: {
      [`&${when.ancestor('[data-side="bad"]')}`]: {
        backgroundColor: `color-mix(in srgb, ${palette["--no"]} 10%, transparent)`,
        boxShadow: `inset 2px 0 0 ${palette["--no"]}`,
      },
      [`&${when.ancestor('[data-side="good"]')}`]: {
        backgroundColor: "color-mix(in srgb, var(--c) 10%, transparent)",
        boxShadow: "inset 2px 0 0 var(--c)",
      },
    },
  }),
  str: style({
    display: "inline-block",
    maxWidth: "100%",
    color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)`,
    selectors: {
      [`&${when.ancestor("[data-note]")}`]: {
        color: "inherit",
      },
    },
  }),
  readers: style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "10px",
    "@media": {
      [PHONE]: {
        gridTemplateColumns: "minmax(0, 1fr)",
      },
    },
  }),
  reader: style({
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    rowGap: "4px",
    columnGap: "12px",
    alignItems: "center",
    paddingBlock: "12px",
    paddingInline: "12px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: drop(2, palette["--drop-ink"]),
  }),
  read: style({
    display: "grid",
    minWidth: 0,
  }),
  who: style({
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  }),
  time: style({
    "@layer": {
      [under1]: {
        fontWeight: 700,
        fontSize: "20px",
        lineHeight: 1.25,
        fontFamily: fonts["--mono"],
        letterSpacing: "-0.02em",
        color: palette["--text"],
        "@media": {
          [PHONE]: {
            fontSize: "18px",
          },
        },
      },
    },
  }),
  date: style({
    fontSize: "13px",
    color: palette["--dim"],
  }),
  should: style({
    marginTop: "2px",
    fontSize: "12.5px",
    fontWeight: 600,
    color: kit["--yes-ink"],
  }),
  off: style({
    color: palette["--no-ink"],
  }),
  clock: style({
    position: "relative",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: kit["--code-bg"],
    boxShadow: `inset 0 0 0 1.5px ${palette["--hair"]}`,
    selectors: {
      "&::before": {
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
      "&::after": {
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
  }),
  hand: style({
    "@layer": {
      [under1]: {
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
    },
  }),
  minuteHand: style({
    left: "calc(50% - 1px)",
    width: "2px",
    height: "19px",
    backgroundColor: palette["--dim"],
  }),
  hourOff: style({
    backgroundColor: palette["--no-ink"],
  }),
  ghost: style({
    backgroundColor: kit["--yes-ink"],
    opacity: 0.5,
  }),
  table: style({
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12.5px",
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
    "@media": {
      [PHONE]: {
        fontSize: "12px",
      },
    },
  }),
  th: style({
    "@layer": {
      [under1]: {
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
    },
  }),
  td: style({
    "@layer": {
      [under1]: {
        paddingBlock: "8px",
        paddingInline: "8px",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: `color-mix(in srgb, ${palette["--hair"]} 60%, transparent)`,
        color: palette["--text"],
      },
    },
  }),
  at: style({
    whiteSpace: "nowrap",
    color: palette["--text"],
    selectors: {
      [`&${when.ancestor('[data-side="bad"]')}`]: {
        color: palette["--no-ink"],
      },
    },
  }),
  sum: style({
    textWrap: "pretty",
    fontSize: "14px",
    color: palette["--dim"],
  }),
  form: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  }),
  formHead: style({
    flexBasis: "100%",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  }),
  input: style({
    minHeight: "38px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    fontStyle: "normal",
    fontWeight: 600,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    colorScheme: "dark",
    transition: `border-color ${kit["--t-fb"]} ease`,
    selectors: {
      "&:focus-visible": {
        borderColor: "var(--c-ink)",
        outlineWidth: "2px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "2px",
      },
      [`&${LIGHT}`]: {
        colorScheme: "light",
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            borderColor: palette["--hair-hover"],
          },
        },
      },
      [TOUCH]: {
        fontSize: "16px",
      },
    },
  }),
  orders: style({
    display: "grid",
    gap: "4px",
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  }),
  order: style({
    "@layer": {
      [under1]: {
        textWrap: "pretty",
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        gap: "10px",
        alignItems: "center",
        minHeight: "40px",
        paddingBlock: "4px",
        paddingInline: "10px",
        borderRadius: "8px",
        fontSize: "12.5px",
        lineHeight: 1.3,
        fontFamily: fonts["--mono"],
        color: palette["--text"],
        transition: `opacity ${kit["--t-fb"]} ease, background-color ${kit["--t-fb"]} ease`,
        "@media": {
          [PHONE]: {
            fontSize: "12px",
          },
        },
      },
    },
  }),
  orderOut: style({
    opacity: 0.45,
  }),
  orderShown: style({
    backgroundColor: "color-mix(in srgb, var(--c) 8%, transparent)",
  }),
  orderWrong: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 8%, transparent)`,
    boxShadow: `inset 2px 0 0 ${palette["--no"]}`,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  }),
  orderId: style({
    color: palette["--mute"],
  }),
  when: style({
    display: "grid",
  }),
  whenMissed: style({
    textDecorationLine: "line-through",
    textDecorationColor: `color-mix(in srgb, ${palette["--no"]} 60%, transparent)`,
  }),
  utc: style({
    fontSize: "11px",
    color: palette["--mute"],
  }),
  fate: style({
    paddingBlock: "2px",
    paddingInline: "7px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    whiteSpace: "nowrap",
  }),
  fateShown: style({
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  }),
  fateWrong: style({
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 16%, transparent)`,
    color: palette["--no-ink"],
  }),
};

export const quiz = {
  table: style({
    display: "grid",
    gridTemplateColumns: "max-content max-content minmax(0, 1fr)",
    fontSize: "12.5px",
    lineHeight: "18px",
    fontFamily: fonts["--mono"],
    "@media": {
      [PHONE]: {
        fontSize: "12px",
      },
    },
  }),
  cell: style({
    paddingBlock: "6px",
    whiteSpace: "nowrap",
  }),
  head: style({
    borderBottomWidth: "1px",
    lineHeight: "16px",
  }),
  line: style({
    display: "block",
  }),
  str: style({
    display: "inline-block",
    whiteSpace: "nowrap",
    color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)`,
  }),
  screen: style({
    display: "grid",
    gap: "6px",
    paddingBlock: "18px",
    paddingInline: "16px",
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
    "@media": {
      [PHONE]: {
        paddingInline: "12px",
      },
    },
  }),
  rule: style({
    paddingInline: "4.5px",
  }),
  lane: style({
    display: "grid",
    gridTemplateColumns: "118px minmax(0, 1fr)",
    gap: "10px",
    alignItems: "center",
    "@media": {
      [PHONE]: {
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "4px",
      },
    },
  }),
  who: style({
    display: "grid",
    paddingInline: 0,
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "15px",
    fontFamily: fonts["--display"],
    color: palette["--text"],
    whiteSpace: "nowrap",
    "@media": {
      [PHONE]: {
        paddingInline: "2px",
      },
    },
  }),
  where: style({
    fontWeight: 600,
    fontSize: "11px",
    color: palette["--dim"],
  }),
  axisWho: style({
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "16px",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
    "@media": {
      [PHONE]: {
        display: "none",
      },
    },
  }),
  track: style({
    position: "relative",
    display: "block",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: kit["--code-bg"],
    backgroundImage: `linear-gradient(90deg, transparent calc(25% - 0.5px), ${palette["--hair"]} calc(25% - 0.5px) calc(25% + 0.5px), transparent calc(25% + 0.5px) calc(75% - 0.5px), ${palette["--hair"]} calc(75% - 0.5px) calc(75% + 0.5px), transparent calc(75% + 0.5px))`,
  }),
  ticks: style({
    position: "relative",
    display: "block",
    height: "16px",
  }),
  tick: style({
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
  }),
  day: style({
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
  }),
  mark: style({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "calc(var(--at) - 1px)",
    width: "2px",
    backgroundColor: "var(--c-ink)",
  }),
};
