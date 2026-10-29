import * as stylex from "@stylexjs/stylex";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { colorOf } from "../../data/guidelines";
import type { Guideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";
import { fonts } from "../../theme.stylex";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const CATEGORY_ICON = new Map<string, ReactNode>([
  [
    "Code Writing",
    <Icon>
      <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
    </Icon>,
  ],
  [
    "UX Design",
    <Icon>
      <path d="M5 3l6.5 17 2.5-7 7-2.5z" />
    </Icon>,
  ],
  [
    "Architecture",
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="8.5" y="14" width="7" height="7" rx="1" />
      <path d="M6.5 10v2h11v-2M12 12v2" />
    </Icon>,
  ],
  [
    "Best Practices",
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </Icon>,
  ],
  [
    "Accessibility",
    <Icon>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M5 8.5l7 1.5 7-1.5M12 10v5M9 21l3-6 3 6" />
    </Icon>,
  ],
]);

const iconOf = (category: string) =>
  CATEGORY_ICON.get(category) ?? CATEGORY_ICON.get("Best Practices");

const RULE_OPEN = "rule-open";

export function useRuleOpen() {
  const panel = useRef<HTMLElement>(null);
  const [opening, setOpening] = useState<{ rule: string; inPanel: boolean } | null>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  return {
    panelProps: { ref: panel, "data-opening": opening?.inPanel ? "" : undefined },
    linkProps: (rule: Guideline) => ({
      "data-opening": opening?.rule === rule.id && !opening.inPanel ? "" : undefined,
      viewTransition: reduced ? undefined : { types: [RULE_OPEN] },
      onClick: (event: MouseEvent<HTMLElement>) => {
        const shown = panel.current?.checkVisibility() ? panel.current : null;
        const card = (shown ?? event.currentTarget).getBoundingClientRect();
        const root = document.documentElement.style;
        root.setProperty("--open-x", `${card.x + card.width / 2}px`);
        root.setProperty("--open-y", `${card.y + card.height / 2}px`);
        setOpening({ rule: rule.id, inPanel: shown !== null });
      },
    }),
  };
}

export function isOpeningRule() {
  try {
    return document.documentElement.matches(`:active-view-transition-type(${RULE_OPEN})`);
  } catch {
    return false;
  }
}

type RuleThumbProps = {
  /** With no rule the screen is blank. */
  rule?: Guideline;
  play?: boolean;
  /** Where the screen sits. The select panel and a rule's cover show it large, with a bigger chip. */
  at?: "card" | "panel" | "cover";
  style?: stylex.StyleXStyles;
};

export function RuleThumb({ rule, play = false, at = "card", style }: RuleThumbProps) {
  const Art = rule && ART.get(rule.id);
  const large = at !== "card";
  return (
    <div
      className={`thumb ${stylex.props(screen.root, style).className}`}
      style={rule && { "--c": colorOf(rule.label) }}
      data-play={play || undefined}
      aria-hidden="true"
    >
      {rule && (Art ? <Art play={play} large={large} /> : <GlyphArt rule={rule} />)}
    </div>
  );
}

type ArtProps = { play: boolean; large: boolean };

type ChipProps = {
  beats: string[];
  /** Each beat's keyframes while the art plays. */
  moves?: stylex.StyleXStyles[];
  /** The art's beat (its length and easing) while it plays. */
  playing?: stylex.StyleXStyles | false;
  large: boolean;
};

function Chip({ beats, moves, playing, large }: ChipProps) {
  return (
    <span
      className={`chip ${stylex.props(screen.chip, large && screen.chipLarge, playing).className}`}
    >
      {beats.map((beat, index) => (
        <b
          key={beat}
          className={`b${index + 1} ${stylex.props(screen.beat, playing, playing && moves?.[index]).className}`}
        >
          {beat}
        </b>
      ))}
    </span>
  );
}

// Proximity: styles.ts walks out to shared/ and back home into OrderCard/.
function ProximityArt({ play, large }: ArtProps) {
  const playing = play && draw.play;
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <rect
          {...stylex.props(proximity.box, draw.moving, playing, play && proximity.boxPlay)}
          x="14"
          y="21"
          width="108"
          height="46"
          rx="6"
        />
        <text {...stylex.props(draw.text, draw.dim, playing)} x="14" y="15">
          src/
        </text>
        <text {...stylex.props(draw.text, draw.hi, playing)} x="22" y="33">
          OrderCard/
        </text>
        <text {...stylex.props(draw.text, playing)} x="32" y="47">
          OrderCard.tsx
        </text>
        <text {...stylex.props(draw.text, draw.dim, playing)} x="22" y="77">
          shared/
        </text>
        <line
          {...stylex.props(proximity.link, draw.moving, playing, play && proximity.linkPlay)}
          x1="27"
          y1="50"
          x2="27"
          y2="89"
        />
        <g {...stylex.props(draw.moving, playing, play && proximity.filePlay)}>
          <rect
            {...stylex.props(proximity.file, playing)}
            x="30"
            y="52"
            width="56"
            height="12"
            rx="3"
          />
          <text {...stylex.props(draw.text, proximity.fileName, playing)} x="34" y="61">
            styles.ts
          </text>
        </g>
      </svg>
      <Chip
        beats={["FAR", "NEAR"]}
        moves={[beat.away, beat.rest]}
        playing={playing}
        large={large}
      />
    </div>
  );
}

