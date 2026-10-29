import * as stylex from "@stylexjs/stylex";

/**
 * The rule pages' fixed tokens: the ✕ and ✓ hues and their text inks, the code wells, the grid on
 * the ground, and the beat of quick feedback. `kitLight` in theme.ts lightens the wells and grid.
 */
export const kit = stylex.defineVars({
  "--no": "#ff5468",
  "--yes": "#7dff6a",
  "--no-ink": "color-mix(in oklab, var(--no) var(--ink-mix), #000)",
  "--yes-ink": "color-mix(in oklab, var(--yes) var(--ink-mix), #000)",
  "--code-bg": "#121219",
  "--grid": "color-mix(in srgb, var(--hair) 55%, transparent)",
  "--t-fb": "160ms",
});

/** The page root, once useReveal has marked what is already on screen. */
export const reveal = stylex.defineMarker();
