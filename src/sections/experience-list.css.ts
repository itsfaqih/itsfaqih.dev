import { drop } from "../bevel";
import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { under1 } from "../layers.css";
const STACKED = "(max-width: 960px)";
const HOVER = "(hover: hover) and (pointer: fine)";
const LIGHT = ":is(.light *)";

const listIn = keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});

export const styles = {
  list: style({
    display: "block",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "22px",
    boxShadow: `${palette["--raise"]}, ${drop(4, palette["--drop-ink"])}`,
    overflow: "hidden",
  }),
  // A [data-cut] piece: the open state keys on data-on, so its class list never changes and the
  // cut-in's .in survives a re-render. Opaque, so a row sliding down covers the list opening above
  // it. On paper the open row is the white sheet and the closed rows sit back in the page tone, so
  // the row being read has the most contrast.
  row: style({
    position: "relative",
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: "14px 28px",
    alignItems: "center",
    paddingBlock: "18px",
    paddingInline: "22px",
    borderTopWidth: "2px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    backgroundColor: palette["--panel"],
    transitionProperty: "background-color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      [`&${LIGHT}`]: {
        backgroundColor: palette["--bg"],
      },
      "&:is([data-on])": {
        gridTemplateRows: "auto 1fr",
        alignItems: "start",
        backgroundColor: palette["--panel-2"],
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
      "&:has(> button:focus-visible)": {
        outline: `2px solid ${palette["--focus"]}`,
        outlineOffset: "-2px",
      },
      "&:first-child": {
        borderTopWidth: 0,
        borderTopStyle: "none",
        borderTopColor: "currentcolor",
      },
      [`&${LIGHT}:is([data-on])`]: {
        backgroundColor: palette["--panel"],
      },
    },
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "1fr",
        gap: "14px",
      },
      [HOVER]: {
        selectors: {
          "&:not([data-on]):hover": {
            backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
          [`&${LIGHT}:not([data-on]):hover`]: {
            backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 55%, ${palette["--bg"]})`,
          },
        },
      },
    },
  }),
  // The dates sit over the company and role; the chevron stays at the right.
  head: style({
    gridArea: "1 / 1",
    display: "grid",
    gridTemplateColumns: "1fr 20px",
    gap: "6px 18px",
    alignItems: "center",
    padding: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundImage: "none",
    // `background: none` minifies to a 0 0 position, which computes to 0px 0px.
    backgroundPosition: "0 0",
    color: "inherit",
    font: "inherit",
    textAlign: "left",
    cursor: cursors["--cursor-point"],
    outline: "none",
    "@media": {
      [STACKED]: {
        gridArea: "auto",
      },
    },
  }),
  // A closed row is one big target; an open row only toggles from its head, so its achievements
  // stay selectable.
  headCover: style({
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
      },
    },
  }),
  years: style({
    gridArea: "1 / 1",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--go-ink"],
  }),
  // The logo leads the name; the role runs under both.
  company: style({
    gridArea: "2 / 1",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "8px",
    alignItems: "center",
    margin: 0,
    font: `700 18px/1.2 ${fonts["--display"]}`,
    color: palette["--text"],
  }),
  logo: style({
    width: "22px",
    height: "22px",
  }),
  role: style({
    gridColumn: "1 / -1",
    display: "block",
    font: `400 13px ${fonts["--sans"]}`,
    color: palette["--mute"],
    marginTop: "4px",
  }),
  chevron: style({
    "@layer": {
      [under1]: {
        gridArea: "1 / 2 / span 2",
        justifySelf: "end",
        width: "9px",
        height: "9px",
        borderRightWidth: "2px",
        borderRightStyle: "solid",
        borderRightColor: palette["--mute"],
        borderBottomWidth: "2px",
        borderBottomStyle: "solid",
        borderBottomColor: palette["--mute"],
        transform: "translateY(-3px) rotate(45deg)",
        transitionProperty: "transform, border-color",
        transitionDuration: `${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}`,
        transitionTimingFunction: motion["--exit"],
      },
    },
  }),
  chevronOpen: style({
    borderTopColor: palette["--go-ink"],
    borderRightColor: palette["--go-ink"],
    borderBottomColor: palette["--go-ink"],
    borderLeftColor: palette["--go-ink"],
    transform: "translateY(2px) rotate(-135deg)",
    transitionDuration: `${motion["--t-moderate"]}, ${motion["--t-fast"]}`,
    transitionTimingFunction: `${motion["--moderate"]}, ${motion["--fast"]}`,
  }),
  // Closed: the stack sits on the right. Open: it fills the left column under the head and the
  // achievements take the right column. Unpositioned while closed, so the head's cover stays on top.
  stackFrame: style({
    "@layer": {
      [under1]: {
        gridArea: "1 / 2",
        minWidth: 0,
        "@media": {
          [STACKED]: {
            gridArea: "auto",
          },
        },
      },
    },
  }),
  // The list inside is taken out of flow, so the achievements alone set the row's height. The fades
  // lie over the list rather than mask it, so a badge gliding in isn't cut off.
  stackFrameOpen: style({
    // While badges glide in from their old spots, only the bottom edge clips.
    gridArea: "2 / 1",
    position: "relative",
    alignSelf: "stretch",
    minHeight: "76px",
    vars: {
      "--ground": palette["--panel-2"],
    },
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        insetInline: 0,
        top: 0,
        zIndex: 1,
        height: "44px",
        pointerEvents: "none",
        backgroundImage: "linear-gradient(to bottom, var(--ground), transparent)",
        opacity: "var(--fade-top, 0)",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        insetInline: 0,
        bottom: 0,
        zIndex: 1,
        height: "44px",
        pointerEvents: "none",
        backgroundImage: "linear-gradient(to top, var(--ground), transparent)",
        opacity: "var(--fade-bottom, 1)",
      },
      [`&${LIGHT}`]: {
        vars: {
          "--ground": palette["--panel"],
        },
      },
      "&:has(> [data-gliding])": {
        clipPath: "inset(-400px -1000px 0 -1000px)",
      },
    },
    "@media": {
      [STACKED]: {
        gridArea: "auto",
      },
    },
  }),
  // Sits on the bottom fade of the open row's tools while more lie below, and leaves with the fade
  // as the list reaches its end. A closed row's tools never scroll, so it has none.
  hint: style({
    display: "none",
  }),
  // A chip in the row's own tone, so the badges sliding under it don't break up its words.
  hintOpen: style({
    position: "absolute",
    left: "50%",
    bottom: "2px",
    zIndex: 2,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    paddingBlock: "4px",
    paddingInline: "10px",
    borderRadius: "999px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    backgroundColor: "var(--ground)",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    font: `500 11px ${fonts["--display"]}`,
    letterSpacing: "0.02em",
    color: palette["--mute"],
    opacity: "var(--fade-bottom, 0)",
    selectors: {
      "&::after": {
        content: '"↓"',
        fontFamily: fonts["--sans"],
      },
      "*:has(> [data-gliding]) > &": {
        opacity: 0,
      },
    },
  }),
  // Above the fades, so the thumb keeps its colour near either end.
  stackBar: style({
    zIndex: 2,
  }),
  stack: style({
    "@layer": {
      [under1]: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        margin: 0,
        padding: 0,
        listStyle: "none",
      },
    },
  }),
  stackOpen: style({
    position: "absolute",
    inset: 0,
    alignContent: "start",
    overflowX: "hidden",
    overflowY: "auto",
    // Its bottom is where the list ends, not where the page picks up.
    overscrollBehavior: "contain",
    // Room for the scrollbar's thumb beside the badges.
    paddingInlineEnd: "14px",
    selectors: {
      "&:focus-visible": {
        outlineWidth: "2px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "-2px",
      },
      "&:is([data-gliding])": {
        overflowX: "visible",
        overflowY: "visible",
      },
    },
    "@media": {
      [STACKED]: {
        position: "static",
        maxHeight: "160px",
      },
    },
  }),
  pill: style({
    "@layer": {
      [under1]: {
        paddingTop: "5px",
        paddingRight: "10px",
        paddingBottom: "5px",
        paddingLeft: "8px",
        borderRadius: "999px",
        borderWidth: "2px",
        borderStyle: "solid",
        font: `500 12px ${fonts["--display"]}`,
        color: palette["--dim"],
        transitionProperty: "border-color",
      },
    },
  }),
  // A closed row lifts its badges' rims and marks together under the pointer; an open row lights
  // the badge under the pointer in its tool's own colours.
  pillClosed: style({
    borderColor: palette["--hair"],
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${when.ancestor(":hover")}`]: {
            borderColor: palette["--hair-hover"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  pillOpen: style({
    borderColor: palette["--hair"],
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            borderColor: "var(--brand)",
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
            vars: {
              "--lit": "1",
            },
          },
        },
      },
    },
  }),
  // The count pill: its words come from data-label, so measuring can try each count without a
  // render.
  more: style({
    display: "inline-flex",
    borderStyle: "dashed",
    color: palette["--mute"],
    selectors: {
      "&::after": {
        content: "attr(data-label)",
      },
    },
  }),
  markClosed: style({
    color: palette["--mute"],
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${when.ancestor(":hover")}`]: {
            color: palette["--dim"],
          },
        },
      },
    },
  }),
  markOpen: style({
    color: palette["--dim"],
  }),
  body: style({
    gridArea: "1 / 2 / span 2",
    selectors: {
      "&:empty": {
        display: "none",
      },
    },
    "@media": {
      [STACKED]: {
        gridArea: "auto",
      },
    },
  }),
  achievements: style({
    display: "grid",
    gap: "10px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  }),
  achievement: style({
    position: "relative",
    paddingLeft: "20px",
    fontSize: "15px",
    lineHeight: 1.55,
    color: palette["--dim"],
    animationName: listIn,
    animationDuration: "360ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "backwards",
    animationDelay: "calc(140ms + var(--j) * 45ms)",
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: "0.6em",
        width: "8px",
        height: "8px",
        borderRadius: "2px",
        backgroundColor: palette["--ts-deep"],
      },
    },
  }),
};
