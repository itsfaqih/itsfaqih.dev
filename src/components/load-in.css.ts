import { motion } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { REDUCE } from "../browser/media-query";
// watchCutIns (cut-ins.ts) adds .in to each [data-cut] piece once it is on screen.
const IN = ":is(.in)";
// With JS on, a piece waits hidden until it gets .in, and so does every piece inside one still waiting.
const WAITING = ":is(:is(.js *):not(.in), .js [data-cut]:not(.in) *)";
const HELD = ":is(.js [data-cut]:not(.in) *)";
// The root script adds .js, and .no-intro once the home intro has handed off (or never plays).
const BOOTING = ":is(.js:not(.no-intro) *)";
const ARRIVING = ":is(.js.no-intro:not(.from-site) *)";
const STAGGER = `calc(min(var(--cut-order, 0), 12) * ${motion["--t-step"]})`;

// Slices clip top and bottom only, with room at the sides for the colour split.
const glitchIn = keyframes({
  "0%": { opacity: 0 },
  "8%": {
    opacity: 1,
    clipPath: "inset(14% -8px 56% -8px)",
    translate: "-12px 0",
    filter: "drop-shadow(-4px 0 var(--ux)) drop-shadow(4px 0 var(--cw))",
  },
  "18%": {
    clipPath: "inset(62% -8px 6% -8px)",
    translate: "14px 0",
    filter: "drop-shadow(5px 0 var(--ux)) drop-shadow(-5px 0 var(--cw))",
  },
  "28%": { opacity: 0 },
  "38%": {
    opacity: 1,
    clipPath: "inset(-8px -8px 48% -8px)",
    translate: "-6px 0",
    filter: "drop-shadow(-3px 0 var(--ux)) drop-shadow(3px 0 var(--cw))",
  },
  "52%": {
    clipPath: "inset(36% -8px -8px -8px)",
    translate: "7px 0",
    filter: "drop-shadow(2px 0 var(--ux)) drop-shadow(-2px 0 var(--cw))",
  },
  "66%": {
    clipPath: "none",
    translate: "-3px 0",
    filter: "drop-shadow(-1px 0 var(--ux)) drop-shadow(1px 0 var(--cw))",
  },
  "82%": { translate: "1px 0", filter: "none" },
  "100%": { opacity: 1, clipPath: "none", translate: "none", filter: "none" },
});

const glitchInAlt = keyframes({
  "0%": { opacity: 0 },
  "8%": {
    opacity: 1,
    clipPath: "inset(48% -8px 22% -8px)",
    translate: "16px 0",
    filter: "drop-shadow(5px 0 var(--ux)) drop-shadow(-5px 0 var(--cw))",
  },
  "20%": {
    clipPath: "inset(4% -8px 70% -8px)",
    translate: "-10px 0",
    filter: "drop-shadow(-4px 0 var(--ux)) drop-shadow(4px 0 var(--cw))",
  },
  "32%": { opacity: 0 },
  "42%": {
    opacity: 1,
    clipPath: "inset(28% -8px 12% -8px)",
    translate: "8px 0",
    filter: "drop-shadow(3px 0 var(--ux)) drop-shadow(-3px 0 var(--cw))",
  },
  "56%": {
    clipPath: "inset(-8px -8px 30% -8px)",
    translate: "-5px 0",
    filter: "drop-shadow(-2px 0 var(--ux)) drop-shadow(2px 0 var(--cw))",
  },
  "70%": {
    clipPath: "none",
    translate: "2px 0",
    filter: "drop-shadow(1px 0 var(--ux)) drop-shadow(-1px 0 var(--cw))",
  },
  "84%": { translate: "none", filter: "none" },
  "100%": { opacity: 1, clipPath: "none", translate: "none", filter: "none" },
});

// Reduced motion keeps only a short fade, with nothing moving.
const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

// A veil only fades, so the patch of page colour under a piece's words never tears with them.
const veilIn = keyframes({
  from: { opacity: 0 },
});

// Filtered tiles deal instead of glitching, since a new filter deals a fresh hand.
const deal = keyframes({
  from: { opacity: 0, transform: "scale(0.6) rotate(-6deg)" },
});

