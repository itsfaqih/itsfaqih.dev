import { createGlobalTheme, createGlobalThemeContract } from "@vanilla-extract/css";

const tokens = {
  "--yes": "#7dff6a",
  "--yes-ink": "color-mix(in oklab, var(--yes) var(--ink-mix), #000)",
  "--code-bg": "#121219",
  "--grid": "color-mix(in srgb, var(--hair) 55%, transparent)",
  "--t-fb": "160ms",
};

/**
 * The rule pages' fixed tokens: the ✓ hue and its text ink, the code wells, the grid on
 * the ground, and the beat of quick feedback. theme.vars.css.ts lightens the wells and grid.
 */
export const kit = createGlobalThemeContract(tokens, (_value, path) => path[0]!);
createGlobalTheme(":root", kit, { "@layer": "global", ...tokens });

/** The page root, once watchReveal has marked what is already on screen. */
export const reveal = "marker-reveal";
