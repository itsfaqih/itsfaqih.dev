import * as stylex from "@stylexjs/stylex";
import { fonts, motion, palette } from "../theme.stylex";

type Stroke = { tag: "path" | "rect" | "circle"; attrs: Record<string, string> };

// Each topic's glyph on a 24-unit grid, for rules without art of their own.
export const GLYPHS = new Map<string, Stroke[]>([
  ["Code Writing", [{ tag: "path", attrs: { d: "M8 6l-6 6 6 6M16 6l6 6-6 6" } }]],
  ["UX Design", [{ tag: "path", attrs: { d: "M5 3l6.5 17 2.5-7 7-2.5z" } }]],
  [
    "Architecture",
    [
      { tag: "rect", attrs: { x: "3", y: "3", width: "7", height: "7", rx: "1" } },
      { tag: "rect", attrs: { x: "14", y: "3", width: "7", height: "7", rx: "1" } },
      { tag: "rect", attrs: { x: "8.5", y: "14", width: "7", height: "7", rx: "1" } },
      { tag: "path", attrs: { d: "M6.5 10v2h11v-2M12 12v2" } },
    ],
  ],
  [
    "Best Practices",
    [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M8 12.5l2.5 2.5L16 9" } },
    ],
  ],
  [
    "Accessibility",
    [
      { tag: "circle", attrs: { cx: "12", cy: "4.5", r: "1.8" } },
      { tag: "path", attrs: { d: "M5 8.5l7 1.5 7-1.5M12 10v5M9 21l3-6 3 6" } },
    ],
  ],
]);

export const glyphOf = (label: string) => GLYPHS.get(label) ?? GLYPHS.get("Best Practices")!;

/** The rules with art of their own; every other rule shows its topic's glyph. */
export const ART_IDS = new Set([
  "proximity-principle",
  "button-design",
  "data-loading",
  "null-vs-undefined",
]);

// The art plays while its screen carries data-play, so starting and stopping it is one attribute
// and the class lists never change.
const PLAY = ":is([data-play] *)";
const LIGHT = ":is(.light *)";

// Each rule's art holds a still frame by default. While it plays it loops forever through the rule
// in a few beats: it moves out of the still frame and glides back into it, so 100% meets 0% without
// a cut. Anything that has to jump does it while invisible. Only transform and opacity animate.
export const screen = stylex.create({
  // A dark screen in the topic's hue. Light puts it on paper with the page; colorOf points --c at
  // the topic hues, so deepening them here keeps thin strokes and 9px labels legible on white, and
  // labels darken further still.
  root: {
    "--c-hi": {
      default: "color-mix(in srgb, var(--c) 55%, white)",
      [LIGHT]: "color-mix(in oklab, var(--c) 68%, #000)",
    },
    "--c-dim": "color-mix(in srgb, var(--c) 40%, transparent)",
    "--cw": { default: null, [LIGHT]: "#0a9cd4" },
    "--ux": { default: null, [LIGHT]: "#e0389f" },
    "--ar": { default: null, [LIGHT]: "#e38a00" },
    "--ts": { default: null, [LIGHT]: "#2aa816" },
    "--ax": { default: null, [LIGHT]: "#815efc" },
    "--go": { default: null, [LIGHT]: "#c99a00" },
    position: "relative",
    aspectRatio: "16 / 10",
    borderRadius: "10px",
    overflow: "hidden",
    // A dot screen over the hue, as two layers so the colour sits under the dots.
    backgroundImage: {
      default:
        "radial-gradient(circle, color-mix(in srgb, var(--c) 16%, transparent) 0.8px, transparent 1.2px), none",
      [LIGHT]:
        "radial-gradient(circle, color-mix(in srgb, var(--c) 26%, transparent) 0.8px, transparent 1.2px), none",
    },
    // Written per axis: the minifier folds a 0% 0% position into 0 0, which computes to 0px 0px.
    backgroundPositionX: "0, 0%",
    backgroundPositionY: "0, 0%",
    backgroundSize: "8px 8px, auto",
    backgroundColor: {
      default: "color-mix(in srgb, var(--c) 9%, #101017)",
      [LIGHT]: "color-mix(in srgb, var(--c) 6%, #fff)",
    },
    boxShadow: {
      default:
        "inset 0 0 0 1px color-mix(in srgb, var(--c) 24%, transparent), inset 0 3px 0 rgb(0 0 0 / 0.35)",
      [LIGHT]:
        "inset 0 0 0 1px color-mix(in srgb, var(--c) 30%, transparent), inset 0 3px 0 rgb(30 30 60 / 0.06)",
    },
  },
  // With no rule there is no topic hue, so the screen goes grey: switched on, projecting nothing.
  blank: {
    "--c": palette["--mute"],
  },
  art: {
    position: "absolute",
    inset: 0,
  },
  // The beat chip in the corner names the state the art is in. Its labels share one cell; the
  // last one shows at rest.
  chip: {
    position: "absolute",
    top: "6%",
    right: "4%",
    display: "grid",
    justifyItems: "end",
    font: `700 8px ${fonts["--display"]}`,
    letterSpacing: "0.04em",
    color: "var(--c)",
  },
  chipLarge: {
    fontSize: "10px",
  },
  beat: {
    gridArea: "1 / 1",
    padding: "2px 5px",
    borderRadius: "4px",
    backgroundColor: { default: "rgb(0 0 0 / 0.45)", [LIGHT]: "rgb(255 255 255 / 0.85)" },
    boxShadow: "inset 0 0 0 1px var(--c-dim)",
    opacity: { default: 0, ":last-child": 1 },
  },
});

