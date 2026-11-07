import { drop } from "../bevel";
import { fonts, motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { REDUCE } from "../browser/media-query";
// The art plays while its screen carries data-play, so starting and stopping it is one attribute
// and the class lists never change.
const PLAY = ":is([data-play] *)";
const LIGHT = ":is(.light *)";

// Each rule's art holds a still frame by default. While it plays it loops forever through the rule
// in a few beats: it moves out of the still frame and glides back into it, so 100% meets 0% without
// a cut. Anything that has to jump does it while invisible. Only transform and opacity animate.
export const screen = {
  // A dark screen in the topic's hue. Light puts it on paper with the page; colorOf points --c at
  // the topic hues, so deepening them here keeps thin strokes and 9px labels legible on white, and
  // labels darken further still.
  root: style({
    "@layer": {
      [under1]: {
        position: "relative",
        aspectRatio: "16 / 10",
        borderRadius: "10px",
        overflow: "hidden",
        // A dot screen over the hue, as two layers so the colour sits under the dots.
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, var(--c) 16%, transparent) 0.8px, transparent 1.2px), none",
        backgroundPosition: "0 0, 0 0",
        backgroundSize: "8px 8px, auto",
        backgroundColor: "color-mix(in srgb, var(--c) 9%, #101017)",
        boxShadow:
          "inset 0 0 0 1px color-mix(in srgb, var(--c) 24%, transparent), inset 0 3px 0 rgb(0 0 0 / 0.35)",
        vars: {
          "--c-hi": "color-mix(in srgb, var(--c) 55%, white)",
          "--c-dim": "color-mix(in srgb, var(--c) 40%, transparent)",
        },
        selectors: {
          [`&${LIGHT}`]: {
            backgroundImage:
              "radial-gradient(circle, color-mix(in srgb, var(--c) 26%, transparent) 0.8px, transparent 1.2px), none",
            backgroundColor: "color-mix(in srgb, var(--c) 6%, #fff)",
            boxShadow:
              "inset 0 0 0 1px color-mix(in srgb, var(--c) 30%, transparent), inset 0 3px 0 rgb(30 30 60 / 0.06)",
            vars: {
              "--c-hi": "color-mix(in oklab, var(--c) 68%, #000)",
              "--cw": palette["--thumb-cw"],
              "--ux": palette["--thumb-ux"],
              "--ar": palette["--thumb-ar"],
              "--ts": palette["--thumb-ts"],
              "--ax": palette["--thumb-ax"],
              "--go": palette["--thumb-go"],
            },
          },
        },
      },
    },
  }),
  // With no rule there is no topic hue, so the screen goes grey: switched on, projecting nothing.
  blank: style({
    vars: {
      "--c": palette["--mute"],
    },
  }),
  art: style({
    position: "absolute",
    inset: 0,
  }),
  // The beat chip in the corner names the state the art is in. Its labels share one cell; the
  // last one shows at rest.
  chip: style({
    "@layer": {
      [under1]: {
        position: "absolute",
        top: "6%",
        right: "4%",
        display: "grid",
        justifyItems: "end",
        font: `700 8px ${fonts["--display"]}`,
        letterSpacing: "0.04em",
        color: "var(--c)",
      },
    },
  }),
  chipLarge: style({
    fontSize: "10px",
  }),
  beat: style({
    gridArea: "1 / 1",
    padding: "2px 5px",
    borderRadius: "4px",
    backgroundColor: "rgb(0 0 0 / 0.45)",
    boxShadow: "inset 0 0 0 1px var(--c-dim)",
    opacity: 0,
    selectors: {
      [`&${LIGHT}`]: {
        backgroundColor: "rgb(255 255 255 / 0.85)",
      },
      "&:last-child": {
        opacity: 1,
      },
    },
  }),
};