// Button: done 0-8%, eases back to idle 8-16%, hover 22-34%, press 38-44%, pending 46-74%, done
// again 74-100%.
function ButtonArt({ play, large }: ArtProps) {
  const playing = play && draw.playSlow;
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <g {...stylex.props(button.button, draw.moving, playing, play && button.buttonPlay)}>
          <rect
            {...stylex.props(button.face, draw.moving, playing)}
            x="38"
            y="30"
            width="84"
            height="28"
            rx="8"
          />
          <rect
            {...stylex.props(button.hover, draw.moving, playing, play && button.hoverPlay)}
            x="38"
            y="30"
            width="84"
            height="28"
            rx="8"
          />
          <text
            {...stylex.props(
              button.text,
              button.hidden,
              draw.moving,
              playing,
              play && button.idlePlay,
            )}
            x="80"
            y="48"
          >
            Save
          </text>
          <g {...stylex.props(button.hidden, draw.moving, playing, play && button.pendingPlay)}>
            <circle
              {...stylex.props(button.spinner, draw.moving, playing, play && button.spinnerPlay)}
              cx="52"
              cy="44"
              r="5"
            />
            <text {...stylex.props(button.text, button.pendingText, playing)} x="88" y="47.5">
              Saving…
            </text>
          </g>
          <text
            {...stylex.props(button.text, draw.moving, playing, play && button.donePlay)}
            x="80"
            y="48"
          >
            Saved ✓
          </text>
        </g>
        {PIP_PLAY.map((pipPlay, index) => (
          <rect
            key={index}
            {...stylex.props(button.pip, draw.moving, playing, play && pipPlay)}
            x={52 + index * 12}
            y="72"
            width="8"
            height="4"
            rx="2"
          />
        ))}
        <path
          {...stylex.props(button.cursor, draw.moving, playing, play && button.cursorPlay)}
          d="M100 46l0 16 4.5-4.2 3 6.6 2.6-1.2-3-6.4 6-.4z"
        />
      </svg>
      <Chip
        beats={["IDLE", "HOVER", "PRESS", "LOAD", "DONE"]}
        moves={[beat.idle, beat.hover, beat.press, beat.load, beat.done]}
        playing={playing}
        large={large}
      />
    </div>
  );
}

function DataLoadingArt({ large }: ArtProps) {
  const rows = [
    { y: 34, width: 50, value: "$12" },
    { y: 52, width: 38, value: "$14" },
    { y: 70, width: 58, value: "$31" },
  ];
  return (
    <div className={`dl ${stylex.props(screen.art).className}`}>
      <svg viewBox="0 0 160 100">
        <rect className="dl-card" x="22" y="16" width="116" height="72" rx="8" />
        <rect className="dl-flash" x="24" y="44" width="112" height="16" rx="3" />
        <g className="dl-rows">
          {rows.map((row, index) => (
            <g key={row.y}>
              <circle cx="36" cy={row.y + 2} r="4" />
              <rect x="46" y={row.y - 1} width={row.width} height="6" rx="3" />
              <text className={index === 1 ? "hi dl-new" : "hi"} x="130" y={row.y + 5}>
                {row.value}
              </text>
            </g>
          ))}
        </g>
        <text className="dl-old" x="130" y="57">
          $8
        </text>
        <rect className="dl-sweep" x="22" y="16" width="116" height="3" rx="1.5" />
      </svg>
      <Chip beats={["STALE", "FRESH"]} large={large} />
    </div>
  );
}

function NullArt({ large }: ArtProps) {
  return (
    <div className={`nu ${stylex.props(screen.art).className}`}>
      <svg viewBox="0 0 160 100">
        <rect className="nu-slot" x="20" y="20" width="52" height="46" rx="8" />
        <text className="nu-q" x="46" y="51">
          ?
        </text>
        <rect className="nu-slot" x="88" y="20" width="52" height="46" rx="8" />
        <g className="nu-box">
          <rect x="91" y="23" width="46" height="40" rx="6" />
          <text x="114" y="51">
            ∅
          </text>
        </g>
        <text className="nu-label dim" x="46" y="84">
          undefined
        </text>
        <text className="nu-label hi" x="114" y="84">
          null
        </text>
      </svg>
      <Chip beats={["MISSING", "EMPTY"]} large={large} />
    </div>
  );
}