// On a rule's cover the art sits in layers that slide against the card's lean, nearer ones further.
// The cover sets --px and --py, the pointer's offset from its centre from -0.5 to 0.5. Inside the
// SVG a px is a viewBox unit, about three screen pixels at cover size. Translate composes with the
// beats' transform, so the layers shift while the art plays.
const REDUCE = "@media (prefers-reduced-motion: reduce)";
export const depth = stylex.create({
  dots: {
    backgroundPositionX: "calc(var(--px, 0) * -12px), 0%",
    backgroundPositionY: "calc(var(--py, 0) * -12px), 0%",
    transitionProperty: { default: "background-position", [REDUCE]: "none" },
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
  },
  // In viewBox units.
  back: {
    translate: "calc(var(--px, 0) * 2px) calc(var(--py, 0) * 2px)",
    transitionProperty: { default: "translate", [REDUCE]: "none" },
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
  },
  mid: {
    translate: "calc(var(--px, 0) * 7px) calc(var(--py, 0) * 7px)",
    transitionProperty: { default: "translate", [REDUCE]: "none" },
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
  },
  front: {
    translate: "calc(var(--px, 0) * 12px) calc(var(--py, 0) * 12px)",
    transitionProperty: { default: "translate", [REDUCE]: "none" },
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
  },
  // In screen pixels: the chip and the glyph sit outside a viewBox.
  near: {
    translate: "calc(var(--px, 0) * 28px) calc(var(--py, 0) * 28px)",
    transitionProperty: { default: "translate", [REDUCE]: "none" },
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
  },
});

const IO = "cubic-bezier(0.645, 0.045, 0.355, 1)";
// The length of one thumbnail loop.
const LOOP = "4.4s";

// What every art draws with, and the beat each part of it keeps while the art plays.
export const draw = stylex.create({
  svg: {
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "visible",
  },
  text: {
    font: `500 9px ${fonts["--mono"]}`,
    fill: "var(--c-hi)",
  },
  dim: {
    fill: "var(--c-dim)",
  },
  hi: {
    fill: "var(--c)",
  },
  // A part that moves turns and scales about its own box.
  moving: {
    transformBox: "fill-box",
  },
  play: {
    animationDuration: { default: null, [PLAY]: LOOP },
    animationTimingFunction: { default: null, [PLAY]: IO },
    animationIterationCount: { default: null, [PLAY]: "infinite" },
  },
  playSlow: {
    animationDuration: { default: null, [PLAY]: "5.2s" },
    animationTimingFunction: { default: null, [PLAY]: IO },
    animationIterationCount: { default: null, [PLAY]: "infinite" },
  },
});

