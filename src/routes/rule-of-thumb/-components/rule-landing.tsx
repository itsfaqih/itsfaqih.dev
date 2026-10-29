import * as stylex from "@stylexjs/stylex";
import { ArrowLeftIcon, CheckIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  isValidElement,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { compactBox, IslandActivity } from "../../../components/header";
import {
  colorOf,
  PUBLISHED_GUIDELINES,
  ruleNumber,
  VISIBLE_GUIDELINES,
} from "../../../data/guidelines";
import type { PublishedGuideline } from "../../../data/guidelines";
import { isOpeningRule, RuleThumb } from "../../-components/rule-art";
import "./rule-landing.css";
import { reducedMotion } from "../../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../../theme.stylex";
import { kit, reveal } from "./rule-landing.stylex";

export const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const SNAP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type Side = { label: string; view: ReactNode; costs: string[] };
export type Lesson = {
  title: string;
  exception?: boolean;
  body: ReactNode;
  extra?: ReactNode;
  bad: Side;
  good: Side;
};

type TreeRow = {
  depth: number;
  kind?: "dir" | "comp" | "more";
  moved?: boolean;
  tag?: string;
} & ({ k: string; text: ReactNode } | { k?: undefined; text: string });

type Slot = { id: string; label: ReactNode; note: string; cost: string[] };
type BoardRow =
  | { depth: number; text: ReactNode; kind?: string; tag?: string }
  | { depth: number; slot: Slot; lead?: ReactNode };
export type Level = {
  name: string;
  prompt: ReactNode;
  piece: string;
  answer: string;
  rows: BoardRow[];
};

type RuleLandingProps = {
  lead: ReactNode;
  learn: { title: string; intro: ReactNode };
  lessons: Lesson[];
  tldr: readonly (readonly [string, string])[];
  /** `board` names what the pieces go into, as in "Drag the piece into the tree". */
  quiz: { intro: ReactNode; levels: Level[]; board: string };
  /** What agents do with the rule in their `AGENTS.md`, as in "build buttons the same way". */
  take: string;
  className?: string;
  /** Applied last to the row of cost tags under each lesson's panes. */
  costsStyle?: stylex.StyleXStyles;
};

type Results = (number | null)[];

export function RuleLanding(props: RuleLandingProps) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const current = PUBLISHED_GUIDELINES.find((guideline) => guideline.href === path);
  // Pinned at mount: while the next route loads, the location already names the next rule.
  const [rule] = useState(current);
  return rule ? <Landing rule={rule} {...props} /> : null;
}

