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
    color: `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
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
 * Copy that sits straight on the dot field, with no card under it, rests on a veil: a soft patch
 * of page colour whose edge feathers out into the dots, so they never run through the words.
 * `dense` is for small text, whose thin strokes the dots break up more easily; `fit` hugs the
 * veil to the words on a block element.
 */
export const veil = stylex.create({
  soft: {
    backgroundColor: palette["--veil"],
    boxShadow: palette["--veil-edge"],
    borderRadius: "16px",
  },
  dense: {
    backgroundColor: palette["--veil-dense"],
    boxShadow: palette["--veil-dense-edge"],
    borderRadius: "12px",
  },
  fit: {
    width: "fit-content",
  },
});