// Two-beat chips: the second label at rest, crossfading to the first and back.
const awayBeat = stylex.keyframes({
  "0%, 22%": { opacity: 0 },
  "28%, 64%": { opacity: 1 },
  "70%, 100%": { opacity: 0 },
});
const restBeat = stylex.keyframes({
  "0%, 22%": { opacity: 1 },
  "28%, 64%": { opacity: 0 },
  "70%, 100%": { opacity: 1 },
});

const pxBox = stylex.keyframes({
  "0%, 14%": { opacity: 1 },
  "30%, 62%": { opacity: 0 },
  "78%, 100%": { opacity: 1 },
});
const pxLink = stylex.keyframes({
  "0%, 14%": { transform: "scaleY(0.205)" },
  "36%, 58%": { transform: "scaleY(1)" },
  "80%, 100%": { transform: "scaleY(0.205)" },
});
const pxFile = stylex.keyframes({
  "0%, 14%": { transform: "none" },
  "36%, 58%": { transform: "translateY(31px)" },
  "80%, 100%": { transform: "none" },
});

export const proximity = stylex.create({
  box: {
    fill: "color-mix(in srgb, var(--c) 8%, transparent)",
    stroke: "var(--c)",
    strokeWidth: "1.2",
  },
  boxPlay: {
    animationName: { default: null, [PLAY]: pxBox },
  },
  link: {
    stroke: "var(--c)",
    strokeWidth: "1.2",
    strokeDasharray: "2 2",
    transformOrigin: "top",
    transform: "scaleY(0.205)",
  },
  linkPlay: {
    animationName: { default: null, [PLAY]: pxLink },
  },
  file: {
    fill: "var(--c)",
  },
  filePlay: {
    animationName: { default: null, [PLAY]: pxFile },
  },
  fileName: {
    fill: "var(--on-c)",
    fontWeight: 600,
  },
});

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });
const btPress = stylex.keyframes({
  "0%, 38%": { transform: "none" },
  "41%": { transform: "scale(0.92)" },
  "44%, 100%": { transform: "none" },
});
const btHover = stylex.keyframes({
  "0%, 28%": { opacity: 0 },
  "34%, 74%": { opacity: 0.22 },
  "80%, 100%": { opacity: 0 },
});
const btIdle = stylex.keyframes({
  "0%, 8%": { opacity: 0 },
  "14%, 46%": { opacity: 1 },
  "50%, 100%": { opacity: 0 },
});
const btPending = stylex.keyframes({
  "0%, 46%": { opacity: 0 },
  "50%, 74%": { opacity: 1 },
  "78%, 100%": { opacity: 0 },
});
const btDone = stylex.keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 74%": { opacity: 0 },
  "78%, 100%": { opacity: 1 },
});
const btCursor = stylex.keyframes({
  "0%, 16%": { opacity: 0, transform: "translate(34px, 30px)" },
  "22%": { opacity: 1, transform: "translate(34px, 30px)" },
  "32%, 74%": { opacity: 1, transform: "none" },
  "86%, 100%": { opacity: 0, transform: "translate(34px, 30px)" },
});
const btPip2 = stylex.keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 28%": { opacity: 0.2 },
  "31%, 100%": { opacity: 1 },
});
const btPip3 = stylex.keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 37%": { opacity: 0.2 },
  "40%, 100%": { opacity: 1 },
});
const btPip4 = stylex.keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 46%": { opacity: 0.2 },
  "49%, 100%": { opacity: 1 },
});
const btPip5 = stylex.keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 74%": { opacity: 0.2 },
  "77%, 100%": { opacity: 1 },
});
const btChipIdle = stylex.keyframes({
  "0%, 10%": { opacity: 0 },
  "14%, 28%": { opacity: 1 },
  "31%, 100%": { opacity: 0 },
});
const btChipHover = stylex.keyframes({
  "0%, 28%": { opacity: 0 },
  "31%, 37%": { opacity: 1 },
  "40%, 100%": { opacity: 0 },
});
const btChipPress = stylex.keyframes({
  "0%, 37%": { opacity: 0 },
  "40%, 45%": { opacity: 1 },
  "48%, 100%": { opacity: 0 },
});
const btChipLoad = stylex.keyframes({
  "0%, 45%": { opacity: 0 },
  "48%, 73%": { opacity: 1 },
  "76%, 100%": { opacity: 0 },
});
const btChipDone = stylex.keyframes({
  "0%, 10%": { opacity: 1 },
  "14%, 73%": { opacity: 0 },
  "76%, 100%": { opacity: 1 },
});