function Landing({
  rule,
  lead,
  learn,
  lessons,
  tldr,
  quiz,
  take,
  className,
  costsStyle,
}: RuleLandingProps & { rule: PublishedGuideline }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);
  const [morphed] = useState(isOpeningRule);
  useLayoutEffect(() => {
    if (morphed) scrollTo({ top: 0, behavior: "instant" });
  }, [morphed]);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useTitleFit(titleRef);
  useTitleDock(rootRef, titleRef, slot);
  const hue = { "--c": colorOf(rule.label) };
  const number = ruleNumber(rule);

  const { levels } = quiz;
  const [results, setResults] = useState<Results>(() => levels.map(() => null));

  const markdownUrl = `${rule.href}.md`;
  const words = rule.title.split(" ");
  const last = words.pop();
  const head = words.join(" ");
  const share = { title: rule.title, text: rule.claim };
  const at = VISIBLE_GUIDELINES.indexOf(rule);
  const prev = VISIBLE_GUIDELINES[at - 1];
  const next = VISIBLE_GUIDELINES[at + 1];

  return (
    <div
      ref={rootRef}
      className={`arc rule-page ${className ?? ""} ${stylex.props(shell.root, reveal).className}`}
      style={hue}
    >
      <div {...stylex.props(shell.ground)} aria-hidden="true" />
      <IslandActivity>
        <span {...stylex.props(styles.activity)} style={hue}>
          <Link to="/rule-of-thumb" {...stylex.props(styles.action, styles.back)}>
            <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
            <span {...stylex.props(styles.backText)}>All rules</span>
          </Link>
          <span {...stylex.props(styles.label, stylex.defaultMarker())}>
            <span {...stylex.props(styles.labelPart, styles.tags)}>
              {number && <span>No.{number}</span>}
              <span>{rule.label}</span>
            </span>
            <span
              ref={setSlot}
              aria-hidden="true"
              {...stylex.props(styles.labelPart, styles.title)}
            >
              {head && `${head} `}
              <span className="hl">{last}</span>
            </span>
          </span>
          <ShareButton data={share} inIsland />
        </span>
      </IslandActivity>
      <header className={`arc-wrap ${stylex.props(shell.titleScreen).className}`}>
        <div {...stylex.props(shell.heroCopy)}>
          <div {...stylex.props(shell.crumbRow)}>
            <nav
              className={`tag ${stylex.props(shell.crumb, shell.in, shell.first).className}`}
              aria-label="Breadcrumb"
            >
              <Link to="/rule-of-thumb" {...stylex.props(shell.crumbLink)}>
                ← All rules
              </Link>
              {number && <span {...stylex.props(shell.crumbTag)}>No.{number}</span>}
              <span {...stylex.props(shell.crumbTag)}>{rule.label}</span>
            </nav>
            <ShareButton data={share} />
          </div>
          <h1 ref={titleRef} {...stylex.props(shell.title)}>
            {head && (
              <>
                <span {...stylex.props(shell.titleLine)}>{head}</span>{" "}
              </>
            )}
            <span {...stylex.props(shell.titleLine)}>
              <span className={`hl ${stylex.props(shell.titleMark).className}`}>{last}</span>
            </span>
          </h1>
          <p {...stylex.props(shell.claim, shell.in, shell.second)}>{rule.claim}</p>
          <p className={`lead ${stylex.props(shell.lead, shell.in, shell.third).className}`}>
            {lead}
          </p>
        </div>
        <Cover rule={rule} entering={!morphed} />
      </header>

      <div className="arc-wrap">
        <section className="learn" id="learn" aria-labelledby="learn-title">
          <div className={`sec-head ${stylex.props(shell.rev).className}`} data-rev>
            <h2 id="learn-title">{learn.title}</h2>
            <p>{learn.intro}</p>
          </div>
          <div className="lessons">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.title} lesson={lesson} costsStyle={costsStyle} />
            ))}
          </div>
          <div className={`sheet-wrap ${stylex.props(shell.rev).className}`} data-rev>
            <h3>TL;DR</h3>
            <ol className="sheet panel">
              {tldr.map(([situation, answer]) => (
                <li key={situation}>
                  <span>{situation}</span>
                  <b>{answer}</b>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="game" id="quiz" aria-labelledby="quiz-title">
          <div className={`sec-head quiz-head ${stylex.props(shell.rev).className}`} data-rev>
            <div>
              <h2 id="quiz-title">Mini quiz</h2>
              <p>{quiz.intro}</p>
            </div>
            <div className="score">
              <span>
                {clearedCount(results)}/{levels.length} cleared
              </span>
              <span className="score-stars">
                ★ {starTotal(results)}/{levels.length * 3}
              </span>
            </div>
          </div>
          <Rail results={results}>
            {levels.map((level, index) => (
              <LevelBoard
                key={index}
                n={index + 1}
                level={level}
                board={quiz.board}
                stars={results[index] ?? null}
                onClear={(stars) =>
                  setResults((list) => list.map((value, at) => (at === index ? stars : value)))
                }
              />
            ))}
          </Rail>
        </section>

        <section className="take">
          <div className={`take-copy ${stylex.props(shell.rev).className}`} data-rev>
            <h2>Take the rule with you</h2>
            <p>
              The whole rule as plain Markdown. Paste it into your <code>AGENTS.md</code>
              {` and your agents will ${take}.`}
            </p>
            <div className="acts">
              <CopyMarkdown url={markdownUrl} />
              <a className="btn soft" href={markdownUrl} target="_blank" rel="noopener noreferrer">
                View .md
              </a>
            </div>
          </div>
          <div {...stylex.props(shell.rev)} data-rev>
            {at !== -1 && (
              <nav className="arc rot-pager" aria-label="More rules">
                {prev ? <PagerCard rule={prev} direction="Previous" /> : <div />}
                {next ? (
                  <PagerCard rule={next} direction="Next" />
                ) : (
                  <Link to="/rule-of-thumb" className="rot-card rot-all">
                    <span className="d">That's every rule so far</span>
                    <span className="t">Back to all rules →</span>
                  </Link>
                )}
              </nav>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PagerCard({
  rule,
  direction,
}: {
  rule: PublishedGuideline;
  direction: "Previous" | "Next";
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={rule.href}
      preload="intent"
      className={direction === "Next" ? "rot-card next" : "rot-card"}
      style={{ "--c": colorOf(rule.label) }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <RuleThumb rule={rule} play={hovered} />
      <span className="meta">
        <span className="d">{direction === "Next" ? "Next rule →" : "← Previous rule"}</span>
        <span className="n">
          No.{ruleNumber(rule)} · {rule.label}
        </span>
        <span className="t">{rule.title}</span>
      </span>
    </Link>
  );
}

type CoverProps = { rule: PublishedGuideline; entering: boolean };

function Cover({ rule, entering }: CoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  function lean(event: PointerEvent<HTMLDivElement>) {
    const cover = ref.current;
    if (!cover || event.pointerType !== "mouse" || reducedMotion()) return;
    const box = cover.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    cover.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    cover.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
  }

  function rest() {
    ref.current?.style.removeProperty("--ry");
    ref.current?.style.removeProperty("--rx");
  }

  return (
    <div
      ref={ref}
      className={`cover ${stylex.props(entering && shell.in, shell.third).className}`}
      onPointerMove={lean}
      onPointerLeave={rest}
    >
      <div className="cover-card">
        <RuleThumb rule={rule} play />
        <div className="cover-foot" aria-hidden="true">
          <span>{rule.id}.md</span>
          <span>{rule.coverTag}</span>
        </div>
      </div>
    </div>
  );
}

type SideKey = "bad" | "good";
const SIDES: readonly SideKey[] = ["bad", "good"];
const MARK = { bad: "✕", good: "✓" } as const;

export const TABBED = "(max-width: 820px)";

export function Tree({ rows }: { rows: TreeRow[] }) {
  return (
    <ul className="tree">
      {rows.map((row) => {
        const k = keyOf(row);
        return (
          <li
            key={k}
            data-k={k}
            data-moved={row.moved || undefined}
            className={row.kind ? `row ${row.kind}` : "row"}
            style={{ "--d": row.depth }}
          >
            <span className="nm">{row.text}</span>
            {row.tag && <span className="calls">{row.tag}</span>}
          </li>
        );
      })}
    </ul>
  );
}

const keyOf = (row: TreeRow) => (row.k === undefined ? row.text : row.k);

const treeRows = (view: ReactNode) =>
  isValidElement<{ rows: TreeRow[] }>(view) && view.type === Tree ? view.props.rows.length : 0;

/** Splits a line of code into plain text and matches of `token`, each with its capture group. */
/** Colours a line of code: a match of `token`'s nth capture group gets the style `kinds[n]`. */
export function paint(
  source: string,
  token: RegExp,
  kinds: readonly stylex.StyleXStyles[],
): ReactNode[] {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const match of source.matchAll(token)) {
    if (match.index > at) parts.push(source.slice(at, match.index));
    const kind = kinds[match.slice(1).findIndex((group) => group !== undefined)];
    parts.push(
      <span key={match.index} {...stylex.props(kind)}>
        {match[0]}
      </span>,
    );
    at = match.index + match[0].length;
  }
  if (at < source.length) parts.push(source.slice(at));
  return parts;
}

function LessonCard({ lesson, costsStyle }: { lesson: Lesson; costsStyle?: stylex.StyleXStyles }) {
  const cardRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const placed = useRef(new Map<string, { x: number; y: number }>());
  const touched = useRef(false);
  const rewound = useRef(false);
  const [side, setSide] = useState<SideKey>("good");

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (
      !card ||
      reducedMotion() ||
      !matchMedia(TABBED).matches ||
      card.getBoundingClientRect().top < innerHeight * 0.7
    )
      return;
    rewound.current = true;
    setSide("bad");
    let timer = 0;
    const stop = onceOnScreen(card, () => {
      timer = window.setTimeout(() => {
        if (!touched.current) setSide("good");
      }, 700);
    });
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, []);

  useLayoutEffect(() => {
    const pane = demoRef.current?.querySelector<HTMLElement>(`[data-side="${side}"]`);
    if (!pane) return;
    const origin = pane.getBoundingClientRect();
    const before = placed.current;
    const animate =
      before.size > 0 &&
      !reducedMotion() &&
      matchMedia(TABBED).matches &&
      !(rewound.current && side === "bad");
    if (side === "bad") rewound.current = false;
    const next = new Map<string, { x: number; y: number }>();
    for (const row of pane.querySelectorAll<HTMLElement>("[data-k]")) {
      const box = row.getBoundingClientRect();
      const at = { x: box.left - origin.left, y: box.top - origin.top };
      next.set(row.dataset.k ?? "", at);
      if (!animate) continue;
      const from = before.get(row.dataset.k ?? "");
      if (!from) {
        row.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 240,
          delay: 260,
          easing: "ease-out",
          fill: "backwards",
        });
      } else if (from.x !== at.x || from.y !== at.y) {
        row.animate(
          [
            { transform: `translate(${from.x - at.x}px, ${from.y - at.y}px)` },
            { transform: "none" },
          ],
          { duration: "moved" in row.dataset ? 640 : 460, easing: OUT },
        );
      }
    }
    placed.current = next;
  }, [side]);

  const most = Math.max(treeRows(lesson.bad.view), treeRows(lesson.good.view));

  return (
    <article
      ref={cardRef}
      className={`lesson ${stylex.props(shell.rev, stylex.defaultMarker()).className}`}
      data-rev
    >
      <div className="lesson-copy">
        {lesson.exception && <span className="exc">Exception</span>}
        <h3>{lesson.title}</h3>
        <p>{lesson.body}</p>
        {lesson.extra}
      </div>
      <div ref={demoRef} className="demo" data-show={side} style={{ "--rows": most }}>
        <div className="flip" role="group" aria-label={`${lesson.title}: compare`}>
          {SIDES.map((key) => (
            <button
              key={key}
              type="button"
              data-key={key}
              aria-pressed={side === key}
              onClick={() => {
                touched.current = true;
                setSide(key);
              }}
            >
              <span aria-hidden="true">{MARK[key]}</span>
              {lesson[key].label}
            </button>
          ))}
        </div>
        {SIDES.map((key) => (
          <figure
            key={key}
            className={`pane well ${stylex.props(stylex.defaultMarker()).className}`}
            data-side={key}
          >
            <figcaption>
              <span aria-hidden="true">{MARK[key]}</span>
              <span className="sr-only">{key === "bad" ? "Avoid: " : "Do: "}</span>
              {lesson[key].label}
            </figcaption>
            {lesson[key].view}
            <div className={`costs ${stylex.props(costsStyle).className ?? ""}`.trim()}>
              {lesson[key].costs.map((cost) => (
                <span key={cost}>{cost}</span>
              ))}
            </div>
          </figure>
        ))}
      </div>
    </article>
  );
}

function Stars({ stars }: { stars: number | null }) {
  if (stars === null) return null;
  return (
    <span className="stars" aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((at) => (
        <i key={at} data-on={at <= stars || undefined}>
          ★
        </i>
      ))}
    </span>
  );
}

const starTotal = (results: Results) =>
  results.reduce<number>((sum, stars) => sum + (stars ?? 0), 0);
const clearedCount = (results: Results) => results.filter((stars) => stars !== null).length;

function Rail({ results, children }: { results: Results; children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const run = results.findIndex((stars) => stars === null);
  const reached = run === -1 ? results.length : run;

  useLayoutEffect(() => {
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rail || !fill) return;
    const place = () => {
      const nodes = rail.querySelectorAll<HTMLElement>(".node");
      const last = nodes[reached - 1];
      const track = fill.parentElement ?? rail;
      const top = track.getBoundingClientRect().top;
      const height = track.offsetHeight || 1;
      const y =
        reached === results.length
          ? height
          : last
            ? last.getBoundingClientRect().top + last.offsetHeight / 2 - top
            : 0;
      fill.style.transform = `scaleY(${Math.min(1, y / height)})`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [reached, results.length]);

  return (
    <div ref={railRef} className="lvls">
      <span className="rail" aria-hidden="true">
        <i ref={fillRef} />
      </span>
      {children}
    </div>
  );
}

type LevelProps = {
  n: number;
  level: Level;
  stars: number | null;
  board: string;
  onClear: (stars: number) => void;
};

type Drag = { x0: number; y0: number; lastX: number; lastT: number; rot: number; moved: boolean };

function LevelBoard({ n, level, board, stars, onClear }: LevelProps) {
  const slots = level.rows.flatMap((row) => ("slot" in row ? [row.slot] : []));
  const [placed, setPlaced] = useState<string | null>(null);
  const [miss, setMiss] = useState<{ id: string; at: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [near, setNear] = useState<string | null>(null);

  const pieceRef = useRef<HTMLButtonElement>(null);
  const seatRef = useRef<HTMLSpanElement>(null);
  const slotRefs = useRef(new Map<string, HTMLElement>());
  const dragRef = useRef<Drag | null>(null);
  const nearRef = useRef<string | null>(null);
  const flipFrom = useRef<{ rect: DOMRect; rot: number } | null>(null);

  const cleared = placed !== null;
  const said = slots.find((slot) => slot.id === (placed ?? miss?.id));

  function flyHome(transform: string) {
    const piece = pieceRef.current;
    if (!piece) return;
    piece.style.transform = "";
    if (!transform || reducedMotion()) return;
    piece.animate([{ transform }, { transform: "none" }], { duration: 360, easing: OUT });
  }

  function drop(id: string) {
    const piece = pieceRef.current;
    if (!piece || cleared) return;
    setPicked(false);
    if (id === level.answer) {
      flipFrom.current = { rect: piece.getBoundingClientRect(), rot: dragRef.current?.rot ?? 0 };
      piece.style.transform = "";
      setPlaced(id);
      setMiss(null);
      onClear(Math.max(1, 3 - mistakes));
      return;
    }
    setMistakes((value) => value + 1);
    setMiss({ id, at: performance.now() });
    flyHome(piece.style.transform);
  }

  useLayoutEffect(() => {
    const from = flipFrom.current;
    const seat = seatRef.current;
    flipFrom.current = null;
    if (!from || !seat || reducedMotion()) return;
    const to = seat.getBoundingClientRect();
    const dx = from.rect.left - to.left;
    const dy = from.rect.top - to.top;
    seat.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) rotate(${from.rot}deg) scale(1.05)` },
        { transform: "none" },
      ],
      { duration: 420, easing: SNAP },
    );
  }, [placed]);

  function nearest(x: number, y: number) {
    let best: string | null = null;
    let bestDistance = 48;
    for (const [id, element] of slotRefs.current) {
      const box = element.getBoundingClientRect();
      const dx = Math.max(box.left - x, 0, x - box.right);
      const dy = Math.max(box.top - y, 0, y - box.bottom);
      const distance = Math.hypot(dx, dy);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = id;
      }
    }
    return best;
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (cleared || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x0: event.clientX,
      y0: event.clientY,
      lastX: event.clientX,
      lastT: event.timeStamp,
      rot: 0,
      moved: false,
    };
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x0;
    const dy = event.clientY - drag.y0;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      setDragging(true);
      setPicked(false);
    }
    const dt = Math.max(event.timeStamp - drag.lastT, 1);
    const lean = reducedMotion()
      ? 0
      : Math.max(-8, Math.min(8, ((event.clientX - drag.lastX) / dt) * 6));
    drag.rot += (lean - drag.rot) * 0.2;
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
    event.currentTarget.style.transform = `translate(${dx}px, ${dy}px) rotate(${drag.rot}deg) scale(1.05)`;
    const target = nearest(event.clientX, event.clientY);
    if (target !== nearRef.current) {
      nearRef.current = target;
      setNear(target);
    }
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>, cancelled: boolean) {
    const drag = dragRef.current;
    if (!drag) return;
    const target = nearRef.current;
    nearRef.current = null;
    setNear(null);
    if (!drag.moved) {
      dragRef.current = null;
      if (!cancelled) setPicked((value) => !value);
      return;
    }
    setDragging(false);
    if (target && !cancelled) drop(target);
    else flyHome(event.currentTarget.style.transform);
    dragRef.current = null;
  }

  useEffect(() => {
    if (!picked) return;
    const first = slotRefs.current.values().next().value;
    if (first && document.activeElement === pieceRef.current) first.focus();
  }, [picked]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && picked) {
      setPicked(false);
      pieceRef.current?.focus();
    }
  }

  return (
    <article
      id={`lv-${n}`}
      className={`level panel ${stylex.props(shell.rev).className}`}
      data-rev
      data-clear={cleared || undefined}
      onKeyDown={onKeyDown}
    >
      <span className="node" aria-hidden="true">
        {cleared ? "✓" : n}
      </span>
      <div className="lv-copy">
        <div className="lv-head">
          <span className="badge">LV {n}</span>
          {cleared && <span className="stamp">Clear</span>}
          <Stars stars={stars} />
        </div>
        <h3>{level.name}</h3>
        <p className="prompt">{level.prompt}</p>
        <div
          className="say"
          aria-live="polite"
          data-tone={cleared ? "yes" : said ? "no" : undefined}
        >
          <p key={said ? `${said.id}-${miss?.at ?? 0}` : "hint"}>
            {said ? said.note : `Drag the piece into the ${board}. Or tap it, then tap a spot.`}
          </p>
          {said && (
            <span className="costs">
              {said.cost.map((cost) => (
                <span key={cost}>{cost}</span>
              ))}
            </span>
          )}
        </div>
      </div>

      <div className="board well" data-drag={dragging || picked || undefined}>
        <ul className="tree">
          {level.rows.map((row, index) => {
            if (!("slot" in row)) {
              return (
                <li
                  key={index}
                  className={row.kind ? `row ${row.kind}` : "row"}
                  style={{ "--d": row.depth }}
                >
                  {row.text}
                  {row.tag && <span className="calls">{row.tag}</span>}
                </li>
              );
            }
            const { slot } = row;
            const seated = placed === slot.id;
            return (
              <li key={index} className="row" style={{ "--d": row.depth }}>
                {row.lead && <span className="slot-lead">{row.lead}</span>}
                <button
                  type="button"
                  ref={(element) => {
                    if (element) slotRefs.current.set(slot.id, element);
                    else slotRefs.current.delete(slot.id);
                  }}
                  className={`slot ${stylex.props(stylex.defaultMarker()).className}`}
                  disabled={cleared || !(picked || dragging)}
                  data-near={near === slot.id || undefined}
                  data-miss={miss?.id === slot.id || undefined}
                  data-off={(cleared && !seated) || undefined}
                  data-seat={seated || undefined}
                  key={miss?.id === slot.id ? miss.at : "slot"}
                  onClick={() => drop(slot.id)}
                >
                  {seated ? (
                    <span ref={seatRef} className="piece seated">
                      {level.piece}
                      <Burst />
                    </span>
                  ) : (
                    slot.label
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="tray">
          {!cleared && (
            <button
              ref={pieceRef}
              type="button"
              className="piece"
              data-picked={picked || undefined}
              data-dragging={dragging || undefined}
              aria-pressed={picked}
              aria-label={`${level.piece}. ${picked ? `Picked up: choose a spot in the ${board}.` : "Pick up"}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => endDrag(event, false)}
              onPointerCancel={(event) => endDrag(event, true)}
              onClick={(event) => {
                // Pointer taps are handled on pointerup; this is Enter and Space.
                if (event.detail === 0) setPicked((value) => !value);
              }}
            >
              {level.piece}
            </button>
          )}
          <span className="tray-note">
            {cleared
              ? "In its place."
              : picked
                ? "Now pick a spot. Esc puts it back."
                : "Your piece"}
          </span>
        </div>
      </div>
    </article>
  );
}

function Burst() {
  return (
    <span className="burst" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <i key={index} style={{ "--a": `${index * 45 + 22}deg` }} />
      ))}
    </span>
  );
}

