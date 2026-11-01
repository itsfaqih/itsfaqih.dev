import * as stylex from "@stylexjs/stylex";
import { fonts, motion, palette } from "../theme.stylex";
import { chips } from "./chips";

/** A topic chip's count, brighter on the pressed chip. rule-select.astro renders it, the client updates it. */
export const countClass = (on: boolean) => stylex.attrs(chips.count, on && chips.countOn).class ?? "";

/** The beam carries the picked rule's hue, and no light while none is picked. */
export const beamClass = (hued: boolean) => stylex.attrs(styles.beam, hued && styles.beamHue).class ?? "";

const STACKED = "@media (max-width: 960px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";
const LIGHT = ":is(.light *)";
// A tile waiting for its cut-in, or inside a piece still waiting, stays hidden (loadIn.piece).
const WAITING = ":is(:is(.js *):not(.in), .js [data-cut]:not(.in) *)";
// The grid's pointer or focus is on a tile's parent; the other tiles dim, except any still
// waiting for its own cut-in.
const DIMMED_HOVER = ":not([data-on]):is(:hover > *):not(:is(.js *):not(.in))";
const DIMMED_FOCUS = ":not([data-on]):is(:focus-within > *):not(:is(.js *):not(.in))";
const INK = `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`;
const PANEL_SHADOW = `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`;
const TILE_TOP = "inset 0 4px 0 var(--c)";
// Per tile: opacity (the dim), transform, border-color, box-shadow (the lift onto its key).
const TILE_LEAVE = `${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}`;
const TILE_PICK = `${motion["--t-fast"]}, ${motion["--t-moderate"]}, ${motion["--t-fast"]}, ${motion["--t-moderate"]}`;
const TILE_PICK_EASE = `${motion["--fast"]}, ${motion["--moderate"]}, ${motion["--fast"]}, ${motion["--moderate"]}`;
const TILE_DIM = `${motion["--t-fast"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}`;
const TILE_DIM_EASE = `${motion["--fast"]}, ${motion["--exit"]}, ${motion["--exit"]}, ${motion["--exit"]}`;
const LENS = (near: string, far: string) =>
  `radial-gradient(circle at var(--lens-x) var(--lens-y), ${near}, ${far} var(--reach))`;

const enter = stylex.keyframes({
  from: { transform: "translate(-60px) scale(0.7)", opacity: 0 },
});

// The lamp catches with a stutter, once per hover of the grid, not per tile.
const beamOn = stylex.keyframes({
  "0%": { opacity: 0 },
  "20%": { opacity: 0.85 },
  "40%": { opacity: 0.25 },
  "60%": { opacity: 1 },
});

// The halftone over the hue, as two layers so the colour sits under the dots. Positions are
// written per axis: the minifier folds 0% 0% into 0 0, which computes to 0px 0px.
const halftoneOverHue = {
  backgroundImage: `${palette["--halftone"]}, none`,
  backgroundPositionX: "0, 0%",
  backgroundPositionY: "0, 0%",
  backgroundSize: "25px 25px, auto",
  backgroundColor: "var(--c)",
};

