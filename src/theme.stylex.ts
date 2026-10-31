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
  // The blog and code blocks use their own greys, which match the cabinet only in dark.
  "--card": "#17171f",
  "--border": "#2c2c3a",
  "--muted-foreground": "#a1a1b5",
  "--mute": "#87879d",
  "--cw": "#4dd4ff",
  "--ux": "#ff6ad5",
  "--ar": "#ffb02e",
  "--ts": "#7dff6a",
  "--ax": "#bca2ff",
  "--go": "#ffe14d",
  // The green is the palette's lightest hue, so on a light ground its marks take a deeper shade.
  "--ts-deep": "var(--ts)",
  // Accent text and focus rings darken toward black by --ink-mix, which is 100% (no change) in
  // dark and lower in light, so the same hue reads on either ground.
  "--ink-mix": "100%",
  "--go-ink": "color-mix(in oklab, var(--go) var(--ink-mix), #000)",
  // Eyebrows are short and bold enough to keep more of their hue than body accents.
  "--eyebrow-mix": "100%",
  "--focus": "var(--go-ink)",
  "--on-accent": "#111",
  "--go-hover": "#fff07a",
  "--go-shadow": "#b39a1d",
  "--no-shadow": "#a3283a",
  "--drop-ink": "#0a0a0e",
  "--soft-hover": "#2a2a38",
  // A soft key sits a step above --panel-2 on a side of its own, since --drop-ink is all but the
  // page itself in dark and the key's edge would vanish into it.
  "--soft-key": "#3a3a4c",
  "--soft-key-hover": "#444458",
  "--soft-key-drop": "#202029",
  "--hair-hover": "#3a3a4c",
  "--scan": "rgb(0 0 0 / 0.18)",
  // Text that sits straight on the dither gets a patch of page colour under it (see veil in routes/-components/section.ts).
  "--veil": "color-mix(in srgb, var(--bg) 72%, transparent)",
  // Small text has thin strokes the dither breaks up easily, so its veil is denser.
  "--veil-dense": "color-mix(in srgb, var(--bg) 90%, transparent)",
  "--dot": "#2e2e3c",
  "--lift": "rgb(0 0 0 / 0.4)",
  // Game panels: a raised body (top highlight, bottom shade, hard drop) and sunken wells.
  "--bevel-hi": "rgb(255 255 255 / 0.06)",
  "--bevel-lo": "rgb(0 0 0 / 0.32)",
  "--raise": "inset 0 2px 0 var(--bevel-hi), inset 0 -3px 0 var(--bevel-lo)",
  "--sink": "inset 0 2px 0 var(--bevel-lo)",
  // A lifted card sits on a darker shade of its own hue, like the keys sit on --go-shadow.
  "--key-mix": "42%",
  // The hero prints' halftone screen, an image tiled at 25px from 0 0: dots 7.9px apart on a grid
  // turned atan(1/3), the angle nearest their 18deg whose grid repeats in a square. Dark lightens
  // the hue under it, like the prints' screen blend; light darkens it, like their multiply.
  "--halftone": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='25' fill='%23fff' fill-opacity='.4'%3E${dots}")`,
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
  // A sampled spring (damping 0.72), about 4% past and back: the header island's fold.
  "--spring":
    "linear(0, 0.034, 0.12, 0.234, 0.359, 0.484, 0.601, 0.705, 0.793, 0.865, 0.922, 0.965, 0.996, 1.017, 1.03, 1.036, 1.038, 1.037, 1.034, 1.03, 1.025, 1.02, 1.016, 1.012, 1.008, 1.005, 1.003, 1.001, 1, 0.999, 0.999, 0.999, 0.999)",
  // Entrance timing: one step between items, one length for small pops, one for panels.
  "--t-step": "40ms",
  "--t-pop": "420ms",
  "--t-panel": "560ms",
});

/** The blog's transitions. */
export const transitions = stylex.defineConsts({
  colors:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transform: "transform, translate, scale, rotate",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
});

/** The system cursors, shown until the print cursor takes over (print-cursor.tsx). */
export const cursors = stylex.defineVars({
  "--cursor": "auto",
  "--cursor-point": "pointer",
  "--cursor-grab": "grab",
  "--cursor-grabbing": "grabbing",
  "--cursor-text": "text",
  "--cursor-forbid": "not-allowed",
});
