import { fonts, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
const STACKED = "(max-width: 960px)";

/**
 * A page section and its heading, shared by the home page and each rule page. `block` spaces the
 * section, `head` lays out the heading row, `title` is the h2, `eyebrow` the small label above it
 * (inked from its --c), `titleText` the h2's own words, and `blurb` the line beside the heading.
 * Each caller composes these first and its own style after.
 */
export const section = {
  block: style({
    "@layer": {
      [under1]: {
        padding: "88px 0",
        "@media": {
          [STACKED]: {
            padding: "64px 0",
          },
        },
      },
    },
  }),
  head: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: "24px",
    marginBottom: "28px",
    flexWrap: "wrap",
  }),
  title: style({
    "@layer": {
      [under1]: {
        font: `900 44px/1 ${fonts["--display"]}`,
        letterSpacing: "-0.04em",
        color: palette["--text"],
        margin: 0,
        "@media": {
          [STACKED]: {
            font: `900 34px/1 ${fonts["--display"]}`,
          },
        },
      },
    },
  }),
  eyebrow: style({
    display: "block",
    font: `500 13px ${fonts["--display"]}`,
    letterSpacing: 0,
    color: `color-mix(in oklab, var(--c) ${palette["--eyebrow-mix"]}, #000)`,
    marginBottom: "10px",
  }),
  // Its own block, so it can glitch in apart from the eyebrow above it.
  titleText: style({
    display: "block",
  }),
  blurb: style({
    margin: 0,
    maxWidth: "34em",
  }),
};

/**
 * Copy that sits straight on the dither, with no card under it, rests on a veil: a blurred,
 * rounded patch of page colour drawn behind the words, so the dither never runs through them.
 * `dense` is for small text, whose thin strokes the dither breaks up more easily; `fit` hugs the
 * veil to the words on a block element. The patch is an ::after at z-index -1. The veil itself
 * stays out of stacking: it joins the content column's context (`arcade.wrap` isolates), where
 * every patch paints before any text. A veil that isolated would paint its patch over the text
 * of a neighbour or of the veiled heading around it.
 */
export const veil = {
  soft: style({
    position: "relative",
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        zIndex: -1,
        pointerEvents: "none",
        // Grows and rounds with the block, so a tall one turns into a blob rather than a card.
        inset: "calc(-16px - 8%) calc(-20px - 8%)",
        borderRadius: "30%",
        backgroundColor: palette["--veil"],
        filter: "blur(18px)",
      },
    },
  }),
  dense: style({
    position: "relative",
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        zIndex: -1,
        pointerEvents: "none",
        inset: "-12px -20px",
        borderRadius: "999px",
        backgroundColor: palette["--veil-dense"],
        filter: "blur(10px)",
      },
    },
  }),
  fit: style({
    width: "fit-content",
  }),
};
