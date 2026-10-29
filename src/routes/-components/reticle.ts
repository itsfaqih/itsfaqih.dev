import * as stylex from "@stylexjs/stylex";
import { motion, palette } from "../../theme.stylex";

const REDUCE = "@media (prefers-reduced-motion: reduce)";
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
export const reticle = stylex.create({
  card: {
    // A lifted card sits on its key: a darker shade of its own hue.
    "--key": `color-mix(in oklab, ${HUE} ${palette["--key-mix"]}, #000)`,
    "::after": {
      content: '""',
      position: "absolute",
      inset: "-10px",
      pointerEvents: "none",
      backgroundImage: Array(8).fill(BRACKET).join(", "),
      // Written per axis in percentages, as the old keywords computed.
      backgroundPositionX: "0%, 0%, 100%, 100%, 0%, 0%, 100%, 100%",
      backgroundPositionY: "0%, 0%, 0%, 0%, 100%, 100%, 100%, 100%",
      backgroundSize: Array(4).fill(`${LEG} ${BAR}, ${BAR} ${LEG}`).join(", "),
      backgroundRepeat: "no-repeat",
      opacity: 0,
      transform: { default: AWAY, [REDUCE]: "none" },
      transitionProperty: "opacity, transform",
      transitionDuration: "120ms, 200ms",
      transitionTimingFunction: `ease, ${motion["--snap"]}`,
      transitionDelay: "0s, 0s",
      transitionBehavior: "normal, normal",
    },
  },
  aim: {
    "::after": {
      opacity: {
        default: 0,
        ":focus-visible": 1,
        "@media (hover: hover)": { default: null, ":hover": 1 },
      },
      transform: {
        default: AWAY,
        ":focus-visible": "none",
        "@media (hover: hover)": { default: null, ":hover": "none" },
        [REDUCE]: "none",
      },
    },
  },
  // The card is picked while it carries data-on. An attribute rather than a conditional style, so
  // the class list React writes never changes and the cut-in's .in survives the re-render.
  on: {
    "::after": {
      opacity: { default: 0, ":is([data-on])": 1 },
      transform: { default: AWAY, ":is([data-on])": "none", [REDUCE]: "none" },
    },
  },
});
