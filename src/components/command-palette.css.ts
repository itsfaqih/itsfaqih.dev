import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
// command-palette.client.ts sets these on the backdrop and the stage while they enter and leave.
const STARTING = ":is([data-starting-style])";
const LEAVING = ":is([data-ending-style])";
const IN_STARTING = ":is([data-starting-style] *)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";
const DARK = ":is(.dark *)";
// The island's ground, black over the light theme and white over the dark one.
const ISLAND = "#0a0a0c";
const ISLAND_DARK = "#fff";

// The pour, on one full-screen layer of the island's ink, shaped by clip-path. The island gathers
// into a drop, the drop falls to the panel's top, stretching as it speeds up and squashing as it
// lands, then splashes wide and runs down into the panel. Closing draws it back up the same way.
// Each stage hands its speed to the next: the gather settles, the fall accelerates into the landing,
// and the splash leaves fast, so the shape never parks between stages.
const POURING_IN = ":is([data-pour]:not([data-ending-style]) *)";
const POURING_OUT = ":is([data-ending-style] *)";
const IN_ISLAND = {
  clipPath:
    "inset(var(--anchor-y) calc(100% - var(--anchor-x) - var(--anchor-w)) calc(100% - var(--anchor-y) - var(--anchor-h)) var(--anchor-x) round calc(var(--anchor-h) / 2))",
};
const DROP_UP = {
  clipPath:
    "inset(calc((var(--anchor-y) + var(--anchor-h) / 2) - 44px / 2) calc(100% - (var(--anchor-x) + var(--anchor-w) / 2) - 44px / 2) calc(100% - (var(--anchor-y) + var(--anchor-h) / 2) - 44px / 2) calc((var(--anchor-x) + var(--anchor-w) / 2) - 44px / 2) round 22px)",
};
const FALLING = {
  clipPath:
    "inset(calc(((var(--anchor-y) + var(--anchor-h) / 2) * 0.3 + (var(--to-y) + 22px) * 0.7) - 60px / 2) calc(100% - ((var(--anchor-x) + var(--anchor-w) / 2) * 0.3 + (var(--to-x) + var(--to-w) / 2) * 0.7) - 34px / 2) calc(100% - ((var(--anchor-y) + var(--anchor-h) / 2) * 0.3 + (var(--to-y) + 22px) * 0.7) - 60px / 2) calc(((var(--anchor-x) + var(--anchor-w) / 2) * 0.3 + (var(--to-x) + var(--to-w) / 2) * 0.7) - 34px / 2) round 17px)",
};
const RISING = {
  clipPath:
    "inset(calc(((var(--anchor-y) + var(--anchor-h) / 2) * 0.55 + (var(--to-y) + 22px) * 0.45) - 58px / 2) calc(100% - ((var(--anchor-x) + var(--anchor-w) / 2) * 0.55 + (var(--to-x) + var(--to-w) / 2) * 0.45) - 34px / 2) calc(100% - ((var(--anchor-y) + var(--anchor-h) / 2) * 0.55 + (var(--to-y) + 22px) * 0.45) - 58px / 2) calc(((var(--anchor-x) + var(--anchor-w) / 2) * 0.55 + (var(--to-x) + var(--to-w) / 2) * 0.45) - 34px / 2) round 17px)",
};
const DROP_DOWN = {
  clipPath:
    "inset(calc((var(--to-y) + 22px) - 44px / 2) calc(100% - (var(--to-x) + var(--to-w) / 2) - 44px / 2) calc(100% - (var(--to-y) + 22px) - 44px / 2) calc((var(--to-x) + var(--to-w) / 2) - 44px / 2) round 22px)",
};
const SQUASHED = {
  clipPath:
    "inset(calc((var(--to-y) + 19px) - 38px / 2) calc(100% - (var(--to-x) + var(--to-w) / 2) - 58px / 2) calc(100% - (var(--to-y) + 19px) - 38px / 2) calc((var(--to-x) + var(--to-w) / 2) - 58px / 2) round 19px)",
};
const SPLASH = {
  clipPath:
    "inset(calc((var(--to-y) + max(44px, var(--to-h) * 0.32) / 2) - max(44px, var(--to-h) * 0.32) / 2) calc(100% - (var(--to-x) + var(--to-w) / 2) - (var(--to-w) * 0.66) / 2) calc(100% - (var(--to-y) + max(44px, var(--to-h) * 0.32) / 2) - max(44px, var(--to-h) * 0.32) / 2) calc((var(--to-x) + var(--to-w) / 2) - (var(--to-w) * 0.66) / 2) round 28px)",
};
const PANEL = {
  clipPath:
    "inset(var(--to-y) calc(100% - var(--to-x) - var(--to-w)) calc(100% - var(--to-y) - var(--to-h)) var(--to-x) round 28px)",
};
const SETTLE = "cubic-bezier(0.3, 0, 0.2, 1)";
const DROP = "cubic-bezier(0.55, 0, 0.9, 0.45)";
const SPREAD = "cubic-bezier(0.15, 0.85, 0.3, 1)";
// The splash runs down into the panel on a spring (damping 0.66) that leaves at the splash's speed,
// spills about 7% past the panel's edges and draws back.
const SPILL =
  "linear(0, 0.156, 0.326, 0.492, 0.642, 0.77, 0.873, 0.951, 1.007, 1.043, 1.064, 1.072, 1.072, 1.066, 1.057, 1.047, 1.036, 1.026, 1.017, 1.01, 1.005, 1.001, 0.998, 0.996, 0.996, 0.995, 0.996, 0.996, 0.997, 0.997, 0.998, 0.999, 1)";
