import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";

const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
// A key that is unavailable, natively or through aria-disabled, neither lights up nor presses down.
// Chrome still matches :hover and :active on a disabled button.
const LIVE_HOVER = ':hover:not(:disabled, [aria-disabled="true"])';
const LIVE_ACTIVE = ':active:not(:disabled, [aria-disabled="true"])';

/**
 * The arcade's keys. Every key takes `base`, one `buttonVariant`, then `sm` for the small size and
 * `iconStart`, `iconEnd` or `iconOnly` when it carries an icon. A caller's own style goes last.
 * A key that is not available yet takes `aria-disabled` and `off`. It still takes focus and pointer
 * events so it can show its tooltip, but its face stays put on hover and press.
 */
export const button = stylex.create({
  base: {
    "--px": "22px",
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
    transform: {
      default: null,
      [LIVE_ACTIVE]: { default: "translateY(2px) scale(0.97)", [REDUCE]: "none" },
    },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    // Hover and press arrive on the moderate spring and leave on its quicker exit, both inside the
    // rule's 100 to 200ms.
    transitionProperty: "transform, background-color, box-shadow, color",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      [LIVE_ACTIVE]: motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      [LIVE_ACTIVE]: motion["--moderate"],
    },
  },
  sm: {
    "--px": "14px",
    height: "38px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  // An icon carries white space inside its own box, so its side takes 4px less padding.
  iconStart: {
    paddingInlineStart: "calc(var(--px) - 4px)",
  },
  iconEnd: {
    paddingInlineEnd: "calc(var(--px) - 4px)",
  },
  iconOnly: {
    aspectRatio: "1",
    paddingInline: 0,
  },
  // Goes after the variant: the key keeps its shape in grey, with its label dimmed but opaque.
  off: {
    "--c": palette["--soft-key"],
    "--lit": palette["--soft-key"],
    "--key": palette["--soft-key-drop"],
    "--on-c": palette["--dim"],
    "--ink": palette["--dim"],
    cursor: cursors["--cursor-forbid"],
  },
});

// A tone names the hue (--c), the text on it (--on-c), its drop (--key), its text on the page
// (--ink) and its lit face on hover (--lit). An emphasis decides which of them the key shows.
const tone = stylex.create({
  brand: {
    "--c": palette["--go"],
    "--on-c": palette["--on-accent"],
    "--key": palette["--go-shadow"],
    "--ink": palette["--go-ink"],
    "--lit": palette["--go-hover"],
  },
  purple: {
    "--c": palette["--ax"],
    "--on-c": palette["--on-accent"],
    "--key": `color-mix(in oklab, ${palette["--ax"]} 55%, #000)`,
    "--ink": `color-mix(in oklab, ${palette["--ax"]} var(--ink-mix), #000)`,
    "--lit": `color-mix(in oklab, ${palette["--ax"]} 82%, #fff)`,
  },
  // The filled purple key lifts its face toward white so it reads bright; its drop keeps the hue.
  purpleFill: {
    "--c": `color-mix(in oklab, ${palette["--ax"]} 82%, #fff)`,
    "--lit": `color-mix(in oklab, ${palette["--ax"]} 68%, #fff)`,
  },
  pink: {
    "--c": palette["--ux"],
    "--on-c": palette["--on-accent"],
    "--key": `color-mix(in oklab, ${palette["--ux"]} 55%, #000)`,
    "--ink": `color-mix(in oklab, ${palette["--ux"]} var(--ink-mix), #000)`,
    "--lit": `color-mix(in oklab, ${palette["--ux"]} 82%, #fff)`,
  },
  destructive: {
    "--c": palette["--no"],
    "--on-c": palette["--on-accent"],
    "--key": `color-mix(in oklab, ${palette["--no"]} 60%, #000)`,
    "--ink": palette["--no-ink"],
    "--lit": `color-mix(in oklab, ${palette["--no"]} 82%, #fff)`,
  },
  neutral: {
    "--c": palette["--soft-key"],
    "--on-c": palette["--text"],
    "--key": palette["--soft-key-drop"],
    "--ink": palette["--text"],
    "--lit": palette["--soft-key-hover"],
  },
});

const emphasis = stylex.create({
  // Filled, on its drop: the one main action on a screen.
  primary: {
    backgroundColor: {
      default: "var(--c)",
      [LIVE_HOVER]: { default: null, [HOVER]: "var(--lit)" },
    },
    color: "var(--on-c)",
    boxShadow: { default: "0 4px 0 var(--key)", [LIVE_ACTIVE]: "0 2px 0 var(--key)" },
  },
  // Tinted: the hue at low strength, for the action that supports the main one.
  secondary: {
    backgroundColor: {
      default: "color-mix(in srgb, var(--c) 18%, transparent)",
      [LIVE_HOVER]: { default: null, [HOVER]: "color-mix(in srgb, var(--c) 28%, transparent)" },
    },
    color: "var(--ink)",
  },
  // Text: transparent until hover, for Cancel and the quiet actions.
  tertiary: {
    backgroundColor: {
      default: "transparent",
      [LIVE_HOVER]: { default: null, [HOVER]: "color-mix(in srgb, var(--ink) 10%, transparent)" },
    },
    color: "var(--ink)",
  },
});

/** The keys: brand, destructive and neutral, each filled, tinted or text (neutral is never tinted), plus purple filled and tinted and pink tinted. */
export const buttonVariant = {
  "primary-brand": [tone.brand, emphasis.primary],
  "secondary-brand": [tone.brand, emphasis.secondary],
  "tertiary-brand": [tone.brand, emphasis.tertiary],
  "primary-purple": [tone.purple, tone.purpleFill, emphasis.primary],
  "secondary-purple": [tone.purple, emphasis.secondary],
  "secondary-pink": [tone.pink, emphasis.secondary],
  "primary-destructive": [tone.destructive, emphasis.primary],
  "secondary-destructive": [tone.destructive, emphasis.secondary],
  "tertiary-destructive": [tone.destructive, emphasis.tertiary],
  "primary-neutral": [tone.neutral, emphasis.primary],
  "tertiary-neutral": [tone.neutral, emphasis.tertiary],
} as const;

export type ButtonVariant = keyof typeof buttonVariant;
