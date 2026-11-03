import * as stylex from "@stylexjs/stylex";
import { boxScrollbarHost } from "../components/box-scrollbar";
import { cursors, fonts, motion, palette } from "../theme.stylex";
import { icon, iconLit, techBadge } from "./tech-icon.styles";

export const marker = stylex.defaultMarker();

const STACKED = "@media (max-width: 960px)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const LIGHT = ":is(.light *)";

const listIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});

export const styles = stylex.create({
  list: {
    display: "block",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "22px",
    boxShadow: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
    overflow: "hidden",
  },
  // A [data-cut] piece: the open state keys on data-on, so its class list never changes and the
  // cut-in's .in survives a re-render. Opaque, so a row sliding down covers the list opening above
  // it. On paper the open row is the white sheet and the closed rows sit back in the page tone, so
  // the row being read has the most contrast.
  row: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: { default: "340px 1fr", [STACKED]: "1fr" },
    gridTemplateRows: { default: null, ":is([data-on])": "auto 1fr" },
    gap: { default: "14px 28px", [STACKED]: "14px" },
    alignItems: { default: "center", ":is([data-on])": "start" },
    paddingBlock: "18px",
    paddingInline: "22px",
    borderTopWidth: { default: "2px", ":first-child": 0 },
    borderTopStyle: { default: "solid", ":first-child": "none" },
    borderTopColor: { default: palette["--hair"], ":first-child": "currentcolor" },
    backgroundColor: {
      default: palette["--panel"],
      ":is([data-on])": palette["--panel-2"],
      ":not([data-on]):hover": {
        default: null,
        [HOVER]: `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
      },
      [LIGHT]: {
        default: palette["--bg"],
        ":is([data-on])": palette["--panel"],
        ":not([data-on]):hover": {
          default: null,
          [HOVER]: `color-mix(in srgb, ${palette["--panel-2"]} 55%, ${palette["--bg"]})`,
        },
      },
    },
    outline: { default: null, ":has(> button:focus-visible)": `2px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":has(> button:focus-visible)": "-2px" },
    transitionProperty: "background-color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([data-on])": motion["--t-fast"],
      ":not([data-on]):hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-on])": motion["--fast"],
      ":not([data-on]):hover": { default: null, [HOVER]: motion["--fast"] },
    },
  },
  // The dates sit over the company and role; the chevron stays at the right.
  head: {
    gridArea: { default: "1 / 1", [STACKED]: "auto" },
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
  },
  // A closed row is one big target; an open row only toggles from its head, so its achievements
  // stay selectable.
  headCover: {
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
    },
  },
  years: {
    gridArea: "1 / 1",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--go-ink"],
  },
  // The logo leads the name; the role runs under both.
  company: {
    gridArea: "2 / 1",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "8px",
    alignItems: "center",
    margin: 0,
    font: `700 18px/1.2 ${fonts["--display"]}`,
    color: palette["--text"],
  },
  logo: {
    width: "22px",
    height: "22px",
  },
  role: {
    gridColumn: "1 / -1",
    display: "block",
    font: `400 13px ${fonts["--sans"]}`,
    color: palette["--mute"],
    marginTop: "4px",
  },
  chevron: {
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
  chevronOpen: {
    borderTopColor: palette["--go-ink"],
    borderRightColor: palette["--go-ink"],
    borderBottomColor: palette["--go-ink"],
    borderLeftColor: palette["--go-ink"],
    transform: "translateY(2px) rotate(-135deg)",
    transitionDuration: `${motion["--t-moderate"]}, ${motion["--t-fast"]}`,
    transitionTimingFunction: `${motion["--moderate"]}, ${motion["--fast"]}`,
  },
  // Closed: the stack sits on the right. Open: it fills the left column under the head and the
  // achievements take the right column. Unpositioned while closed, so the head's cover stays on top.
  stackFrame: {
    gridArea: { default: "1 / 2", [STACKED]: "auto" },
    minWidth: 0,
  },
  // The list inside is taken out of flow, so the achievements alone set the row's height. The fades
  // lie over the list rather than mask it, so a badge gliding in isn't cut off.
  stackFrameOpen: {
    "--ground": { default: palette["--panel-2"], [LIGHT]: palette["--panel"] },
    gridArea: { default: "2 / 1", [STACKED]: "auto" },
    position: "relative",
    alignSelf: { default: "stretch", [STACKED]: null },
    minHeight: { default: "76px", [STACKED]: null },
    // While badges glide in from their old spots, only the bottom edge clips.
    clipPath: {
      default: null,
      ":has(> [data-gliding])": "inset(-400px -1000px 0 -1000px)",
    },
    "::before": {
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
    "::after": {
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
  },
  // Above the fades, so the thumb keeps its colour near either end.
  stackBar: { zIndex: 2 },
  stack: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  stackOpen: {
    position: { default: "absolute", [STACKED]: "static" },
    inset: { default: 0, [STACKED]: null },
    maxHeight: { default: null, [STACKED]: "160px" },
    alignContent: "start",
    overflowX: { default: "hidden", ":is([data-gliding])": "visible" },
    overflowY: { default: "auto", ":is([data-gliding])": "visible" },
    // Room for the scrollbar's thumb beside the badges.
    paddingInlineEnd: "14px",
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "-2px" },
  },
  pill: {
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
  // A closed row lifts its badges' rims and marks together under the pointer; an open row lights
  // the badge under the pointer in its tool's own colours.
  pillClosed: {
    borderColor: {
      default: palette["--hair"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: palette["--hair-hover"] },
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--fast"] },
    },
  },
  pillOpen: {
    "--lit": { default: null, ":hover": { default: null, [HOVER]: "1" } },
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: "var(--brand)" },
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
    },
  },
  // The count pill: its words come from data-label, so measuring can try each count without a
  // render.
  more: {
    display: "inline-flex",
    borderStyle: "dashed",
    color: palette["--mute"],
    "::after": {
      content: "attr(data-label)",
    },
  },
  markClosed: {
    color: {
      default: palette["--mute"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: palette["--dim"] },
    },
  },
  markOpen: {
    color: palette["--dim"],
  },
  body: {
    gridArea: { default: "1 / 2 / span 2", [STACKED]: "auto" },
    display: { default: null, ":empty": "none" },
  },
  achievements: {
    display: "grid",
    gap: "10px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  achievement: {
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
    "::before": {
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
});

export const rowView = (isOpen: boolean) => ({
  head: stylex.attrs(styles.head, iconLit.hover, !isOpen && styles.headCover).class ?? "",
  company: stylex.attrs(styles.company, isOpen && iconLit.on).class ?? "",
  chevron: stylex.attrs(styles.chevron, isOpen && styles.chevronOpen).class ?? "",
  frame: stylex.attrs(styles.stackFrame, isOpen && styles.stackFrameOpen).class ?? "",
  stack:
    stylex.attrs(styles.stack, isOpen && styles.stackOpen, isOpen && boxScrollbarHost.box).class ??
    "",
  pill:
    stylex.attrs(techBadge.badge, styles.pill, isOpen ? styles.pillOpen : styles.pillClosed)
      .class ?? "",
  mark: stylex.attrs(icon.pair, isOpen ? styles.markOpen : styles.markClosed).class ?? "",
  more: stylex.attrs(styles.pill, styles.more, styles.pillClosed).class ?? "",
});

export const moreLabel = (count: number) => `+${count} more`;
