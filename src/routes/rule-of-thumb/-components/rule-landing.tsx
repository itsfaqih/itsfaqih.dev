import { ArrowLeftIcon, CheckIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
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
import type { Guideline } from "../../../data/guidelines";
import { colorOf, isOpeningRule, ruleNumber, RuleThumb } from "../../-components/rule-art";
import { RuleOfThumbPagination } from "./rule-of-thumb-pagination";
import { readMarkdown, useCurrentRule } from "./index";
import "./rule-landing.css";

const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const SNAP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- The data a rule page supplies ----------

/** One way to do it: what it looks like and what it costs. */
export type Side = { label: string; view: ReactNode; costs: string[] };
export type Lesson = {
  title: string;
  exception?: boolean;
  body: ReactNode;
  extra?: ReactNode;
  bad: Side;
  good: Side;
};

/** Rows with the same key in both layouts glide between their places. A row whose text is not a
 * string has no key of its own, so it needs `k`. */
export type TreeRow = {
  depth: number;
  kind?: "dir" | "comp" | "more";
  /** The piece of code the lesson is about. */
  moved?: boolean;
  tag?: string;
} & ({ k: string; text: ReactNode } | { k?: undefined; text: string });

export type Slot = { id: string; label: ReactNode; note: string; cost: string[] };
export type BoardRow =
  | { depth: number; text: ReactNode; kind?: string; tag?: string }
  /** `lead` sits before the slot and stays once the piece is seated, like a key before its value. */
  | { depth: number; slot: Slot; lead?: ReactNode };
export type Level = {
  name: string;
  prompt: ReactNode;
  piece: string;
  answer: string;
  rows: BoardRow[];
};

type RuleLandingProps = {
  claim: string;
  lead: ReactNode;
  coverTag: string;
  learn: { title: string; intro: ReactNode };
  lessons: Lesson[];
  tldr: readonly (readonly [string, string])[];
  /** `board` names what the pieces go into, as in "Drag the piece into the tree". */
  quiz: { intro: ReactNode; levels: Level[]; board?: string };
  /** The "Take the rule with you" paragraph. */
  take?: ReactNode;
  /** A hook for the page's own CSS. */
  className?: string;
};

const TAKE = (
  <>
    The whole rule as plain Markdown. Paste it into your <code>AGENTS.md</code> and your agents will
    follow it too.
  </>
);

/** Stars per level: 1 to 3 once cleared, null while open. */
type Results = (number | null)[];

/** A rule's landing: the title screen with its cover, lessons that set the wrong way beside the
 * right one, a TL;DR, a mini quiz, and the rule as Markdown to take away. */
export function RuleLanding(props: RuleLandingProps) {
  const current = useCurrentRule();
  // Pinned at mount: while the next route loads, the location already names the next rule.
  const [rule] = useState(current);
  return rule ? <Landing rule={rule} {...props} /> : null;
}

function Landing({
  rule,
  claim,
  lead,
  coverTag,
  learn,
  lessons,
  tldr,
  quiz,
  take = TAKE,
  className,
}: RuleLandingProps & { rule: Guideline }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);
  const [morphed] = useState(isOpeningRule);
  // Arriving by morph, start at the top now so the title and cover fly into a hero on screen.
  useLayoutEffect(() => {
    if (morphed) scrollTo({ top: 0, behavior: "instant" });
  }, [morphed]);

  const titleRef = useRef<HTMLHeadingElement>(null);
  // State, not a ref: the slot mounts in the island a commit after the page does.
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useTitleFit(titleRef);
  useTitleDock(rootRef, titleRef, slot);
  const hue = { "--c": colorOf(rule.label) };
  const number = ruleNumber(rule);

  const { levels } = quiz;
  const [results, setResults] = useState<Results>(() => levels.map(() => null));

  const markdownUrl = `/rule-of-thumb/${rule.id}.md`;
  const words = rule.title.split(" ");
  const last = words.pop();
  const head = words.join(" ");
  const share = { title: rule.title, text: claim };

  return (
    <div
      ref={rootRef}
      className={className ? `arc rule-page ${className}` : "arc rule-page"}
      style={hue}
    >
      <div className="grid-ground" aria-hidden="true" />
      <IslandActivity>
        <span className="act-in" style={hue}>
          <Link to="/rule-of-thumb" className="act-back">
            <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
            <span className="act-txt">All rules</span>
          </Link>
          <span className="act-label">
            <span className="tags">
              {number && <span>No.{number}</span>}
              <span>{rule.label}</span>
            </span>
            <span ref={setSlot} className="title" aria-hidden="true">
              {head && `${head} `}
              <span className="hl">{last}</span>
            </span>
          </span>
          <ShareButton data={share} inIsland />
        </span>
      </IslandActivity>
      <header className="arc-wrap title-screen">
        <div className="hero-copy">
          <div className="crumb-row">
            <nav className="tag crumb in" style={{ "--i": 0 }} aria-label="Breadcrumb">
              <Link to="/rule-of-thumb">← All rules</Link>
              {number && <span className="c">No.{number}</span>}
              <span className="c">{rule.label}</span>
            </nav>
            <ShareButton data={share} />
          </div>
          <h1 ref={titleRef}>
            {head && (
              <>
                <span className="ln">{head}</span>{" "}
              </>
            )}
            <span className="ln">
              <span className="hl">{last}</span>
            </span>
          </h1>
          <p className="claim in" style={{ "--i": 1 }}>
            {claim}
          </p>
          <p className="lead in" style={{ "--i": 2 }}>
            {lead}
          </p>
        </div>
        <Cover rule={rule} tag={coverTag} entering={!morphed} />
      </header>

      <div className="arc-wrap">
        <section className="learn" id="learn" aria-labelledby="learn-title">
          <div className="sec-head" data-rev>
            <h2 id="learn-title">{learn.title}</h2>
            <p>{learn.intro}</p>
          </div>
          <div className="lessons">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.title} lesson={lesson} />
            ))}
          </div>
          <div className="sheet-wrap" data-rev>
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
          <div className="sec-head quiz-head" data-rev>
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
                board={quiz.board ?? "board"}
                stars={results[index] ?? null}
                onClear={(stars) =>
                  setResults((list) => list.map((value, at) => (at === index ? stars : value)))
                }
              />
            ))}
          </Rail>
        </section>

        <section className="take">
          <div className="take-copy" data-rev>
            <h2>Take the rule with you</h2>
            <p>{take}</p>
            <div className="acts">
              <CopyMarkdown url={markdownUrl} className="btn go" />
              <a className="btn soft" href={markdownUrl} target="_blank" rel="noopener noreferrer">
                View .md
              </a>
            </div>
          </div>
          <div data-rev>
            <RuleOfThumbPagination />
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- The cover: the card's thumbnail, grown and tilted beside the title ----------

