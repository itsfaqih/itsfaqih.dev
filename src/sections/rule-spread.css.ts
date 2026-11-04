import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
// A press or hover counts only while the deck is not being dragged.
const STILL = ":not([data-dragging] *)";
const INK = `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`;
const PRESSED = `:active${STILL}`;
const NUDGED = `:is(:hover > * > *)${STILL}`;

/*
 * The cards share one grid cell and take their pose from --d, the card's offset from the centre,
 * and --ad, its distance. Per step from the centre a card moves 68% of its width sideways, 10px
 * down and 92px back, turns 13deg toward the centre, tilts 2.5deg, and fades 20%, gone by the
 * third step. The backdrop's dots around the centred card take its hue (backdrop-dots.ts).
 */
// The style type has no member for this non-standard property.
const undraggable = { WebkitUserDrag: "none" };

export const styles = {
  spread: style({
    display: "block",
  }),
  stage: style({
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
    cursor: cursors["--cursor-grab"],
    userSelect: "none",
    selectors: {
      "&:is([data-dragging])": {
        cursor: cursors["--cursor-grabbing"],
      },
    },
  }),
  slot: style({
    gridArea: "1 / 1",
    display: "grid",
    width: "min(300px, 66vw)",
    transform:
      "translateX(calc(var(--d) * 68%)) translateY(calc(var(--ad) * 10px)) translateZ(calc(var(--ad) * -92px)) rotateY(calc(var(--d) * -13deg)) rotateZ(calc(var(--d) * 2.5deg))",
  }),
  // A [data-cut] piece: its states key on pseudo-classes, so its class list never changes and the
  // cut-in's .in survives a re-render.
  card: style({
    // Cards fade into the page under a cover of its colour rather than going see-through, so a
    // card behind never shows through the one in front. With reduced motion the deck jumps to the
    // chosen card, and only the fade eases.
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
    boxShadow: `${palette["--raise"]}, 0 6px 0 var(--key)`,
    color: palette["--text"],
    textDecoration: "none",
    ...undraggable,
    transitionProperty: "translate, box-shadow",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    vars: {
      "--key": `color-mix(in oklab, var(--c) ${palette["--key-mix"]}, #000)`,
    },
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        inset: "-3px -3px -9px",
        borderRadius: "24px",
        backgroundColor: palette["--bg"],
        opacity: "clamp(0, var(--ad) * 0.2 + max(0, var(--ad) - 2) * 0.4, 1)",
        pointerEvents: "none",
      },
      [`&${PRESSED}`]: {
        boxShadow: `${palette["--raise"]}, 0 3px 0 var(--key)`,
        translate: "0 3px",
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
      "&:focus-visible": {
        outlineWidth: "3px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "4px",
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          "&::after": {
            transitionProperty: "opacity",
            transitionDuration: "200ms",
            transitionTimingFunction: "ease",
          },
          [`&${PRESSED}`]: {
            translate: "none",
          },
        },
      },
    },
  }),
  plate: style({
    "@layer": {
      [under1]: {
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
    },
  }),
  foot: style({
    marginTop: "auto",
    fontWeight: 500,
    color: palette["--mute"],
  }),
  arrow: style({
    fontSize: "15px",
    lineHeight: "11px",
    color: INK,
    transitionProperty: "translate",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${NUDGED}`]: {
            translate: "2px -2px",
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
      [`${HOVER} and ${REDUCE}`]: {
        selectors: {
          [`&${NUDGED}`]: {
            translate: "none",
          },
        },
      },
    },
  }),
  thumb: style({
    borderRadius: "14px",
  }),
  title: style({
    paddingBlock: 0,
    paddingInline: "2px",
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
  }),
  // A fixed two-line slot, so every card in the deck keeps one height.
  summary: style({
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
  }),
  nav: style({
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
  }),
  step: style({
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    // Disabled at either end, the key goes gray and flat rather than see-through.
    backgroundColor: palette["--panel"],
    color: palette["--text"],
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    // The nav's tabular figures are for the count, not the arrows.
    fontVariantNumeric: "normal",
    boxShadow: `${palette["--raise"]}, 0 3px 0 ${palette["--drop-ink"]}`,
    cursor: cursors["--cursor-point"],
    // The press rides the moderate spring and the rim lights on the fast one.
    transitionProperty: "transform, box-shadow, border-color, background-color, color",
    transitionDuration: `${motion["--t-moderate-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}`,
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active:not(:disabled)": {
        boxShadow: `${palette["--raise"]}, 0 1px 0 ${palette["--drop-ink"]}`,
        transform: "translateY(2px)",
      },
      "&&:active:not(:disabled)": {
        transitionDuration: `${motion["--t-moderate"]}, ${motion["--t-moderate"]}, ${motion["--t-fast"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}`,
        transitionTimingFunction: `${motion["--moderate"]}, ${motion["--moderate"]}, ${motion["--fast"]}, ${motion["--exit"]}, ${motion["--exit"]}`,
      },
      "&:focus-visible": {
        outlineWidth: "3px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "2px",
      },
      "&:hover:not(:disabled)": {
        borderColor: palette["--hair-hover"],
        transitionDuration: `${motion["--t-moderate-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast"]}, ${motion["--t-fast-exit"]}, ${motion["--t-fast-exit"]}`,
        transitionTimingFunction: `${motion["--exit"]}, ${motion["--exit"]}, ${motion["--fast"]}, ${motion["--exit"]}, ${motion["--exit"]}`,
      },
      "&:disabled": {
        backgroundColor: palette["--panel-2"],
        color: palette["--mute"],
        boxShadow: `0 3px 0 ${palette["--drop-ink"]}`,
        cursor: cursors["--cursor-forbid"],
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          "&:active:not(:disabled)": {
            transform: "none",
          },
        },
      },
    },
  }),
};

const numIn = keyframes({
  from: { translate: "0 var(--num-from, 100%)", opacity: 0 },
});

const numOut = keyframes({
  to: { translate: "0 var(--num-to, -100%)", opacity: 0 },
});

// The count's new digits slide in from the side it moved toward while the old ones leave.
export const number = {
  root: style({
    display: "inline-grid",
    overflow: "clip",
    verticalAlign: "bottom",
    selectors: {
      '&:is([data-dir="down"])': {
        vars: {
          "--num-from": "-100%",
          "--num-to": "100%",
        },
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          '&:not([data-dir="down"])': {
            vars: {
              "--num-from": "0",
              "--num-to": "0",
            },
          },
        },
      },
    },
  }),
  digits: style({
    gridArea: "1 / 1",
  }),
  was: style({
    animationName: numOut,
    animationDuration: motion["--t-moderate-exit"],
    animationTimingFunction: motion["--exit"],
    animationFillMode: "forwards",
  }),
  now: style({
    animationName: numIn,
    animationDuration: motion["--t-moderate"],
    animationTimingFunction: motion["--moderate"],
    animationFillMode: "backwards",
  }),
};