type ShareData = { title: string; text: string };

function ShareButton({ data, inIsland = false }: { data: ShareData; inIsland?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const shared = { ...data, url: location.href };
    if ("share" in navigator && navigator.canShare(shared)) {
      try {
        await navigator.share(shared);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) console.error(e);
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shared.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error(e);
    }
  }

  const label = copied ? "Link copied" : "Share";
  if (inIsland) {
    return (
      <button type="button" onClick={share} {...stylex.props(styles.action)}>
        {copied ? (
          <CheckIcon size={16} weight="bold" aria-hidden="true" />
        ) : (
          <ShareNetworkIcon size={16} weight="bold" aria-hidden="true" />
        )}
        <span className="sr-only" aria-live="polite">
          {label}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`btn soft sm ${stylex.props(shell.share, shell.in, shell.first).className}`}
      onClick={share}
    >
      {copied ? (
        <CheckIcon weight="bold" aria-hidden="true" {...stylex.props(shell.shareIcon)} />
      ) : (
        <ShareNetworkIcon weight="bold" aria-hidden="true" {...stylex.props(shell.shareIcon)} />
      )}
      <span aria-live="polite" {...stylex.props(shell.shareLabel)}>
        {label}
      </span>
    </button>
  );
}

function useTitleFit(titleRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const title = titleRef.current;
    const column = title?.parentElement;
    if (!title || !column) return;
    const fit = () => {
      title.style.removeProperty("--fit");
      const width = title.scrollWidth;
      if (width <= column.clientWidth) return;
      const size = parseFloat(getComputedStyle(title).fontSize);
      title.style.setProperty("--fit", `${Math.floor((size * column.clientWidth) / width)}px`);
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(column);
    void document.fonts.ready.then(fit);
    return () => resize.disconnect();
  }, [titleRef]);
}

