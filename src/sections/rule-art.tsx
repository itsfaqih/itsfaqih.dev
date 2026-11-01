import * as stylex from "@stylexjs/stylex";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { colorOf } from "../data/guidelines";
import type { Guideline } from "../data/guidelines";
import { useMediaQuery } from "../hooks/use-media-query";
import { fonts, motion, palette } from "../theme.stylex";

type StrokeProps = ReturnType<typeof stylex.props>;

// Each topic's glyph on a 24-unit grid. Every stroke takes the art's beat while it plays.
const GLYPH = new Map<string, (stroke: StrokeProps) => ReactNode>([
  ["Code Writing", (stroke) => <path {...stroke} d="M8 6l-6 6 6 6M16 6l6 6-6 6" />],
  ["UX Design", (stroke) => <path {...stroke} d="M5 3l6.5 17 2.5-7 7-2.5z" />],
  [
    "Architecture",
    (stroke) => (
      <>
        <rect {...stroke} x="3" y="3" width="7" height="7" rx="1" />
        <rect {...stroke} x="14" y="3" width="7" height="7" rx="1" />
        <rect {...stroke} x="8.5" y="14" width="7" height="7" rx="1" />
        <path {...stroke} d="M6.5 10v2h11v-2M12 12v2" />
      </>
    ),
  ],
  [
    "Best Practices",
    (stroke) => (
      <>
        <circle {...stroke} cx="12" cy="12" r="9" />
        <path {...stroke} d="M8 12.5l2.5 2.5L16 9" />
      </>
    ),
  ],
  [
    "Accessibility",
    (stroke) => (
      <>
        <circle {...stroke} cx="12" cy="4.5" r="1.8" />
        <path {...stroke} d="M5 8.5l7 1.5 7-1.5M12 10v5M9 21l3-6 3 6" />
      </>
    ),
  ],
]);

/** Where a tile's click leaves the dive for the head script on the rule page (head-script.ts). */
export const OPENING_KEY = "rule-open";

export function useRuleOpen() {
  const panel = useRef<HTMLElement>(null);
  const [opening, setOpening] = useState<{ rule: string; inPanel: boolean } | null>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  return {
    panelProps: { ref: panel, "data-opening": opening?.inPanel ? "" : undefined },
    linkProps: (rule: Guideline) => ({
      "data-opening": opening?.rule === rule.id && !opening.inPanel ? "" : undefined,
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const shown = panel.current?.checkVisibility() ? panel.current : null;
        const card = (shown ?? event.currentTarget).getBoundingClientRect();
        // The zoom's origin, for the rule page, where the transition's pictures live.
        const dive = { href: rule.href, x: card.x + card.width / 2, y: card.y + card.height / 2 };
        try {
          if (reduced) sessionStorage.removeItem(OPENING_KEY);
          else sessionStorage.setItem(OPENING_KEY, JSON.stringify(dive));
        } catch {}
        setOpening({ rule: rule.id, inPanel: shown !== null });
      },
    }),
  };
}

export function isTransitioning() {
  return matchesRoot(":active-view-transition");
}

