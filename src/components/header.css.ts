import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
const REDUCE = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover) and (pointer: fine)";
const TABLET = "(max-width: 960px)";

const NARROW = "(max-width: 480px)";
const TINY = "(max-width: 380px)";
const DARK = ":is(.dark *)";
const LIGHT = ":is(.light *)";
// The root script adds .js, and .no-intro once the home intro has handed off (or never plays).
const ARRIVING = ":is(.js.no-intro:not(.from-site) *)";
const WAITING = ":is(.js:not(.no-intro) *)";
const AWAY = ":is([data-island-away] *)";

// The island inverts the page: black on paper, white in the dark. So the Connect chip takes the purple
// of the ground it sits on, the dark theme's lavender on the black island and paper's deeper purple
// on the white one, rather than the page's own --ax.
const AX_ON_BLACK = "#bca2ff";
const AX_ON_WHITE = "#a084ff";
const CONNECT_CHIP = `color-mix(in srgb, ${AX_ON_BLACK} 18%, #0a0a0c)`;
const SPRING = motion["--spring"];
const FOLD = "560ms";

const islandIn = keyframes({
  from: { opacity: 0, scale: 0.82 },
});

const ROW_IN = `opacity ${motion["--t-slow"]} ${motion["--slow"]} 40ms, filter ${motion["--t-slow"]} ${motion["--slow"]} 40ms`;
const ROW_OUT = `opacity ${motion["--t-moderate-exit"]} ${motion["--exit"]}, filter ${motion["--t-moderate-exit"]} ${motion["--exit"]}`;