type CoverProps = { rule: Guideline; tag: string; entering: boolean };

/** Rests at a tilt and leans a few degrees toward the pointer. The thumbnail inside is the one the
 * card flies in during the `rule-open` morph. */
function Cover({ rule, tag, entering }: CoverProps) {
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
      className={entering ? "cover in" : "cover"}
      style={{ "--i": 2 }}
      onPointerMove={lean}
      onPointerLeave={rest}
    >
      <div className="cover-card">
        <RuleThumb rule={rule} play />
        <div className="cover-foot" aria-hidden="true">
          <span>{rule.id}.md</span>
          <span>{tag}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- One lesson: the wrong way beside the right one ----------

type SideKey = "bad" | "good";
const SIDES: readonly SideKey[] = ["bad", "good"];
const MARK = { bad: "✕", good: "✓" } as const;

/** Below this width the two layouts share one pane, behind tabs. */
const TABBED = "(max-width: 820px)";

/** A file tree. Rows that share a key across the two panes glide between them. */
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

/** Only trees size the tabbed pane; any other view keeps its own height. */
const treeRows = (view: ReactNode) =>
  isValidElement<{ rows: TreeRow[] }>(view) && view.type === Tree ? view.props.rows.length : 0;

function LessonCard({ lesson }: { lesson: Lesson }) {
  const cardRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const placed = useRef(new Map<string, { x: number; y: number }>());
  const touched = useRef(false);
  const rewound = useRef(false);
  // Wide screens show both layouts side by side. Behind tabs, the server renders the rule's
  // answer; the client rewinds unseen lessons to bad and plays the walk home once each comes on
  // screen.
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => {
          if (!touched.current) setSide("good");
        }, 700);
      },
      { threshold: 0.6 },
    );
    observer.observe(card);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // FLIP between the tabs: rows that exist on both sides glide from where they were in the other
  // pane; new rows fade in after them.
  useLayoutEffect(() => {
    const pane = demoRef.current?.querySelector<HTMLElement>(`[data-side="${side}"]`);
    if (!pane) return;
    const origin = pane.getBoundingClientRect();
    const before = placed.current;
    // The rewind to bad happens off screen, so it jumps.
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
    <article ref={cardRef} className="lesson" data-rev>
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
          <figure key={key} className="pane well" data-side={key}>
            <figcaption>
              <span aria-hidden="true">{MARK[key]}</span>
              <span className="sr-only">{key === "bad" ? "Avoid: " : "Do: "}</span>
              {lesson[key].label}
            </figcaption>
            {lesson[key].view}
            <div className="costs">
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

// ---------- Quiz progress ----------

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

/** The levels hang off a rail whose fill reaches the last level of the cleared run from LV1. */
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
      // Down to the centre of the last cleared node.
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

// ---------- One level: carry the piece to where it lives ----------

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
  const said = placed
    ? slots.find((slot) => slot.id === placed)
    : miss
      ? slots.find((slot) => slot.id === miss.id)
      : undefined;

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

  // The piece flies from wherever it was let go into its seat in the tree.
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
    // Lean into the direction of travel, up to 8 degrees.
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

  // The keyboard path: Enter picks the piece up, focus moves to the first spot, Enter drops it.
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
      className="level panel"
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
                  className="slot"
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

// ---------- The crumb row and the island's live activity ----------

type ShareData = { title: string; text: string };

/** Opens the system share sheet where there is one, and copies the link everywhere else. */
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
      <button type="button" className="act-btn" onClick={share}>
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
    <button type="button" className="btn soft sm share in" style={{ "--i": 0 }} onClick={share}>
      {copied ? (
        <CheckIcon weight="bold" aria-hidden="true" />
      ) : (
        <ShareNetworkIcon weight="bold" aria-hidden="true" />
      )}
      <span className="lbl" aria-live="polite">
        {label}
      </span>
    </button>
  );
}

