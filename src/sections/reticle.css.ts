import { motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { HOVER, REDUCE } from "../browser/media-query";
const HUE = `var(--c, ${palette["--go"]})`;
const INK = `color-mix(in oklab, ${HUE} ${palette["--ink-mix"]}, #000)`;
const LEG = "12px";
const BAR = "3px";
const BRACKET = `linear-gradient(${INK} 0 0)`;
const AWAY = "scale(1.08)";

/**
 * The select reticle: four corner brackets in the card's hue lock onto the card under the pointer
 * or keyboard focus, like a character-select cursor. One ::after, eight legs. A card takes `card`,
 * and then `aim` to lock on hover and focus, or `on` to lock while it is the one selected.
 */
export const reticle = {
  card: style({
    "@layer": {
      [under1]: {
        userSelect: "none",
        vars: {
          // A lifted card sits on its key: a darker shade of its own hue.
          "--key": `color-mix(in oklab, ${HUE} ${palette["--key-mix"]}, #000)`,
        },
        selectors: {
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "-10px",
            pointerEvents: "none",
            backgroundImage: Array(8).fill(BRACKET).join(", "),
            // Per axis, so the minifier cannot fold 0% 0% into 0 0, which computes to 0px 0px.
            backgroundPositionX: "0%, 0%, 100%, 100%, 0%, 0%, 100%, 100%",
            backgroundPositionY: "0%, 0%, 0%, 0%, 100%, 100%, 100%, 100%",
            backgroundSize: Array(4).fill(`${LEG} ${BAR}, ${BAR} ${LEG}`).join(", "),
            backgroundRepeat: "no-repeat",
            opacity: 0,
            transform: AWAY,
            // Locks on with the fast spring and lets go on its quicker exit.
            transitionProperty: "opacity, transform",
            transitionDuration: motion["--t-fast-exit"],
            transitionTimingFunction: motion["--exit"],
          },
        },
        "@media": {
          [REDUCE]: {
            selectors: {
              "&::after": {
                transform: "none",
              },
            },
          },
        },
      },
    },
  }),
  aim: style({
    selectors: {
      "&::after": {
        opacity: 0,
        transform: AWAY,
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
      },
      "&:focus-visible::after": {
        opacity: 1,
        transform: "none",
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover::after": {
            opacity: 1,
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
      [`${HOVER} and (not (${REDUCE}))`]: {
        selectors: {
          "&&:hover::after": {
            transform: "none",
          },
        },
      },
      [REDUCE]: {
        selectors: {
          "&&::after": {
            transform: "none",
          },
        },
      },
    },
  }),
  // The card is picked while it carries data-on. An attribute rather than a conditional style, so
  // the class list never changes and the cut-in's .in survives every update.
  on: style({
    selectors: {
      "&::after": {
        opacity: 0,
        transform: AWAY,
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
      },
      "&:is([data-on])::after": {
        opacity: 1,
        transform: "none",
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          "&&::after": {
            transform: "none",
          },
        },
      },
    },
  }),
};
