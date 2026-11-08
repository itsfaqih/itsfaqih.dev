import { motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { HOVER } from "../browser/media-query";

/**
 * `badge` lays a tool's mark and name in a row, and `brand` sets --brand, a single-colour mark's
 * colour. Pair either with techBrand(name) as the inline style, which also carries --ring.
 */
export const techBadge = {
  badge: style({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    userSelect: "none",
    vars: {
      // The tool's own colour for the current theme, from techBrand's inline properties.
      "--brand": `var(--brand-dark, ${palette["--go-ink"]})`,
    },
    selectors: {
      "&:is(.light *)": {
        vars: {
          "--brand": `var(--brand-light, ${palette["--go-ink"]})`,
        },
      },
    },
  }),
  brand: style({
    vars: {
      "--brand": `var(--brand-dark, ${palette["--go-ink"]})`,
    },
    selectors: {
      "&:is(.light *)": {
        vars: {
          "--brand": `var(--brand-light, ${palette["--go-ink"]})`,
        },
      },
    },
  }),
};

// The layer arriving takes the fast tier and the one leaving its quicker exit, picked by --lit.
const FADE_GAP = `(${motion["--t-fast"]} - ${motion["--t-fast-exit"]})`;

/** The two layers of a TechIcon or CompanyLogo: `flat`, the one-colour mark, and `lit`, the colours. */
export const icon = {
  pair: style({
    "@layer": {
      [under1]: {
        flex: "none",
        display: "inline-grid",
        width: "calc(1.15em * var(--wide, 1))",
        height: "1.15em",
        color: palette["--dim"],
      },
    },
  }),
  flat: style({
    gridArea: "1 / 1",
    width: "100%",
    height: "100%",
    fill: "currentColor",
    opacity: "calc(1 - var(--lit, 0))",
    transitionProperty: "opacity",
    transitionTimingFunction: motion["--exit"],
    transitionDuration: `calc(${motion["--t-fast"]} - var(--lit, 0) * ${FADE_GAP})`,
  }),
  lit: style({
    gridArea: "1 / 1",
    width: "100%",
    height: "100%",
    opacity: "var(--lit, 0)",
    transitionProperty: "opacity",
    transitionTimingFunction: motion["--exit"],
    transitionDuration: `calc(${motion["--t-fast-exit"]} + var(--lit, 0) * ${FADE_GAP})`,
  }),
};

/** Lights the icons inside: set it on a badge under the pointer, focused, pressed or open. */
export const iconLit = {
  on: style({
    vars: {
      "--lit": "1",
    },
  }),
  hover: style({
    selectors: {
      "&:focus-visible": {
        vars: {
          "--lit": "1",
        },
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            vars: {
              "--lit": "1",
            },
          },
        },
      },
    },
  }),
};

export const mark = {
  brand: style({
    fill: `var(--brand, ${palette["--mute"]})`,
  }),
};