/** The heading grows with the viewport, but a word can't wrap, so a long one ("Timestamps") would
 * run out of its column and under the cover. This caps the size, as --fit, where the longest word
 * just fits. Size and width scale together, so one measure at any size gives the cap. */
function useTitleFit(titleRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const title = titleRef.current;
    const column = title?.parentElement;
    if (!title || !column) return;
    function fit() {
      if (!title || !column) return;
      title.style.removeProperty("--fit");
      const width = title.scrollWidth;
      if (width <= column.clientWidth) return;
      const size = parseFloat(getComputedStyle(title).fontSize);
      title.style.setProperty("--fit", `${Math.floor((size * column.clientWidth) / width)}px`);
    }
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(column);
    void document.fonts.ready.then(fit);
    return () => resize.disconnect();
  }, [titleRef]);
}

/** Scrolling flies the heading up into the island, shrinking it to the island's title. The
 * flight is a scroll-driven animation in the CSS; this measures where it starts and where the
 * island's title will sit once the island is compact, and as it lands swaps the island's label
 * from the page's tags to that title. Where the flight can't run, the swap waits until the
 * heading has scrolled under the island. */
function useTitleDock(
  rootRef: RefObject<HTMLElement | null>,
  titleRef: RefObject<HTMLElement | null>,
  slot: HTMLElement | null,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    const label = slot?.closest<HTMLElement>(".act-label");
    if (!root || !title || !slot || !label) return;
    const flies = CSS.supports("animation-timeline: scroll()") && !reducedMotion();
    let land = Infinity;

    function dock() {
      const docked = scrollY >= land;
      root?.toggleAttribute("data-docked", docked);
      label?.toggleAttribute("data-swap", docked);
    }

    function measure() {
      if (!root || !title || !slot) return;
      // Where the heading sits with no flight applied, in page coordinates.
      title.style.animation = "none";
      const from = title.getBoundingClientRect();
      title.style.removeProperty("animation");
      // The island is fixed, so its title keeps one place on screen however far the page scrolls.
      const to = compactBox(slot);
      const end = Math.max(1, from.top + scrollY + from.height / 2 - (to.top + to.height / 2));
      const scale =
        parseFloat(getComputedStyle(slot).fontSize) / parseFloat(getComputedStyle(title).fontSize);
      root.style.setProperty("--dock-end", `${end}px`);
      root.style.setProperty("--dock-x", `${to.left - from.left}px`);
      root.style.setProperty("--dock-k", scale.toFixed(4));
      land = flies ? end * 0.96 : from.bottom + scrollY - to.bottom;
      dock();
    }

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(title.closest("header") ?? title);
    resize.observe(label);
    const bar = slot.closest(".arc-bar");
    if (bar) resize.observe(bar);
    // The island boots in with a scale and its parts with a glitch; measure again once they settle.
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

function CopyMarkdown({ url, className }: { url: string; className: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const text = await readMarkdown(url);
      if (text === null) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? "Copied" : "Copy as Markdown"}
    </button>
  );
}

/** Each [data-rev] element rises in once as it enters the screen. Those already on screen when
 * the page mounts are shown at once, so nothing that was painted disappears. */
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
