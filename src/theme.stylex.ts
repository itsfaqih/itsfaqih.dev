import * as stylex from "@stylexjs/stylex";

// Every token keeps its literal `--name`, so the plain stylesheets read it as var(--name) too.

const dots =
  "%3Ccircle cx='0' cy='0' r='2.5'/%3E%3Ccircle cx='25' cy='0' r='2.5'/%3E%3Ccircle cx='0' cy='25' r='2.5'/%3E%3Ccircle cx='25' cy='25' r='2.5'/%3E%3Ccircle cx='7.5' cy='2.5' r='2.5'/%3E%3Ccircle cx='15' cy='5' r='2.5'/%3E%3Ccircle cx='22.5' cy='7.5' r='2.5'/%3E%3Ccircle cx='5' cy='10' r='2.5'/%3E%3Ccircle cx='12.5' cy='12.5' r='2.5'/%3E%3Ccircle cx='20' cy='15' r='2.5'/%3E%3Ccircle cx='2.5' cy='17.5' r='2.5'/%3E%3Ccircle cx='10' cy='20' r='2.5'/%3E%3Ccircle cx='17.5' cy='22.5' r='2.5'/%3E%3C/svg%3E";

/** The arcade cabinet in the dark. `lightTheme` in theme.ts puts the same cabinet on paper. */
export const palette = stylex.defineVars({
  "--bg": "#0e0e13",
  "--panel": "#17171f",
  "--panel-2": "#20202b",
  "--hair": "#2c2c3a",
  "--text": "#f4f4f8",
  "--dim": "#a1a1b5",
  // The blog and code blocks still use the old site's greys, which match the cabinet only in dark.
  "--card": "#17171f",
  "--border": "#2c2c3a",
  "--muted-foreground": "#a1a1b5",
  "--mute": "#87879d",
  "--cw": "#4dd4ff",
  "--ux": "#ff6ad5",
  "--ar": "#ffb02e",
  "--ts": "#7dff6a",
  "--ax": "#9d7bff",
  "--go": "#ffe14d",
  // Accent text and focus rings darken toward black by --ink-mix, which is 100% (no change) in
  // dark and lower in light, so the same hue reads on either ground.
  "--ink-mix": "100%",
  "--go-ink": "color-mix(in oklab, var(--go) var(--ink-mix), #000)",
  "--focus": "var(--go-ink)",
  "--on-accent": "#111",
  "--go-hover": "#fff07a",
  "--go-shadow": "#b39a1d",
  "--no-shadow": "#a3283a",
  "--drop-ink": "#0a0a0e",
  "--soft-hover": "#2a2a38",
  "--hair-hover": "#3a3a4c",
  "--scan": "rgb(0 0 0 / 0.18)",
  // Text that sits straight on the dot field gets a patch of page colour under it (see .arc .sh2).
  "--veil": "color-mix(in srgb, var(--bg) 72%, transparent)",
  "--veil-edge": "0 0 24px 12px var(--veil)",
  // Small text has thin strokes the dots break up easily, so its veil is denser and reaches further.
  "--veil-dense": "color-mix(in srgb, var(--bg) 90%, transparent)",
  "--veil-dense-edge": "0 0 28px 18px var(--veil-dense)",
  "--dot": "#2e2e3c",
  "--lift": "rgb(0 0 0 / 0.4)",
  // Game panels: a raised body (top highlight, bottom shade, hard drop) and sunken wells.
  "--bevel-hi": "rgb(255 255 255 / 0.06)",
  "--bevel-lo": "rgb(0 0 0 / 0.32)",
  "--raise": "inset 0 2px 0 var(--bevel-hi), inset 0 -3px 0 var(--bevel-lo)",
  "--sink": "inset 0 2px 0 var(--bevel-lo)",
  // A lifted card sits on a darker shade of its own hue, like the keys sit on --go-shadow.
  "--key-mix": "42%",
  // The hero prints' halftone screen as a 25px tile: dots 7.9px apart on a grid turned atan(1/3),
  // the angle nearest their 18deg whose grid repeats in a square. Dark lightens the hue under it,
  // like the prints' screen blend; light darkens it, like their multiply.
  "--halftone": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='25' fill='%23fff' fill-opacity='.4'%3E${dots}") 0 0 / 25px 25px`,
});

export const fonts = stylex.defineVars({
  "--display": '"Unbounded", system-ui, sans-serif',
  "--sans": '"Geist", system-ui, sans-serif',
  "--mono": '"Geist Mono", ui-monospace, monospace',
  "--font-sans": '"Geist", ui-sans-serif, system-ui, sans-serif',
  "--font-mono": '"Geist Mono", ui-monospace, monospace',
});

export const motion = stylex.defineVars({
  "--cut": "cubic-bezier(0.83, 0, 0.17, 1)",
  "--out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "--snap": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  // Entrance timing: one step between items, one length for small pops, one for panels.
  "--t-step": "40ms",
  "--t-pop": "420ms",
  "--t-panel": "560ms",
  "--t-bar": "200ms",
});

/** The blog's transitions. */
export const transitions = stylex.defineConsts({
  colors: "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transform: "transform, translate, scale, rotate",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
});

/** Pixel cursors from scripts/cursors.py, shown until the print cursor takes over. Each falls back to its system cursor. */
export const cursors = stylex.defineVars({
  "--cursor": 'url("/cursors/arrow.svg") 0 0, auto',
  "--cursor-point": 'url("/cursors/point.svg") 8 0, pointer',
  "--cursor-grab": 'url("/cursors/grab.svg") 12 14, grab',
  "--cursor-grabbing": 'url("/cursors/grabbing.svg") 12 8, grabbing',
  "--cursor-text": 'url("/cursors/text.svg") 7 13, text',
});
