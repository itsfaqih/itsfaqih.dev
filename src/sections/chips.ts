import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";

const INK = `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`;
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const FAST = motion["--t-fast"];
const FAST_EXIT = motion["--t-fast-exit"];
const EXIT = motion["--exit"];

/**
 * Filter chips: a row of pill toggles, each with a dot in its hue (--c), a name and a count. The
 * rule select's topics and the stack's companies and projects use them. `group` lays the row out,
 * `chip` is the button, `dot` and `count` its parts, and `countOn` the pressed chip's count.
 */
export const chips = stylex.create({
  group: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "18px",
  },
  // A [data-cut] piece, so the pressed state keys on aria-pressed.
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    height: "34px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderRadius: "999px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ':is([aria-pressed="true"])': INK },
    // Solid, so the backdrop's dots never show through.
    backgroundColor: {
      default: palette["--panel"],
      ':is([aria-pressed="true"])': `color-mix(in srgb, var(--c) 14%, ${palette["--panel"]})`,
    },
    color: { default: palette["--dim"], ':is([aria-pressed="true"])': palette["--text"] },
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    cursor: cursors["--cursor-point"],
    transform: { default: null, ":active": { default: "scale(0.97)", [REDUCE]: "none" } },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    // The colours ride the fast tier and the press the moderate one.
    transitionProperty: "background-color, color, border-color, transform",
    transitionDuration: {
      default: `${FAST_EXIT}, ${FAST_EXIT}, ${FAST_EXIT}, ${motion["--t-moderate-exit"]}`,
      ':is([aria-pressed="true"])': `${FAST}, ${FAST}, ${FAST}, ${motion["--t-moderate-exit"]}`,
      ":active": `${FAST_EXIT}, ${FAST_EXIT}, ${FAST_EXIT}, ${motion["--t-moderate"]}`,
    },
    transitionTimingFunction: {
      default: EXIT,
      ':is([aria-pressed="true"])': `${motion["--fast"]}, ${motion["--fast"]}, ${motion["--fast"]}, ${EXIT}`,
      ":active": `${EXIT}, ${EXIT}, ${EXIT}, ${motion["--moderate"]}`,
    },
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--c)",
  },
  count: {
    color: palette["--mute"],
  },
  countOn: {
    color: palette["--dim"],
    fontWeight: 500,
  },
});
