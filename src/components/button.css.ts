import { drop } from "../bevel";
import { hoverHold } from "./hover-hold.css";
import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { under1, under2 } from "../layers.css";
const HOVER = "(hover: hover) and (pointer: fine)";
const REDUCE = "(prefers-reduced-motion: reduce)";
// A key that is unavailable, natively or through aria-disabled, neither lights up nor presses down.
// Chrome still matches :hover and :active on a disabled button.
const LIVE_HOVER = ':hover:not(:disabled, [aria-disabled="true"])';
const LIVE_ACTIVE = ':active:not(:disabled, [aria-disabled="true"])';
const RISEN = `${LIVE_HOVER}:not(:active)`;
const MOVING_HOVER = `${HOVER} and (prefers-reduced-motion: no-preference)`;

// A call to action rises 2px on hover and its drop grows to match, so its foot stays put.
const lift = style({
  "@media": {
    [MOVING_HOVER]: {
      selectors: {
        [`&${RISEN}`]: {
          transform: "translateY(-2px)",
        },
      },
    },
  },
});

/**
 * The arcade's keys. Every key takes `base`, one `buttonVariant`, then `sm` for the small size and
 * `iconStart`, `iconEnd` or `iconOnly` when it carries an icon. A caller's own style goes last.
 * A key that is not available yet takes `aria-disabled` and `off`. It still takes focus and pointer
 * events so it can show its tooltip, but its face stays put on hover and press.
 */
export const button = {
  lift,
  // The trailing icon of a lifted key slides toward where the key leads.
  nudge: style({
    transitionProperty: "translate",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [MOVING_HOVER]: {
        selectors: {
          [`${lift}${RISEN} &`]: {
            translate: "3px 0",
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
          },
        },
      },
    },
  }),
  base: style([
    hoverHold.lift,
    {
      "@layer": {
        [under2]: {
          userSelect: "none",
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          height: "48px",
          paddingBlock: 0,
          paddingInline: "var(--px)",
          borderRadius: "12px",
          font: `700 14px ${fonts["--display"]}`,
          whiteSpace: "nowrap",
          borderWidth: 0,
          borderStyle: "none",
          borderColor: "currentcolor",
          cursor: cursors["--cursor-point"],
          // Hover and press arrive on the moderate spring and leave on its quicker exit, both inside the
          // rule's 100 to 200ms.
          transitionProperty: "transform, background-color, box-shadow, color",
          transitionDuration: motion["--t-moderate-exit"],
          transitionTimingFunction: motion["--exit"],
          vars: {
            "--px": "22px",
          },
          selectors: {
            [`&${LIVE_ACTIVE}`]: {
              transform: "translateY(2px) scale(0.97)",
              transitionDuration: motion["--t-moderate"],
              transitionTimingFunction: motion["--moderate"],
            },
            "&:focus-visible": {
              outlineWidth: "3px",
              outlineStyle: "solid",
              outlineColor: palette["--focus"],
              outlineOffset: "3px",
            },
          },
          "@media": {
            [REDUCE]: {
              selectors: {
                [`&${LIVE_ACTIVE}`]: {
                  transform: "none",
                },
              },
            },
            [HOVER]: {
              selectors: {
                "&&:hover": {
                  transitionDuration: motion["--t-moderate"],
                  transitionTimingFunction: motion["--moderate"],
                },
              },
            },
          },
        },
      },
    },
  ]),
  sm: style({
    "@layer": {
      [under1]: {
        height: "38px",
        borderRadius: "10px",
        fontSize: "12px",
        vars: {
          "--px": "14px",
        },
      },
    },
  }),
  // An icon carries white space inside its own box, so its side takes 4px less padding.
  iconStart: style({
    paddingInlineStart: "calc(var(--px) - 4px)",
  }),
  iconEnd: style({
    paddingInlineEnd: "calc(var(--px) - 4px)",
  }),
  iconOnly: style({
    aspectRatio: "1",
    paddingInline: 0,
  }),
  // Goes after the variant: the key keeps its shape in grey, with its label dimmed but opaque.
  off: style({
    cursor: cursors["--cursor-forbid"],
    vars: {
      "--c": palette["--soft-key"],
      "--lit": palette["--soft-key"],
      "--key": palette["--soft-key-drop"],
      "--on-c": palette["--dim"],
      "--ink": palette["--dim"],
    },
  }),
};

