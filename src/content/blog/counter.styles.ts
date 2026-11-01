import * as stylex from "@stylexjs/stylex";
import { motion } from "../../theme.stylex";

// Tailwind's zinc greys, with 700, 600 and 400 in lab() form.
const zinc700 = "lab(26.8019% 1.35387 -4.68303)";
const zinc600 = "lab(35.1166% 1.78212 -6.1173)";
const zinc400 = "lab(65.6464% 1.53497 -5.42429)";

const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

export const styles = stylex.create({
  counter: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBlock: "1rem",
    padding: "0.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: zinc700,
    borderRadius: "0.75rem",
    backgroundColor: "color-mix(in oklab, oklch(27.4% .006 286.033) 50%, transparent)",
  },
  button: {
    padding: "0.5rem",
    borderRadius: "0.375rem",
    scale: { default: null, ":active": { default: "95% 95%", [REDUCE]: null } },
    transitionProperty: "scale, color, background-color",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":active": motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":active": motion["--moderate"],
    },
  },
  decrease: {
    color: {
      default: zinc400,
      ":hover": { default: null, [HOVER]: "#fff" },
    },
    backgroundColor: {
      default: null,
      ":hover": { default: null, [HOVER]: zinc700 },
    },
  },
  increase: {
    color: "#fff",
    backgroundColor: {
      default: zinc700,
      ":hover": { default: null, [HOVER]: zinc600 },
    },
  },
  display: {
    minWidth: 80,
    textAlign: "center",
  },
  count: {
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 700,
    color: "#fff",
  },
});
