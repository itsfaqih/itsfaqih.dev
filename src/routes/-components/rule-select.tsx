import * as stylex from "@stylexjs/stylex";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { colorOf, ruleNumber, TOPICS } from "../../data/guidelines";
import type { PublishedGuideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";
import { chips } from "./chips";
import { reticle } from "./reticle";
import { RuleThumb, useRuleOpen } from "./rule-art";
import { fonts, motion, palette } from "../../theme.stylex";
import { loadIn } from "../../components/load-in";
import { arcade } from "../../components/arcade";

export function RuleSelect({ rules }: { rules: PublishedGuideline[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [litId, setLitId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const litTile = useRef<HTMLElement>(null);
  const { linkProps: openRule, panelProps } = useRuleOpen();

  const normalizedQuery = query.trim().toLowerCase();
  const fuse = useMemo(
    () =>
      new Fuse(rules, {
        keys: [
          { name: "title", weight: 3 },
          { name: "label", weight: 1.5 },
          { name: "description", weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [rules],
  );
  const matches = (
    normalizedQuery ? fuse.search(normalizedQuery).map(({ item }) => item) : rules
  ).filter((rule) => category === "All" || rule.label === category);
  const selected = matches.find((rule) => rule.id === selectedId);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const typing = target?.closest("input, textarea, [contenteditable='true']");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, []);

  useLayoutEffect(() => {
    const select = selectRef.current;
    const beam = beamRef.current;
    const tile = litTile.current;
    const panel = panelProps.ref.current;
    if (!litId || !select || !beam || !tile || !panel?.checkVisibility()) return;
    const aim = () => {
      const box = select.getBoundingClientRect();
      const from = tile.getBoundingClientRect();
      const to = panel.getBoundingClientRect();
      const corners = ({ left, top, right, bottom }: DOMRect): Point[] => {
        const [x0, y0, x1, y1] = [
          left - box.left,
          top - box.top,
          right - box.left,
          bottom - box.top,
        ];
        return [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ];
      };
      const lens: Point = [
        from.left + from.width / 2 - box.left,
        from.top + from.height / 2 - box.top,
      ];
      const reach = Math.max(...corners(to).map(([x, y]) => Math.hypot(x - lens[0], y - lens[1])));
      beam.style.clipPath = `polygon(${hull([...corners(from), ...corners(to)])
        .map(([x, y]) => `${x}px ${y}px`)
        .join(", ")})`;
      beam.style.setProperty("--lens-x", `${lens[0]}px`);
      beam.style.setProperty("--lens-y", `${lens[1]}px`);
      beam.style.setProperty("--reach", `${reach}px`);
    };
    aim();
    addEventListener("scroll", aim, { passive: true });
    addEventListener("resize", aim);
    return () => {
      removeEventListener("scroll", aim);
      removeEventListener("resize", aim);
    };
  }, [litId, panelProps.ref]);

  const light = (rule: PublishedGuideline, tile: HTMLElement) => {
    litTile.current = tile;
    setLitId(rule.id);
  };

  return (
    <div ref={selectRef} {...stylex.props(styles.select)} data-lit={litId ? "" : undefined}>
      <aside
        {...panelProps}
        {...stylex.props(loadIn.piece, styles.panel)}
        data-cut
        data-empty={selected ? undefined : ""}
        aria-live="polite"
        style={{ "--c": selected ? colorOf(selected.label) : undefined }}
      >
        {selected ? (
          <>
            <div {...stylex.props(styles.plate)}>
              <span>No.{ruleNumber(selected)}</span>
              <span>{selected.label.toUpperCase()}</span>
            </div>
            <RuleThumb
              key={selected.id}
              rule={selected}
              play
              at="panel"
              style={[styles.thumb, styles.panelThumb]}
            />
            <h3 {...stylex.props(styles.title)}>
              <ScrambleText text={selected.title} />
              <span {...stylex.props(arcade.srOnly)}>{selected.title}</span>
            </h3>
            <p {...stylex.props(styles.blurb)}>{selected.description}</p>
            <dl {...stylex.props(styles.facts)}>
              <div {...stylex.props(styles.fact)}>
                <dt {...stylex.props(styles.term)}>TOPIC</dt>
                <dd {...stylex.props(styles.value)}>{selected.label}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <div {...stylex.props(styles.plate, styles.standby)}>
              <span>No.—</span>
              <span>STANDBY</span>
            </div>
            <RuleThumb style={[styles.thumb, styles.panelThumb]} />
            <h3 {...stylex.props(styles.title, styles.standby)}>Pick a rule</h3>
            <p {...stylex.props(styles.blurb)}>Hover or focus a rule to preview it.</p>
            <dl {...stylex.props(styles.facts)}>
              <div {...stylex.props(styles.fact)}>
                <dt {...stylex.props(styles.term)}>TOPIC</dt>
                <dd {...stylex.props(styles.value)}>{category}</dd>
              </div>
            </dl>
          </>
        )}
      </aside>
      <div>
        <div {...stylex.props(styles.tools)}>
          <label {...stylex.props(loadIn.piece, styles.search)} data-cut>
            FIND
            <input
              ref={searchRef}
              {...stylex.props(styles.input)}
              type="search"
              enterKeyHint="search"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="button, cache, null…"
              aria-label="Search rules"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd {...stylex.props(styles.key)}>/</kbd>
          </label>
        </div>
        <div {...stylex.props(chips.group)} role="group" aria-label="Filter by topic">
          {["All", ...TOPICS].map((name) => (
            <button
              key={name}
              type="button"
              {...stylex.props(loadIn.piece, chips.chip)}
              data-cut
              aria-pressed={category === name}
              style={{ "--c": colorOf(name) }}
              onClick={() => setCategory(name)}
            >
              <i {...stylex.props(chips.dot)} />
              {name}
              <b {...stylex.props(chips.count, category === name && chips.countOn)}>
                {name === "All" ? rules.length : rules.filter((rule) => rule.label === name).length}
              </b>
            </button>
          ))}
        </div>
        <div
          {...stylex.props(styles.tiles)}
          key={`${category}|${normalizedQuery}`}
          onPointerLeave={(event) => {
            setLitId(null);
            if (!event.currentTarget.querySelector(":focus-visible")) setSelectedId(null);
          }}
        >
          {matches.map((rule) => (
            <Link
              key={rule.id}
              to={rule.href}
              preload="intent"
              {...stylex.props(loadIn.piece, loadIn.deal, reticle.card, reticle.on, styles.tile)}
              data-cut
              data-on={rule === selected ? "" : undefined}
              data-lit={rule.id === litId ? "" : undefined}
              style={{ "--c": colorOf(rule.label) }}
              onPointerEnter={(event) => {
                setSelectedId(rule.id);
                if (event.pointerType !== "touch") light(rule, event.currentTarget);
              }}
              onFocus={(event) => {
                setSelectedId(rule.id);
                if (event.currentTarget.matches(":focus-visible")) light(rule, event.currentTarget);
              }}
              onBlur={() => {
                setLitId((id) => (id === rule.id ? null : id));
                setSelectedId((id) => (id === rule.id ? null : id));
              }}
              {...openRule(rule)}
            >
              <RuleThumb rule={rule} play={rule === selected} />
              <span {...stylex.props(styles.number)}>
                <span>{ruleNumber(rule)}</span>
                <span aria-label="Has demos">▶</span>
              </span>
              {/* .t names the title for the rule-open view transition in arcade.css. */}
              <span className={`t ${stylex.props(styles.tileTitle).className}`}>{rule.title}</span>
            </Link>
          ))}
        </div>
        {matches.length === 0 && (
          <p {...stylex.props(styles.empty)}>
            No rules match “{query.trim()}”{category !== "All" ? ` in ${category}` : ""}.
          </p>
        )}
      </div>
      <div
        ref={beamRef}
        {...stylex.props(styles.beam, selected && styles.beamHue)}
        aria-hidden="true"
        style={{ "--c": selected ? colorOf(selected.label) : undefined }}
      />
    </div>
  );
}

type Point = [x: number, y: number];

function hull(points: Point[]) {
  const sorted = [...points].sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  const turn = ([ox, oy]: Point, [ax, ay]: Point, [bx, by]: Point) =>
    (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
  const chain = (list: Point[]) => {
    const kept: Point[] = [];
    for (const point of list) {
      while (kept.length >= 2 && turn(kept.at(-2)!, kept.at(-1)!, point) <= 0) kept.pop();
      kept.push(point);
    }
    return kept.slice(0, -1);
  };
  return [...chain(sorted), ...chain([...sorted].reverse())];
}

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVXYZ0123456789#%<>";
const NARROW = "il1!|:;.,'";
const IS_NARROW = /[iljtfrI1.,:;'!|()-]/;

function glyphLike(char: string) {
  if (IS_NARROW.test(char)) return NARROW[Math.floor(Math.random() * NARROW.length)]!;
  const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
  return char === char.toLowerCase() ? glyph.toLowerCase() : glyph;
}

function ScrambleText({ text }: { text: string }) {
  const [settled, setSettled] = useState(text.length);
  const [glyphs, setGlyphs] = useState<string[]>([]);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (reduced) {
      setSettled(text.length);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 300);
      setSettled(Math.floor(progress * text.length));
      setGlyphs(Array.from(text, glyphLike));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setSettled(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, reduced]);

  let at = 0;
  return (
    <span aria-hidden="true">
      {text.split(" ").map((word, w) => {
        const from = at;
        at += word.length + 1;
        return (
          <Fragment key={w}>
            {w > 0 && " "}
            <span {...stylex.props(styles.word)}>
              {Array.from(word, (char, c) => {
                const index = from + c;
                const live = index >= settled ? glyphs[index] : undefined;
                return (
                  <span key={c} {...stylex.props(styles.cell)} data-glyph={live}>
                    {char}
                  </span>
                );
              })}
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}

const STACKED = "@media (max-width: 960px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";
const LIGHT = ":is(.light *)";
// A tile waiting for its cut-in, or inside a piece still waiting, stays hidden (loadIn.piece).
const WAITING = ":is(:is(.js *):not(.in), .js [data-cut]:not(.in) *)";
// The grid's pointer or focus is on a tile's parent; the other tiles dim, except any still
// waiting for its own cut-in.
const DIMMED_HOVER = ":not([data-on]):is(:hover > *):not(:is(.js *):not(.in))";
const DIMMED_FOCUS = ":not([data-on]):is(:focus-within > *):not(:is(.js *):not(.in))";
const INK = `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`;
const PANEL_SHADOW = `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`;
const TILE_TOP = "inset 0 4px 0 var(--c)";
// Per tile: opacity (the dim), transform, border-color, box-shadow (the lift onto its key).
const TILE_LEAVE = `${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}`;
const TILE_PICK = `${motion["--t-fast"]}, ${motion["--t-moderate"]}, ${motion["--t-fast"]}, ${motion["--t-moderate"]}`;
const TILE_PICK_EASE = `${motion["--fast"]}, ${motion["--moderate"]}, ${motion["--fast"]}, ${motion["--moderate"]}`;
const TILE_DIM = `${motion["--t-fast"]}, ${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}, ${motion["--t-moderate-exit"]}`;
const TILE_DIM_EASE = `${motion["--fast"]}, ${motion["--exit"]}, ${motion["--exit"]}, ${motion["--exit"]}`;
const LENS = (near: string, far: string) =>
  `radial-gradient(circle at var(--lens-x) var(--lens-y), ${near}, ${far} var(--reach))`;

const enter = stylex.keyframes({
  from: { transform: "translate(-60px) scale(0.7)", opacity: 0 },
});

// The lamp catches with a stutter, once per hover of the grid, not per tile.
const beamOn = stylex.keyframes({
  "0%": { opacity: 0 },
  "20%": { opacity: 0.85 },
  "40%": { opacity: 0.25 },
  "60%": { opacity: 1 },
});

// The halftone over the hue, as two layers so the colour sits under the dots. Positions are
// written per axis: the minifier folds 0% 0% into 0 0, which computes to 0px 0px.
const halftoneOverHue = {
  backgroundImage: `${palette["--halftone"]}, none`,
  backgroundPositionX: "0, 0%",
  backgroundPositionY: "0, 0%",
  backgroundSize: "25px 25px, auto",
  backgroundColor: "var(--c)",
};

const styles = stylex.create({
  select: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: { default: "340px 1fr", [STACKED]: "1fr" },
    gap: "24px",
    alignItems: "start",
  },
  // The panel the lit tile projects onto. A [data-cut] piece: its states key on attributes, so its
  // class list never changes and the cut-in's .in survives a re-render.
  panel: {
    position: "sticky",
    zIndex: 2,
    top: "92px",
    display: { default: null, [STACKED]: "none" },
    borderRadius: "22px",
    padding: "20px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: { default: "solid", ":is([data-empty])": "dashed" },
    borderColor: `var(--c, ${palette["--hair"]})`,
    boxShadow: {
      default: PANEL_SHADOW,
      ":is([data-lit] > *)": `${PANEL_SHADOW}, 0 0 56px -12px color-mix(in srgb, var(--c) 55%, transparent)`,
    },
    overflow: "hidden",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([data-lit] > *)": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-lit] > *)": motion["--fast"],
    },
  },
  plate: {
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: INK,
    display: "flex",
    justifyContent: "space-between",
  },
  // With no rule there is no topic hue.
  standby: {
    color: palette["--mute"],
  },
  thumb: {
    borderRadius: "14px",
  },
  panelThumb: {
    marginBlock: "12px 16px",
    marginInline: 0,
    animationName: enter,
    animationDuration: motion["--t-slow"],
    animationTimingFunction: motion["--slow"],
  },
  // The description gets a fixed three-line slot, so a longer blurb never changes the panel's
  // height. The title takes only the lines it needs.
  title: {
    marginBlock: "0 8px",
    marginInline: 0,
    fontWeight: 900,
    fontSize: "24px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    color: palette["--text"],
  },
  blurb: {
    marginBlock: "0 16px",
    marginInline: 0,
    fontSize: "15px",
    lineHeight: 1.6,
    height: "4.8em",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    overflow: "hidden",
  },
  facts: {
    margin: 0,
    display: "grid",
    gap: "6px",
    fontSize: "13px",
  },
  fact: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    alignItems: "center",
    gap: "10px",
  },
  term: {
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--mute"],
  },
  value: {
    margin: 0,
    color: palette["--text"],
  },
  word: {
    whiteSpace: "nowrap",
  },
  // The real letter holds the cell's width; its stand-in is drawn centred over it.
  cell: {
    position: "relative",
    color: { default: null, ":is([data-glyph])": "transparent" },
    "::after": {
      content: { default: null, ":is([data-glyph])": "attr(data-glyph)" },
      position: "absolute",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      color: palette["--text"],
    },
  },
  tools: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "12px",
  },
  search: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "260px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "46px",
    paddingBlock: 0,
    paddingInline: "14px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":focus-within": palette["--focus"] },
    color: palette["--mute"],
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    outline: 0,
    backgroundColor: "transparent",
    backgroundPosition: "0 0",
    color: palette["--text"],
    fontWeight: 400,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "15px", [TOUCH]: "16px" },
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
  },
  key: {
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "6px",
    paddingBlock: "1px",
    paddingInline: "7px",
  },
  tiles: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(auto-fill, minmax(168px, 1fr))", [STACKED]: "1fr 1fr" },
    gap: "10px",
  },
  // A [data-cut] piece: its states key on data-on, data-lit and .in, so its class list never
  // changes and the cut-in's .in survives a re-render. The picked tile rises onto its key.
  tile: {
    position: "relative",
    zIndex: { default: null, ":is([data-on])": 2 },
    minHeight: { default: null, [STACKED]: "118px" },
    borderRadius: "16px",
    paddingTop: "10px",
    paddingInline: "10px",
    paddingBottom: "14px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":is([data-on])": "var(--c)" },
    display: "flex",
    flexDirection: "column",
    gap: { default: "10px", [STACKED]: "18px" },
    opacity: {
      default: null,
      [WAITING]: 0,
      [DIMMED_FOCUS]: 0.25,
      [HOVER]: { default: null, [DIMMED_HOVER]: 0.25 },
    },
    transform: {
      default: null,
      ":is([data-on])": {
        default: "translateY(-4px)",
        ":active": "translateY(3px)",
        [REDUCE]: "none",
      },
    },
    boxShadow: {
      default: `${TILE_TOP}, ${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
      ":is([data-on])": {
        default: `${TILE_TOP}, ${palette["--raise"]}, 0 8px 0 var(--key)`,
        ":active": `${TILE_TOP}, ${palette["--raise"]}, 0 1px 0 var(--key)`,
      },
    },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transitionProperty: "opacity, transform, border-color, box-shadow",
    transitionDuration: {
      default: TILE_LEAVE,
      ":is([data-on])": TILE_PICK,
      [DIMMED_FOCUS]: TILE_DIM,
      [HOVER]: { default: null, [DIMMED_HOVER]: TILE_DIM },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-on])": TILE_PICK_EASE,
      [DIMMED_FOCUS]: TILE_DIM_EASE,
      [HOVER]: { default: null, [DIMMED_HOVER]: TILE_DIM_EASE },
    },
    // A lit tile turns into the projector's lens: its face fills with its hue under the halftone
    // screen, and the beam carries the light from it onto the panel, which shows what it projects.
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 2,
      borderRadius: "14px",
      pointerEvents: "none",
      ...halftoneOverHue,
      opacity: { default: 0, ":is([data-lit])": 1 },
      transitionProperty: "opacity",
      transitionDuration: {
        default: motion["--t-fast-exit"],
        ":is([data-lit])": motion["--t-fast"],
      },
      transitionTimingFunction: { default: motion["--exit"], ":is([data-lit])": motion["--fast"] },
    },
  },
  number: {
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: INK,
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: 0,
    paddingInline: "4px",
  },
  tileTitle: {
    position: "relative",
    zIndex: 1,
    paddingBlock: 0,
    paddingInline: "4px",
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: 1.2,
    fontFamily: fonts["--display"],
    color: palette["--text"],
    letterSpacing: "-0.02em",
  },
  empty: {
    margin: 0,
    padding: 0,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  // The light is brightest at the lens and spreads thinner toward the panel. The layout effect
  // above clips it to the hull of the tile and the panel and puts the lens at the tile's centre.
  // It shines over the dimmed tiles and under the lit one and the panel, and catches with a
  // stutter while the grid is lit.
  beam: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    display: { default: null, [STACKED]: "none" },
    pointerEvents: "none",
    maskImage: {
      default: LENS("rgb(0 0 0 / 0.5)", "rgb(0 0 0 / 0.12)"),
      [LIGHT]: LENS("rgb(0 0 0 / 0.32)", "rgb(0 0 0 / 0.06)"),
    },
    mixBlendMode: { default: "screen", [LIGHT]: "multiply" },
    opacity: { default: 0, ":is([data-lit] > *)": 1 },
    transitionProperty: "opacity",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([data-lit] > *)": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-lit] > *)": motion["--fast"],
    },
    animationName: { default: null, ":is([data-lit] > *)": beamOn },
    animationDuration: { default: null, ":is([data-lit] > *)": "260ms" },
    animationTimingFunction: { default: null, ":is([data-lit] > *)": "steps(1)" },
    animationFillMode: { default: null, ":is([data-lit] > *)": "both" },
  },
  // Only while a rule is picked: with no hue there is no light to carry.
  beamHue: halftoneOverHue,
});
