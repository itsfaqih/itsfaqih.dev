import * as stylex from "@stylexjs/stylex";
import { kit } from "./rules/rule-landing.stylex";
import { palette } from "./theme.stylex";

export type Theme = "light" | "dark";

// The same cabinet on paper. Panels go white, hairlines and hard shadows go grey, and accents
// keep their fills but darken for text. Thumbnails deepen their hues instead (see rule-thumb.styles.ts).
const lightTheme = stylex.createTheme(palette, {
  "--bg": "#f5f5f8",
  "--panel": "#ffffff",
  "--panel-2": "#ececf2",
  "--hair": "#d6d6df",
  "--text": "#111117",
  "--dim": "#4b4b5b",
  "--mute": "#67677a",
  "--card": "oklch(1 0 0 / 50%)",
  "--border": "oklch(0.922 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  // As bright as the green can go and still hold 4.5:1 on white.
  "--ink-mix": "62%",
  "--eyebrow-mix": "90%",
  "--ts-deep": "color-mix(in oklab, var(--ts) 82%, #000)",
  // The purple's light lavender washes out on paper, so light mode takes a deeper one.
  "--ax": "#a084ff",
  // Yellow darkened toward black turns olive; light mode takes a gold of its own, 4:1 on white.
  "--go-ink": "#a87400",
  "--drop-ink": "#c5c5d1",
  "--bevel-hi": "rgb(255 255 255 / 0.9)",
  "--bevel-lo": "rgb(30 30 60 / 0.07)",
  "--key-mix": "80%",
  "--soft-hover": "#e2e2ea",
  "--soft-key": "#ececf2",
  "--soft-key-hover": "#e2e2ea",
  "--soft-key-drop": "#c5c5d1",
  "--hair-hover": "#b9b9c6",
  // Dark lines vanish on dark ink, so paper's scanlines are light: they cut through black text the
  // way dark mode's cut through white, and all but vanish on the pale page.
  "--scan": "rgb(255 255 255 / 0.18)",
  "--dot": "#e8e8ee",
  "--lift": "rgb(30 30 60 / 0.14)",
  "--halftone": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='25' fill='%23000' fill-opacity='.22'%3E%3Ccircle cx='0' cy='0' r='2.5'/%3E%3Ccircle cx='25' cy='0' r='2.5'/%3E%3Ccircle cx='0' cy='25' r='2.5'/%3E%3Ccircle cx='25' cy='25' r='2.5'/%3E%3Ccircle cx='7.5' cy='2.5' r='2.5'/%3E%3Ccircle cx='15' cy='5' r='2.5'/%3E%3Ccircle cx='22.5' cy='7.5' r='2.5'/%3E%3Ccircle cx='5' cy='10' r='2.5'/%3E%3Ccircle cx='12.5' cy='12.5' r='2.5'/%3E%3Ccircle cx='20' cy='15' r='2.5'/%3E%3Ccircle cx='2.5' cy='17.5' r='2.5'/%3E%3Ccircle cx='10' cy='20' r='2.5'/%3E%3Ccircle cx='17.5' cy='22.5' r='2.5'/%3E%3C/svg%3E")`,
});

// The rule pages' code wells and ground grid on paper.
const kitLight = stylex.createTheme(kit, {
  "--code-bg": "#fbfbfd",
  "--grid": "color-mix(in srgb, var(--hair) 70%, transparent)",
});

/** The classes each theme puts on <html>. `light` and `dark` are for the selectors plain CSS keys on. */
export const THEME_CLASSES: Record<Theme, string[]> = {
  light: ["light", ...(stylex.props(lightTheme, kitLight).className ?? "").split(" ")],
  dark: ["dark"],
};

/** Each theme's page background, for the browser chrome's theme-color. */
export const THEME_COLORS: Record<Theme, string> = { light: "#f5f5f8", dark: "#0e0e13" };
