import * as stylex from "@stylexjs/stylex";
import { motion } from "../theme.stylex";

const REDUCE = "@media (prefers-reduced-motion: reduce)";
// watchCutIns (cut-ins.ts) adds .in to each [data-cut] piece once it is on screen.
const IN = ":is(.in)";
// With JS on, a piece waits hidden until it gets .in, and so does every piece inside one still waiting.
const WAITING = ":is(:is(.js *):not(.in), .js [data-cut]:not(.in) *)";
const HELD = ":is(.js [data-cut]:not(.in) *)";
// The root script adds .js, and .no-intro once the home intro has handed off (or never plays).
const READY = ":is(.js.no-intro *)";
const BOOTING = ":is(.js:not(.no-intro) *)";
const STAGGER = `calc(min(var(--cut-order, 0), 12) * ${motion["--t-step"]})`;

// Slices clip top and bottom only, with room at the sides for the colour split.
const glitchIn = stylex.keyframes({
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

const glitchInAlt = stylex.keyframes({
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

// Reduced motion keeps only a short fade up.
const fadeIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(10px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

// A veil only fades, so the patch of page colour under a piece's words never tears with them.
const veilIn = stylex.keyframes({
  from: { opacity: 0 },
});

// Filtered tiles deal instead of glitching, since a new filter deals a fresh hand.
const deal = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.6) rotate(-6deg)" },
});

/**
 * The load-in: pieces boot like a corrupted game frame. Each cuts in as torn slices that jump
 * sideways on a pink and cyan split, drops out once, then locks clean, in hard steps with no
 * easing. Every [data-cut] composes `piece` first: it plays once, when watchCutIns gives it .in, and
 * pieces that arrive in the same frame stagger by --cut-order. A piece inside one still waiting
 * waits too. Siblings alternate two slice patterns so a row never tears in unison. Without JS
 * everything sits at rest; with reduced motion a piece only fades up. A piece under [data-loop]
 * pauses while watchCutIns marks it .paused, except for that fade.
 *
 * `deal` swaps the glitch for a dealt card, on the rule tiles. `veil` is for a [data-cut] that
 * wears a veil (see section.ts): it fades up while its words, a `piece` composed with `words`
 * inside it, glitch in. `islandPart` plays the glitch on the header island's parts once the page
 * is ready, staggered across the island.
 */
export const loadIn = stylex.create({
  piece: {
    opacity: { default: null, [WAITING]: 0 },
    animationName: {
      default: null,
      [IN]: {
        default: glitchIn,
        ":nth-child(2n)": glitchInAlt,
        [HELD]: "none",
        [REDUCE]: `${fadeIn} !important`,
      },
    },
    animationDuration: {
      default: null,
      [IN]: { default: "560ms", [HELD]: "0s", [REDUCE]: "240ms !important" },
    },
    animationTimingFunction: {
      default: null,
      [IN]: { default: "steps(1, end)", [HELD]: "ease", [REDUCE]: "ease !important" },
    },
    animationDelay: {
      default: null,
      [IN]: { default: STAGGER, [HELD]: "0s", [REDUCE]: "0s !important" },
    },
    animationFillMode: {
      default: null,
      [IN]: { default: "backwards", [HELD]: "none", [REDUCE]: "backwards !important" },
    },
    animationPlayState: {
      default: null,
      ":is(.paused)": "paused !important",
      [REDUCE]: { default: null, [IN]: "running !important" },
    },
  },
  deal: {
    animationName: { default: null, [IN]: { default: deal, [REDUCE]: `${fadeIn} !important` } },
    animationDuration: {
      default: null,
      [IN]: { default: motion["--t-pop"], [REDUCE]: "240ms !important" },
    },
    animationTimingFunction: {
      default: null,
      [IN]: { default: motion["--snap"], [REDUCE]: "ease !important" },
    },
    animationDelay: { default: null, [IN]: { default: STAGGER, [REDUCE]: "0s !important" } },
    animationFillMode: {
      default: null,
      [IN]: { default: "backwards", [REDUCE]: "backwards !important" },
    },
  },
  veil: {
    opacity: { default: null, [WAITING]: 0 },
    animationName: { default: null, [IN]: { default: veilIn, [HELD]: "none" } },
    animationDuration: { default: null, [IN]: { default: "200ms", [HELD]: "0s" } },
    animationTimingFunction: { default: null, [IN]: motion["--out"] },
    animationDelay: { default: null, [IN]: { default: STAGGER, [HELD]: "0s", [REDUCE]: "0s" } },
    animationFillMode: { default: null, [IN]: "backwards" },
  },
  words: {
    display: "block",
  },
  islandPart: {
    opacity: { default: null, [BOOTING]: 0 },
    animationName: {
      default: null,
      [READY]: {
        default: glitchIn,
        ":nth-child(2n)": glitchInAlt,
        [REDUCE]: `${fadeIn} !important`,
      },
    },
    animationDuration: {
      default: null,
      [READY]: { default: "560ms", [REDUCE]: "240ms !important" },
    },
    animationTimingFunction: {
      default: null,
      [READY]: { default: "steps(1, end)", [REDUCE]: "ease !important" },
    },
    animationDelay: {
      default: null,
      [READY]: {
        default: "0ms",
        ":nth-child(2)": "40ms",
        ":nth-child(3)": "80ms",
        ":nth-child(4)": "120ms",
        ":nth-child(5)": "160ms",
        ":nth-child(6)": "200ms",
        [REDUCE]: "0s !important",
      },
    },
    animationFillMode: {
      default: null,
      [READY]: { default: "backwards", [REDUCE]: "backwards !important" },
    },
  },
});
