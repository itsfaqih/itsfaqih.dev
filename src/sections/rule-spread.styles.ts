import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";

const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
// A press or hover counts only while the deck is not being dragged.
const STILL = ":not([data-dragging] *)";
const INK = `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`;
const PRESSED = `:active${STILL}`;
const NUDGED = `:is(:hover > * > *)${STILL}`;

/*
 * The cards share one grid cell and take their pose from --d, the card's offset from the centre,
 * and --ad, its distance. Per step from the centre a card moves 68% of its width sideways, 10px
 * down and 92px back, turns 13deg toward the centre, tilts 2.5deg, and fades 20%, gone by the
 * third step. The glow behind the deck takes the centred card's hue.
 */
export const styles = stylex.create({
  // --glow is registered in arcade.css, so it can ease between hues.
  spread: {
    display: "block",
    "--glow": "var(--c)",
    transitionProperty: "--glow",
    transitionDuration: "600ms",
    transitionTimingFunction: "ease",
  },
  stage: {
    position: "relative",
    display: "grid",
    justifyItems: "center",
    paddingTop: "20px",
    paddingInline: 0,
    paddingBottom: "48px",
    // Out to the screen edge at every width, so the neighbours peek in from it instead of being cut
    // at the column's edge. html and body clip the overflow.
    marginInline: "calc(50% - 50vw)",
    perspective: "1400px",
    overflowX: "clip",
    touchAction: "pan-y",
    cursor: {
      default: cursors["--cursor-grab"],
      ":is([data-dragging])": cursors["--cursor-grabbing"],
    },
    userSelect: "none",
    "::before": {
      content: '""',
      position: "absolute",
      inset: "0 8%",
      backgroundImage:
        "radial-gradient(closest-side, color-mix(in srgb, var(--glow) 18%, transparent), transparent)",
      pointerEvents: "none",
    },
  },
  slot: {
    gridArea: "1 / 1",
    display: "grid",
    width: "min(300px, 66vw)",
    transform:
      "translateX(calc(var(--d) * 68%)) translateY(calc(var(--ad) * 10px)) translateZ(calc(var(--ad) * -92px)) rotateY(calc(var(--d) * -13deg)) rotateZ(calc(var(--d) * 2.5deg))",
  },
  // A [data-cut] piece: its states key on pseudo-classes, so its class list never changes and the
  // cut-in's .in survives a re-render.
  card: {
    "--key": `color-mix(in oklab, var(--c) ${palette["--key-mix"]}, #000)`,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingTop: "14px",
    paddingInline: "14px",
    paddingBottom: "16px",
    borderRadius: "22px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--c)",
    boxShadow: {
      default: `${palette["--raise"]}, 0 6px 0 var(--key)`,
      [PRESSED]: `${palette["--raise"]}, 0 3px 0 var(--key)`,
    },
    translate: { default: null, [PRESSED]: { default: "0 3px", [REDUCE]: "none" } },
    color: palette["--text"],
    textDecoration: "none",
    WebkitUserDrag: "none",
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "4px" },
    transitionProperty: "translate, box-shadow",
    transitionDuration: { default: motion["--t-moderate-exit"], [PRESSED]: motion["--t-moderate"] },
    transitionTimingFunction: { default: motion["--exit"], [PRESSED]: motion["--moderate"] },
    // Cards fade into the page under a cover of its colour rather than going see-through, so a
    // card behind never shows through the one in front. With reduced motion the deck jumps to the
    // chosen card, and only the fade eases.
    "::after": {
      content: '""',
      position: "absolute",
      inset: "-3px -3px -9px",
      borderRadius: "24px",
      backgroundColor: palette["--bg"],
      opacity: "clamp(0, var(--ad) * 0.2 + max(0, var(--ad) - 2) * 0.4, 1)",
      pointerEvents: "none",
      transitionProperty: { default: null, [REDUCE]: "opacity" },
      transitionDuration: { default: null, [REDUCE]: "200ms" },
      transitionTimingFunction: { default: null, [REDUCE]: "ease" },
    },
  },
  plate: {
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: 0,
    paddingInline: "2px",
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: INK,
  },
  foot: {
    marginTop: "auto",
    fontWeight: 500,
    color: palette["--mute"],
  },
  arrow: {
    fontSize: "15px",
    lineHeight: "11px",
    color: INK,
    translate: {
      default: null,
      [HOVER]: { default: null, [NUDGED]: { default: "2px -2px", [REDUCE]: "none" } },
    },
    transitionProperty: "translate",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [HOVER]: { default: null, [NUDGED]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [HOVER]: { default: null, [NUDGED]: motion["--fast"] },
    },
  },
  thumb: {
    borderRadius: "14px",
  },
  title: {
    paddingBlock: 0,
    paddingInline: "2px",
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
  },
  // A fixed two-line slot, so every card in the deck keeps one height.
  summary: {
    height: "3em",
    marginTop: "-9px",
    paddingBlock: 0,
    paddingInline: "2px",
    fontSize: "13px",
    lineHeight: 1.5,
    color: palette["--dim"],
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    fontVariantNumeric: "tabular-nums",
    color: palette["--dim"],
  },
  step: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":hover:not(:disabled)": palette["--hair-hover"] },
    // Disabled at either end, the key goes gray and flat rather than see-through.
    backgroundColor: { default: palette["--panel"], ":disabled": palette["--panel-2"] },
    color: { default: palette["--text"], ":disabled": palette["--mute"] },
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    // The nav's tabular figures are for the count, not the arrows.
    fontVariantNumeric: "normal",
    boxShadow: {
      default: `${palette["--raise"]}, 0 3px 0 ${palette["--drop-ink"]}`,
      ":active:not(:disabled)": `${palette["--raise"]}, 0 1px 0 ${palette["--drop-ink"]}`,
      ":disabled": `0 3px 0 ${palette["--drop-ink"]}`,
    },
    transform: {
      default: null,
      ":active:not(:disabled)": { default: "translateY(2px)", [REDUCE]: "none" },
    },
    cursor: { default: cursors["--cursor-point"], ":disabled": cursors["--cursor-forbid"] },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    // The press rides the moderate spring and the rim lights on the fast one.
    transitionProperty: "transform, box-shadow, border-color, background-color, color",
    transitionDuration: {
      default: `${motion["--t-moderate-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}`,
      ":hover:not(:disabled)": `${motion["--t-moderate-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}`,
      ":active:not(:disabled)": `${motion["--t-moderate"]}, ${motion["--t-moderate"]}, ${motion["--t-fast"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}`,
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover:not(:disabled)": `${motion["--exit"]}, ${motion["--exit"]}, ${motion["--fast"]}, ${motion["--exit"]}, ${motion["--exit"]}`,
      ":active:not(:disabled)": `${motion["--moderate"]}, ${motion["--moderate"]}, ${motion["--fast"]}, ${motion["--exit"]}, ${motion["--exit"]}`,
    },
  },
});

const numIn = stylex.keyframes({
  from: { translate: "0 var(--num-from, 100%)", opacity: 0 },
});

const numOut = stylex.keyframes({
  to: { translate: "0 var(--num-to, -100%)", opacity: 0 },
});

// The count's new digits slide in from the side it moved toward while the old ones leave.
export const number = stylex.create({
  root: {
    "--num-from": {
      default: null,
      ':is([data-dir="down"])': "-100%",
      [REDUCE]: { default: null, ':not([data-dir="down"])': "0" },
    },
    "--num-to": {
      default: null,
      ':is([data-dir="down"])': "100%",
      [REDUCE]: { default: null, ':not([data-dir="down"])': "0" },
    },
    display: "inline-grid",
    overflow: "clip",
    verticalAlign: "bottom",
  },
  digits: {
    gridArea: "1 / 1",
  },
  was: {
    animationName: numOut,
    animationDuration: motion["--t-moderate-exit"],
    animationTimingFunction: motion["--exit"],
    animationFillMode: "forwards",
  },
  now: {
    animationName: numIn,
    animationDuration: motion["--t-moderate"],
    animationTimingFunction: motion["--moderate"],
    animationFillMode: "backwards",
  },
});

export const pad = (n: number) => String(n).padStart(2, "0");