// On a rule's cover the art sits in layers that slide against the card's lean, nearer ones further.
// The cover sets --px and --py, the pointer's offset from its centre from -0.5 to 0.5. Inside the
// SVG a px is a viewBox unit, about three screen pixels at cover size. Translate composes with the
// beats' transform, so the layers shift while the art plays.
export const depth = {
  dots: style({
    backgroundPositionX: "calc(var(--px, 0) * -12px), 0%",
    backgroundPositionY: "calc(var(--py, 0) * -12px), 0%",
    transitionProperty: "background-position",
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        transitionProperty: "none",
      },
    },
  }),
  // In viewBox units.
  back: style({
    translate: "calc(var(--px, 0) * 2px) calc(var(--py, 0) * 2px)",
    transitionProperty: "translate",
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        transitionProperty: "none",
      },
    },
  }),
  mid: style({
    translate: "calc(var(--px, 0) * 7px) calc(var(--py, 0) * 7px)",
    transitionProperty: "translate",
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        transitionProperty: "none",
      },
    },
  }),
  front: style({
    translate: "calc(var(--px, 0) * 12px) calc(var(--py, 0) * 12px)",
    transitionProperty: "translate",
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        transitionProperty: "none",
      },
    },
  }),
  // In screen pixels: the chip and the glyph sit outside a viewBox.
  near: style({
    translate: "calc(var(--px, 0) * 28px) calc(var(--py, 0) * 28px)",
    transitionProperty: "translate",
    transitionDuration: motion["--t-panel"],
    transitionTimingFunction: motion["--out"],
    "@media": {
      [REDUCE]: {
        transitionProperty: "none",
      },
    },
  }),
};

const IO = "cubic-bezier(0.645, 0.045, 0.355, 1)";
// The length of one thumbnail loop.
const LOOP = "4.4s";

// What every art draws with, and the beat each part of it keeps while the art plays.
export const draw = {
  svg: style({
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "visible",
  }),
  text: style({
    "@layer": {
      [under1]: {
        font: `500 9px ${fonts["--mono"]}`,
        fill: "var(--c-hi)",
      },
    },
  }),
  dim: style({
    fill: "var(--c-dim)",
  }),
  hi: style({
    fill: "var(--c)",
  }),
  // A part that moves turns and scales about its own box.
  moving: style({
    transformBox: "fill-box",
  }),
  play: style({
    "@layer": {
      [under1]: {
        selectors: {
          [`&${PLAY}`]: {
            animationDuration: LOOP,
            animationTimingFunction: IO,
            animationIterationCount: "infinite",
          },
        },
      },
    },
  }),
  playSlow: style({
    "@layer": {
      [under1]: {
        selectors: {
          [`&${PLAY}`]: {
            animationDuration: "5.2s",
            animationTimingFunction: IO,
            animationIterationCount: "infinite",
          },
        },
      },
    },
  }),
};

// Two-beat chips: the second label at rest, crossfading to the first and back.
const awayBeat = keyframes({
  "0%, 22%": { opacity: 0 },
  "28%, 64%": { opacity: 1 },
  "70%, 100%": { opacity: 0 },
});
const restBeat = keyframes({
  "0%, 22%": { opacity: 1 },
  "28%, 64%": { opacity: 0 },
  "70%, 100%": { opacity: 1 },
});

const pxBox = keyframes({
  "0%, 14%": { opacity: 1 },
  "30%, 62%": { opacity: 0 },
  "78%, 100%": { opacity: 1 },
});
const pxLink = keyframes({
  "0%, 14%": { transform: "scaleY(0.205)" },
  "36%, 58%": { transform: "scaleY(1)" },
  "80%, 100%": { transform: "scaleY(0.205)" },
});
const pxFile = keyframes({
  "0%, 14%": { transform: "none" },
  "36%, 58%": { transform: "translateY(31px)" },
  "80%, 100%": { transform: "none" },
});

