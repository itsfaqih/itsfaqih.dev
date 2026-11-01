import * as stylex from "@stylexjs/stylex";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { colorOf } from "../data/guidelines";
import type { Guideline } from "../data/guidelines";
import { opensElsewhere, recordDive } from "./rule-open";
import {
  beat,
  button,
  dataLoading,
  depth,
  draw,
  glyph,
  glyphOf,
  nullish,
  PIP_PLAY,
  proximity,
  screen,
} from "./rule-thumb.styles";

export { isTransitioning } from "./rule-open";

export function useRuleOpen() {
  const panel = useRef<HTMLElement>(null);
  const [opening, setOpening] = useState<{ rule: string; inPanel: boolean } | null>(null);
  return {
    panelProps: { ref: panel, "data-opening": opening?.inPanel ? "" : undefined },
    linkProps: (rule: Guideline) => ({
      "data-opening": opening?.rule === rule.id && !opening.inPanel ? "" : undefined,
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (opensElsewhere(event.nativeEvent)) return;
        const shown = panel.current?.checkVisibility() ? panel.current : null;
        recordDive(rule.href, shown ?? event.currentTarget);
        setOpening({ rule: rule.id, inPanel: shown !== null });
      },
    }),
  };
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
      data-play={play ? "" : undefined}
    >
      {rule && (Art ? <Art at={at} /> : <GlyphArt rule={rule} at={at} />)}
    </div>
  );
}

type ArtProps = { at: NonNullable<RuleThumbProps["at"]> };

type ChipProps = {
  beats: string[];
  /** Each beat's keyframes while the art plays. */
  moves: stylex.StyleXStyles[];
  /** The art's beat (its length and easing) while it plays. */
  playing: stylex.StyleXStyles;
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
        <b key={beat} {...stylex.props(screen.beat, playing, moves[index])}>
          {beat}
        </b>
      ))}
    </span>
  );
}

// Proximity: styles.ts walks out to shared/ and back home into OrderCard/.
function ProximityArt({ at }: ArtProps) {
  const playing = draw.play;
  const z = at === "cover";
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <rect
          {...stylex.props(
            proximity.box,
            draw.moving,
            playing,
            proximity.boxPlay,
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
            proximity.linkPlay,
            z && depth.mid,
          )}
          x1="27"
          y1="50"
          x2="27"
          y2="89"
        />
        <g {...stylex.props(draw.moving, playing, proximity.filePlay, z && depth.front)}>
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
function ButtonArt({ at }: ArtProps) {
  const playing = draw.playSlow;
  const z = at === "cover";
  return (
    <div {...stylex.props(screen.art, playing)}>
      <svg viewBox="0 0 160 100" {...stylex.props(draw.svg, playing)}>
        <g
          {...stylex.props(
            button.button,
            draw.moving,
            playing,
            button.buttonPlay,
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
            {...stylex.props(button.hover, draw.moving, playing, button.hoverPlay)}
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
              button.idlePlay,
            )}
            x="80"
            y="48"
          >
            Save
          </text>
          <g {...stylex.props(button.hidden, draw.moving, playing, button.pendingPlay)}>
            <circle
              {...stylex.props(button.spinner, draw.moving, playing, button.spinnerPlay)}
              cx="52"
              cy="44"
              r="5"
            />
            <text {...stylex.props(button.text, button.pendingText, playing)} x="88" y="47.5">
              Saving…
            </text>
          </g>
          <text
            {...stylex.props(button.text, draw.moving, playing, button.donePlay)}
            x="80"
            y="48"
          >
            Saved ✓
          </text>
        </g>
        {PIP_PLAY.map((pipPlay, index) => (
          <rect
            key={index}
            {...stylex.props(button.pip, draw.moving, playing, pipPlay, z && depth.back)}
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
            button.cursorPlay,
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
function DataLoadingArt({ at }: ArtProps) {
  const playing = draw.play;
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
            dataLoading.flashPlay,
            own && depth.mid,
          )}
          x="24"
          y="44"
          width="112"
          height="16"
          rx="3"
        />
        <g {...stylex.props(draw.moving, playing, dataLoading.rowsPlay, own && depth.mid)}>
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
                  index === 1 && dataLoading.newPlay,
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
            dataLoading.oldPlay,
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
            (own ? dataLoading.slidePlay : dataLoading.sweepPlay),
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
function NullArt({ at }: ArtProps) {
  const playing = draw.play;
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
            nullish.questionPlay,
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
        <g {...stylex.props(draw.moving, playing, nullish.boxPlay, z && depth.front)}>
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
function GlyphArt({ rule, at }: { rule: Guideline; at: ArtProps["at"] }) {
  const playing = draw.play;
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
        {...stylex.props(glyph.svg, playing, glyph.float, at === "cover" && depth.near)}
      >
        {glyphOf(rule.label).map(({ tag: Stroke, attrs }, index) => (
          <Stroke key={index} {...stylex.props(playing)} {...attrs} />
        ))}
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
