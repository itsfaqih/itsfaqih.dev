import * as stylex from "@stylexjs/stylex";
import { ArrowLeftIcon, CheckIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import {
  createContext,
  Fragment,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { colorOf, PUBLISHED_GUIDELINES, ruleNumber, VISIBLE_GUIDELINES } from "../data/guidelines";
import type { PublishedGuideline } from "../data/guidelines";
import { heroType } from "../sections/hero-type";
import { reticle } from "../sections/reticle";
import { RuleThumb, useRuleOpen } from "../sections/rule-art";
import { reducedMotion } from "../hooks/media-query";
import { reveal } from "./rule-landing.stylex";
import {
  cover,
  glyphSwap,
  hintKit,
  island,
  lessonKit,
  OUT,
  pager,
  quizKit,
  shell,
  SNAP,
  TABBED,
  takeKit,
  text,
  tree,
} from "./rule-landing.styles";
import { type Hint, watchHintReader, watchHints } from "./hints";
import { onceOnScreen, watchReveal, watchTitleFit, watchTitleSwap } from "./rule-motion";

// The React rule pages still import these from here until they move onto rule-landing.astro.
export { OUT, TABBED, onceOnScreen };
import { button, buttonVariant } from "../components/button";
import { hoverHold } from "../components/hover-hold";
import { section, veil } from "../sections/section";
import { arcade } from "../components/arcade";
import { Backdrop } from "../sections/backdrop";


type Side = { label: string; view: ReactNode; costs: string[] };
export type Lesson = {
  title: string;
  exception?: boolean;
  body: ReactNode;
  extra?: ReactNode;
  bad: Side;
  good: Side;
  /** Quiz levels that test this lesson, played right after it. */
  levels: [Level, ...Level[]];
};

type Slot = { id: string; label: ReactNode; note: string };
type BoardRow =
  | { depth: number; text: ReactNode; kind?: "dir" | "comp" | "more"; tag?: string }
  | { depth: number; slot: Slot; lead?: ReactNode };
export type Level = {
  name: string;
  prompt: ReactNode;
  piece: string;
  answer: string;
  rows: BoardRow[];
};

type RuleLandingProps = {
  /** The published rule this page teaches. */
  id: string;
  lead: ReactNode;
  learn: { title: string; intro: ReactNode };
  lessons: Lesson[];
  tldr: readonly (readonly [string, string])[];
  /** What the quiz pieces go into, as in "Drag the piece into the tree". */
  board: string;
  /** What agents do with the rule in their `AGENTS.md`, as in "build buttons the same way". */
  take: string;
  /** Applied last to the row of cost tags under each lesson's panes. */
  costsStyle?: stylex.StyleXStyles;
};

export function RuleLanding(props: RuleLandingProps) {
  const rule = PUBLISHED_GUIDELINES.find((guideline) => guideline.id === props.id);
  if (!rule) throw new Error(`No published rule "${props.id}"`);
  return <Landing rule={rule} {...props} />;
}

function Landing({
  rule,
  lead,
  learn,
  lessons,
  tldr,
  board,
  take,
  costsStyle,
}: RuleLandingProps & { rule: PublishedGuideline }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => watchReveal(rootRef.current!), []);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => watchTitleFit(titleRef.current!), []);
  useEffect(() => {
    const label = slot?.parentElement;
    if (label) return watchTitleSwap(titleRef.current!, label);
  }, [slot]);
  const hue = { "--c": colorOf(rule.label) };
  const number = ruleNumber(rule);

  const levels = lessons.flatMap((lesson) => lesson.levels);

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
      className={`arc ${stylex.props(arcade.root, arcade.scan, shell.root, reveal).className}`}
      style={hue}
    >
      <Backdrop tide />
      <IslandActivity>
        <span {...stylex.props(island.activity)} style={hue}>
          <a href="/rule-of-thumb" {...stylex.props(island.action, island.back)}>
            <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
            <span {...stylex.props(island.backText)}>All rules</span>
          </a>
          <span {...stylex.props(island.label, stylex.defaultMarker())}>
            <span {...stylex.props(island.labelPart, island.tags)}>
              {number && <span>No.{number}</span>}
              <span>{rule.label}</span>
            </span>
            <span
              ref={setSlot}
              aria-hidden="true"
              {...stylex.props(island.labelPart, island.title)}
            >
              {head && `${head} `}
              <span {...stylex.props(heroType.hl)}>{last}</span>
            </span>
          </span>
          <ShareButton data={share} inIsland />
        </span>
      </IslandActivity>
      <header {...stylex.props(arcade.wrap, shell.titleScreen)}>
        {/* Spans both columns, so Share sits over the cover's right edge. */}
        <div {...stylex.props(shell.crumbRow)}>
          <nav
            {...stylex.props(heroType.tag, veil.dense, shell.crumb, shell.in, shell.first)}
            aria-label="Breadcrumb"
          >
            <a href="/rule-of-thumb" {...stylex.props(shell.crumbLink)}>
              ← All rules
            </a>
            {number && <span {...stylex.props(shell.crumbTag)}>No.{number}</span>}
            <span {...stylex.props(shell.crumbTag)}>{rule.label}</span>
          </nav>
          <ShareButton data={share} />
        </div>
        <div {...stylex.props(veil.soft, shell.heroCopy)}>
          <h1 ref={titleRef} {...stylex.props(heroType.title, shell.title)}>
            {head && (
              <>
                <span {...stylex.props(shell.titleLine)}>{head}</span>{" "}
              </>
            )}
            <span {...stylex.props(shell.titleLine)}>
              <span {...stylex.props(heroType.hl, shell.titleMark)}>{last}</span>
            </span>
          </h1>
          <p {...stylex.props(shell.claim, shell.in, shell.second)}>{rule.claim}</p>
          <p {...stylex.props(heroType.lead, shell.lead, shell.in, shell.third)}>{lead}</p>
        </div>
        <Cover rule={rule} />
      </header>

      <div {...stylex.props(arcade.wrap)}>
        <section
          id="learn"
          aria-labelledby="learn-title"
          {...stylex.props(section.block, lessonKit.section)}
        >
          <div {...stylex.props(lessonKit.secHead, shell.rev)} data-rev>
            <h2
              id="learn-title"
              {...stylex.props(section.title, veil.soft, lessonKit.headItem, lessonKit.secTitle)}
            >
              {learn.title}
            </h2>
            <Tone value="wrap">
              <p {...stylex.props(veil.soft, lessonKit.headItem, lessonKit.secText)}>
                {learn.intro}
              </p>
            </Tone>
          </div>
          <div {...stylex.props(lessonKit.lessons)}>
            {lessons.map((lesson) => (
              <Fragment key={lesson.title}>
                <LessonCard lesson={lesson} costsStyle={costsStyle} />
                {lesson.levels.map((level) => (
                  <LevelBoard
                    key={level.name}
                    n={levels.indexOf(level) + 1}
                    level={level}
                    board={board}
                  />
                ))}
              </Fragment>
            ))}
          </div>
          <div {...stylex.props(lessonKit.sheetWrap, shell.rev)} data-rev>
            <h3 {...stylex.props(veil.soft, lessonKit.sheetTitle)}>TL;DR</h3>
            <ol {...stylex.props(lessonKit.panel, lessonKit.sheet)}>
              {tldr.map(([situation, answer]) => (
                <li key={situation} {...stylex.props(lessonKit.sheetRow)}>
                  <span {...stylex.props(lessonKit.situation)}>{situation}</span>
                  <b {...stylex.props(lessonKit.answer)}>{answer}</b>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section {...stylex.props(section.block, takeKit.section)}>
          <div {...stylex.props(veil.soft, takeKit.copy, shell.rev)} data-rev>
            <h2 {...stylex.props(section.title, takeKit.title)}>Take the rule with you</h2>
            <Tone value="take">
              <p {...stylex.props(takeKit.text)}>
                The whole rule in Markdown. Paste it into your <Code>AGENTS.md</Code>
                {` and your agents will ${take}.`}
              </p>
            </Tone>
            <div {...stylex.props(heroType.acts, takeKit.acts)}>
              <CopyMarkdown url={markdownUrl} />
              <a
                {...stylex.props(button.base, buttonVariant["secondary-brand"])}
                href={markdownUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View .md
              </a>
            </div>
          </div>
          <div {...stylex.props(shell.rev)} data-rev>
            {at !== -1 && (
              <nav {...stylex.props(arcade.root, pager.nav)} aria-label="More rules">
                {prev ? (
                  <PagerCard rule={prev} direction="Previous" />
                ) : (
                  <div {...stylex.props(pager.gap)} />
                )}
                {next ? (
                  <PagerCard rule={next} direction="Next" />
                ) : (
                  <a
                    href="/rule-of-thumb"
                    {...stylex.props(reticle.card, reticle.aim, pager.card, pager.all)}
                  >
                    <span {...stylex.props(pager.dir)}>That's every rule so far</span>
                    <span {...stylex.props(pager.title)}>Back to all rules →</span>
                  </a>
                )}
              </nav>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Lends the compact header island (header.astro) its children.
function IslandActivity({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => setHost(document.querySelector("[data-island-activity]")), []);
  return host ? createPortal(children, host) : null;
}

function PagerCard({
  rule,
  direction,
}: {
  rule: PublishedGuideline;
  direction: "Previous" | "Next";
}) {
  const [hovered, setHovered] = useState(false);
  const { linkProps: openRule } = useRuleOpen();

  return (
    <a
      href={rule.href}
      {...openRule(rule)}
      {...stylex.props(
        reticle.card,
        reticle.aim,
        hoverHold.lift,
        pager.card,
        direction === "Next" && pager.next,
      )}
      style={{ "--c": colorOf(rule.label) }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <RuleThumb rule={rule} play={hovered} style={pager.thumb} />
      <span {...stylex.props(pager.meta)}>
        <span {...stylex.props(pager.dir)}>
          {direction === "Next" ? "Next rule →" : "← Previous rule"}
        </span>
        <span {...stylex.props(pager.number)}>
          No.{ruleNumber(rule)} · {rule.label}
        </span>
        <span className={`t ${stylex.props(pager.title).className}`}>{rule.title}</span>
      </span>
    </a>
  );
}

type CoverProps = { rule: PublishedGuideline };

function Cover({ rule }: CoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [was, now] = rule.coverTag.split(" → ");

  function lean(event: PointerEvent<HTMLDivElement>) {
    const cover = ref.current;
    if (!cover || event.pointerType !== "mouse" || reducedMotion()) return;
    const box = cover.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    cover.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    cover.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    // The art's layers read these to slide against the lean.
    cover.style.setProperty("--px", x.toFixed(3));
    cover.style.setProperty("--py", y.toFixed(3));
  }

  function rest() {
    for (const name of ["--ry", "--rx", "--px", "--py"]) ref.current?.style.removeProperty(name);
  }

  return (
    <div
      ref={ref}
      {...stylex.props(cover.box, shell.in, shell.coverIn, shell.third)}
      onPointerMove={lean}
      onPointerLeave={rest}
    >
      <div {...stylex.props(cover.card)}>
        <div {...stylex.props(cover.sheet)}>
          <RuleThumb rule={rule} play at="cover" style={cover.thumb} />
          <div {...stylex.props(cover.tear)} />
          <div aria-hidden="true" {...stylex.props(cover.stub)}>
            <span {...stylex.props(cover.was)}>{was}</span>
            <span {...stylex.props(cover.to)}>→</span>
            <span {...stylex.props(cover.now)}>{now}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type SideKey = "bad" | "good";
const SIDES: readonly SideKey[] = ["bad", "good"];
const MARK = { bad: "✕", good: "✓" } as const;


/** How inline code reads where the kit puts it: a chip in lesson copy, a tint in a quiz prompt. */
const Tone = createContext<"plain" | "wrap" | "chip" | "prompt" | "take">("plain");

export function Code({ children, style }: { children: ReactNode; style?: stylex.StyleXStyles }) {
  const tone = useContext(Tone);
  return (
    <code
      {...stylex.props(
        tone !== "plain" && text.wrap,
        tone === "chip" && text.chip,
        tone === "prompt" && text.tint,
        tone === "take" && text.bright,
        style,
      )}
    >
      {children}
    </code>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd {...stylex.props(text.chip)}>{children}</kbd>;
}

/** A paragraph of lesson copy, for a lesson's `extra` as well as its body. */
function LessonText({
  children,
  style,
}: {
  children: ReactNode;
  style?: stylex.StyleXStyles;
}) {
  return (
    <Tone value="chip">
      <p {...stylex.props(text.lesson, style)}>{children}</p>
    </Tone>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return <LessonText style={text.tip}>{children}</LessonText>;
}

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

  return (
    <article
      ref={cardRef}
      className={`lesson ${stylex.props(lessonKit.lesson, shell.rev, stylex.defaultMarker()).className}`}
      data-rev
    >
      <div {...stylex.props(lessonKit.copy)}>
        {lesson.exception && <span {...stylex.props(lessonKit.exception)}>Exception</span>}
        <h3 {...stylex.props(lessonKit.title)}>{lesson.title}</h3>
        <LessonText>{lesson.body}</LessonText>
        <Tone value="wrap">{lesson.extra}</Tone>
      </div>
      <div
        ref={demoRef}
        data-show={side}
        style={{ "--rows": 0 }}
        {...stylex.props(lessonKit.demo)}
      >
        <div role="group" aria-label={`${lesson.title}: compare`} {...stylex.props(lessonKit.flip)}>
          {SIDES.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={side === key}
              onClick={() => {
                touched.current = true;
                setSide(key);
              }}
              {...stylex.props(lessonKit.flipKey, side === key && lessonKit[key])}
            >
              <span aria-hidden="true" {...stylex.props(lessonKit.mark)}>
                {MARK[key]}
              </span>
              {lesson[key].label}
            </button>
          ))}
        </div>
        {SIDES.map((key) => (
          <figure
            key={key}
            data-side={key}
            {...stylex.props(
              lessonKit.well,
              lessonKit.pane,
              side !== key && lessonKit.behind,
              stylex.defaultMarker(),
            )}
          >
            <figcaption {...stylex.props(lessonKit.caption, lessonKit[key])}>
              <span aria-hidden="true" {...stylex.props(lessonKit.mark)}>
                {MARK[key]}
              </span>
              <span {...stylex.props(arcade.srOnly)}>{key === "bad" ? "Avoid: " : "Do: "}</span>
              {lesson[key].label}
            </figcaption>
            {lesson[key].view}
            <div {...stylex.props(lessonKit.costs, costsStyle)}>
              {lesson[key].costs.map((cost) => (
                <span
                  key={cost}
                  {...stylex.props(lessonKit.cost, lessonKit.costIn, lessonKit[`${key}Cost`])}
                >
                  {cost}
                </span>
              ))}
            </div>
          </figure>
        ))}
      </div>
      <Hints side={side} />
    </article>
  );
}

function Hints({ side }: { side: SideKey }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState<ReadonlySet<string>>(new Set());

  useLayoutEffect(() => {
    const card = layerRef.current?.parentElement;
    const ruler = rulerRef.current;
    if (!card || !ruler) return;
    return watchHints(card, ruler, setHints);
  }, [side]);

  useEffect(() => {
    const card = layerRef.current?.parentElement;
    if (!card) return;
    return watchHintReader(
      card,
      () => setShown(true),
      (zone) => setDone((now) => (now.has(zone) ? now : new Set(now).add(zone))),
    );
  }, []);

  return (
    <div ref={layerRef} data-hint-layer aria-hidden="true" {...stylex.props(hintKit.layer)}>
      <span ref={rulerRef} {...stylex.props(hintKit.label, hintKit.ruler)}>
        Try it
      </span>
      {hints.map((hint) => (
        <Fragment key={`${hint.zone}-${hint.path}`}>
          <svg {...stylex.props(hintKit.svg, (!shown || done.has(hint.zone)) && hintKit.gone)}>
            <path
              d={hint.path}
              pathLength={1}
              {...stylex.props(hintKit.arrow, shown && hintKit.drawn)}
            />
          </svg>
          <span
            style={{ left: hint.at.x, top: hint.at.y }}
            {...stylex.props(
              hintKit.label,
              hintKit[hint.tilt],
              hint.zone === "copy" && hintKit.onPanel,
              (!shown || done.has(hint.zone)) && hintKit.gone,
            )}
          >
            Try it
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function Stars({ stars }: { stars: number | null }) {
  if (stars === null) return null;
  return (
    <span aria-label={`${stars} of 3 stars`} {...stylex.props(quizKit.stars)}>
      {[1, 2, 3].map((at) => (
        <i key={at} {...stylex.props(quizKit.star, at <= stars && quizKit.starOn)}>
          ★
        </i>
      ))}
    </span>
  );
}

type LevelProps = {
  n: number;
  level: Level;
  board: string;
};

type Drag = { x0: number; y0: number; lastX: number; lastT: number; rot: number; moved: boolean };

function LevelBoard({ n, level, board }: LevelProps) {
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
  const stars = cleared ? Math.max(1, 3 - mistakes) : null;
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
      {...stylex.props(lessonKit.panel, quizKit.level, shell.rev)}
      data-rev
      onKeyDown={onKeyDown}
    >
      <div {...stylex.props(quizKit.copy)}>
        <div {...stylex.props(quizKit.levelHead)}>
          <span {...stylex.props(quizKit.badge)}>Quiz</span>
          {cleared && <span {...stylex.props(quizKit.stamp)}>Clear</span>}
          <Stars stars={stars} />
        </div>
        <h3 {...stylex.props(quizKit.title)}>{level.name}</h3>
        <Tone value="prompt">
          <p {...stylex.props(quizKit.prompt)}>{level.prompt}</p>
        </Tone>
        <div
          aria-live="polite"
          {...stylex.props(quizKit.say, cleared ? quizKit.sayYes : said && quizKit.sayNo)}
        >
          <p
            key={said ? `${said.id}-${miss?.at ?? 0}` : "hint"}
            {...stylex.props(quizKit.said, said && quizKit.saidToned)}
          >
            {said ? said.note : `Drag the piece into the ${board}. Or tap it, then tap a spot.`}
          </p>
        </div>
      </div>

      <div {...stylex.props(lessonKit.well, quizKit.board)}>
        <ul {...stylex.props(tree.list)}>
          {level.rows.map((row, index) => {
            if (!("slot" in row)) {
              return (
                <li
                  key={index}
                  style={{ "--d": row.depth }}
                  {...stylex.props(tree.row, row.kind && tree[row.kind])}
                >
                  {row.text}
                  {row.tag && <span {...stylex.props(tree.calls)}>{row.tag}</span>}
                </li>
              );
            }
            const { slot } = row;
            const seated = placed === slot.id;
            const open = !cleared && (picked || dragging);
            const missed = miss?.id === slot.id;
            return (
              <li
                key={index}
                style={{ "--d": row.depth }}
                {...stylex.props(tree.row, row.lead ? quizKit.leadRow : null)}
              >
                {row.lead && <span {...stylex.props(quizKit.lead)}>{row.lead}</span>}
                <button
                  type="button"
                  ref={(element) => {
                    if (element) slotRefs.current.set(slot.id, element);
                    else slotRefs.current.delete(slot.id);
                  }}
                  {...stylex.props(
                    quizKit.slot,
                    row.lead ? quizKit.slotAfterLead : null,
                    open && quizKit.slotOpen,
                    near === slot.id && quizKit.slotNear,
                    missed && (open ? quizKit.slotMissOpen : quizKit.slotMiss),
                    cleared && !seated && quizKit.slotOff,
                    seated && quizKit.slotSeat,
                    stylex.defaultMarker(),
                  )}
                  disabled={!open}
                  data-off={(cleared && !seated) || undefined}
                  key={missed ? miss.at : "slot"}
                  onClick={() => drop(slot.id)}
                >
                  {seated ? (
                    <span ref={seatRef} {...stylex.props(quizKit.piece, quizKit.seated)}>
                      {level.piece}
                      <Burst />
                    </span>
                  ) : (
                    <Tone value="wrap">{slot.label}</Tone>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div {...stylex.props(quizKit.tray)}>
          {!cleared && (
            <button
              ref={pieceRef}
              type="button"
              {...stylex.props(
                quizKit.piece,
                picked && quizKit.picked,
                dragging && quizKit.dragging,
              )}
              data-dragging={dragging || undefined}
              aria-pressed={picked}
              aria-label={`${level.piece}. ${picked ? `Picked up. Choose a spot in the ${board}.` : "Pick up"}`}
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
          <span {...stylex.props(quizKit.trayNote)}>
            {cleared ? "In its place." : picked ? "Choose a spot. Esc puts it back." : "Your piece"}
          </span>
        </div>
      </div>
    </article>
  );
}

function Burst() {
  return (
    <span aria-hidden="true" {...stylex.props(quizKit.burst)}>
      {Array.from({ length: 8 }, (_, index) => (
        <i
          key={index}
          style={{ "--a": `${index * 45 + 22}deg` }}
          {...stylex.props(quizKit.spark)}
        />
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
      <button type="button" onClick={share} {...stylex.props(island.action)}>
        <ShareGlyph copied={copied} />
        <span {...stylex.props(arcade.srOnly)} aria-live="polite">
          {label}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      {...stylex.props(
        button.base,
        buttonVariant["tertiary-neutral"],
        button.sm,
        button.iconStart,
        shell.share,
        shell.in,
        shell.first,
      )}
      onClick={share}
    >
      <ShareGlyph copied={copied} />
      <span aria-live="polite" {...stylex.props(shell.shareLabel)}>
        {label}
      </span>
    </button>
  );
}

function ShareGlyph({ copied }: { copied: boolean }) {
  return (
    <span aria-hidden="true" {...stylex.props(glyphSwap.cell)}>
      <ShareNetworkIcon
        size={16}
        weight="bold"
        {...stylex.props(glyphSwap.glyph, copied ? glyphSwap.hidden : glyphSwap.shown)}
      />
      <CheckIcon
        size={16}
        weight="bold"
        {...stylex.props(glyphSwap.glyph, copied ? glyphSwap.shown : glyphSwap.hidden)}
      />
    </span>
  );
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
    <button
      type="button"
      {...stylex.props(button.base, buttonVariant["primary-brand"])}
      onClick={handleCopy}
    >
      {copied ? "Copied" : "Copy as Markdown"}
    </button>
  );
}
