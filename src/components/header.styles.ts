import * as stylex from "@stylexjs/stylex";
import { cursors, fonts, motion, palette } from "../theme.stylex";
import { loadIn } from "./load-in";

export type HeaderState = { scrolled: boolean; open: boolean; live: boolean };

export const SEGS = ["home", "live", "nav", "tools", "connect", "menu"] as const;
export type Seg = (typeof SEGS)[number];

/** Each segment's classes for a state. header.astro renders the first state, header.client.ts the rest. */
export function segView(seg: Seg, { scrolled, open, live }: HeaderState) {
  const full = !scrolled || open;
  const view = {
    home: {
      on: full || !live,
      compact: "idle",
      style: open && styles.homeFolded,
      row: open && styles.homeFoldedRow,
    },
    live: { on: !full && live, compact: "live", style: null, row: null },
    nav: { on: full, compact: undefined, style: null, row: null },
    tools: { on: true, compact: "always", style: styles.toolsSeg, row: null },
    connect: { on: true, compact: "always", style: styles.connectSeg, row: styles.connectRow },
    menu: { on: scrolled, compact: "always", style: null, row: null },
  }[seg];
  return {
    on: view.on,
    compact: view.compact,
    seg:
      stylex.attrs(loadIn.islandPart, styles.seg, view.on && styles.segOn, view.style).class ?? "",
    row: `row ${stylex.attrs(styles.row, view.on && styles.rowOn, view.row).class}`,
  };
}

export function menuGlyphs(open: boolean) {
  return {
    list: stylex.attrs(styles.glyph, open && styles.turnedRight).class ?? "",
    x: stylex.attrs(styles.glyph, !open && styles.turnedLeft).class ?? "",
  };
}

const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TABLET = "@media (max-width: 960px)";
const PHONE = "@media (max-width: 640px)";
const NARROW = "@media (max-width: 480px)";
const TINY = "@media (max-width: 380px)";
const DARK = ":is(.dark *)";
const LIGHT = ":is(.light *)";
// The root script adds .js, and .no-intro once the home intro has handed off (or never plays).
const READY = ":is(.js.no-intro *)";
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