function matchesRoot(selector: string) {
  try {
    return document.documentElement.matches(selector);
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
  return (
    <div
      className={`thumb ${stylex.props(screen.root, !rule && screen.blank, at === "cover" && depth.dots, style).className}`}
      style={rule && { "--c": colorOf(rule.label) }}
      aria-hidden="true"
    >
      {rule && (Art ? <Art play={play} at={at} /> : <GlyphArt rule={rule} play={play} at={at} />)}
    </div>
  );
}

type ArtProps = { play: boolean; at: NonNullable<RuleThumbProps["at"]> };

type ChipProps = {
  beats: string[];
  /** Each beat's keyframes while the art plays. */
  moves: stylex.StyleXStyles[];
  /** The art's beat (its length and easing) while it plays. */
  playing: stylex.StyleXStyles | false;
  at: ArtProps["at"];
};

function Chip({ beats, moves, playing, at }: ChipProps) {
  return (
    <span
      {...stylex.props(
        screen.chip,
        at !== "card" && screen.chipLarge,
        at === "cover" && depth.near,
        playing,
      )}
    >
      {beats.map((beat, index) => (
        <b key={beat} {...stylex.props(screen.beat, playing, playing && moves[index])}>
          {beat}
        </b>
      ))}
    </span>
  );
}

// Proximity: styles.ts walks out to shared/ and back home into OrderCard/.
function ProximityArt({ play, at }: ArtProps) {
  const playing = play && draw.play;
  const z = at === "cover";
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <rect
          {...stylex.props(
            proximity.box,
            draw.moving,
            playing,
            play && proximity.boxPlay,
            z && depth.back,
          )}
          x="14"
          y="21"
          width="108"
          height="46"
          rx="6"
        />
        <text {...stylex.props(draw.text, draw.dim, playing, z && depth.back)} x="14" y="15">
          src/
        </text>
        <text {...stylex.props(draw.text, draw.hi, playing, z && depth.mid)} x="22" y="33">
          OrderCard/
        </text>
        <text {...stylex.props(draw.text, playing, z && depth.mid)} x="32" y="47">
          OrderCard.tsx
        </text>
        <text {...stylex.props(draw.text, draw.dim, playing, z && depth.mid)} x="22" y="77">
          shared/
        </text>
        <line
          {...stylex.props(
            proximity.link,
            draw.moving,
            playing,
            play && proximity.linkPlay,
            z && depth.mid,
          )}
          x1="27"
          y1="50"
          x2="27"
          y2="89"
        />
        <g {...stylex.props(draw.moving, playing, play && proximity.filePlay, z && depth.front)}>
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
      <Chip beats={["FAR", "NEAR"]} moves={[beat.away, beat.rest]} playing={playing} at={at} />
    </div>
  );
}

// Button: done 0-8%, eases back to idle 8-16%, hover 22-34%, press 38-44%, pending 46-74%, done
// again 74-100%.
function ButtonArt({ play, at }: ArtProps) {
  const playing = play && draw.playSlow;
  const z = at === "cover";
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <g
          {...stylex.props(
            button.button,
            draw.moving,
            playing,
            play && button.buttonPlay,
            z && depth.mid,
          )}
        >
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
            {...stylex.props(button.pip, draw.moving, playing, play && pipPlay, z && depth.back)}
            x={52 + index * 12}
            y="72"
            width="8"
            height="4"
            rx="2"
          />
        ))}
        <path
          {...stylex.props(
            button.cursor,
            draw.moving,
            playing,
            play && button.cursorPlay,
            z && depth.front,
          )}
          d="M100 46l0 16 4.5-4.2 3 6.6 2.6-1.2-3-6.4 6-.4z"
        />
      </svg>
      <Chip
        beats={["IDLE", "HOVER", "PRESS", "LOAD", "DONE"]}
        moves={[beat.idle, beat.hover, beat.press, beat.load, beat.done]}
        playing={playing}
        at={at}
      />
    </div>
  );
}

// Data loading: fresh rows go stale, a revalidate sweep runs, and they come back fresh.
function DataLoadingArt({ play, at }: ArtProps) {
  const playing = play && draw.play;
  // On the data-loading page's own cover the screen takes that page's demo card styles, and its
  // slide in place of the sweep.
  const own = at === "cover";
  const rows = [
    { y: 34, width: 50, value: "$12" },
    { y: 52, width: 38, value: "$14" },
    { y: 70, width: 58, value: "$31" },
  ];
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <rect
          {...stylex.props(
            dataLoading.card,
            own && dataLoading.ownCard,
            draw.moving,
            playing,
            own && depth.back,
          )}
          x="22"
          y="16"
          width="116"
          height="72"
          rx="8"
        />
        <rect
          {...stylex.props(
            dataLoading.flash,
            draw.moving,
            playing,
            play && dataLoading.flashPlay,
            own && depth.mid,
          )}
          x="24"
          y="44"
          width="112"
          height="16"
          rx="3"
        />
        <g {...stylex.props(draw.moving, playing, play && dataLoading.rowsPlay, own && depth.mid)}>
          {rows.map((row, index) => (
            <g key={row.y} {...stylex.props(playing)}>
              <circle {...stylex.props(dataLoading.mark, playing)} cx="36" cy={row.y + 2} r="4" />
              <rect
                {...stylex.props(dataLoading.mark, playing)}
                x="46"
                y={row.y - 1}
                width={row.width}
                height="6"
                rx="3"
              />
              <text
                {...stylex.props(
                  draw.text,
                  draw.hi,
                  dataLoading.value,
                  index === 1 && draw.moving,
                  playing,
                  play && index === 1 && dataLoading.newPlay,
                )}
                x="130"
                y={row.y + 5}
              >
                {row.value}
              </text>
            </g>
          ))}
        </g>
        <text
          {...stylex.props(
            draw.text,
            dataLoading.value,
            dataLoading.old,
            draw.moving,
            playing,
            play && dataLoading.oldPlay,
            own && depth.mid,
          )}
          x="130"
          y="57"
        >
          $8
        </text>
        <rect
          {...stylex.props(
            dataLoading.sweep,
            draw.moving,
            playing,
            play && (own ? dataLoading.slidePlay : dataLoading.sweepPlay),
            own && depth.back,
          )}
          x="22"
          y="16"
          width="116"
          height="3"
          rx="1.5"
        />
      </svg>
      <Chip beats={["STALE", "FRESH"]} moves={[beat.away, beat.rest]} playing={playing} at={at} />
    </div>
  );
}

