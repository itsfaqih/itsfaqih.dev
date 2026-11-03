import { fonts, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
const ink = (hue: string) => `color-mix(in oklab, ${hue} ${palette["--ink-mix"]}, #000)`;

export const styles = {
  file: style({
    display: "block",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    minHeight:
      "calc(var(--lines, 0) * var(--diffs-line-height) + 2 * var(--diffs-gap-block) + 2px)",
    overflow: "hidden",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--border"],
    borderRadius: "0.75rem",
    backgroundColor: palette["--card"],
    color: palette["--text"],
    // The shadow DOM uses light-dark(); pin it to the site's explicit mode.
    colorScheme: "light",
    vars: {
      "--diffs-gap-block": "0.5rem",
      "--diffs-line-height": "1.625rem",
      "--diffs-font-family": fonts["--mono"],
      "--diffs-header-font-family": fonts["--font-sans"],
      "--diffs-light-bg": palette["--card"],
      "--diffs-dark-bg": palette["--card"],
      "--diffs-foreground": palette["--text"],
      "--diffs-background": palette["--panel"],
      "--diffs-token-comment": palette["--mute"],
      "--diffs-token-keyword": ink(palette["--ux"]),
      "--diffs-token-string": ink(palette["--ts"]),
      "--diffs-token-string-expression": ink(palette["--ts"]),
      "--diffs-token-constant": palette["--go-ink"],
      "--diffs-token-function": ink(palette["--cw"]),
      "--diffs-token-parameter": ink(palette["--ax"]),
      "--diffs-token-punctuation": palette["--dim"],
      "--diffs-token-link": ink(palette["--cw"]),
    },
    selectors: {
      "&:is(.dark *)": {
        colorScheme: "dark",
      },
    },
  }),
};
