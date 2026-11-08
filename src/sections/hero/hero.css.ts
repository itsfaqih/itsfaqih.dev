import { cursors, fonts, motion, palette } from "../../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../../when";
import { under1 } from "../../layers.css";
import { HOVER, REDUCE } from "../../browser/media-query";
const STACKED = "(max-width: 960px)";
const FOCUS_RING = `3px solid ${palette["--focus"]}`;
// The leaving phrase stays visible until its fade ends.
const PHRASE_OUT = "160ms";

const slash = keyframes({
  "0%": { clipPath: "polygon(0 0,0 0,-20% 100%,-20% 100%)", transform: "translate(-16px)" },
  to: { clipPath: "polygon(0 0,120% 0,100% 100%,-20% 100%)" },
});
const scrollWheel = keyframes({
  "0%": {
    opacity: 0,
    animationTimingFunction: "cubic-bezier(.19,1,.22,1)",
    transform: "translateY(-3px)",
  },
  "15%": {
    opacity: 1,
    animationTimingFunction: "cubic-bezier(.645,.045,.355,1)",
    transform: "none",
  },
  "60%, to": { opacity: 0, transform: "translateY(10px)" },
});
const prog = keyframes({
  to: { transform: "scaleX(1)" },
});

export const styles = {
  root: style({
    display: "grid",
    gridTemplateColumns: "1fr 1.05fr",
    gap: "48px",
    alignItems: "center",
    paddingTop: "38px",
    paddingInline: 0,
    paddingBottom: "80px",
    "@media": {
      [STACKED]: {
        gridTemplateColumns: "1fr",
        gap: "28px",
        paddingTop: "24px",
      },
    },
  }),
  // Three lines: "I build" / the phrase / the highlight. The phrase line never wraps, so the size
  // follows the column to fit the longest one, "agentic setups that" at 12.2em: two columns share
  // (100vw - 112px) at 1 : 1.05 up to the 1200px wrap; one column is 100vw - 36px.
  title: style({
    fontSize: "clamp(28px, 3.9vw - 5px, 43px)",
    "@media": {
      [STACKED]: {
        fontSize: "clamp(26px, 8vw - 4px, 44px)",
      },
    },
  }),
  line: style({
    display: "block",
  }),
  nowrap: style({
    whiteSpace: "nowrap",
  }),
  // Every phrase sits in the same grid cell, so the headline keeps the height of the longest one.
  phrases: style({
    display: "grid",
  }),
  phrase: style({
    "@layer": {
      [under1]: {
        gridArea: "1 / 1",
        opacity: 0,
        visibility: "hidden",
        transitionProperty: "opacity, visibility",
        transitionDuration: `${PHRASE_OUT}, 0s`,
        transitionTimingFunction: "ease, ease",
        transitionDelay: `0s, ${PHRASE_OUT}`,
        transitionBehavior: "normal, normal",
      },
    },
  }),
  phraseOn: style({
    opacity: 1,
    visibility: "visible",
    transitionProperty: "opacity",
    transitionDuration: "120ms",
    transitionTimingFunction: "ease",
    transitionDelay: "0s",
    transitionBehavior: "normal",
  }),
  // Later phrases slash in; the first arrives with the headline's glitch.
  slash: style({
    animationName: slash,
    animationDuration: "520ms",
    animationTimingFunction: motion["--cut"],
  }),
  leadLink: style({
    color: palette["--text"],
    textDecorationLine: "underline",
    textDecorationColor: palette["--hair"],
    textUnderlineOffset: "4px",
    transitionProperty: "text-decoration-color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        textDecorationColor: palette["--go-ink"],
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            textDecorationColor: palette["--go-ink"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  // The button wears the slide's hue. The hue eases slower than a hover would, so hover moves to a
  // brightness filter on its own quick timing.
  go: style({
    backgroundColor: "var(--c)",
    transitionProperty: "transform, background-color, box-shadow, filter",
    transitionDuration: "150ms, 280ms, 280ms, 120ms",
    transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94), ease, ease, ease",
    transitionDelay: "0s, 0s, 0s, 0s",
    transitionBehavior: "normal, normal, normal, normal",
    vars: {
      "--key": "color-mix(in oklab, var(--c) 70%, #000)",
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            filter: "brightness(1.08)",
          },
        },
      },
    },
  }),
  // A mouse whose wheel rolls down, rests, and rolls again, on the button row at button height.
  // The loop rides on the wheel, since [data-cut] owns the link's animation.
  cue: style({
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    height: "48px",
    marginLeft: "12px",
    paddingBlock: 0,
    paddingInline: "6px",
    borderRadius: "12px",
    font: `700 14px ${fonts["--display"]}`,
    color: palette["--dim"],
    textDecorationLine: "none",
    cursor: cursors["--cursor-point"],
    transitionProperty: "color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:focus-visible": {
        outline: FOCUS_RING,
        outlineOffset: "3px",
      },
      "&:active": {
        color: palette["--text"],
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  mouse: style({
    position: "relative",
    flex: "none",
    width: "22px",
    height: "34px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "currentcolor",
    borderRadius: "11px",
  }),
  wheel: style({
    position: "absolute",
    top: "6px",
    left: "50%",
    width: "4px",
    height: "7px",
    marginLeft: "-2px",
    borderRadius: "2px",
    backgroundColor: palette["--go-ink"],
    animationName: scrollWheel,
    animationDuration: "1.8s",
    animationIterationCount: "infinite",
    "@media": {
      [REDUCE]: {
        animationName: "none",
      },
    },
  }),
  bench: style({
    display: "grid",
    gap: "12px",
    justifyItems: "center",
  }),
  // Above the tilted card, whose art may swing out past its edges.
  controls: style({
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "14px",
  }),
  pips: style({
    display: "flex",
    gap: "2px",
  }),
  pip: style({
    display: "grid",
    alignItems: "center",
    width: "36px",
    height: "32px",
    paddingBlock: 0,
    paddingInline: "4px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundImage: "none",
    backgroundPosition: "0 0",
    cursor: cursors["--cursor-point"],
    selectors: {
      "&:focus-visible": {
        outline: FOCUS_RING,
        outlineOffset: "3px",
      },
    },
  }),
  bar: style({
    "@layer": {
      [under1]: {
        display: "block",
        height: "4px",
        borderRadius: "2px",
        backgroundColor: palette["--hair"],
        overflow: "hidden",
        transitionProperty: "background-color",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
        "@media": {
          [HOVER]: {
            selectors: {
              [`&${when.ancestor(":hover")}`]: {
                backgroundColor: palette["--mute"],
                transitionDuration: motion["--t-fast"],
                transitionTimingFunction: motion["--fast"],
              },
            },
          },
        },
      },
    },
  }),
  // The current slide's bar fills over its run; --ms is the run's length.
  barOn: style({
    backgroundColor: `color-mix(in oklab, var(--c) 30%, ${palette["--hair"]})`,
    selectors: {
      "&::after": {
        content: '""',
        display: "block",
        height: "100%",
        backgroundColor: "var(--c)",
        transform: "scaleX(0)",
        transformOrigin: "left",
        animationName: prog,
        animationDuration: "var(--ms)",
        animationTimingFunction: "linear",
        animationFillMode: "forwards",
      },
    },
  }),
  barHeld: style({
    selectors: {
      "&::after": {
        animationPlayState: "paused !important",
      },
    },
  }),
  pause: style({
    width: "30px",
    height: "28px",
    display: "grid",
    placeItems: "center",
    font: `500 10px ${fonts["--display"]}`,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: palette["--panel-2"],
    color: palette["--text"],
    borderRadius: "999px",
    cursor: cursors["--cursor-point"],
    flex: "none",
    selectors: {
      "&:focus-visible": {
        outline: FOCUS_RING,
        outlineOffset: "3px",
      },
    },
  }),
  // Play and pause share one cell and cross-fade: the arriving glyph on the fast tier, the leaving
  // one on its quicker exit, so the slot never resizes.
  glyph: style({
    "@layer": {
      [under1]: {
        gridArea: "1 / 1",
        transitionProperty: "opacity, transform, filter",
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: "ease-out",
      },
    },
  }),
  glyphOff: style({
    opacity: 0,
    transform: "scale(0.6)",
    filter: "blur(4px)",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: "ease-in",
    "@media": {
      [REDUCE]: {
        transform: "none",
      },
    },
  }),
};