/**
 * The load-in: pieces boot like a corrupted game frame. Each cuts in as torn slices that jump
 * sideways on a pink and cyan split, drops out once, then locks clean, in hard steps with no
 * easing. Every [data-cut] composes `piece` first: it plays once, when watchCutIns gives it .in, and
 * pieces that arrive in the same frame stagger by --cut-order. A piece inside one still waiting
 * waits too. Siblings alternate two slice patterns so a row never tears in unison. Without JS
 * everything sits at rest; with reduced motion a piece only fades in. A piece under [data-loop]
 * pauses while watchCutIns marks it .paused, except for that fade.
 *
 * `deal` swaps the glitch for a dealt card, on the rule tiles. `veil` is for a [data-cut] that
 * wears a veil (see section.css.ts): it fades up while its words, a `piece` composed with `words`
 * inside it, glitch in. `islandPart` plays the glitch on the header island's parts once the page
 * is ready, staggered across the island, on the visit's first page only.
 */
export const loadIn = {
  piece: style({
    "@layer": {
      [under1]: {
        selectors: {
          [`&${IN}`]: {
            animationName: glitchIn,
            animationDuration: "560ms",
            animationTimingFunction: "steps(1, end)",
            animationDelay: STAGGER,
            animationFillMode: "backwards",
          },
          "&:is(.paused)": {
            animationPlayState: "paused !important",
          },
          [`&${WAITING}`]: {
            opacity: 0,
          },
          [`&${IN}${HELD}`]: {
            animationName: "none",
            animationDuration: "0s",
            animationTimingFunction: "ease",
            animationDelay: "0s",
            animationFillMode: "none",
          },
          [`&${IN}:nth-child(2n)`]: {
            animationName: glitchInAlt,
          },
        },
        "@media": {
          [REDUCE]: {
            selectors: {
              [`&&${IN}`]: {
                animationName: `${fadeIn} !important`,
              },
              [`&${IN}`]: {
                animationDuration: "240ms !important",
                animationTimingFunction: "ease !important",
                animationDelay: "0s !important",
                animationFillMode: "backwards !important",
                animationPlayState: "running !important",
              },
            },
          },
        },
      },
    },
  }),
  deal: style({
    selectors: {
      [`&${IN}`]: {
        animationName: deal,
        animationDuration: motion["--t-pop"],
        animationTimingFunction: motion["--snap"],
        animationDelay: STAGGER,
        animationFillMode: "backwards",
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          [`&${IN}`]: {
            animationName: `${fadeIn} !important`,
            animationDuration: "240ms !important",
            animationTimingFunction: "ease !important",
            animationDelay: "0s !important",
            animationFillMode: "backwards !important",
          },
        },
      },
    },
  }),
  veil: style({
    selectors: {
      [`&${IN}`]: {
        animationName: veilIn,
        animationDuration: "200ms",
        animationTimingFunction: motion["--out"],
        animationDelay: STAGGER,
        animationFillMode: "backwards",
      },
      [`&${WAITING}`]: {
        opacity: 0,
      },
      [`&${IN}${HELD}`]: {
        animationName: "none",
        animationDuration: "0s",
        animationDelay: "0s",
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          [`&${IN}`]: {
            animationDelay: "0s",
          },
        },
      },
    },
  }),
  words: style({
    display: "block",
  }),
  islandPart: style({
    selectors: {
      [`&${ARRIVING}`]: {
        animationName: glitchIn,
        animationDuration: "560ms",
        animationTimingFunction: "steps(1, end)",
        animationDelay: "0ms",
        animationFillMode: "backwards",
      },
      [`&${BOOTING}`]: {
        opacity: 0,
      },
      [`&&${ARRIVING}:nth-child(2)`]: {
        animationDelay: "40ms",
      },
      [`&${ARRIVING}:nth-child(2n)`]: {
        animationName: glitchInAlt,
      },
      [`&&${ARRIVING}:nth-child(3)`]: {
        animationDelay: "80ms",
      },
      [`&${ARRIVING}:nth-child(4)`]: {
        animationDelay: "120ms",
      },
      [`&${ARRIVING}:nth-child(5)`]: {
        animationDelay: "160ms",
      },
      [`&${ARRIVING}:nth-child(6)`]: {
        animationDelay: "200ms",
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          [`&&${ARRIVING}`]: {
            animationName: `${fadeIn} !important`,
          },
          [`&${ARRIVING}`]: {
            animationDuration: "240ms !important",
            animationTimingFunction: "ease !important",
            animationFillMode: "backwards !important",
          },
          [`&&&${ARRIVING}`]: {
            animationDelay: "0s !important",
          },
        },
      },
    },
  }),
};