export const proximity = {
  box: style({
    fill: "color-mix(in srgb, var(--c) 8%, transparent)",
    stroke: "var(--c)",
    strokeWidth: "1.2",
  }),
  boxPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: pxBox,
      },
    },
  }),
  link: style({
    stroke: "var(--c)",
    strokeWidth: "1.2",
    strokeDasharray: "2 2",
    transformOrigin: "top",
    transform: "scaleY(0.205)",
  }),
  linkPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: pxLink,
      },
    },
  }),
  file: style({
    fill: "var(--c)",
  }),
  filePlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: pxFile,
      },
    },
  }),
  fileName: style({
    fill: "var(--on-c)",
    fontWeight: 600,
  }),
};

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});
const btPress = keyframes({
  "0%, 38%": { transform: "none" },
  "41%": { transform: "scale(0.92)" },
  "44%, 100%": { transform: "none" },
});
const btHover = keyframes({
  "0%, 28%": { opacity: 0 },
  "34%, 74%": { opacity: 0.22 },
  "80%, 100%": { opacity: 0 },
});
const btIdle = keyframes({
  "0%, 8%": { opacity: 0 },
  "14%, 46%": { opacity: 1 },
  "50%, 100%": { opacity: 0 },
});
const btPending = keyframes({
  "0%, 46%": { opacity: 0 },
  "50%, 74%": { opacity: 1 },
  "78%, 100%": { opacity: 0 },
});
const btDone = keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 74%": { opacity: 0 },
  "78%, 100%": { opacity: 1 },
});
const btCursor = keyframes({
  "0%, 16%": { opacity: 0, transform: "translate(34px, 30px)" },
  "22%": { opacity: 1, transform: "translate(34px, 30px)" },
  "32%, 74%": { opacity: 1, transform: "none" },
  "86%, 100%": { opacity: 0, transform: "translate(34px, 30px)" },
});
const btPip2 = keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 28%": { opacity: 0.2 },
  "31%, 100%": { opacity: 1 },
});
const btPip3 = keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 37%": { opacity: 0.2 },
  "40%, 100%": { opacity: 1 },
});
const btPip4 = keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 46%": { opacity: 0.2 },
  "49%, 100%": { opacity: 1 },
});
const btPip5 = keyframes({
  "0%, 8%": { opacity: 1 },
  "14%, 74%": { opacity: 0.2 },
  "77%, 100%": { opacity: 1 },
});
const btChipIdle = keyframes({
  "0%, 10%": { opacity: 0 },
  "14%, 28%": { opacity: 1 },
  "31%, 100%": { opacity: 0 },
});
const btChipHover = keyframes({
  "0%, 28%": { opacity: 0 },
  "31%, 37%": { opacity: 1 },
  "40%, 100%": { opacity: 0 },
});
const btChipPress = keyframes({
  "0%, 37%": { opacity: 0 },
  "40%, 45%": { opacity: 1 },
  "48%, 100%": { opacity: 0 },
});
const btChipLoad = keyframes({
  "0%, 45%": { opacity: 0 },
  "48%, 73%": { opacity: 1 },
  "76%, 100%": { opacity: 0 },
});
const btChipDone = keyframes({
  "0%, 10%": { opacity: 1 },
  "14%, 73%": { opacity: 0 },
  "76%, 100%": { opacity: 1 },
});

export const button = {
  button: style({
    transformOrigin: "center",
  }),
  buttonPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btPress,
      },
    },
  }),
  face: style({
    fill: "var(--c)",
  }),
  hover: style({
    fill: "white",
    opacity: 0,
  }),
  hoverPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btHover,
      },
    },
  }),
  text: style({
    "@layer": {
      [under1]: {
        font: `700 10px ${fonts["--display"]}`,
        fill: "var(--on-c)",
        textAnchor: "middle",
      },
    },
  }),
  hidden: style({
    opacity: 0,
  }),
  idlePlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btIdle,
      },
    },
  }),
  pendingPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btPending,
      },
    },
  }),
  spinner: style({
    fill: "none",
    stroke: "var(--on-c)",
    strokeWidth: "2",
    strokeDasharray: "20 12",
    transformOrigin: "center",
  }),
  spinnerPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: spin,
        animationDuration: "700ms",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
      },
    },
  }),
  pendingText: style({
    fontSize: "8px",
  }),
  donePlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btDone,
      },
    },
  }),
  pip: style({
    fill: "var(--c)",
  }),
  pip2Play: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btPip2,
      },
    },
  }),
  pip3Play: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btPip3,
      },
    },
  }),
  pip4Play: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btPip4,
      },
    },
  }),
  pip5Play: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btPip5,
      },
    },
  }),
  cursor: style({
    fill: "white",
    stroke: "#0e0e13",
    strokeWidth: "1",
    opacity: 0,
  }),
  cursorPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btCursor,
      },
    },
  }),
};

const dlRows = keyframes({
  "0%, 16%": { opacity: 1 },
  "28%, 60%": { opacity: 0.45 },
  "70%, 100%": { opacity: 1 },
});
const dlNew = keyframes({
  "0%, 16%": { opacity: 1 },
  "26%, 62%": { opacity: 0 },
  "68%, 100%": { opacity: 1 },
});
const dlOld = keyframes({
  "0%, 16%": { opacity: 0 },
  "26%, 62%": { opacity: 1 },
  "68%, 100%": { opacity: 0 },
});
const dlFlash = keyframes({
  "0%, 62%": { opacity: 0 },
  "67%": { opacity: 0.3 },
  "84%, 100%": { opacity: 0 },
});
const dlSweep = keyframes({
  "0%, 30%": { opacity: 0, transform: "scaleX(0)" },
  "34%": { opacity: 1, transform: "scaleX(0)" },
  "62%": { opacity: 1, transform: "none" },
  "70%, 100%": { opacity: 0, transform: "none" },
});
const dlSlide = keyframes({
  to: { transform: "translate(calc(100% + 12px))" },
});

