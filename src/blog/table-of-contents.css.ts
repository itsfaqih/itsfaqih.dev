import { motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
const HOVER = "(hover: hover) and (pointer: fine)";

export const styles = {
  host: style({
    display: "contents",
  }),
  title: style({
    marginBottom: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
  }),
  list: style({
    fontSize: "1rem",
    lineHeight: 1.5,
    "@media": {
      "(min-width: 64rem)": {
        fontSize: "0.875rem",
        lineHeight: "1.25rem",
      },
    },
  }),
  // While any link is hovered, the other entries dim.
  item: style({
    // -webkit-box with no -webkit-line-clamp, so it clamps nothing.
    display: "-webkit-box",
    overflow: "hidden",
    transitionProperty: "opacity",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${when.ancestor(":has(a:hover)")}`]: {
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
          [`&${when.ancestor(":has(a:hover)")}:not(:hover)`]: {
            opacity: 0.5,
          },
          "&:hover": {
            opacity: 1,
          },
        },
      },
    },
  }),
  depth3: style({
    paddingLeft: "12px",
  }),
  link: style({
    display: "block",
    paddingBlock: "0.75rem",
    transitionProperty: "color, font-weight",
    "@media": {
      "(min-width: 64rem)": {
        paddingBlock: "0.375rem",
      },
    },
  }),
  active: style({
    fontWeight: 500,
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: motion["--fast"],
  }),
  idle: style({
    color: palette["--muted-foreground"],
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        color: palette["--text"],
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  // The active entry turns 500: a hidden copy holds that width, so the bolder text never rewraps.
  label: style({
    display: "grid",
  }),
  layer: style({
    gridArea: "1 / 1",
  }),
  ghost: style({
    visibility: "hidden",
    fontWeight: 500,
  }),
};
