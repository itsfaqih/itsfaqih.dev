import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { colorOf, ruleNumber } from "../../data/guidelines";
import type { Guideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";
import { RuleThumb, useRuleOpen } from "./rule-art";

// A searchable, filterable select grid for the Rule of Thumb index. Hovering or
// focusing a tile shows it in the side panel; it holds up at 100+ rules. The tile under the
// pointer or keyboard focus lights up and projects a beam onto the panel.

export function RuleSelect({ rules }: { rules: Guideline[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [litId, setLitId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const litTile = useRef<HTMLElement>(null);
  const { linkProps: openRule, panelProps } = useRuleOpen();

  const categories = [...new Set(rules.map((rule) => rule.label))];
  const normalizedQuery = query.trim().toLowerCase();
  // Typos and partial words still find a rule; the best matches come first, titles weighing most.
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
  const matches = (normalizedQuery ? fuse.search(normalizedQuery).map(({ item }) => item) : rules).filter(
    (rule) => category === "All" || rule.label === category,
  );
  // Only a hovered or focused tile fills the panel; otherwise it waits in its empty state.
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

  // The sticky panel moves against the grid as the page scrolls, so the beam re-aims with it.
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
        const [x0, y0, x1, y1] = [left - box.left, top - box.top, right - box.left, bottom - box.top];
        return [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ];
      };
      const lens: Point = [from.left + from.width / 2 - box.left, from.top + from.height / 2 - box.top];
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

  const light = (rule: Guideline, tile: HTMLElement) => {
    litTile.current = tile;
    setLitId(rule.id);
  };

  return (
    <div ref={selectRef} className="select" data-lit={litId ? "" : undefined}>
      {/* The panel always holds its place, so filtering to nothing never shifts the grid. It stays
          one element across empty and filled, so React never rewrites the class the cut-in added. */}
      <aside
        {...panelProps}
        className="sel"
        data-cut
        data-empty={selected ? undefined : ""}
        aria-live="polite"
        style={{ "--c": selected ? colorOf(selected.label) : undefined }}
      >
        {selected ? (
          <>
            <div className="p">
              <span>No.{ruleNumber(selected)}</span>
              <span>{selected.label.toUpperCase()}</span>
            </div>
            <RuleThumb key={selected.id} rule={selected} play />
            <h3>
              <ScrambleText text={selected.title} />
              <span className="sr-only">{selected.title}</span>
            </h3>
            <p>{selected.description}</p>
            <dl>
              <div>
                <dt>TOPIC</dt>
                <dd>{selected.label}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <div className="p">
              <span>No.—</span>
              <span>STANDBY</span>
            </div>
            <div className="thumb" aria-hidden="true" />
            <h3>Pick a rule</h3>
            <p>Hover or focus a tile to preview it here.</p>
            <dl>
              <div>
                <dt>TOPIC</dt>
                <dd>{category}</dd>
              </div>
            </dl>
          </>
        )}
      </aside>
      <div>
        <div className="tools">
          <label className="search" data-cut>
            FIND
            <input
              ref={searchRef}
              type="search"
              placeholder="button, cache, null…"
              aria-label="Search rules"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>/</kbd>
          </label>
        </div>
        <div className="chips" role="group" aria-label="Filter by topic">
          {["All", ...categories].map((name) => (
            <button
              key={name}
              type="button"
              data-cut
              aria-pressed={category === name}
              style={{ "--c": colorOf(name) }}
              onClick={() => setCategory(name)}
            >
              <i />
              {name}
              <b>
                {name === "All" ? rules.length : rules.filter((rule) => rule.label === name).length}
              </b>
            </button>
          ))}
        </div>
        {/* Keyed by the filter, so a new filter deals a fresh hand of tiles. */}
        <div className="tiles" key={`${category}|${normalizedQuery}`} onPointerLeave={() => {
            setLitId(null);
            if (!selectRef.current?.querySelector(".tile:focus-visible")) setSelectedId(null);
          }}
        >
          {matches.map((rule) => (
            <Link
              key={rule.id}
              to={rule.href}
              preload="intent"
              className="tile"
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
              <span className="n">
                <span>{ruleNumber(rule)}</span>
                <span aria-label={rule.interactive ? "Has demos" : undefined}>
                  {rule.interactive ? "▶" : ""}
                </span>
              </span>
              <span className="t">{rule.title}</span>
            </Link>
          ))}
        </div>
        {matches.length === 0 && (
          <p className="empty">
            No rule matches “{query.trim()}”{category !== "All" ? ` in ${category}` : ""} yet.
          </p>
        )}
      </div>
      <div
        ref={beamRef}
        className="beam"
        aria-hidden="true"
        style={{ "--c": selected ? colorOf(selected.label) : undefined }}
      />
    </div>
  );
}

type Point = [x: number, y: number];

/** The convex hull of the points (Andrew's monotone chain): the outline of the light running from
 * every point of the tile to every point of the panel. */
function hull(points: Point[]) {
  const sorted = [...points].sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  const turn = ([ox, oy]: Point, [ax, ay]: Point, [bx, by]: Point) => (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
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

// Characters scramble, then settle left to right. Every character keeps its own cell, sized by
// the real letter, so the scramble has exactly the title's length and wraps where the title wraps.
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVXYZ0123456789#%<>";
const NARROW = "il1!|:;.,'";
const IS_NARROW = /[iljtfrI1.,:;'!|()-]/;

// A narrow letter gets a narrow glyph and capitals stay capitals, so a glyph stays close to
// the width of the cell it fills.
function glyphLike(char: string) {
  if (IS_NARROW.test(char)) return NARROW[Math.floor(Math.random() * NARROW.length)]!;
  const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
  return char === char.toLowerCase() ? glyph.toLowerCase() : glyph;
}

function ScrambleText({ text, ms = 300 }: { text: string; ms?: number }) {
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
      const progress = Math.min(1, (now - start) / ms);
      setSettled(Math.floor(progress * text.length));
      setGlyphs(Array.from(text, glyphLike));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setSettled(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, ms, reduced]);

  // Words stay unbroken and spaces stay real, so line breaks match the settled title.
  let at = 0;
  return (
    <span className="scramble" aria-hidden="true">
      {text.split(" ").map((word, w) => {
        const from = at;
        at += word.length + 1;
        return (
          <Fragment key={w}>
            {w > 0 && " "}
            <span className="scramble-word">
              {Array.from(word, (char, c) => {
                const index = from + c;
                // Settled letters keep their cell too, so the title never re-kerns mid-scramble.
                const live = index >= settled ? glyphs[index] : undefined;
                return (
                  <span key={c} className="scramble-cell" data-glyph={live}>
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