function useTitleDock(
  rootRef: RefObject<HTMLElement | null>,
  titleRef: RefObject<HTMLElement | null>,
  slot: HTMLElement | null,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    const label = slot?.parentElement;
    if (!root || !title || !slot || !label) return;
    const flies = CSS.supports("animation-timeline: scroll()") && !reducedMotion();
    let land = Infinity;

    const dock = () => {
      const docked = scrollY >= land;
      root.toggleAttribute("data-docked", docked);
      label.toggleAttribute("data-swap", docked);
    };

    const measure = () => {
      title.style.animation = "none";
      const from = title.getBoundingClientRect();
      title.style.removeProperty("animation");
      const to = compactBox(slot);
      const end = Math.max(1, from.top + scrollY + from.height / 2 - (to.top + to.height / 2));
      const scale =
        parseFloat(getComputedStyle(slot).fontSize) / parseFloat(getComputedStyle(title).fontSize);
      root.style.setProperty("--dock-end", `${end}px`);
      root.style.setProperty("--dock-x", `${to.left - from.left}px`);
      root.style.setProperty("--dock-k", scale.toFixed(4));
      land = flies ? end * 0.96 : from.bottom + scrollY - to.bottom;
      dock();
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(title.closest("header") ?? title);
    resize.observe(label);
    const bar = slot.closest(".arc-bar");
    if (bar) resize.observe(bar);
    bar?.addEventListener("animationend", measure);
    void document.fonts.ready.then(measure);
    addEventListener("scroll", dock, { passive: true });
    return () => {
      resize.disconnect();
      bar?.removeEventListener("animationend", measure);
      removeEventListener("scroll", dock);
      root.removeAttribute("data-docked");
    };
  }, [rootRef, titleRef, slot]);
}