// The island drops in on the page's first frame, a touch small, and settles on the spring.
const islandIn = stylex.keyframes({
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
export const styles = stylex.create({
  // A clear strip at the top of every page that only centres the island; presses pass through it
  // everywhere but the island itself.
  bar: {
    position: "fixed",
    inset: "calc(12px + env(safe-area-inset-top, 0px)) 0 auto",
    // Between the command palette's backdrop and the palette while it is mounted: the palette
    // pours out of the island and back into it, so the island stays sharp underneath.
    zIndex: { default: 50, ":is([data-palette] *)": 101 },
    display: "flex",
    justifyContent: "center",
    padding:
      "0 calc(12px + env(safe-area-inset-right, 0px)) 0 calc(12px + env(safe-area-inset-left, 0px))",
    pointerEvents: "none",
  },
  island: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: "48px",
    maxWidth: "100%",
    padding: { default: "0 10px", [NARROW]: "0 6px" },
    borderRadius: "999px",
    isolation: "isolate",
    font: `500 13px ${fonts["--display"]}`,
    // The island's own ground, so everything inside reads light on black (dark on white).
    "--text": { default: "#fff", [DARK]: "#0a0a0c" },
    "--dim": { default: "rgb(255 255 255 / 0.66)", [DARK]: "rgb(10 10 12 / 0.68)" },
    "--mute": { default: "rgb(255 255 255 / 0.46)", [DARK]: "rgb(10 10 12 / 0.5)" },
    "--hair": { default: "rgb(255 255 255 / 0.18)", [DARK]: "rgb(10 10 12 / 0.16)" },
    "--panel-2": { default: "rgb(255 255 255 / 0.1)", [DARK]: "rgb(10 10 12 / 0.07)" },
    "--focus": {
      default: palette["--go"],
      [DARK]: `color-mix(in oklab, ${palette["--go"]} 45%, #000)`,
    },
    color: palette["--text"],
    // Away while the palette pours out of it: the drop takes over the island's ink, so the island
    // fades as the drop gathers and fades back in as the drop lands on it.
    opacity: { default: null, [WAITING]: 0, [AWAY]: { default: 0, [REDUCE]: null } },
    pointerEvents: { default: "auto", [AWAY]: { default: "none", [REDUCE]: null } },
    transition: { default: "opacity 70ms ease", [REDUCE]: null },
    animationName: { default: null, [READY]: islandIn },
    animationDuration: { default: null, [READY]: FOLD },
    animationTimingFunction: { default: null, [READY]: SPRING },
    animationFillMode: { default: null, [READY]: "backwards" },
  },
  // The capsule's black (white) ground, its own layer so it can bounce past the folding parts.
  ground: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    borderRadius: "inherit",
    backgroundColor: { default: "#0a0a0c", [DARK]: "#fff" },
    boxShadow: {
      default: "inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 10px 28px -12px rgb(0 0 0 / 0.55)",
      [DARK]: "inset 0 0 0 1px rgb(0 0 0 / 0.06), 0 10px 28px -12px rgb(0 0 0 / 0.7)",
    },
    pointerEvents: "none",
  },
  seg: {
    display: "grid",
    gridTemplateColumns: "0fr",
    transition: { default: `grid-template-columns ${FOLD} ${SPRING}`, [REDUCE]: "none" },
  },
  segOn: {
    gridTemplateColumns: "1fr",
  },
  // Clips sideways only, so the button's press and the focus ring keep their height.
  clip: {
    minWidth: 0,
    overflowX: "clip",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    width: "max-content",
    padding: { default: "0 4px", [PHONE]: "0 2px", [NARROW]: 0 },
    opacity: 0,
    filter: { default: "blur(4px)", [REDUCE]: "none" },
    transition: ROW_OUT,
  },
  rowOn: {
    opacity: 1,
    filter: "none",
    transition: ROW_IN,
  },
  // Narrow phones: the open menu has no room for the brand as well as the close button.
  homeFolded: {
    gridTemplateColumns: { default: "1fr", [NARROW]: "0fr" },
  },
  homeFoldedRow: {
    opacity: { default: 1, [NARROW]: 0 },
    filter: { default: "none", [NARROW]: { default: "blur(4px)", [REDUCE]: "none" } },
    visibility: { default: null, [NARROW]: "hidden" },
    transition: {
      default: ROW_IN,
      [NARROW]: `${ROW_OUT}, visibility 0s ${motion["--t-moderate-exit"]}`,
    },
  },
  wideOnly: {
    display: { default: null, [TABLET]: "none" },
  },
  // Unlike the folding segments, the tools sit in a flex row.
  toolsSeg: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  },
  // Narrow phones: the hero's contact button sits right below, so the island drops its copy.
  connectSeg: {
    display: { default: "grid", [TINY]: "none" },
  },
  connectRow: {
    paddingLeft: { default: "8px", [NARROW]: "4px" },
  },
  // Lavender with dark ink on the black island; the deeper purple with white ink on the white one.
  connect: {
    color: { default: CONNECT_CHIP, [DARK]: "#fff" },
    backgroundColor: {
      default: AX_ON_BLACK,
      ":hover": { default: null, [HOVER]: `color-mix(in oklab, ${AX_ON_BLACK} 82%, #fff)` },
      [DARK]: {
        default: AX_ON_WHITE,
        ":hover": { default: null, [HOVER]: `color-mix(in oklab, ${AX_ON_WHITE} 88%, #000)` },
      },
    },
    flex: "none",
    height: "32px",
    paddingInline: "12px",
    whiteSpace: "nowrap",
    borderRadius: "999px",
  },
  ring: {
    outline: { default: null, ":focus-visible": `2px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "-2px" },
  },
  brand: {
    userSelect: "none",
    padding: { default: "0 8px 0 12px", [PHONE]: "0 6px 0 10px", [NARROW]: "0 4px 0 10px" },
    fontWeight: 900,
    color: palette["--text"],
  },
  nav: {
    display: "flex",
  },
  // One hover fill for the whole island, painted over the ground and under the items.
  highlight: {
    borderRadius: "999px",
    backgroundColor: palette["--panel-2"],
  },
  navLink: {
    userSelect: "none",
    whiteSpace: "nowrap",
    padding: { default: "8px 12px", [TABLET]: "8px" },
    borderRadius: "999px",
    backgroundColor: {
      default: null,
      ":is([aria-current='page'])": palette["--panel-2"],
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
      ":is([aria-current='page'])": palette["--text"],
    },
    transitionProperty: "color",
    transitionDuration: { default: motion["--t-fast-exit"], ":hover": motion["--t-fast"] },
    transitionTimingFunction: { default: motion["--exit"], ":hover": motion["--fast"] },
  },
  find: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    // The compact island holds the activity beside search, theme and menu; on narrow phones these
    // keep it inside the screen.
    padding: { default: "8px 12px", [TABLET]: "8px", [NARROW]: "8px 6px" },
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "999px",
    // A pointer that can hover gets the island's one gliding fill; a touch press lights the button.
    backgroundColor: {
      default: "transparent",
      ":active": { default: palette["--panel-2"], [HOVER]: "transparent" },
    },
    // `background: none` minifies to a 0 0 position at rest, and the press's background shorthand
    // resets it to 0% 0%. StyleX would minify a literal 0% 0% back to 0 0, so the press sets initial.
    backgroundPosition: { default: "0 0", ":active": "initial" },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    font: "inherit",
    cursor: cursors["--cursor-point"],
    transitionProperty: "background-color, color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
      ":active": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
      ":active": motion["--fast"],
    },
  },
  findKey: {
    padding: "1px 6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "6px",
    font: `500 11px ${fonts["--display"]}`,
  },
  // Both icons share one cell; the outgoing one turns away as the incoming one turns in.
  iconButton: {
    display: "inline-grid",
    placeItems: "center",
  },
  menu: {
    width: "36px",
    height: "36px",
    padding: { default: 0, [NARROW]: "8px 6px" },
  },
  glyph: {
    gridArea: "1 / 1",
    transitionProperty: { default: "opacity, transform, filter", [REDUCE]: "opacity" },
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
  },
  // Each sets its own timing whole: a later StyleX key replaces the glyph's, conditions and all.
  sunInLight: {
    opacity: { default: null, [LIGHT]: 0 },
    transform: { default: null, [LIGHT]: "rotate(90deg) scale(0.6)" },
    filter: { default: null, [LIGHT]: "blur(4px)" },
    transitionDuration: { default: motion["--t-moderate"], [LIGHT]: motion["--t-moderate-exit"] },
    transitionTimingFunction: { default: motion["--moderate"], [LIGHT]: motion["--exit"] },
  },
  moonInDark: {
    opacity: { default: null, [DARK]: 0 },
    transform: { default: null, [DARK]: "rotate(-90deg) scale(0.6)" },
    filter: { default: null, [DARK]: "blur(4px)" },
    transitionDuration: { default: motion["--t-moderate"], [DARK]: motion["--t-moderate-exit"] },
    transitionTimingFunction: { default: motion["--moderate"], [DARK]: motion["--exit"] },
  },
  turnedRight: {
    opacity: 0,
    transform: "rotate(90deg) scale(0.6)",
    filter: "blur(4px)",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
  },
  turnedLeft: {
    opacity: 0,
    transform: "rotate(-90deg) scale(0.6)",
    filter: "blur(4px)",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
  },
});
