import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { REDUCE } from "../browser/media-query";
const INK = `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`;
const FAST = motion["--t-fast"];
const FAST_EXIT = motion["--t-fast-exit"];
const EXIT = motion["--exit"];

/**
 * Filter chips: a row of pill toggles, each with a dot in its hue (--c), a name and a count. The
 * rule select's topics and the stack's companies and projects use them. `group` lays the row out,
 * `chip` is the button, `dot` and `count` its parts, and `countOn` the pressed chip's count.
 */
export const chips = {
  group: style({
    "@layer": {
      [under1]: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginBottom: "18px",
      },
    },
  }),
  // A [data-cut] piece, so the pressed state keys on aria-pressed.
  chip: style({
    "@layer": {
      [under1]: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: "34px",
        paddingBlock: 0,
        paddingInline: "12px",
        borderRadius: "999px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: palette["--hair"],
        // Solid, so the backdrop's dots never show through.
        backgroundColor: palette["--panel"],
        color: palette["--dim"],
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "normal",
        fontFamily: fonts["--display"],
        cursor: cursors["--cursor-point"],
        // The colours ride the fast tier and the press the moderate one.
        transitionProperty: "background-color, color, border-color, transform",
        transitionDuration: `${FAST_EXIT}, ${FAST_EXIT}, ${FAST_EXIT}, ${motion["--t-moderate-exit"]}`,
        transitionTimingFunction: EXIT,
        selectors: {
          "&:focus-visible": {
            outlineWidth: "3px",
            outlineStyle: "solid",
            outlineColor: palette["--focus"],
            outlineOffset: "3px",
          },
          '&:is([aria-pressed="true"])': {
            borderColor: INK,
            backgroundColor: `color-mix(in srgb, var(--c) 14%, ${palette["--panel"]})`,
            color: palette["--text"],
            transitionDuration: `${FAST}, ${FAST}, ${FAST}, ${motion["--t-moderate-exit"]}`,
            transitionTimingFunction: `${motion["--fast"]}, ${motion["--fast"]}, ${motion["--fast"]}, ${EXIT}`,
          },
          "&:active": {
            transform: "scale(0.97)",
            transitionDuration: `${FAST_EXIT}, ${FAST_EXIT}, ${FAST_EXIT}, ${motion["--t-moderate"]}`,
            transitionTimingFunction: `${EXIT}, ${EXIT}, ${EXIT}, ${motion["--moderate"]}`,
          },
        },
        "@media": {
          [REDUCE]: {
            selectors: {
              "&:active": {
                transform: "none",
              },
            },
          },
        },
      },
    },
  }),
  dot: style({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--c)",
  }),
  count: style({
    "@layer": {
      [under1]: {
        color: palette["--mute"],
      },
    },
  }),
  countOn: style({
    color: palette["--dim"],
    fontWeight: 500,
  }),
};