export const styles = stylex.create({
  select: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: { default: "340px 1fr", [STACKED]: "1fr" },
    gap: "24px",
    alignItems: "start",
  },
  // The panel the lit tile projects onto. A [data-cut] piece: its states key on attributes, so its
  // class list never changes and the cut-in's .in survives every update.
  panel: {
    position: "sticky",
    zIndex: 2,
    top: "92px",
    display: { default: null, [STACKED]: "none" },
    borderRadius: "22px",
    padding: "20px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: { default: "solid", ":is([data-empty])": "dashed" },
    borderColor: `var(--c, ${palette["--hair"]})`,
    boxShadow: {
      default: PANEL_SHADOW,
      ":is([data-lit] > *)": `${PANEL_SHADOW}, 0 0 56px -12px color-mix(in srgb, var(--c) 55%, transparent)`,
    },
    overflow: "hidden",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([data-lit] > *)": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-lit] > *)": motion["--fast"],
    },
  },
  plate: {
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: INK,
    display: "flex",
    justifyContent: "space-between",
  },
  // With no rule there is no topic hue.
  standby: {
    color: palette["--mute"],
  },
  thumb: {
    borderRadius: "14px",
  },
  panelThumb: {
    marginBlock: "12px 16px",
    marginInline: 0,
    animationName: enter,
    animationDuration: motion["--t-slow"],
    animationTimingFunction: motion["--slow"],
  },
  // The description gets a fixed three-line slot, so a longer blurb never changes the panel's
  // height. The title takes only the lines it needs.
  title: {
    marginBlock: "0 8px",
    marginInline: 0,
    fontWeight: 900,
    fontSize: "24px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    color: palette["--text"],
  },
  blurb: {
    marginBlock: "0 16px",
    marginInline: 0,
    fontSize: "15px",
    lineHeight: 1.6,
    height: "4.8em",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    overflow: "hidden",
  },
  facts: {
    margin: 0,
    display: "grid",
    gap: "6px",
    fontSize: "13px",
  },
  fact: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    alignItems: "center",
    gap: "10px",
  },
  term: {
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--mute"],
  },
  value: {
    margin: 0,
    color: palette["--text"],
  },
  word: {
    whiteSpace: "nowrap",
  },
  // The real letter holds the cell's width; its stand-in is drawn centred over it.
  cell: {
    position: "relative",
    color: { default: null, ":is([data-glyph])": "transparent" },
    "::after": {
      content: { default: null, ":is([data-glyph])": "attr(data-glyph)" },
      position: "absolute",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      color: palette["--text"],
    },
  },
  tools: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "12px",
  },
  search: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "260px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "46px",
    paddingBlock: 0,
    paddingInline: "14px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":focus-within": palette["--focus"] },
    color: palette["--mute"],
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    outline: 0,
    backgroundColor: "transparent",
    backgroundPosition: "0 0",
    color: palette["--text"],
    fontWeight: 400,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "15px", [TOUCH]: "16px" },
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
  },
  key: {
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "6px",
    paddingBlock: "1px",
    paddingInline: "7px",
  },
  tiles: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(auto-fill, minmax(168px, 1fr))", [STACKED]: "1fr 1fr" },
    gap: "10px",
  },
  // A [data-cut] piece: its states key on data-on, data-lit and .in, so its class list never
  // changes and the cut-in's .in survives every update. The picked tile rises onto its key.
  tile: {
    position: "relative",
    zIndex: { default: null, ":is([data-on])": 2 },
    minHeight: { default: null, [STACKED]: "118px" },
    borderRadius: "16px",
    paddingTop: "10px",
    paddingInline: "10px",
    paddingBottom: "14px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":is([data-on])": "var(--c)" },
    display: "flex",
    flexDirection: "column",
    gap: { default: "10px", [STACKED]: "18px" },
    opacity: {
      default: null,
      [WAITING]: 0,
      [DIMMED_FOCUS]: 0.25,
      [HOVER]: { default: null, [DIMMED_HOVER]: 0.25 },
    },
    transform: {
      default: null,
      ":is([data-on])": {
        default: "translateY(-4px)",
        ":active": "translateY(3px)",
        [REDUCE]: "none",
      },
    },
    boxShadow: {
      default: `${TILE_TOP}, ${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
      ":is([data-on])": {
        default: `${TILE_TOP}, ${palette["--raise"]}, 0 8px 0 var(--key)`,
        ":active": `${TILE_TOP}, ${palette["--raise"]}, 0 1px 0 var(--key)`,
      },
    },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transitionProperty: "opacity, transform, border-color, box-shadow",
    transitionDuration: {
      default: TILE_LEAVE,
      ":is([data-on])": TILE_PICK,
      [DIMMED_FOCUS]: TILE_DIM,
      [HOVER]: { default: null, [DIMMED_HOVER]: TILE_DIM },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-on])": TILE_PICK_EASE,
      [DIMMED_FOCUS]: TILE_DIM_EASE,
      [HOVER]: { default: null, [DIMMED_HOVER]: TILE_DIM_EASE },
    },
    // A lit tile turns into the projector's lens: its face fills with its hue under the halftone
    // screen, and the beam carries the light from it onto the panel, which shows what it projects.
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 2,
      borderRadius: "14px",
      pointerEvents: "none",
      ...halftoneOverHue,
      opacity: { default: 0, ":is([data-lit])": 1 },
      transitionProperty: "opacity",
      transitionDuration: {
        default: motion["--t-fast-exit"],
        ":is([data-lit])": motion["--t-fast"],
      },
      transitionTimingFunction: { default: motion["--exit"], ":is([data-lit])": motion["--fast"] },
    },
  },
  number: {
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: INK,
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: 0,
    paddingInline: "4px",
  },
  tileTitle: {
    position: "relative",
    zIndex: 1,
    paddingBlock: 0,
    paddingInline: "4px",
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: 1.2,
    fontFamily: fonts["--display"],
    color: palette["--text"],
    letterSpacing: "-0.02em",
  },
  empty: {
    margin: 0,
    padding: 0,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  // The light is brightest at the lens and spreads thinner toward the panel. rule-select.client.ts
  // clips it to the hull of the tile and the panel and puts the lens at the tile's centre.
  // It shines over the dimmed tiles and under the lit one and the panel, and catches with a
  // stutter while the grid is lit.
  beam: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    display: { default: null, [STACKED]: "none" },
    pointerEvents: "none",
    maskImage: {
      default: LENS("rgb(0 0 0 / 0.5)", "rgb(0 0 0 / 0.12)"),
      [LIGHT]: LENS("rgb(0 0 0 / 0.32)", "rgb(0 0 0 / 0.06)"),
    },
    mixBlendMode: { default: "screen", [LIGHT]: "multiply" },
    opacity: { default: 0, ":is([data-lit] > *)": 1 },
    transitionProperty: "opacity",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([data-lit] > *)": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-lit] > *)": motion["--fast"],
    },
    animationName: { default: null, ":is([data-lit] > *)": beamOn },
    animationDuration: { default: null, ":is([data-lit] > *)": "260ms" },
    animationTimingFunction: { default: null, ":is([data-lit] > *)": "steps(1)" },
    animationFillMode: { default: null, ":is([data-lit] > *)": "both" },
  },
  // Only while a rule is picked: with no hue there is no light to carry.
  beamHue: halftoneOverHue,
});