export const button = stylex.create({
  button: {
    transformOrigin: "center",
  },
  buttonPlay: {
    animationName: { default: null, [PLAY]: btPress },
  },
  face: {
    fill: "var(--c)",
  },
  hover: {
    fill: "white",
    opacity: 0,
  },
  hoverPlay: {
    animationName: { default: null, [PLAY]: btHover },
  },
  text: {
    font: `700 10px ${fonts["--display"]}`,
    fill: "var(--on-c)",
    textAnchor: "middle",
  },
  hidden: {
    opacity: 0,
  },
  idlePlay: {
    animationName: { default: null, [PLAY]: btIdle },
  },
  pendingPlay: {
    animationName: { default: null, [PLAY]: btPending },
  },
  spinner: {
    fill: "none",
    stroke: "var(--on-c)",
    strokeWidth: "2",
    strokeDasharray: "20 12",
    transformOrigin: "center",
  },
  spinnerPlay: {
    animationName: { default: null, [PLAY]: spin },
    animationDuration: { default: null, [PLAY]: "700ms" },
    animationTimingFunction: { default: null, [PLAY]: "linear" },
    animationIterationCount: { default: null, [PLAY]: "infinite" },
  },
  pendingText: {
    fontSize: "8px",
  },
  donePlay: {
    animationName: { default: null, [PLAY]: btDone },
  },
  pip: {
    fill: "var(--c)",
  },
  pip2Play: {
    animationName: { default: null, [PLAY]: btPip2 },
  },
  pip3Play: {
    animationName: { default: null, [PLAY]: btPip3 },
  },
  pip4Play: {
    animationName: { default: null, [PLAY]: btPip4 },
  },
  pip5Play: {
    animationName: { default: null, [PLAY]: btPip5 },
  },
  cursor: {
    fill: "white",
    stroke: "#0e0e13",
    strokeWidth: "1",
    opacity: 0,
  },
  cursorPlay: {
    animationName: { default: null, [PLAY]: btCursor },
  },
});

// The progress pips fill one by one; the first is lit throughout.
export const PIP_PLAY = [null, button.pip2Play, button.pip3Play, button.pip4Play, button.pip5Play];

const dlRows = stylex.keyframes({
  "0%, 16%": { opacity: 1 },
  "28%, 60%": { opacity: 0.45 },
  "70%, 100%": { opacity: 1 },
});
const dlNew = stylex.keyframes({
  "0%, 16%": { opacity: 1 },
  "26%, 62%": { opacity: 0 },
  "68%, 100%": { opacity: 1 },
});
const dlOld = stylex.keyframes({
  "0%, 16%": { opacity: 0 },
  "26%, 62%": { opacity: 1 },
  "68%, 100%": { opacity: 0 },
});
const dlFlash = stylex.keyframes({
  "0%, 62%": { opacity: 0 },
  "67%": { opacity: 0.3 },
  "84%, 100%": { opacity: 0 },
});
const dlSweep = stylex.keyframes({
  "0%, 30%": { opacity: 0, transform: "scaleX(0)" },
  "34%": { opacity: 1, transform: "scaleX(0)" },
  "62%": { opacity: 1, transform: "none" },
  "70%, 100%": { opacity: 0, transform: "none" },
});
const dlSlide = stylex.keyframes({
  to: { transform: "translate(calc(100% + 12px))" },
});

const PHONE = "@media (max-width: 640px)";