const PHONE = "(max-width: 640px)";

export const dataLoading = {
  card: style({
    fill: "color-mix(in srgb, var(--c) 6%, transparent)",
    stroke: "var(--c-dim)",
  }),
  // The data-loading page's demo card, which the cover's screen there matches.
  ownCard: style({
    position: "relative",
    display: "grid",
    gap: "12px",
    alignContent: "start",
    padding: "14px 16px 16px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, ${drop(3, palette["--drop-ink"])}`,
    overflow: "hidden",
    "@media": {
      [PHONE]: {
        padding: "12px 12px 14px",
      },
    },
  }),
  mark: style({
    fill: "var(--c-dim)",
  }),
  value: style({
    textAnchor: "end",
  }),
  flash: style({
    fill: "var(--c)",
    opacity: 0,
  }),
  old: style({
    opacity: 0,
  }),
  sweep: style({
    fill: "var(--c)",
    transformOrigin: "left",
    opacity: 0,
  }),
  rowsPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: dlRows,
      },
    },
  }),
  newPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: dlNew,
      },
    },
  }),
  oldPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: dlOld,
      },
    },
  }),
  flashPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: dlFlash,
      },
    },
  }),
  sweepPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: dlSweep,
      },
    },
  }),
  slidePlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: dlSlide,
      },
    },
  }),
};

const nuBox = keyframes({
  "0%, 36%": { opacity: 1, transform: "none" },
  "50%": { opacity: 0, transform: "translateY(-40px)" },
  "58%": { opacity: 0, animationTimingFunction: motion["--snap"], transform: "translateY(-64px)" },
  "76%, 100%": { opacity: 1, transform: "none" },
});
const nuQuestion = keyframes({
  to: { opacity: 0.35 },
});
const nuMissing = keyframes({
  "0%, 40%": { opacity: 0 },
  "44%, 62%": { opacity: 1 },
  "66%, 100%": { opacity: 0 },
});
const nuEmpty = keyframes({
  "0%, 40%": { opacity: 1 },
  "44%, 62%": { opacity: 0 },
  "66%, 100%": { opacity: 1 },
});

export const nullish = {
  slot: style({
    fill: "none",
    stroke: "var(--c-dim)",
    strokeWidth: "1.2",
    strokeDasharray: "3 3",
  }),
  mark: style({
    "@layer": {
      [under1]: {
        font: `700 20px ${fonts["--display"]}`,
        fill: "var(--c-hi)",
        textAnchor: "middle",
      },
    },
  }),
  question: style({
    fill: "var(--c-dim)",
  }),
  questionPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: nuQuestion,
        animationDuration: "1.4s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDirection: "alternate",
      },
    },
  }),
  box: style({
    fill: "color-mix(in srgb, var(--c) 22%, #101017)",
    stroke: "var(--c)",
    strokeWidth: "1.5",
    selectors: {
      [`&${LIGHT}`]: {
        fill: "color-mix(in srgb, var(--c) 12%, #fff)",
      },
    },
  }),
  boxPlay: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: nuBox,
      },
    },
  }),
  label: style({
    textAnchor: "middle",
  }),
};

const glFloat = keyframes({
  "50%": { transform: "translateY(-4px)" },
});

export const glyph = {
  box: style({
    display: "grid",
    placeItems: "center",
    color: "var(--c)",
  }),
  svg: style({
    display: "block",
    width: "34%",
    height: "auto",
    overflow: "visible",
    filter: "drop-shadow(0 0 14px color-mix(in srgb, var(--c) 55%, transparent))",
  }),
  float: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: glFloat,
        animationDuration: LOOP,
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
      },
    },
  }),
};

export const beat = {
  away: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: awayBeat,
      },
    },
  }),
  rest: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: restBeat,
      },
    },
  }),
  idle: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btChipIdle,
      },
    },
  }),
  hover: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btChipHover,
      },
    },
  }),
  press: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btChipPress,
      },
    },
  }),
  load: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btChipLoad,
      },
    },
  }),
  done: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: btChipDone,
      },
    },
  }),
  missing: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: nuMissing,
      },
    },
  }),
  empty: style({
    selectors: {
      [`&${PLAY}`]: {
        animationName: nuEmpty,
      },
    },
  }),
};
