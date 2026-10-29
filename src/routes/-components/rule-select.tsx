import * as stylex from "@stylexjs/stylex";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { colorOf, ruleNumber, TOPICS } from "../../data/guidelines";
import type { PublishedGuideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";
import { reticle } from "./reticle";
import { RuleThumb, useRuleOpen } from "./rule-art";

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
  const matches = (normalizedQuery ? fuse.search(normalizedQuery).map(({ item }) => item) : rules).filter(
    (rule) => category === "All" || rule.label === category,
  );
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

  const light = (rule: PublishedGuideline, tile: HTMLElement) => {
    litTile.current = tile;
    setLitId(rule.id);
  };

  return (
    <div ref={selectRef} className="select" data-lit={litId ? "" : undefined}>
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
            <RuleThumb key={selected.id} rule={selected} play at="panel" style={styles.thumb} />
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
            <RuleThumb style={styles.thumb} />
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
          {["All", ...TOPICS].map((name) => (
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
              className={`tile ${stylex.props(reticle.card, reticle.on).className}`}
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

const styles = stylex.create({
  thumb: {
    borderRadius: "14px",
  },
});
