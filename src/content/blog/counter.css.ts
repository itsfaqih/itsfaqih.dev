import { motion } from "../../theme.vars.css";
import { style } from "@vanilla-extract/css";
// Tailwind's zinc greys, with 700, 600 and 400 in lab() form.
const zinc700 = "lab(26.8019% 1.35387 -4.68303)";
const zinc600 = "lab(35.1166% 1.78212 -6.1173)";
const zinc400 = "lab(65.6464% 1.53497 -5.42429)";

const HOVER = "(hover: hover) and (pointer: fine)";

export const styles = {
  counter: style({
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
  }),
  button: style({
    padding: "0.5rem",
    borderRadius: "0.375rem",
    transitionProperty: "scale, color, background-color",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        scale: "95% 95%",
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
          },
        },
      },
    },
  }),
  decrease: style({
    color: zinc400,
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: "#fff",
            backgroundColor: zinc700,
          },
        },
      },
    },
  }),
  increase: style({
    color: "#fff",
    backgroundColor: zinc700,
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            backgroundColor: zinc600,
          },
        },
      },
    },
  }),
  display: style({
    minWidth: 80,
    textAlign: "center",
  }),
  count: style({
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 700,
    color: "#fff",
  }),
};
