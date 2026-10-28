import * as stylex from "@stylexjs/stylex";
import { palette } from "./theme.stylex";

export type Theme = "light" | "dark";

// The same cabinet on paper. Panels go white, hairlines and hard shadows go grey, and accents
// keep their fills but darken for text. Thumbnails deepen their hues instead (see .light .arc .thumb).
const lightTheme = stylex.createTheme(palette, {
  "--bg": "#f5f5f8",
  "--panel": "#ffffff",
  "--panel-2": "#ececf2",
  "--hair": "#d6d6df",
  "--text": "#111117",
  "--dim": "#4b4b5b",
  "--mute": "#67677a",
  // As bright as the green can go and still hold 4.5:1 on white.
  "--ink-mix": "62%",
  // Yellow darkened toward black turns olive; light mode takes a gold of its own.
  "--go-ink": "#9a6a00",
  "--drop-ink": "#c5c5d1",
  "--bevel-hi": "rgb(255 255 255 / 0.9)",
  "--bevel-lo": "rgb(30 30 60 / 0.07)",
  "--key-mix": "80%",
  "--soft-hover": "#e2e2ea",
  "--hair-hover": "#b9b9c6",
  "--scan": "rgb(0 0 0 / 0.03)",
  "--dot": "#cacad6",
  "--lift": "rgb(30 30 60 / 0.14)",
  "--halftone": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='25' fill='%23000' fill-opacity='.22'%3E%3Ccircle cx='0' cy='0' r='2.5'/%3E%3Ccircle cx='25' cy='0' r='2.5'/%3E%3Ccircle cx='0' cy='25' r='2.5'/%3E%3Ccircle cx='25' cy='25' r='2.5'/%3E%3Ccircle cx='7.5' cy='2.5' r='2.5'/%3E%3Ccircle cx='15' cy='5' r='2.5'/%3E%3Ccircle cx='22.5' cy='7.5' r='2.5'/%3E%3Ccircle cx='5' cy='10' r='2.5'/%3E%3Ccircle cx='12.5' cy='12.5' r='2.5'/%3E%3Ccircle cx='20' cy='15' r='2.5'/%3E%3Ccircle cx='2.5' cy='17.5' r='2.5'/%3E%3Ccircle cx='10' cy='20' r='2.5'/%3E%3Ccircle cx='17.5' cy='22.5' r='2.5'/%3E%3C/svg%3E") 0 0 / 25px 25px`,
});

/** The classes each theme puts on <html>. `light` and `dark` stay for the selectors plain CSS keys on. */
export const THEME_CLASSES: Record<Theme, string[]> = {
  light: ["light", ...(stylex.props(lightTheme).className ?? "").split(" ")],
  dark: ["dark"],
};