export const dataLoading = stylex.create({
  card: {
    fill: "color-mix(in srgb, var(--c) 6%, transparent)",
    stroke: "var(--c-dim)",
  },
  // The data-loading page's demo card, which the cover's screen there matches.
  ownCard: {
    position: "relative",
    display: "grid",
    gap: "12px",
    alignContent: "start",
    padding: { default: "14px 16px 16px", [PHONE]: "12px 12px 14px" },
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 3px 0 ${palette["--drop-ink"]}`,
    overflow: "hidden",
  },
  mark: {
    fill: "var(--c-dim)",
  },
  value: {
    textAnchor: "end",
  },
  flash: {
    fill: "var(--c)",
    opacity: 0,
  },
  old: {
    opacity: 0,
  },
  sweep: {
    fill: "var(--c)",
    transformOrigin: "left",
    opacity: 0,
  },
  rowsPlay: {
    animationName: { default: null, [PLAY]: dlRows },
  },
  newPlay: {
    animationName: { default: null, [PLAY]: dlNew },
  },
  oldPlay: {
    animationName: { default: null, [PLAY]: dlOld },
  },
  flashPlay: {
    animationName: { default: null, [PLAY]: dlFlash },
  },
  sweepPlay: {
    animationName: { default: null, [PLAY]: dlSweep },
  },
  slidePlay: {
    animationName: { default: null, [PLAY]: dlSlide },
  },
});

const nuBox = stylex.keyframes({
  "0%, 36%": { opacity: 1, transform: "none" },
  "50%": { opacity: 0, transform: "translateY(-40px)" },
  "58%": {
    opacity: 0,
    animationTimingFunction: motion["--snap"],
    transform: "translateY(-64px)",
  },
  "76%, 100%": { opacity: 1, transform: "none" },
});
const nuQuestion = stylex.keyframes({ to: { opacity: 0.35 } });
const nuMissing = stylex.keyframes({
  "0%, 40%": { opacity: 0 },
  "44%, 62%": { opacity: 1 },
  "66%, 100%": { opacity: 0 },
});
const nuEmpty = stylex.keyframes({
  "0%, 40%": { opacity: 1 },
  "44%, 62%": { opacity: 0 },
  "66%, 100%": { opacity: 1 },
});

export const nullish = stylex.create({
  slot: {
    fill: "none",
    stroke: "var(--c-dim)",
    strokeWidth: "1.2",
    strokeDasharray: "3 3",
  },
  mark: {
    font: `700 20px ${fonts["--display"]}`,
    fill: "var(--c-hi)",
    textAnchor: "middle",
  },
  question: {
    fill: "var(--c-dim)",
  },
  questionPlay: {
    animationName: { default: null, [PLAY]: nuQuestion },
    animationDuration: { default: null, [PLAY]: "1.4s" },
    animationTimingFunction: { default: null, [PLAY]: "ease-in-out" },
    animationIterationCount: { default: null, [PLAY]: "infinite" },
    animationDirection: { default: null, [PLAY]: "alternate" },
  },
  box: {
    fill: {
      default: "color-mix(in srgb, var(--c) 22%, #101017)",
      [LIGHT]: "color-mix(in srgb, var(--c) 12%, #fff)",
    },
    stroke: "var(--c)",
    strokeWidth: "1.5",
  },
  boxPlay: {
    animationName: { default: null, [PLAY]: nuBox },
  },
  label: {
    textAnchor: "middle",
  },
});

const glFloat = stylex.keyframes({ "50%": { transform: "translateY(-4px)" } });

export const glyph = stylex.create({
  box: {
    display: "grid",
    placeItems: "center",
    color: "var(--c)",
  },
  svg: {
    display: "block",
    width: "34%",
    height: "auto",
    overflow: "visible",
    filter: "drop-shadow(0 0 14px color-mix(in srgb, var(--c) 55%, transparent))",
  },
  float: {
    animationName: { default: null, [PLAY]: glFloat },
    animationDuration: { default: null, [PLAY]: LOOP },
    animationTimingFunction: { default: null, [PLAY]: "ease-in-out" },
    animationIterationCount: { default: null, [PLAY]: "infinite" },
  },
});

export const beat = stylex.create({
  away: {
    animationName: { default: null, [PLAY]: awayBeat },
  },
  rest: {
    animationName: { default: null, [PLAY]: restBeat },
  },
  idle: {
    animationName: { default: null, [PLAY]: btChipIdle },
  },
  hover: {
    animationName: { default: null, [PLAY]: btChipHover },
  },
  press: {
    animationName: { default: null, [PLAY]: btChipPress },
  },
  load: {
    animationName: { default: null, [PLAY]: btChipLoad },
  },
  done: {
    animationName: { default: null, [PLAY]: btChipDone },
  },
  missing: {
    animationName: { default: null, [PLAY]: nuMissing },
  },
  empty: {
    animationName: { default: null, [PLAY]: nuEmpty },
  },
});