function CopyMarkdown({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      await navigator.clipboard.writeText(await response.text());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <button type="button" className="btn go" onClick={handleCopy}>
      {copied ? "Copied" : "Copy as Markdown"}
    </button>
  );
}

export function onceOnScreen(element: Element, show: () => void) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      show();
    },
    { threshold: 0.6 },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-rev]")];
    for (const item of items) {
      if (item.getBoundingClientRect().top < innerHeight) item.dataset.in = "";
    }
    root.dataset.revOn = "";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
          entry.target.dataset.in = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const item of items) if (!("in" in item.dataset)) observer.observe(item);
    return () => observer.disconnect();
  }, [rootRef]);
}

const enter = stylex.keyframes({ from: { opacity: 0.01, translate: "0 12px" } });
const dockSlide = stylex.keyframes({ to: { translate: "var(--dock-x,0px) 0" } });
const dockShrink = stylex.keyframes({
  "90%": { opacity: 1 },
  to: { scale: "var(--dock-k,1)", opacity: 0 },
});

const STACKED = "@media (max-width: 960px)";
const PHONE = "@media (max-width: 640px)";
const TINY = "@media (max-width: 400px)";
const COMPACT = ':is(:root:has(.arc-bar[data-mode="compact"]) *)';
const RULE_OPEN = ":is(html:active-view-transition-type(rule-open) *)";
const DOCKS = "@supports (animation-timeline: scroll())";
const MOVES = "@media (prefers-reduced-motion: no-preference)";
const NARROW = "@media (max-width: 480px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

