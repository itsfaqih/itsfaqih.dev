import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, palette } from "../theme.stylex";

/**
 * The arcade's keys: a chunky button that sits on a hard drop shadow and presses down into it.
 * Every key takes `base`, then `go` (the accent), `hue` (its own --c) or `soft` (a quiet panel),
 * and `sm` for the small size. A caller's own style goes last, so its values win.
 */
export const button = stylex.create({
  base: {
    userSelect: "none",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: "48px",
    padding: "0 22px",
    borderRadius: "12px",
    font: `700 14px ${fonts["--display"]}`,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    cursor: cursors["--cursor-point"],
    transform: { default: null, ":active": "scale(0.97) translateY(2px)" },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transition:
      "transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 120ms ease, box-shadow 120ms ease",
  },
  go: {
    backgroundColor: { default: palette["--go"], ":hover": palette["--go-hover"] },
    color: palette["--on-accent"],
    boxShadow: {
      default: `0 4px 0 ${palette["--go-shadow"]}`,
      ":active": `0 2px 0 ${palette["--go-shadow"]}`,
    },
  },
  hue: {
    "--key": "color-mix(in oklab, var(--c) 62%, #000)",
    backgroundColor: {
      default: "var(--c)",
      ":hover": "color-mix(in oklab, var(--c) 72%, #fff)",
    },
    color: "var(--on-c)",
    boxShadow: { default: "0 4px 0 var(--key)", ":active": "0 2px 0 var(--key)" },
  },
  soft: {
    backgroundColor: { default: palette["--panel-2"], ":hover": palette["--soft-hover"] },
    color: palette["--text"],
    boxShadow: `0 4px 0 ${palette["--drop-ink"]}`,
  },
  sm: {
    height: "38px",
    padding: "0 14px",
    fontSize: "12px",
  },
});
