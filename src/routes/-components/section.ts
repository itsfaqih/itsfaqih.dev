import * as stylex from "@stylexjs/stylex";
import { fonts, palette } from "../../theme.stylex";

const STACKED = "@media (max-width: 960px)";

/**
 * A page section and its heading, shared by the home page and each rule page. `block` spaces the
 * section, `head` lays out the heading row, `title` is the h2, `eyebrow` the small label above it
 * (inked from its --c), `titleText` the h2's own words, and `blurb` the line beside the heading.
 * Each caller composes these first and its own style after.
 */
export const section = stylex.create({
  block: {
    padding: { default: "88px 0", [STACKED]: "64px 0" },
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: "24px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  title: {
    font: { default: `900 44px/1 ${fonts["--display"]}`, [STACKED]: `900 34px/1 ${fonts["--display"]}` },
    letterSpacing: "-0.04em",
    color: palette["--text"],
    margin: 0,
  },
  eyebrow: {
    display: "block",
    font: `500 13px ${fonts["--display"]}`,
    letterSpacing: 0,
    color: `color-mix(in oklab, var(--c) ${palette["--eyebrow-mix"]}, #000)`,
    marginBottom: "10px",
  },
  // Its own block, so it can glitch in apart from the eyebrow above it.
  titleText: {
    display: "block",
  },
  blurb: {
    margin: 0,
    maxWidth: "34em",
  },
});

/**
 * Copy that sits straight on the dither, with no card under it, rests on a veil: a blurred,
 * rounded patch of page colour drawn behind the words, so the dither never runs through them.
 * `dense` is for small text, whose thin strokes the dither breaks up more easily; `fit` hugs the
 * veil to the words on a block element. The patch is an ::after at z-index -1. The veil itself
 * stays out of stacking: it joins the content column's context (`arcade.wrap` isolates), where
 * every patch paints before any text. A veil that isolated would paint its patch over the text
 * of a neighbour or of the veiled heading around it.
 */
const patch = {
  content: '""',
  position: "absolute",
  zIndex: -1,
  pointerEvents: "none",
} as const;

export const veil = stylex.create({
  soft: {
    position: "relative",
    "::after": {
      ...patch,
      // Grows and rounds with the block, so a tall one turns into a blob rather than a card.
      inset: "calc(-16px - 8%) calc(-20px - 8%)",
      borderRadius: "30%",
      backgroundColor: palette["--veil"],
      filter: "blur(18px)",
    },
  },
  dense: {
    position: "relative",
    "::after": {
      ...patch,
      inset: "-12px -20px",
      borderRadius: "999px",
      backgroundColor: palette["--veil-dense"],
      filter: "blur(10px)",
    },
  },
  fit: {
    width: "fit-content",
  },
});