// Null vs undefined: the null box lifts out of its slot and drops back in; undefined stays empty.
function NullArt({ play, at }: ArtProps) {
  const playing = play && draw.play;
  const z = at === "cover";
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <rect
          {...stylex.props(nullish.slot, draw.moving, playing, z && depth.back)}
          x="20"
          y="20"
          width="52"
          height="46"
          rx="8"
        />
        <text
          {...stylex.props(
            nullish.mark,
            nullish.question,
            draw.moving,
            playing,
            play && nullish.questionPlay,
            z && depth.mid,
          )}
          x="46"
          y="51"
        >
          ?
        </text>
        <rect
          {...stylex.props(nullish.slot, draw.moving, playing, z && depth.back)}
          x="88"
          y="20"
          width="52"
          height="46"
          rx="8"
        />
        <g {...stylex.props(draw.moving, playing, play && nullish.boxPlay, z && depth.front)}>
          <rect
            {...stylex.props(nullish.box, playing)}
            x="91"
            y="23"
            width="46"
            height="40"
            rx="6"
          />
          <text {...stylex.props(nullish.mark, playing)} x="114" y="51">
            ∅
          </text>
        </g>
        <text
          {...stylex.props(
            draw.text,
            draw.dim,
            nullish.label,
            draw.moving,
            playing,
            z && depth.back,
          )}
          x="46"
          y="84"
        >
          undefined
        </text>
        <text
          {...stylex.props(
            draw.text,
            draw.hi,
            nullish.label,
            draw.moving,
            playing,
            z && depth.back,
          )}
          x="114"
          y="84"
        >
          null
        </text>
      </svg>
      <Chip
        beats={["MISSING", "EMPTY"]}
        moves={[beat.missing, beat.empty]}
        playing={playing}
        at={at}
      />
    </div>
  );
}

// Rules without custom art yet: the topic glyph on the same screen.
function GlyphArt({ rule, play, at }: { rule: Guideline; play: boolean; at: ArtProps["at"] }) {
  const playing = play && draw.play;
  const strokes = GLYPH.get(rule.label) ?? GLYPH.get("Best Practices")!;
  return (
    <div {...stylex.props(screen.art, glyph.box, playing)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...stylex.props(glyph.svg, playing, play && glyph.float, at === "cover" && depth.near)}
      >
        {strokes(stylex.props(playing))}
      </svg>
    </div>
  );
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
const depth = stylex.create({
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
    animationDuration: LOOP,
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

const dataLoading = stylex.create({
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
    animationName: dlRows,
  },
  newPlay: {
    animationName: dlNew,
  },
  oldPlay: {
    animationName: dlOld,
  },
  flashPlay: {
    animationName: dlFlash,
  },
  sweepPlay: {
    animationName: dlSweep,
  },
  slidePlay: {
    animationName: dlSlide,
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

const nullish = stylex.create({
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
    animationName: nuQuestion,
    animationDuration: "1.4s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
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
    animationName: nuBox,
  },
  label: {
    textAnchor: "middle",
  },
});

const glFloat = stylex.keyframes({ "50%": { transform: "translateY(-4px)" } });

const glyph = stylex.create({
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
    animationName: glFloat,
    animationDuration: LOOP,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
});

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
  missing: {
    animationName: nuMissing,
  },
  empty: {
    animationName: nuEmpty,
  },
});