// A tone names the hue (--c), the text on it (--on-c), its drop (--key), its text on the page
// (--ink) and its lit face on hover (--lit). An emphasis decides which of them the key shows.
export const tone = {
  brand: style({
    "@layer": {
      [under1]: {
        vars: {
          "--c": palette["--go"],
          "--on-c": palette["--on-accent"],
          "--key": palette["--go-shadow"],
          "--ink": palette["--go-ink"],
          "--lit": palette["--go-hover"],
        },
      },
    },
  }),
  purple: style({
    "@layer": {
      [under1]: {
        vars: {
          "--c": palette["--ax"],
          "--on-c": palette["--on-accent"],
          "--key": `color-mix(in oklab, ${palette["--ax"]} 55%, #000)`,
          "--ink": `color-mix(in oklab, ${palette["--ax"]} var(--ink-mix), #000)`,
          "--lit": `color-mix(in oklab, ${palette["--ax"]} 82%, #fff)`,
        },
      },
    },
  }),
  // The filled purple key lifts its face toward white so it reads bright; its drop keeps the hue.
  purpleFill: style({
    vars: {
      "--c": `color-mix(in oklab, ${palette["--ax"]} 82%, #fff)`,
      "--lit": `color-mix(in oklab, ${palette["--ax"]} 68%, #fff)`,
    },
  }),
  pink: style({
    vars: {
      "--c": palette["--ux"],
      "--on-c": palette["--on-accent"],
      "--key": `color-mix(in oklab, ${palette["--ux"]} 55%, #000)`,
      "--ink": `color-mix(in oklab, ${palette["--ux"]} var(--ink-mix), #000)`,
      "--lit": `color-mix(in oklab, ${palette["--ux"]} 82%, #fff)`,
    },
  }),
  // The page's own colour, from the --hue its layout sets.
  hue: style({
    vars: {
      "--c": "var(--hue)",
      "--on-c": palette["--on-accent"],
      "--key": "color-mix(in oklab, var(--hue) 55%, #000)",
      "--ink": "color-mix(in oklab, var(--hue) var(--ink-mix), #000)",
      "--lit": "color-mix(in oklab, var(--hue) 82%, #fff)",
    },
  }),
  destructive: style({
    vars: {
      "--c": palette["--no"],
      "--on-c": palette["--on-accent"],
      "--key": `color-mix(in oklab, ${palette["--no"]} 60%, #000)`,
      "--ink": palette["--no-ink"],
      "--lit": `color-mix(in oklab, ${palette["--no"]} 82%, #fff)`,
    },
  }),
  neutral: style({
    vars: {
      "--c": palette["--soft-key"],
      "--on-c": palette["--text"],
      "--key": palette["--soft-key-drop"],
      "--ink": palette["--text"],
      "--lit": palette["--soft-key-hover"],
    },
  }),
};

export const emphasis = {
  // Filled, on its drop: the one main action on a screen.
  primary: style({
    "@layer": {
      [under1]: {
        backgroundColor: "var(--c)",
        color: "var(--on-c)",
        boxShadow: drop(4, "var(--key)"),
        selectors: {
          [`&${LIVE_ACTIVE}`]: {
            boxShadow: drop(2, "var(--key)"),
          },
        },
        "@media": {
          [HOVER]: {
            selectors: {
              [`&${LIVE_HOVER}`]: {
                backgroundColor: "var(--lit)",
              },
            },
          },
          [MOVING_HOVER]: {
            selectors: {
              [`&${lift}${RISEN}`]: {
                boxShadow: drop(6, "var(--key)"),
              },
            },
          },
        },
      },
    },
  }),
  // Tinted: the hue at low strength, for the action that supports the main one.
  secondary: style({
    backgroundColor: "color-mix(in srgb, var(--c) 18%, transparent)",
    color: "var(--ink)",
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${LIVE_HOVER}`]: {
            backgroundColor: "color-mix(in srgb, var(--c) 28%, transparent)",
          },
        },
      },
    },
  }),
  // Text: transparent until hover, for Cancel and the quiet actions.
  tertiary: style({
    backgroundColor: "transparent",
    color: "var(--ink)",
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${LIVE_HOVER}`]: {
            backgroundColor: "color-mix(in srgb, var(--ink) 10%, transparent)",
          },
        },
      },
    },
  }),
};