const shell = stylex.create({
  root: {
    "--c-ink": `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
    "--key-c": "color-mix(in oklab, var(--c) 60%, #000)",
    position: "relative",
    isolation: "isolate",
    overflowWrap: "break-word",
  },
  ground: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    backgroundImage: `linear-gradient(${kit["--grid"]} 1px, transparent 1px), linear-gradient(90deg, ${kit["--grid"]} 1px, transparent 1px)`,
    backgroundSize: "48px 48px",
    backgroundPosition: "center -1px",
    maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
  },
  // Off while the header is compact: the island carries the way back then.
  crumbRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: { default: "16px", [TINY]: "6px" },
    justifySelf: "stretch",
    marginBottom: "8px",
    opacity: { default: null, [COMPACT]: 0 },
    filter: { default: null, [COMPACT]: { default: "blur(4px)", [REDUCE]: "none" } },
    visibility: { default: null, [COMPACT]: "hidden" },
    transition: {
      default: `opacity 240ms ${motion["--out"]} 40ms, filter 260ms ${motion["--out"]} 40ms, visibility 0s`,
      [COMPACT]: "opacity 120ms ease, filter 120ms ease, visibility 0s 120ms",
    },
  },
  crumb: {
    gap: { default: "10px", [TINY]: "6px" },
    marginBottom: 0,
    fontSize: "0.875rem",
    color: palette["--dim"],
    whiteSpace: "nowrap",
    backgroundColor: palette["--veil-dense"],
    boxShadow: palette["--veil-dense-edge"],
    borderRadius: "12px",
    "::before": { display: "none" },
  },
  crumbLink: {
    marginBlock: "-12px",
    paddingBlock: "12px",
    color: { default: null, ":hover": palette["--text"] },
    transition: "color 120ms ease",
  },
  crumbTag: {
    fontWeight: 700,
    color: "var(--c-ink)",
  },
  share: {
    justifyContent: { default: null, [PHONE]: "center" },
    width: { default: null, [PHONE]: "38px" },
  },
  shareIcon: {
    width: "16px",
    height: "16px",
  },
  shareLabel: {
    position: { default: null, [PHONE]: "absolute" },
    width: { default: null, [PHONE]: "1px" },
    height: { default: null, [PHONE]: "1px" },
    overflow: { default: null, [PHONE]: "hidden" },
    clipPath: { default: null, [PHONE]: "inset(50%)" },
    whiteSpace: { default: null, [PHONE]: "nowrap" },
  },
  titleScreen: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1.15fr) minmax(0, 1fr)", [STACKED]: "minmax(0, 1fr)" },
    gap: { default: "56px", [STACKED]: "40px" },
    alignItems: "center",
    minHeight: { default: "calc(100svh - 72px)", [STACKED]: 0 },
    paddingTop: { default: "48px", [STACKED]: "40px" },
    paddingBottom: "72px",
  },
  heroCopy: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    justifyItems: "start",
    backgroundColor: palette["--veil"],
    boxShadow: palette["--veil-edge"],
    borderRadius: "16px",
  },
  // useTitleFit caps the size with --fit; useTitleDock sets --dock-x, --dock-k and --dock-end, and
  // the heading flies onto the island's label as the page scrolls.
  title: {
    width: "fit-content",
    maxWidth: "100%",
    marginBottom: "8px",
    fontWeight: 900,
    fontSize: "min(clamp(44px, 7vw, 108px), var(--fit, 108px))",
    lineHeight: 0.94,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.05em",
    viewTransitionName: { default: null, [RULE_OPEN]: "rule-title" },
    position: { default: null, [DOCKS]: { default: null, [MOVES]: "relative" } },
    zIndex: { default: null, [DOCKS]: { default: null, [MOVES]: 41 } },
    transformOrigin: { default: null, [DOCKS]: { default: null, [MOVES]: "0 50%" } },
    animationName: {
      default: null,
      [DOCKS]: { default: null, [MOVES]: `${dockSlide}, ${dockShrink}` },
    },
    animationDuration: { default: null, [DOCKS]: { default: null, [MOVES]: "auto, auto" } },
    animationTimingFunction: {
      default: null,
      [DOCKS]: { default: null, [MOVES]: "cubic-bezier(0.5, 0, 0.75, 0), linear" },
    },
    animationDelay: { default: null, [DOCKS]: { default: null, [MOVES]: "0s, 0s" } },
    animationIterationCount: { default: null, [DOCKS]: { default: null, [MOVES]: "1, 1" } },
    animationDirection: { default: null, [DOCKS]: { default: null, [MOVES]: "normal, normal" } },
    animationFillMode: { default: null, [DOCKS]: { default: null, [MOVES]: "both, both" } },
    animationPlayState: { default: null, [DOCKS]: { default: null, [MOVES]: "running, running" } },
    animationTimeline: {
      default: null,
      [DOCKS]: { default: null, [MOVES]: "scroll(root), scroll(root)" },
    },
    animationRangeStart: { default: null, [DOCKS]: { default: null, [MOVES]: "0px" } },
    animationRangeEnd: {
      default: null,
      [DOCKS]: { default: null, [MOVES]: "var(--dock-end, 100vh)" },
    },
  },
  titleLine: {
    display: "block",
    position: { default: null, ":first-child": "relative" },
    zIndex: { default: null, ":first-child": 1 },
  },
  titleMark: {
    paddingInline: "0.06em",
    borderRadius: "0.06em",
  },
  claim: {
    maxWidth: "20em",
    fontWeight: 700,
    fontSize: "clamp(21px, 2vw, 28px)",
    lineHeight: 1.25,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.025em",
    color: palette["--text"],
    textWrap: "pretty",
  },
  // .arc .lead keeps its margin, as it always outranked the page's reset.
  lead: {
    maxWidth: "34em",
    fontSize: "18px",
    lineHeight: 1.6,
    textWrap: "pretty",
  },
  // The load-in starts at 0.01, not 0: Chrome skips a text paint at opacity 0 for LCP, and a fade runs
  // on the compositor without painting again, so a fully transparent start leaves the lead out of LCP
  // until some unrelated repaint seconds later.
  in: {
    animationName: { default: enter, [REDUCE]: "none" },
    animationDuration: "560ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "both",
    animationDelay: "calc(var(--i, 0) * 60ms + 200ms)",
  },
  first: { "--i": "0" },
  second: { "--i": "1" },
  third: { "--i": "2" },
  // useReveal marks what starts on screen with data-in, then sets data-rev-on; the rest rises in.
  rev: {
    opacity: {
      default: null,
      [stylex.when.ancestor("[data-rev-on]", reveal)]: { default: null, ":not([data-in])": 0 },
    },
    translate: {
      default: null,
      [stylex.when.ancestor("[data-rev-on]", reveal)]: {
        default: null,
        ":not([data-in])": { default: "0 16px", [REDUCE]: "none" },
      },
    },
    transition: {
      default: null,
      [stylex.when.ancestor("[data-rev-on]", reveal)]: `opacity ${motion["--t-panel"]} ${motion["--out"]}, translate ${motion["--t-panel"]} ${motion["--out"]}`,
    },
  },
});

// The live activity this page lends the header island: a back link, a label that trades the
// page's tags for its title once the heading docks (useTitleDock sets data-swap), and Share.
const styles = stylex.create({
  activity: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },
  action: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "36px",
    minWidth: "36px",
    padding: "0 10px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "999px",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, "@media (hover: hover)": palette["--panel-2"] },
    },
    // `background: none` minifies to a 0 0 position at rest, and the hover's background shorthand
    // resets it to 0% 0%. StyleX would minify a literal 0% 0% back to 0 0, so hover sets initial.
    backgroundPosition: {
      default: "0 0",
      ":hover": { default: null, "@media (hover: hover)": "initial" },
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, "@media (hover: hover)": palette["--text"] },
    },
    font: "inherit",
    whiteSpace: "nowrap",
    cursor: cursors["--cursor-point"],
    outline: { default: null, ":focus-visible": `2px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "-2px" },
    transition: "background-color 120ms ease, color 120ms ease",
  },
  // Phones: the back link keeps its name for screen readers and shows only the arrow.
  back: {
    padding: { default: "0 10px", [PHONE]: 0 },
  },
  backText: {
    position: { default: null, [PHONE]: "absolute" },
    width: { default: null, [PHONE]: "1px" },
    height: { default: null, [PHONE]: "1px" },
    overflow: { default: null, [PHONE]: "hidden" },
    clipPath: { default: null, [PHONE]: "inset(50%)" },
    whiteSpace: { default: null, [PHONE]: "nowrap" },
  },
  // A long rule title would push the island past the screen on narrow phones: the label takes what
  // is left after the back link, Share, the tools, the menu and the island's padding, and ends in an
  // ellipsis. compactBox reads the capped width, so the title still docks onto it.
  label: {
    display: "grid",
    maxWidth: { default: null, [NARROW]: "calc(100vw - 206px)" },
    padding: { default: "0 8px", [NARROW]: "0 4px" },
    whiteSpace: "nowrap",
  },
  labelPart: {
    gridArea: "1 / 1",
    alignSelf: "center",
    minWidth: { default: null, [NARROW]: 0 },
    overflow: { default: null, [NARROW]: "hidden" },
    textOverflow: { default: null, [NARROW]: "ellipsis" },
    transition: `opacity 200ms ${motion["--out"]}, filter 200ms ${motion["--out"]}, translate 200ms ${motion["--out"]}`,
  },
  tags: {
    display: "flex",
    gap: "8px",
    color: palette["--mute"],
    opacity: { default: null, [stylex.when.ancestor("[data-swap]")]: 0 },
    filter: {
      default: null,
      [stylex.when.ancestor("[data-swap]")]: { default: "blur(2px)", [REDUCE]: "none" },
    },
    translate: {
      default: null,
      [stylex.when.ancestor("[data-swap]")]: { default: "0 -6px", [REDUCE]: "none" },
    },
  },
  title: {
    fontWeight: 900,
    fontSize: "0.875rem",
    opacity: { default: 0, [stylex.when.ancestor("[data-swap]")]: 1 },
    filter: {
      default: "blur(2px)",
      [stylex.when.ancestor("[data-swap]")]: "none",
      [REDUCE]: "none",
    },
    translate: {
      default: "0 6px",
      [stylex.when.ancestor("[data-swap]")]: { default: "0 0", [REDUCE]: "none" },
      [REDUCE]: "none",
    },
  },
});