function GlyphArt({ rule }: { rule: Guideline }) {
  return <div className={`gl ${stylex.props(screen.art).className}`}>{iconOf(rule.label)}</div>;
}

const ART = new Map<string, (props: ArtProps) => ReactNode>([
  ["proximity-principle", ProximityArt],
  ["button-design", ButtonArt],
  ["data-loading", DataLoadingArt],
  ["null-vs-undefined", NullArt],
]);

const LIGHT = ":is(.light *)";

// Each rule's art holds a still frame by default. While it plays it loops forever through the rule
// in a few beats: it moves out of the still frame and glides back into it, so 100% meets 0% without
// a cut. Anything that has to jump does it while invisible. Only transform and opacity animate.
const screen = stylex.create({
  // A dark screen in the topic's hue. Light puts it on paper with the page; colorOf points --c at
  // the topic hues, so deepening them here keeps thin strokes and 9px labels legible on white, and
  // labels darken further still.
  root: {
    "--dur": "4.4s",
    "--io": "cubic-bezier(0.645, 0.045, 0.355, 1)",
    "--c-hi": {
      default: "color-mix(in srgb, var(--c) 55%, white)",
      [LIGHT]: "color-mix(in oklab, var(--c) 68%, #000)",
    },
    "--c-dim": "color-mix(in srgb, var(--c) 40%, transparent)",
    "--cw": { default: null, [LIGHT]: "#0a9cd4" },
    "--ux": { default: null, [LIGHT]: "#e0389f" },
    "--ar": { default: null, [LIGHT]: "#e38a00" },
    "--ts": { default: null, [LIGHT]: "#2aa816" },
    "--ax": { default: null, [LIGHT]: "#7650ee" },
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

const IO = "cubic-bezier(0.645, 0.045, 0.355, 1)";

// What every art draws with, and the beat each part of it keeps while the art plays.
const draw = stylex.create({
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
    animationDuration: "4.4s",
    animationTimingFunction: IO,
    animationIterationCount: "infinite",
  },
  playSlow: {
    animationDuration: "5.2s",
    animationTimingFunction: IO,
    animationIterationCount: "infinite",
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

const proximity = stylex.create({
  box: {
    fill: "color-mix(in srgb, var(--c) 8%, transparent)",
    stroke: "var(--c)",
    strokeWidth: "1.2",
  },
  boxPlay: {
    animationName: pxBox,
  },
  link: {
    stroke: "var(--c)",
    strokeWidth: "1.2",
    strokeDasharray: "2 2",
    transformOrigin: "top",
    transform: "scaleY(0.205)",
  },
  linkPlay: {
    animationName: pxLink,
  },
  file: {
    fill: "var(--c)",
  },
  filePlay: {
    animationName: pxFile,
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

const button = stylex.create({
  button: {
    transformOrigin: "center",
  },
  buttonPlay: {
    animationName: btPress,
  },
  face: {
    fill: "var(--c)",
  },
  hover: {
    fill: "white",
    opacity: 0,
  },
  hoverPlay: {
    animationName: btHover,
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
    animationName: btIdle,
  },
  pendingPlay: {
    animationName: btPending,
  },
  spinner: {
    fill: "none",
    stroke: "var(--on-c)",
    strokeWidth: "2",
    strokeDasharray: "20 12",
    transformOrigin: "center",
  },
  spinnerPlay: {
    animationName: spin,
    animationDuration: "700ms",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  pendingText: {
    fontSize: "8px",
  },
  donePlay: {
    animationName: btDone,
  },
  pip: {
    fill: "var(--c)",
  },
  pip2Play: {
    animationName: btPip2,
  },
  pip3Play: {
    animationName: btPip3,
  },
  pip4Play: {
    animationName: btPip4,
  },
  pip5Play: {
    animationName: btPip5,
  },
  cursor: {
    fill: "white",
    stroke: "#0e0e13",
    strokeWidth: "1",
    opacity: 0,
  },
  cursorPlay: {
    animationName: btCursor,
  },
});

// The progress pips fill one by one; the first is lit throughout.
const PIP_PLAY = [null, button.pip2Play, button.pip3Play, button.pip4Play, button.pip5Play];

const beat = stylex.create({
  away: {
    animationName: awayBeat,
  },
  rest: {
    animationName: restBeat,
  },
  idle: {
    animationName: btChipIdle,
  },
  hover: {
    animationName: btChipHover,
  },
  press: {
    animationName: btChipPress,
  },
  load: {
    animationName: btChipLoad,
  },
  done: {
    animationName: btChipDone,
  },
});
