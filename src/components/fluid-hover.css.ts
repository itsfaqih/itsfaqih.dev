import { motion } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { REDUCE } from "../browser/media-query";

export const fluidHover = {
  group: style({
    position: "relative",
    isolation: "isolate",
  }),
  // Sized from the item's box on a leaf with nothing inside, so it reflows nothing around it.
  highlight: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "var(--w, 0px)",
        height: "var(--h, 0px)",
        transform: "translate(var(--x, 0px), var(--y, 0px))",
        pointerEvents: "none",
        opacity: 0,
        transitionProperty: "opacity, transform, width, height",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
        selectors: {
          "&:is([data-fresh])": {
            transitionProperty: "opacity",
          },
          "&:is([data-on])": {
            opacity: 1,
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
        "@media": {
          [REDUCE]: {
            selectors: {
              "&&": {
                transitionProperty: "opacity",
              },
            },
          },
        },
      },
    },
  }),
};
