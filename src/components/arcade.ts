import * as stylex from "@stylexjs/stylex";
import { fonts, palette } from "../theme.stylex";

const STACKED = "@media (max-width: 960px)";

/**
 * The arcade theme's frame, shared by the home page, the Rule of Thumb index, each rule page and
 * the header. `root` sets the body type on an arcade root, `scan` lays the CRT scanlines over the
 * whole screen from it, `wrap` is the centred content column, and `srOnly` hides text from sight
 * but not from screen readers. Each root also keeps the `arc` class, which the reduced-motion
 * blanket in arcade.css keys on.
 */
export const arcade = stylex.create({
  root: {
    color: palette["--dim"],
    font: `400 16px/1.6 ${fonts["--sans"]}`,
  },
  scan: {
    "::after": {
      content: '""',
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 90,
      backgroundImage: `repeating-linear-gradient(transparent 0 2px, ${palette["--scan"]} 2px 3px)`,
    },
  },
  // Isolates so the veils' patches (section.ts) share one context above the backdrop, behind all
  // of the column's text.
  wrap: {
    isolation: "isolate",
    maxWidth: "1200px",
    marginBlock: 0,
    marginInline: "auto",
    padding: { default: "0 32px", [STACKED]: "0 18px" },
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});
