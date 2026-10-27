import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { GUIDELINES } from "../../data/guidelines";
import type { Guideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";

// The Rule of Thumb visual system: one hue and glyph per topic, and a
// thumbnail "screen" per rule that acts the rule out when it plays. Shared by
// the home page, the index, and every article.

const CATEGORY_COLOR = new Map([
  ["Code Writing", "var(--cw)"],
  ["UX Design", "var(--ux)"],
  ["Architecture", "var(--ar)"],
  ["Best Practices", "var(--ts)"],
  ["Accessibility", "var(--ax)"],
]);

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

export const colorOf = (category: string) => CATEGORY_COLOR.get(category) ?? "var(--go)";
const iconOf = (category: string) =>
  CATEGORY_ICON.get(category) ?? CATEGORY_ICON.get("Best Practices");

const VISIBLE = GUIDELINES.filter((guideline) => !guideline.hidden);

/** "001" for the first published rule. Unpublished rules have no number. */
export function ruleNumber(rule: Guideline) {
  const index = VISIBLE.indexOf(rule);
  return index === -1 ? null : String(index + 1).padStart(3, "0");
}

/** The view transition a rule card starts when it opens its rule: the page dives into the card
 * while its thumbnail and title grow into the rule page's cover and heading (see `rule-open` in
 * arcade.css). */
export const RULE_OPEN = "rule-open";

/** Props for the links that open rules with the dive, and for the panel that previews the rule a
 * link points at, where a page has one. The page dives into the panel while it is on screen, and
 * into the clicked card otherwise. The card that opens is marked and its centre recorded, the point
 * the page zooms toward. */
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

/** True while the page renders inside a card's `rule-open` transition, when the hero's cover and
 * heading are already on screen as the morph's end state and must not play their cut-in. */
export function isOpeningRule() {
  try {
    return document.documentElement.matches(`:active-view-transition-type(${RULE_OPEN})`);
  } catch {
    return false;
  }
}

type RuleThumbProps = {
  rule: Guideline;
  /** Loop the rule's animation. Otherwise the thumbnail holds its still frame. */
  play?: boolean;
  className?: string;
};

// Each art piece's still frame is its default style, and every keyframe loop
// ends on that frame, so stopping mid-loop or reduced motion lands on the
// same picture.
export function RuleThumb({ rule, play = false, className }: RuleThumbProps) {
  return (
    <div
      className={className ? `thumb ${className}` : "thumb"}
      style={{ "--c": colorOf(rule.label) }}
      data-play={play || undefined}
      aria-hidden="true"
    >
      {ART.get(rule.id) ?? <GlyphArt rule={rule} />}
    </div>
  );
}

function Chip({ beats }: { beats: string[] }) {
  return (
    <span className="chip">
      {beats.map((beat, index) => (
        <b key={beat} className={`b${index + 1}`}>
          {beat}
        </b>
      ))}
    </span>
  );
}

// A styles file walks from shared/ to the component that uses it.
function ProximityArt() {
  return (
    <div className="art px">
      <svg viewBox="0 0 160 100">
        <rect className="px-box" x="14" y="24" width="108" height="46" rx="6" />
        <text className="dim" x="14" y="17">
          src/
        </text>
        <text className="hi" x="22" y="37">
          OrderCard/
        </text>
        <text x="32" y="52">
          OrderCard.tsx
        </text>
        <text className="dim" x="22" y="84">
          shared/
        </text>
        <line className="px-link" x1="27" y1="55" x2="27" y2="95" />
        <g className="px-file">
          <rect x="30" y="58" width="56" height="12" rx="3" />
          <text x="34" y="67">
            styles.ts
          </text>
        </g>
      </svg>
      <Chip beats={["FAR", "NEAR"]} />
    </div>
  );
}

// One button walks through idle, hover, press, pending and done.
function ButtonArt() {
  return (
    <div className="art bt">
      <svg viewBox="0 0 160 100">
        <g className="bt-btn">
          <rect className="bt-face" x="38" y="30" width="84" height="28" rx="8" />
          <rect className="bt-hover" x="38" y="30" width="84" height="28" rx="8" />
          <text className="bt-l1" x="80" y="48">
            Save
          </text>
          <g className="bt-l2">
            <circle className="bt-spin" cx="52" cy="44" r="5" />
            <text x="88" y="47.5">
              Saving…
            </text>
          </g>
          <text className="bt-l3" x="80" y="48">
            Saved ✓
          </text>
        </g>
        {[0, 1, 2, 3, 4].map((index) => (
          <rect
            key={index}
            className={`bt-pip p${index + 1}`}
            x={52 + index * 12}
            y="72"
            width="8"
            height="4"
            rx="2"
          />
        ))}
        <path className="bt-cursor" d="M100 46l0 16 4.5-4.2 3 6.6 2.6-1.2-3-6.4 6-.4z" />
      </svg>
      <Chip beats={["IDLE", "HOVER", "PRESS", "LOAD", "DONE"]} />
    </div>
  );
}

// Cached rows show at once, then revalidate in place.
function DataLoadingArt() {
  const rows = [
    { y: 34, width: 50, value: "$12" },
    { y: 52, width: 38, value: "$14" },
    { y: 70, width: 58, value: "$31" },
  ];
  return (
    <div className="art dl">
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
      <Chip beats={["STALE", "FRESH"]} />
    </div>
  );
}

// undefined leaves the slot empty; null puts an empty box in it.
function NullArt() {
  return (
    <div className="art nu">
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
      <Chip beats={["MISSING", "EMPTY"]} />
    </div>
  );
}

function GlyphArt({ rule }: { rule: Guideline }) {
  return <div className="art gl">{iconOf(rule.label)}</div>;
}

const ART = new Map<string, ReactNode>([
  ["proximity-principle", <ProximityArt />],
  ["button-design", <ButtonArt />],
  ["data-loading", <DataLoadingArt />],
  ["null-vs-undefined", <NullArt />],
]);