// Stages at 8, 16, 30, 35 and 49% of T_IN, leaving the spill the rest.
const pourIn = keyframes({
  "0%": { ...IN_ISLAND, opacity: 0, animationTimingFunction: SETTLE },
  "8.18%": { opacity: 1 },
  "16.36%": { ...DROP_UP, animationTimingFunction: DROP },
  "30%": { ...FALLING, animationTimingFunction: "linear" },
  "35.45%": { ...SQUASHED, animationTimingFunction: SPREAD },
  "49.09%": { ...SPLASH, animationTimingFunction: SPILL },
  "99.9%": { ...PANEL, opacity: 1 },
  "100%": { ...PANEL, opacity: 0 },
});
const pourOut = keyframes({
  "0%": { ...PANEL, opacity: 1, animationTimingFunction: "cubic-bezier(0.5, 0, 0.3, 1)" },
  "38%": { ...DROP_DOWN, animationTimingFunction: "cubic-bezier(0.45, 0, 0.8, 0.5)" },
  "52%": { ...RISING, animationTimingFunction: "linear" },
  "70%": { ...DROP_UP, animationTimingFunction: SPREAD },
  "84%": { opacity: 1 },
  "100%": { ...IN_ISLAND, opacity: 0 },
});
const T_IN = "440ms";
const T_OUT = "240ms";
// The content and then the shadow come in as the drop nears the panel's full size.
const CONTENT_IN = `calc(${T_IN} * 0.45)`;
const SHADOW_IN = `calc(${T_IN} * 0.73)`;
const FAST_IN = `${motion["--t-fast"]} ${motion["--fast"]}`;
const FAST_OUT = `${motion["--t-fast-exit"]} ${motion["--exit"]}`;
// The panel itself wears the drop's shape from the splash on, in its own coordinates, so the
// content fading in never shows past the drop's edge. Its ground stays clear while the drop shapes
// it, and fills in on the last frame, where the drop is exactly the panel and gives way.
const fill = keyframes({
  "0%": {
    clipPath: "inset(0 50% 100% 50% round 28px)",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  "49%": { clipPath: "inset(0 50% 100% 50% round 28px)" },
  "49.09%": {
    clipPath: "inset(0 17% calc(100% - max(44px, 32%)) 17% round 28px)",
    animationTimingFunction: SPILL,
  },
  "99.9%": { clipPath: "inset(0 round 28px)", backgroundColor: "transparent", boxShadow: "none" },
});
const drain = keyframes({
  "0%": {
    clipPath: "inset(0 round 28px)",
    animationTimingFunction: "cubic-bezier(0.5, 0, 0.3, 1)",
  },
  "38%": { clipPath: "inset(0 calc(50% - 22px) calc(100% - 44px) calc(50% - 22px) round 22px)" },
  "100%": { clipPath: "inset(0 calc(50% - 22px) calc(100% - 44px) calc(50% - 22px) round 22px)" },
});

// How far a level slides as the palette moves between levels.
const SLIDE = "30%";

const shiftIn = keyframes({
  from: { opacity: 0, transform: "translateX(var(--shift))", filter: "blur(2px)" },
});
const shiftOut = keyframes({
  to: { opacity: 0, transform: "translateX(var(--shift))", filter: "blur(2px)" },
});

// The palette wears the header island: one black capsule (white over the dark theme) with the
// island's own text tokens, hairlines and pill highlights.
export const styles = {
  // Lays out nothing itself: the backdrop and the stage are fixed to the viewport.
  host: style({
    display: "contents",
  }),
  // Focus lands on one only when Tab runs off either end of the open palette; the client sends it
  // back around, as a modal would.
  guard: style({
    position: "fixed",
    width: 1,
    height: 0,
    overflow: "hidden",
  }),
  backdrop: style({
    position: "fixed",
    inset: 0,
    backgroundColor: `color-mix(in srgb, ${palette["--bg"]} 72%, transparent)`,
    backdropFilter: "blur(6px)",
    zIndex: 100,
    transition: `opacity ${motion["--t-slow"]} ${motion["--slow"]}`,
    selectors: {
      [`&${LEAVING}`]: {
        opacity: 0,
        transition: `opacity ${motion["--t-slow-exit"]} ${motion["--exit"]}`,
      },
      [`&${STARTING}`]: {
        opacity: 0,
      },
    },
  }),
  // The browser's own dialog box, cleared so the stage is only the full-screen layer below.
  dialog: style({
    width: "auto",
    height: "auto",
    maxWidth: "none",
    maxHeight: "none",
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
  }),
  // The client closes the palette once the stage's own transitions end, so a pour out holds the
  // stage until the drop is back in the island.
  stage: style({
    position: "fixed",
    inset: 0,
    zIndex: 102,
    pointerEvents: "none",
    outline: "none",
    selectors: {
      [`&${LEAVING}`]: {
        opacity: 0,
        transition: `opacity 1ms linear ${T_OUT}`,
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          [`&${LEAVING}`]: {
            transition: `opacity ${motion["--t-slow-exit"]} ${motion["--exit"]}`,
          },
          [`&${STARTING}`]: {
            opacity: 0,
          },
          "&:not([data-ending-style])": {
            transition: `opacity ${motion["--t-slow"]} ${motion["--slow"]}`,
          },
        },
      },
    },
  }),
  drop: style({
    position: "absolute",
    inset: 0,
    backgroundColor: ISLAND,
    opacity: 0,
    animationFillMode: "both",
    selectors: {
      [`&${DARK}`]: {
        backgroundColor: ISLAND_DARK,
      },
      [`&${POURING_OUT}`]: {
        animationName: pourOut,
        animationDuration: T_OUT,
      },
      [`&${POURING_IN}`]: {
        animationName: pourIn,
        animationDuration: T_IN,
      },
    },
    "@media": {
      [REDUCE]: {
        display: "none",
      },
    },
  }),
  // Positions the palette and carries its shadow, which fades in once the pour has filled it.
  panel: style({
    position: "absolute",
    top: "16dvh",
    left: "50%",
    width: "min(560px, calc(100vw - 24px))",
    translate: "-50% 0",
    pointerEvents: "auto",
    selectors: {
      "&::before": {
        content: "''",
        position: "absolute",
        inset: 0,
        borderRadius: "28px",
        boxShadow: "0 24px 60px -20px rgb(0 0 0 / 0.6)",
      },
      [`&${DARK}::before`]: {
        boxShadow: "0 24px 60px -20px rgb(0 0 0 / 0.7)",
      },
      [`&${POURING_OUT}::before`]: {
        opacity: 0,
        transition: `opacity ${FAST_OUT}`,
      },
      [`&${POURING_IN}::before`]: {
        transition: `opacity ${FAST_IN} ${SHADOW_IN}`,
      },
      [`&${IN_STARTING}::before`]: {
        opacity: 0,
      },
    },
  }),
  surface: style({
    position: "relative",
    overflow: "hidden",
    borderRadius: "28px",
    boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.08)",
    // Clear for the whole pour out, where the drop is the ground from the first frame.
    backgroundColor: ISLAND,
    color: palette["--dim"],
    font: `400 14px/1.4 ${fonts["--sans"]}`,
    vars: {
      "--text": "#fff",
      "--dim": "rgb(255 255 255 / 0.66)",
      "--mute": "rgb(255 255 255 / 0.46)",
      "--hair": "rgb(255 255 255 / 0.12)",
      "--panel-2": "rgb(255 255 255 / 0.1)",
      "--focus": palette["--go"],
    },
    selectors: {
      [`&${DARK}`]: {
        boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.06)",
        backgroundColor: ISLAND_DARK,
        vars: {
          "--text": "#0a0a0c",
          "--dim": "rgb(10 10 12 / 0.68)",
          "--mute": "rgb(10 10 12 / 0.5)",
          "--hair": "rgb(10 10 12 / 0.1)",
          "--panel-2": "rgb(10 10 12 / 0.07)",
          "--focus": `color-mix(in oklab, ${palette["--go"]} 45%, #000)`,
        },
      },
      [`&${POURING_OUT}`]: {
        boxShadow: "none",
        animationName: drain,
        animationDuration: T_OUT,
        animationFillMode: "both",
        backgroundColor: "transparent",
      },
      [`&${POURING_IN}`]: {
        animationName: fill,
        animationDuration: T_IN,
      },
    },
  }),
  // The content resolves out of a light blur as the surface nears full size, and goes first on the
  // way back, so the clip never slices through text.
  body: style({
    selectors: {
      [`&${POURING_OUT}`]: {
        opacity: 0,
        filter: "blur(4px)",
        transition: `opacity ${FAST_OUT}, filter ${FAST_OUT}`,
      },
      [`&${POURING_IN}`]: {
        transition: `opacity ${FAST_IN} ${CONTENT_IN}, filter ${FAST_IN} ${CONTENT_IN}`,
      },
      [`&${IN_STARTING}`]: {
        opacity: 0,
        filter: "blur(4px)",
      },
    },
  }),
  kbd: style({
    display: "inline-grid",
    placeItems: "center",
    minWidth: "20px",
    padding: "1px 6px",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    color: palette["--dim"],
    font: `500 11px ${fonts["--display"]}`,
  }),
  lastKey: style({
    marginRight: "4px",
  }),
  // Grows the crumb row open (and shut) so the panel eases taller instead of jumping a row.
  crumbFold: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gridTemplateRows: "0fr",
        opacity: 0,
        transition: `grid-template-rows ${motion["--t-moderate-exit"]} ${motion["--exit"]}, opacity ${FAST_OUT}`,
        "@media": {
          [REDUCE]: {
            transition: `opacity ${FAST_OUT}`,
          },
        },
      },
    },
  }),
  crumbOpen: style({
    gridTemplateRows: "1fr",
    opacity: 1,
    transition: `grid-template-rows ${motion["--t-moderate"]} ${motion["--moderate"]}, opacity ${FAST_IN}`,
    "@media": {
      [REDUCE]: {
        transition: `opacity ${FAST_IN}`,
      },
    },
  }),
  crumbClip: style({
    minHeight: 0,
    overflow: "hidden",
  }),
  // Levels push sideways like pages: a submenu comes in from the right as the list it replaces
  // leaves to the left, and going back runs the other way. A light blur blends the two mid-pass.
  level: style({
    animationName: shiftIn,
    animationDuration: motion["--t-moderate"],
    animationTimingFunction: motion["--moderate"],
    animationFillMode: "backwards",
  }),
  fromRight: style({
    "@layer": {
      [under1]: {
        vars: {
          "--shift": SLIDE,
        },
        "@media": {
          [REDUCE]: {
            vars: {
              "--shift": "0px",
            },
          },
        },
      },
    },
  }),
  fromLeft: style({
    vars: {
      "--shift": `-${SLIDE}`,
    },
    "@media": {
      [REDUCE]: {
        vars: {
          "--shift": "0px",
        },
      },
    },
  }),
  toLeft: style({
    animationName: shiftOut,
    animationDuration: motion["--t-moderate-exit"],
    animationTimingFunction: motion["--exit"],
    animationFillMode: "forwards",
    vars: {
      "--shift": `-${SLIDE}`,
    },
    "@media": {
      [REDUCE]: {
        vars: {
          "--shift": "0px",
        },
      },
    },
  }),
  toRight: style({
    animationName: shiftOut,
    animationDuration: motion["--t-moderate-exit"],
    animationTimingFunction: motion["--exit"],
    animationFillMode: "forwards",
    vars: {
      "--shift": SLIDE,
    },
    "@media": {
      [REDUCE]: {
        vars: {
          "--shift": "0px",
        },
      },
    },
  }),
  // Holds the leaving level, clipped to the list so it never adds scroll.
  ghosts: style({
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  }),
  crumb: style({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    // The fold clips this row, so the Back pill's hover fill takes real room rather than spilling
    // past the row on negative margins.
    padding: "8px 20px 0",
    font: `500 12px ${fonts["--display"]}`,
  }),
  crumbBack: style({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginInline: "-10px",
    padding: "4px 10px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "999px",
    backgroundPosition: "0 0",
    backgroundColor: "transparent",
    color: palette["--dim"],
    font: "inherit",
    cursor: cursors["--cursor-point"],
    transitionProperty: "background-color, color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:focus-visible": {
        outline: `2px solid ${palette["--focus"]}`,
        outlineOffset: "-2px",
      },
      "&:active": {
        backgroundPosition: "initial",
        backgroundColor: palette["--panel-2"],
        color: palette["--text"],
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            backgroundPosition: "initial",
            backgroundColor: palette["--panel-2"],
            color: palette["--text"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  crumbSlash: style({
    color: palette["--mute"],
  }),
  crumbLevel: style({
    fontWeight: 700,
    color: palette["--text"],
  }),
  search: style({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    height: "56px",
    padding: "0 20px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    color: palette["--mute"],
  }),
  input: style({
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    outline: "none",
    backgroundColor: "transparent",
    backgroundPosition: "0 0",
    color: palette["--text"],
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    font: `500 15px ${fonts["--display"]}`,
    selectors: {
      "&::placeholder": {
        color: palette["--mute"],
      },
    },
    "@media": {
      [TOUCH]: {
        font: `500 16px ${fonts["--display"]}`,
      },
    },
  }),
  // Holds the list and its scrollbar, which sits over the list's edge without scrolling with it.
  listFrame: style({
    position: "relative",
  }),
  list: style({
    position: "relative",
    maxHeight: "min(340px, 50dvh)",
    overflowX: "hidden",
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: "4px 8px 8px",
    scrollPadding: "8px",
    selectors: {
      "&:has(> [data-shifting])": {
        transition: `height ${motion["--t-moderate"]} ${motion["--moderate"]}`,
      },
    },
  }),
  laterGroup: style({
    marginTop: "4px",
  }),
  label: style({
    padding: "10px 16px 6px",
    font: `700 11px ${fonts["--display"]}`,
    color: "var(--c)",
    selectors: {
      [`&${DARK}`]: {
        // A hue as text on that ground: full strength on black, inked down on white.
        color: "color-mix(in oklab, var(--c) 62%, #000)",
      },
    },
  }),
  highlight: style({
    borderRadius: "999px",
    backgroundColor: palette["--panel-2"],
    vars: {
      "--w": "100%",
    },
  }),
  // A pill as tall as its icon plus 8px a side, so the highlight's ends run concentric with it.
  item: style({
    "@layer": {
      [under1]: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 18px 8px 8px",
        borderRadius: "999px",
        color: palette["--mute"],
        cursor: cursors["--cursor-point"],
        transition: `color ${FAST_OUT}`,
      },
    },
  }),
  itemSelected: style({
    color: palette["--dim"],
    transition: `color ${FAST_IN}`,
  }),
  icon: style({
    "@layer": {
      [under1]: {
        flex: "none",
        display: "grid",
        placeItems: "center",
        width: "32px",
        height: "32px",
        borderRadius: "999px",
        backgroundColor: palette["--panel-2"],
        color: palette["--dim"],
        transition: `background-color ${FAST_OUT}, color ${FAST_OUT}`,
      },
    },
  }),
  iconSelected: style({
    backgroundColor: "var(--c)",
    color: "var(--on-c)",
    transition: `background-color ${FAST_IN}, color ${FAST_IN}`,
  }),
  // Envelope and check share the icon's cell and cross-fade: the arriving glyph on the fast tier,
  // the leaving one on its quicker exit.
  glyph: style({
    "@layer": {
      [under1]: {
        gridArea: "1 / 1",
        display: "grid",
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
  text: style({
    flex: 1,
    minWidth: 0,
    display: "grid",
  }),
  name: style({
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    font: `600 13px ${fonts["--display"]}`,
    color: palette["--text"],
  }),
  description: style({
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "12px",
    color: palette["--mute"],
  }),
  done: style({
    font: `700 11px ${fonts["--display"]}`,
    color: "var(--c)",
    selectors: {
      [`&${DARK}`]: {
        color: "color-mix(in oklab, var(--c) 62%, #000)",
      },
    },
  }),
  empty: style({
    padding: "32px 16px",
    textAlign: "center",
    color: palette["--mute"],
  }),
  foot: style({
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "10px 20px 12px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    font: `500 11px ${fonts["--display"]}`,
    color: palette["--mute"],
  }),
  hint: style({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  }),
};
