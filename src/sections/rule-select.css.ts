import { fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
const STACKED = "(max-width: 960px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";
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

const enter = keyframes({
  from: { transform: "translate(-60px) scale(0.7)", opacity: 0 },
});

// The lamp catches with a stutter, once per hover of the grid, not per tile.
const beamOn = keyframes({
  "0%": { opacity: 0 },
  "20%": { opacity: 0.85 },
  "40%": { opacity: 0.25 },
  "60%": { opacity: 1 },
});

export const styles = {
  select: style({
    position: "relative",
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: "24px",
    alignItems: "start",
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "1fr",
      },
    },
  }),
  // The panel the lit tile projects onto. A [data-cut] piece: its states key on attributes, so its
  // class list never changes and the cut-in's .in survives every update.
  panel: style({
    position: "sticky",
    zIndex: 2,
    top: "92px",
    borderRadius: "22px",
    padding: "20px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: `var(--c, ${palette["--hair"]})`,
    boxShadow: PANEL_SHADOW,
    overflow: "hidden",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:is([data-empty])": {
        borderStyle: "dashed",
      },
      "&:is([data-lit] > *)": {
        boxShadow: `${PANEL_SHADOW}, 0 0 56px -12px color-mix(in srgb, var(--c) 55%, transparent)`,
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [STACKED]: {
        display: "none",
      },
    },
  }),
  plate: style({
    "@layer": {
      [under1]: {
        fontWeight: 700,
        fontSize: "12px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        color: INK,
        display: "flex",
        justifyContent: "space-between",
      },
    },
  }),
  // With no rule there is no topic hue.
  standby: style({
    color: palette["--mute"],
  }),
  thumb: style({
    borderRadius: "14px",
  }),
  panelThumb: style({
    marginBlock: "12px 16px",
    marginInline: 0,
    animationName: enter,
    animationDuration: motion["--t-slow"],
    animationTimingFunction: motion["--slow"],
  }),
  // The description gets a fixed three-line slot, so a longer blurb never changes the panel's
  // height. The title takes only the lines it needs.
  title: style({
    "@layer": {
      [under1]: {
        marginBlock: "0 8px",
        marginInline: 0,
        fontWeight: 900,
        fontSize: "24px",
        lineHeight: 1.1,
        fontFamily: fonts["--display"],
        letterSpacing: "-0.03em",
        color: palette["--text"],
      },
    },
  }),
  blurb: style({
    marginBlock: "0 16px",
    marginInline: 0,
    fontSize: "15px",
    lineHeight: 1.6,
    height: "4.8em",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    overflow: "hidden",
  }),
  facts: style({
    margin: 0,
    display: "grid",
    gap: "6px",
    fontSize: "13px",
  }),
  fact: style({
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    alignItems: "center",
    gap: "10px",
  }),
  term: style({
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--mute"],
  }),
  value: style({
    margin: 0,
    color: palette["--text"],
  }),
  word: style({
    whiteSpace: "nowrap",
  }),
  // The real letter holds the cell's width; its stand-in is drawn centred over it.
  cell: style({
    position: "relative",
    selectors: {
      "&::after": {
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        color: palette["--text"],
      },
      "&:is([data-glyph])": {
        color: "transparent",
      },
      "&:is([data-glyph])::after": {
        content: "attr(data-glyph)",
      },
    },
  }),
  tools: style({
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "12px",
  }),
  search: style({
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
    borderColor: palette["--hair"],
    color: palette["--mute"],
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    selectors: {
      "&:focus-within": {
        borderColor: palette["--focus"],
      },
    },
  }),
  input: style({
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
    fontSize: "15px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    "@media": {
      [TOUCH]: {
        fontSize: "16px",
      },
    },
  }),
  key: style({
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
  }),
  tiles: style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
    gap: "10px",
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "1fr 1fr",
      },
    },
  }),
  // A [data-cut] piece: its states key on data-on, data-lit and .in, so its class list never
  // changes and the cut-in's .in survives every update. The picked tile rises onto its key.
  tile: style({
    // A lit tile turns into the projector's lens: its face fills with its hue under the halftone
    // screen, and the beam carries the light from it onto the panel, which shows what it projects.
    position: "relative",
    borderRadius: "16px",
    paddingTop: "10px",
    paddingInline: "10px",
    paddingBottom: "14px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: `${TILE_TOP}, ${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
    transitionProperty: "opacity, transform, border-color, box-shadow",
    transitionDuration: TILE_LEAVE,
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        zIndex: 2,
        borderRadius: "14px",
        pointerEvents: "none",
        // The halftone over the hue, as two layers so the colour sits under the dots. Positions are
        // written per axis: the minifier folds 0% 0% into 0 0, which computes to 0px 0px.
        backgroundImage: `${palette["--halftone"]}, none`,
        backgroundPositionX: "0, 0%",
        backgroundPositionY: "0, 0%",
        backgroundSize: "25px 25px, auto",
        backgroundColor: "var(--c)",
        opacity: 0,
        transitionProperty: "opacity",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
      },
      "&:focus-visible": {
        outlineWidth: "3px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "3px",
      },
      [`&${WAITING}`]: {
        opacity: 0,
      },
      "&:is([data-lit])::before": {
        opacity: 1,
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
      "&:is([data-on])": {
        zIndex: 2,
        borderColor: "var(--c)",
        transform: "translateY(-4px)",
        boxShadow: `${TILE_TOP}, ${palette["--raise"]}, 0 8px 0 var(--key)`,
        transitionDuration: TILE_PICK,
        transitionTimingFunction: TILE_PICK_EASE,
      },
      [`&${DIMMED_FOCUS}`]: {
        opacity: 0.25,
        transitionDuration: TILE_DIM,
        transitionTimingFunction: TILE_DIM_EASE,
      },
      "&:is([data-on]):active": {
        transform: "translateY(3px)",
        boxShadow: `${TILE_TOP}, ${palette["--raise"]}, 0 1px 0 var(--key)`,
      },
    },
    "@media": {
      [STACKED]: {
        minHeight: "118px",
        gap: "18px",
      },
      [HOVER]: {
        selectors: {
          [`&${DIMMED_HOVER}`]: {
            opacity: 0.25,
            transitionDuration: TILE_DIM,
            transitionTimingFunction: TILE_DIM_EASE,
          },
        },
      },
      [REDUCE]: {
        selectors: {
          "&&:is([data-on])": {
            transform: "none",
          },
        },
      },
    },
  }),
  number: style({
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: INK,
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: 0,
    paddingInline: "4px",
  }),
  tileTitle: style({
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
  }),
  empty: style({
    margin: 0,
    padding: 0,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  }),
  // The light is brightest at the lens and spreads thinner toward the panel. rule-select.client.ts
  // clips it to the hull of the tile and the panel and puts the lens at the tile's centre.
  // It shines over the dimmed tiles and under the lit one and the panel, and catches with a
  // stutter while the grid is lit.
  beam: style({
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    maskImage: LENS("rgb(0 0 0 / 0.5)", "rgb(0 0 0 / 0.12)"),
    mixBlendMode: "screen",
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      [`&${LIGHT}`]: {
        maskImage: LENS("rgb(0 0 0 / 0.32)", "rgb(0 0 0 / 0.06)"),
        mixBlendMode: "multiply",
      },
      "&:is([data-lit] > *)": {
        opacity: 1,
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
        animationName: beamOn,
        animationDuration: "260ms",
        animationTimingFunction: "steps(1)",
        animationFillMode: "both",
      },
    },
    "@media": {
      [STACKED]: {
        display: "none",
      },
    },
  }),
  // Only while a rule is picked: with no hue there is no light to carry.
  beamHue: style({
    backgroundImage: `${palette["--halftone"]}, none`,
    backgroundPositionX: "0, 0%",
    backgroundPositionY: "0, 0%",
    backgroundSize: "25px 25px, auto",
    backgroundColor: "var(--c)",
  }),
};
