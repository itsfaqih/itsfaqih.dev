import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Guideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";
import { colorOf, ruleNumber, RuleThumb } from "./rule-art";

// A searchable, filterable select grid for the Rule of Thumb index. Hovering or
// focusing a tile shows it in the side panel; it holds up at 100+ rules.

type RuleSelectProps = {
  rules: Guideline[];
  /** Show this many tiles until "Show all" is pressed. Omit to show every match. */
  pageSize?: number;
};

export function RuleSelect({ rules, pageSize }: RuleSelectProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(rules.map((rule) => rule.label))];
  const normalizedQuery = query.trim().toLowerCase();
  const matches = rules.filter(
    (rule) =>
      (category === "All" || rule.label === category) &&
      (!normalizedQuery ||
        `${rule.title} ${rule.description} ${rule.label}`.toLowerCase().includes(normalizedQuery)),
  );
  const shown = expanded || !pageSize ? matches : matches.slice(0, pageSize);
  const selected = shown.find((rule) => rule.id === selectedId) ?? shown[0];

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

  const pickCategory = (next: string) => {
    setCategory(next);
    setExpanded(false);
  };

  return (
    <div className="select" data-cut>
      {/* The panel always holds its place, so filtering to nothing never shifts the grid. */}
      {selected ? (
        <aside className="sel" aria-live="polite" style={{ "--c": colorOf(selected.label) }}>
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
              <dt>DEMO</dt>
              <dd>{selected.interactive ? "Interactive" : "Article only"}</dd>
            </div>
            <div>
              <dt>TOPIC</dt>
              <dd>{selected.label}</dd>
            </div>
          </dl>
        </aside>
      ) : (
        <aside className="sel sel-empty" aria-live="polite">
          <div className="p">
            <span>No.—</span>
            <span>NO MATCH</span>
          </div>
          <div className="thumb" aria-hidden="true" />
          <h3>Nothing here yet</h3>
          <p>Try another word, or pick a different topic.</p>
          <dl>
            <div>
              <dt>DEMO</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt>TOPIC</dt>
              <dd>{category}</dd>
            </div>
          </dl>
        </aside>
      )}
      <div>
        <div className="tools">
          <label className="search">
            FIND
            <input
              ref={searchRef}
              type="search"
              placeholder="button, cache, null…"
              aria-label="Search rules"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setExpanded(false);
              }}
            />
            <kbd>/</kbd>
          </label>
        </div>
        <div className="chips" role="group" aria-label="Filter by topic">
          {["All", ...categories].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              style={{ "--c": colorOf(name) }}
              onClick={() => pickCategory(name)}
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
        <div className="tiles" key={`${category}|${normalizedQuery}|${expanded}`}>
          {shown.map((rule, index) => (
            <Link
              key={rule.id}
              to={rule.href}
              preload="intent"
              className={rule === selected ? "tile on" : "tile"}
              style={{ "--i": Math.min(index, 20), "--c": colorOf(rule.label) }}
              onPointerEnter={() => setSelectedId(rule.id)}
              onFocus={() => setSelectedId(rule.id)}
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
        {pageSize !== undefined && matches.length > pageSize && (
          <button type="button" className="btn soft more" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show fewer" : `Show all ${matches.length}`}
          </button>
        )}
      </div>
    </div>
  );
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
