import * as stylex from "@stylexjs/stylex";
import { motion, palette } from "../theme.stylex";

// The tool's own colour for the current theme, from techBrand's inline properties.
const BRAND = {
  "--brand": {
    default: `var(--brand-dark, ${palette["--go-ink"]})`,
    ":is(.light *)": `var(--brand-light, ${palette["--go-ink"]})`,
  },
};

const HOVER = "@media (hover: hover) and (pointer: fine)";

/**
 * `badge` lays a tool's mark and name in a row, and `brand` sets --brand, a single-colour mark's
 * colour. Pair either with techBrand(name) as the inline style, which also carries --ring.
 */
export const techBadge = stylex.create({
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    userSelect: "none",
    ...BRAND,
  },
  brand: BRAND,
});

// The layer arriving takes the fast tier and the one leaving its quicker exit, picked by --lit.
const FADE_GAP = `(${motion["--t-fast"]} - ${motion["--t-fast-exit"]})`;
const FADE = {
  transitionProperty: "opacity",
  transitionTimingFunction: motion["--exit"],
};

/** The two layers of a TechIcon or CompanyLogo: `flat`, the one-colour mark, and `lit`, the colours. */
export const icon = stylex.create({
  pair: {
    flex: "none",
    display: "inline-grid",
    width: "calc(1.15em * var(--wide, 1))",
    height: "1.15em",
    color: palette["--dim"],
  },
  flat: {
    gridArea: "1 / 1",
    width: "100%",
    height: "100%",
    fill: "currentColor",
    opacity: "calc(1 - var(--lit, 0))",
    ...FADE,
    transitionDuration: `calc(${motion["--t-fast"]} - var(--lit, 0) * ${FADE_GAP})`,
  },
  lit: {
    gridArea: "1 / 1",
    width: "100%",
    height: "100%",
    opacity: "var(--lit, 0)",
    ...FADE,
    transitionDuration: `calc(${motion["--t-fast-exit"]} + var(--lit, 0) * ${FADE_GAP})`,
  },
});

/** Lights the icons inside: set it on a badge under the pointer, focused, pressed or open. */
export const iconLit = stylex.create({
  on: {
    "--lit": "1",
  },
  hover: {
    "--lit": { default: null, ":hover": { default: null, [HOVER]: "1" }, ":focus-visible": "1" },
  },
});

export const mark = stylex.create({
  brand: {
    fill: `var(--brand, ${palette["--mute"]})`,
  },
});