// A black capsule that floats over every page. At the top it holds the whole nav; once the page
// scrolls it folds to the brand, or to the live activity a page lends it (IslandActivity), beside
// search and the theme switch, and a menu button unfolds it again. Each part folds its own column
// from 1fr to 0fr on one spring, so the capsule resizes around whatever it holds while the parts
// blur out quickly and resolve in a beat later. The capsule is black over the light theme and white
// over the dark one, so it is always the one shape that stands apart from the page.
export const styles = {
  // A clear strip at the top of every page that only centres the island; presses pass through it
  // everywhere but the island itself.
  bar: style({
    position: "fixed",
    inset: "calc(12px + env(safe-area-inset-top, 0px)) 0 auto",
    // Between the command palette's backdrop and the palette while it is mounted: the palette
    // pours out of the island and back into it, so the island stays sharp underneath.
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    padding:
      "0 calc(12px + env(safe-area-inset-right, 0px)) 0 calc(12px + env(safe-area-inset-left, 0px))",
    pointerEvents: "none",
    selectors: {
      "&:is([data-palette] *)": {
        zIndex: 101,
      },
    },
  }),
  island: style({
    // Away while the palette pours out of it: the drop takes over the island's ink, so the island
    // fades as the drop gathers and fades back in as the drop lands on it.
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: "48px",
    maxWidth: "100%",
    padding: "0 10px",
    borderRadius: "999px",
    isolation: "isolate",
    font: `500 13px ${fonts["--display"]}`,
    color: palette["--text"],
    pointerEvents: "auto",
    transition: "opacity 70ms ease",
    vars: {
      // The island's own ground, so everything inside reads light on black (dark on white).
      "--text": "#fff",
      "--dim": "rgb(255 255 255 / 0.66)",
      "--mute": "rgb(255 255 255 / 0.46)",
      "--hair": "rgb(255 255 255 / 0.18)",
      "--panel-2": "rgb(255 255 255 / 0.1)",
      "--focus": palette["--go"],
    },
    selectors: {
      [`&${DARK}`]: {
        vars: {
          "--text": "#0a0a0c",
          "--dim": "rgb(10 10 12 / 0.68)",
          "--mute": "rgb(10 10 12 / 0.5)",
          "--hair": "rgb(10 10 12 / 0.16)",
          "--panel-2": "rgb(10 10 12 / 0.07)",
          "--focus": `color-mix(in oklab, ${palette["--go"]} 45%, #000)`,
        },
      },
      [`&${ARRIVING}`]: {
        animationName: islandIn,
        animationDuration: FOLD,
        animationTimingFunction: SPRING,
        animationFillMode: "backwards",
      },
      [`&${WAITING}`]: {
        opacity: 0,
      },
      [`&${AWAY}`]: {
        opacity: 0,
        pointerEvents: "none",
      },
    },
    "@media": {
      [NARROW]: {
        padding: "0 6px",
      },
    },
  }),
  // The capsule's black (white) ground, its own layer so it can bounce past the folding parts.
  ground: style({
    position: "absolute",
    inset: 0,
    zIndex: -1,
    borderRadius: "inherit",
    backgroundColor: "#0a0a0c",
    boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 10px 28px -12px rgb(0 0 0 / 0.55)",
    pointerEvents: "none",
    selectors: {
      [`&${DARK}`]: {
        backgroundColor: "#fff",
        boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.06), 0 10px 28px -12px rgb(0 0 0 / 0.7)",
      },
    },
  }),
  seg: style({
    "@layer": {
      [under1]: {
        display: "grid",
        gridTemplateColumns: "0fr",
        transition: `grid-template-columns ${FOLD} ${SPRING}`,
        "@media": {
          [REDUCE]: {
            transition: "none",
          },
        },
      },
    },
  }),
  segOn: style({
    gridTemplateColumns: "1fr",
  }),
  // Clips sideways only, so the button's press and the focus ring keep their height.
  clip: style({
    minWidth: 0,
    overflowX: "clip",
  }),
  row: style({
    "@layer": {
      [under1]: {
        display: "flex",
        alignItems: "center",
        gap: "2px",
        width: "max-content",
        padding: "0 4px",
        opacity: 0,
        filter: "blur(4px)",
        transition: ROW_OUT,
        "@media": {
          [NARROW]: {
            padding: 0,
          },
          "(min-width: 480.01px) and (max-width: 640px)": {
            padding: "0 2px",
          },
          [REDUCE]: {
            filter: "none",
          },
        },
      },
    },
  }),
  rowOn: style({
    opacity: 1,
    filter: "none",
    transition: ROW_IN,
  }),
  // Narrow phones: the open menu has no room for the brand as well as the close button.
  homeFolded: style({
    gridTemplateColumns: "1fr",
    "@media": {
      [NARROW]: {
        gridTemplateColumns: "0fr",
      },
    },
  }),
  homeFoldedRow: style({
    opacity: 1,
    filter: "none",
    transition: ROW_IN,
    "@media": {
      [NARROW]: {
        opacity: 0,
        filter: "blur(4px)",
        visibility: "hidden",
        transition: `${ROW_OUT}, visibility 0s ${motion["--t-moderate-exit"]}`,
      },
      [`${NARROW} and ${REDUCE}`]: {
        filter: "none",
      },
    },
  }),
  wideOnly: style({
    "@media": {
      [TABLET]: {
        display: "none",
      },
    },
  }),
  // Unlike the folding segments, the tools sit in a flex row.
  toolsSeg: style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  }),
  // Narrow phones: the hero's contact button sits right below, so the island drops its copy.
  connectSeg: style({
    display: "grid",
    "@media": {
      [TINY]: {
        display: "none",
      },
    },
  }),
  connectRow: style({
    paddingLeft: "8px",
    "@media": {
      [NARROW]: {
        paddingLeft: "4px",
      },
    },
  }),
  // Lavender with dark ink on the black island; the deeper purple with white ink on the white one.
  connect: style({
    color: CONNECT_CHIP,
    backgroundColor: AX_ON_BLACK,
    flex: "none",
    height: "32px",
    paddingInline: "12px",
    whiteSpace: "nowrap",
    borderRadius: "999px",
    selectors: {
      [`&${DARK}`]: {
        color: "#fff",
        backgroundColor: AX_ON_WHITE,
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            backgroundColor: `color-mix(in oklab, ${AX_ON_BLACK} 82%, #fff)`,
          },
          [`&${DARK}:hover`]: {
            backgroundColor: `color-mix(in oklab, ${AX_ON_WHITE} 88%, #000)`,
          },
        },
      },
    },
  }),
  ring: style({
    selectors: {
      "&:focus-visible": {
        outline: `2px solid ${palette["--focus"]}`,
        outlineOffset: "-2px",
      },
    },
  }),
  brand: style({
    userSelect: "none",
    padding: "0 8px 0 12px",
    fontWeight: 900,
    color: palette["--text"],
    "@media": {
      [NARROW]: {
        padding: "0 4px 0 10px",
      },
      "(min-width: 480.01px) and (max-width: 640px)": {
        padding: "0 6px 0 10px",
      },
    },
  }),
  nav: style({
    display: "flex",
  }),
  // One hover fill for the whole island, painted over the ground and under the items.
  highlight: style({
    borderRadius: "999px",
    backgroundColor: palette["--panel-2"],
  }),
  navLink: style({
    userSelect: "none",
    whiteSpace: "nowrap",
    padding: "8px 12px",
    borderRadius: "999px",
    color: palette["--dim"],
    transitionProperty: "color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:is([aria-current='page'])": {
        backgroundColor: palette["--panel-2"],
        color: palette["--text"],
      },
      "&:hover": {
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
      "&:active": {
        color: palette["--text"],
      },
    },
    "@media": {
      [TABLET]: {
        padding: "8px",
      },
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
          },
        },
      },
    },
  }),
  find: style({
    "@layer": {
      [under1]: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
        // The compact island holds the activity beside search, theme and menu; on narrow phones these
        // keep it inside the screen.
        padding: "8px 12px",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "currentcolor",
        borderRadius: "999px",
        // A pointer that can hover gets the island's one gliding fill; a touch press lights the button.
        backgroundColor: "transparent",
        backgroundPosition: "0 0",
        color: palette["--dim"],
        font: "inherit",
        cursor: cursors["--cursor-point"],
        transitionProperty: "background-color, color",
        transitionDuration: motion["--t-fast-exit"],
        transitionTimingFunction: motion["--exit"],
        selectors: {
          "&:active": {
            backgroundColor: palette["--panel-2"],
            backgroundPosition: "initial",
            color: palette["--text"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
        "@media": {
          [NARROW]: {
            padding: "8px 6px",
          },
          "(min-width: 480.01px) and (max-width: 960px)": {
            padding: "8px",
          },
          [HOVER]: {
            selectors: {
              "&:hover": {
                color: palette["--text"],
                transitionDuration: motion["--t-fast"],
                transitionTimingFunction: motion["--fast"],
              },
              "&:active": {
                backgroundColor: "transparent",
              },
            },
          },
        },
      },
    },
  }),
  findKey: style({
    padding: "1px 6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "6px",
    font: `500 11px ${fonts["--display"]}`,
  }),
  // Both icons share one cell; the outgoing one turns away as the incoming one turns in.
  iconButton: style({
    display: "inline-grid",
    placeItems: "center",
  }),
  menu: style({
    width: "36px",
    height: "36px",
    padding: 0,
    "@media": {
      [NARROW]: {
        padding: "8px 6px",
      },
    },
  }),
  glyph: style({
    "@layer": {
      [under1]: {
        gridArea: "1 / 1",
        transitionProperty: "opacity, transform, filter",
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
        "@media": {
          [REDUCE]: {
            transitionProperty: "opacity",
          },
        },
      },
    },
  }),
  sunInLight: style({
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
    selectors: {
      [`&${LIGHT}`]: {
        opacity: 0,
        transform: "rotate(90deg) scale(0.6)",
        filter: "blur(4px)",
        transitionDuration: motion["--t-moderate-exit"],
        transitionTimingFunction: motion["--exit"],
      },
    },
  }),
  moonInDark: style({
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
    selectors: {
      [`&${DARK}`]: {
        opacity: 0,
        transform: "rotate(-90deg) scale(0.6)",
        filter: "blur(4px)",
        transitionDuration: motion["--t-moderate-exit"],
        transitionTimingFunction: motion["--exit"],
      },
    },
  }),
  turnedRight: style({
    opacity: 0,
    transform: "rotate(90deg) scale(0.6)",
    filter: "blur(4px)",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
  }),
  turnedLeft: style({
    opacity: 0,
    transform: "rotate(-90deg) scale(0.6)",
    filter: "blur(4px)",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
  }),
};
