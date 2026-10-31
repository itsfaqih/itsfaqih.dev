import * as stylex from "@stylexjs/stylex";
import { ArrowLeftIcon, CheckIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  createContext,
  Fragment,
  isValidElement,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useContext,
  useRef,
  useState,
} from "react";
import { IslandActivity } from "../../../components/header";
import {
  colorOf,
  PUBLISHED_GUIDELINES,
  ruleNumber,
  VISIBLE_GUIDELINES,
} from "../../../data/guidelines";
import type { PublishedGuideline } from "../../../data/guidelines";
import { heroType } from "../../-components/hero-type";
import { reticle } from "../../-components/reticle";
import { isOpeningRule, isTransitioning, RuleThumb, useRuleOpen } from "../../-components/rule-art";
import { reducedMotion } from "../../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../../theme.stylex";
import { kit, reveal } from "./rule-landing.stylex";
import { button } from "../../../components/button";
import { hoverHold } from "../../../components/hover-hold";
import { section, veil } from "../../-components/section";
import { arcade } from "../../../components/arcade";
import { Backdrop } from "../../-components/backdrop";

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
  /** Quiz levels that test this lesson, played right after it. */
  levels: [Level, ...Level[]];
};

type TreeRow = {
  depth: number;
  kind?: "dir" | "comp" | "more";
  moved?: boolean;
  tag?: string;
} & ({ k: string; text: ReactNode } | { k?: undefined; text: string });

type Slot = { id: string; label: ReactNode; note: string };
type BoardRow =
  | { depth: number; text: ReactNode; kind?: TreeRow["kind"]; tag?: string }
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
  /** What the quiz pieces go into, as in "Drag the piece into the tree". */
  board: string;
  /** What agents do with the rule in their `AGENTS.md`, as in "build buttons the same way". */
  take: string;
  /** Applied last to the row of cost tags under each lesson's panes. */
  costsStyle?: stylex.StyleXStyles;
};

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
  board,
  take,
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
  useTitleSwap(titleRef, slot);
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
            <Link to="/rule-of-thumb" {...stylex.props(shell.crumbLink)}>
              ← All rules
            </Link>
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
        <Cover rule={rule} entering={!morphed} />
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
                {...stylex.props(button.base, button.soft)}
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
                  <Link
                    to="/rule-of-thumb"
                    {...stylex.props(reticle.card, reticle.aim, pager.card, pager.all)}
                  >
                    <span {...stylex.props(pager.dir)}>That's every rule so far</span>
                    <span {...stylex.props(pager.title)}>Back to all rules →</span>
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
  const { linkProps: openRule } = useRuleOpen();

  return (
    <Link
      to={rule.href}
      preload="intent"
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
    </Link>
  );
}

type CoverProps = { rule: PublishedGuideline; entering: boolean };

function Cover({ rule, entering }: CoverProps) {
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
  }

  function rest() {
    ref.current?.style.removeProperty("--ry");
    ref.current?.style.removeProperty("--rx");
  }

  return (
    <div
      ref={ref}
      {...stylex.props(cover.box, entering && shell.in, shell.third)}
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

export const TABBED = "(max-width: 820px)";

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
export function LessonText({
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

export function Tree({ rows }: { rows: TreeRow[] }) {
  return (
    <ul {...stylex.props(tree.list, tree.inPane)}>
      {rows.map((row) => {
        const k = keyOf(row);
        return (
          <li
            key={k}
            data-k={k}
            data-moved={row.moved || undefined}
            {...stylex.props(tree.row, row.kind && tree[row.kind])}
            style={{ "--d": row.depth }}
          >
            <span {...stylex.props(row.moved && tree.moved)}>{row.text}</span>
            {row.tag && <span {...stylex.props(tree.calls)}>{row.tag}</span>}
          </li>
        );
      })}
    </ul>
  );
}

const keyOf = (row: TreeRow) => (row.k === undefined ? row.text : row.k);

const treeRows = (view: ReactNode) =>
  isValidElement<{ rows: TreeRow[] }>(view) && view.type === Tree ? view.props.rows.length : 0;

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
        style={{ "--rows": most }}
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

type Point = { x: number; y: number };
type Box = { left: number; top: number; right: number; bottom: number };
type Hint = { zone: string; at: Point; tilt: "up" | "down" | "level"; path: string };

const HINT_STEP = 10;
const HINT_CLEAR = 8;
const HINT_NEAR = 56;
const HINT_FAR = 130;
// How far a toggle in the copy sits from its label, which points at it in a straight line.
const HINT_SHORT = 26;
// A label's gap from its target's edge, and how far it steps sideways off the edge's middle, so
// every curved arrow has the same length and bend.
const HINT_GAP = 26;
const HINT_SHIFT = 14;
// The room a label keeps from words level with it, so it never reads as part of a line of text.
const HINT_BERTH = 40;
// Wider rings a label falls back to when every slot at HINT_GAP is taken.
const HINT_RINGS = [HINT_GAP, 44, 64];
// The spots a label tries round its target, in order: above right, right, their mirror images,
// level beside it, then below. `dir` is the side of the edge's middle it steps toward, and a
// level label (dir 0) points straight across.
const HINT_SLOTS = [
  { edge: "top", dir: 1 },
  { edge: "right", dir: -1 },
  { edge: "top", dir: -1 },
  { edge: "left", dir: -1 },
  { edge: "right", dir: 0 },
  { edge: "left", dir: 0 },
  { edge: "bottom", dir: 1 },
  { edge: "right", dir: 1 },
  { edge: "bottom", dir: -1 },
  { edge: "left", dir: 1 },
] as const;

function overlap(a: Box, b: Box) {
  return (
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  );
}

function area(b: Box) {
  return (b.right - b.left) * (b.bottom - b.top);
}

function holds(outer: Box, inner: Box) {
  return (
    inner.left >= outer.left &&
    inner.right <= outer.right &&
    inner.top >= outer.top &&
    inner.bottom <= outer.bottom
  );
}

/** The gap between two boxes, 0 when they touch. */
function apart(a: Box, b: Box) {
  return Math.hypot(
    Math.max(0, a.left - b.right, b.left - a.right),
    Math.max(0, a.top - b.bottom, b.top - a.bottom),
  );
}

/** Where a ray from the box's centre toward `to` leaves the box, pushed `gap` further out. */
function exit(b: Box, to: Point, gap: number): Point {
  const cx = (b.left + b.right) / 2;
  const cy = (b.top + b.bottom) / 2;
  const dx = to.x - cx;
  const dy = to.y - cy;
  const length = Math.hypot(dx, dy) || 1;
  const reach = Math.min(
    dx ? (b.right - b.left) / 2 / Math.abs(dx) : Infinity,
    dy ? (b.bottom - b.top) / 2 / Math.abs(dy) : Infinity,
  );
  return { x: cx + dx * reach + (dx / length) * gap, y: cy + dy * reach + (dy / length) * gap };
}

type Edge = (typeof HINT_SLOTS)[number]["edge"];
type Spot = { edge: Edge; dir: -1 | 0 | 1; gap: number; shift: number };
// Further steps off an edge's middle for when a neighbour blocks every slot, so the label slides
// past it along the same edge.
const HINT_REACH = [30, 48, 72, 100, 130, 160];
// Every place a label tries round its target, nearest first.
const HINT_SPOTS: Spot[] = [
  ...HINT_RINGS.flatMap((gap) =>
    HINT_SLOTS.map(({ edge, dir }) => ({ edge, dir, gap, shift: (HINT_SHIFT * gap) / HINT_GAP })),
  ),
  ...HINT_REACH.flatMap((shift) =>
    HINT_RINGS.flatMap((gap) =>
      HINT_SLOTS.filter(({ dir }) => dir !== 0).map(({ edge, dir }) => ({ edge, dir, gap, shift })),
    ),
  ),
];
type Way = { label: Box; way: ReturnType<typeof arc> };

/** Where an arrow lands on its target: just off the middle of one edge, never a corner. */
function landing(t: Box, edge: Edge): Point {
  const cx = (t.left + t.right) / 2;
  const cy = (t.top + t.bottom) / 2;
  if (edge === "top") return { x: cx, y: t.top - 6 };
  if (edge === "bottom") return { x: cx, y: t.bottom + 6 };
  if (edge === "left") return { x: t.left - 6, y: cy };
  return { x: t.right + 6, y: cy };
}

/** A `w` by `h` label at one of the HINT_SPOTS round `t`. */
function slot(t: Box, { edge, dir, gap, shift }: Spot, w: number, h: number): Box {
  const cx = (t.left + t.right) / 2;
  const cy = (t.top + t.bottom) / 2;
  if (edge === "top" || edge === "bottom") {
    const left = dir > 0 ? cx + shift : cx - shift - w;
    const top = edge === "top" ? t.top - gap - h : t.bottom + gap;
    return { left, right: left + w, top, bottom: top + h };
  }
  const left = edge === "right" ? t.right + gap : t.left - gap - w;
  const top = dir === 0 ? cy - h / 2 : dir > 0 ? cy + shift : cy - shift - h;
  return { left, right: left + w, top, bottom: top + h };
}

/** How far an arc bows out past the edge it lands on, rather than back across the target. */
const OUTWARD: Record<Edge, (way: ReturnType<typeof arc>) => number> = {
  top: (way) => -way.ny,
  bottom: (way) => way.ny,
  left: (way) => -way.nx,
  right: (way) => way.nx,
};

const EDGES = ["top", "bottom", "left", "right"] as const;

/**
 * A hand-drawn arc from the label to `end`, bowed to one side by `bow` (-1 to 1, straight at 0),
 * with its head.
 */
function arc(label: Box, end: Point, bow: number) {
  const start = exit(label, end, 6);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const nx = -dy * 0.32 * bow;
  const ny = dx * 0.32 * bow;
  const c1 = { x: start.x + dx * 0.2 + nx, y: start.y + dy * 0.2 + ny };
  const c2 = { x: start.x + dx * 0.72 + nx * 0.55, y: start.y + dy * 0.72 + ny * 0.55 };
  const along = Array.from({ length: 29 }, (_, i) => {
    const t = (i + 1) / 30;
    const u = 1 - t;
    return {
      x: u ** 3 * start.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * end.x,
      y: u ** 3 * start.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * end.y,
    };
  });
  return { start, c1, c2, end, wings: wings(c2, end), along, nx, ny };
}

/** The two strokes of an arrowhead at `end`, for a line arriving from `from`. */
function wings(from: Point, end: Point) {
  const length = Math.hypot(end.x - from.x, end.y - from.y) || 1;
  const ux = (end.x - from.x) / length;
  const uy = (end.y - from.y) / length;
  const wing = (turn: number) => ({
    x: end.x - (ux * Math.cos(turn) - uy * Math.sin(turn)) * 8,
    y: end.y - (ux * Math.sin(turn) + uy * Math.cos(turn)) * 8,
  });
  return [wing(0.5), wing(-0.5)] as const;
}

/** Spots right beside a target, nearest side first, for a label with a short straight arrow. */
function beside(t: Box, w: number, h: number): Box[] {
  const cx = (t.left + t.right) / 2;
  const cy = (t.top + t.bottom) / 2;
  return [
    {
      left: t.right + HINT_SHORT,
      right: t.right + HINT_SHORT + w,
      top: cy - h / 2,
      bottom: cy + h / 2,
    },
    {
      left: t.left - HINT_SHORT - w,
      right: t.left - HINT_SHORT,
      top: cy - h / 2,
      bottom: cy + h / 2,
    },
    {
      left: cx - w / 2,
      right: cx + w / 2,
      top: t.bottom + HINT_SHORT,
      bottom: t.bottom + HINT_SHORT + h,
    },
    {
      left: cx - w / 2,
      right: cx + w / 2,
      top: t.top - HINT_SHORT - h,
      bottom: t.top - HINT_SHORT,
    },
  ];
}

/** Which cells of the room any box covers, summed so a rectangle's coverage costs one lookup. */
function raster(room: Box, boxes: Box[]) {
  const cell = 4;
  const cols = Math.ceil((room.right - room.left) / cell);
  const rows = Math.ceil((room.bottom - room.top) / cell);
  const col = (x: number) => Math.min(cols, Math.max(0, Math.round((x - room.left) / cell)));
  const row = (y: number) => Math.min(rows, Math.max(0, Math.round((y - room.top) / cell)));
  const hit = new Uint8Array(cols * rows);
  for (const b of boxes) {
    for (let r = row(b.top); r < row(b.bottom); r++)
      hit.fill(1, r * cols + col(b.left), r * cols + col(b.right));
  }
  const sum = new Uint32Array((cols + 1) * (rows + 1));
  for (let r = 0; r < rows; r++) {
    let line = 0;
    for (let c = 0; c < cols; c++) {
      line += hit[r * cols + c] ?? 0;
      sum[(r + 1) * (cols + 1) + c + 1] = (sum[r * (cols + 1) + c + 1] ?? 0) + line;
    }
  }
  const at = (r: number, c: number) => sum[r * (cols + 1) + c] ?? 0;
  return {
    covers: (b: Box) => {
      const [c0, c1, r0, r1] = [col(b.left), col(b.right), row(b.top), row(b.bottom)];
      return (at(r1, c1) - at(r0, c1) - at(r1, c0) + at(r0, c0)) * cell * cell;
    },
    has: (p: Point) => {
      const c = Math.floor((p.x - room.left) / cell);
      const r = Math.floor((p.y - room.top) / cell);
      return c >= 0 && c < cols && r >= 0 && r < rows && hit[r * cols + c] === 1;
    },
  };
}

type Mark = {
  e: Element;
  box: Box;
  kind: "content" | "surface" | "leaf" | "frame";
  glyphs?: true;
};

/**
 * Sort what's on screen in the card: content (text, controls, icons) a hint must never cover,
 * surfaces (cards, panels) it covers only when they're big enough to be a backdrop, bare leaves
 * that count only when small, and frames that don't count.
 */
function survey(things: Element[]): Mark[] {
  return things.flatMap<Mark>((e) => {
    const box = e.getBoundingClientRect();
    // A screen-reader-only box is 1px, though its text still measures full width.
    if (box.width <= 1 || box.height <= 1 || e.matches("col, colgroup")) return [];
    if (e.matches("button, input, select, textarea, svg")) return [{ e, box, kind: "content" }];
    const look = getComputedStyle(e);
    const surface =
      !/^(transparent|rgba\(0, 0, 0, 0\))$|\/ 0\)$/.test(look.backgroundColor) ||
      parseFloat(look.borderTopWidth) + parseFloat(look.borderBottomWidth) > 0 ||
      look.boxShadow !== "none";
    const words = [...e.childNodes].filter(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
    );
    const cell = e.matches("td, th");
    if (words.length && surface && !cell) return [{ e, box, kind: "content" }];
    // Bare text, and text in a table cell, counts only where its glyphs are, so a wide cell keeps
    // its empty space.
    if (words.length) {
      const range = document.createRange();
      const glyphs = words.flatMap((n) => {
        range.selectNodeContents(n);
        const r = range.getBoundingClientRect();
        return r.width ? [{ e, box: r, kind: "content" as const, glyphs: true as const }] : [];
      });
      return surface ? [...glyphs, { e, box, kind: "surface" }] : glyphs;
    }
    return [{ e, box, kind: surface ? "surface" : e.childElementCount === 0 ? "leaf" : "frame" }];
  });
}

/**
 * An arrow to every `[data-hint]` in the card, so readers know the demo takes input. A toggle in
 * the copy gets a short straight one from right beside it. Anything else gets a short curve from
 * the first clear spot in HINT_SPOTS, landing on the middle of an edge, so every pane reads the
 * same. Only when no spot is clear does the label search the pane for empty space. Each fades
 * once the reader touches the pane it points into.
 */
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
    const place = () => {
      const box = card.getBoundingClientRect();
      const w = ruler.offsetWidth;
      const h = ruler.offsetHeight;
      const figures = [...card.querySelectorAll<HTMLElement>("figure[data-side]")];
      const hidden = figures.filter((f) => getComputedStyle(f).visibility === "hidden");
      const marks = survey(
        [...card.querySelectorAll("*")].filter(
          (e) => !e.closest("svg *, [data-hint-layer]") && !hidden.some((f) => f.contains(e)),
        ),
      );
      const next: Hint[] = [];
      const x = (p: Point) => `${(p.x - box.left).toFixed(1)} ${(p.y - box.top).toFixed(1)}`;
      const pad = (b: Box) => ({
        left: b.left - HINT_CLEAR,
        right: b.right + HINT_CLEAR,
        top: b.top - HINT_CLEAR,
        bottom: b.bottom + HINT_CLEAR,
      });
      const curved: {
        zone: string;
        t: Box;
        fits: (spot: Spot, snug: boolean) => Way | undefined;
        roam: () => Way | undefined;
      }[] = [];
      for (const target of card.querySelectorAll<HTMLElement>("[data-hint]")) {
        const figure = target.closest<HTMLElement>("figure[data-side]");
        if (figure && hidden.includes(figure)) continue;
        resized.observe(target);
        const t = target.getBoundingClientRect();
        if (t.width === 0) continue;
        const zone = (figure ?? card).getBoundingClientRect();
        const solid: Box[] = [];
        const backdrops: Box[] = [];
        const firm: Box[] = [];
        const sheets: Box[] = [];
        for (const { e, box: r, kind } of marks) {
          if (kind === "frame" || target.contains(e)) continue;
          const big = area(r) >= area(zone) * 0.4;
          if (kind === "content" || !big) solid.push(r);
          else if (kind === "surface") backdrops.push(r);
          if (kind === "surface") sheets.push(r);
          else if (kind === "content" || !big) firm.push(r);
        }
        for (const other of figures)
          if (other !== figure && !hidden.includes(other)) {
            solid.push(other.getBoundingClientRect());
            firm.push(other.getBoundingClientRect());
          }
        const covered = raster(box, [...solid, t]);
        const near = figure
          ? undefined
          : beside(t, w, h).find((b) => holds(box, pad(b)) && covered.covers(pad(b)) === 0);
        if (near) {
          const mid = { x: (near.left + near.right) / 2, y: (near.top + near.bottom) / 2 };
          const start = exit(near, { x: (t.left + t.right) / 2, y: (t.top + t.bottom) / 2 }, 4);
          const end = exit(t, mid, 5);
          const [a, b] = wings(start, end);
          next.push({
            zone: "copy",
            at: { x: mid.x - box.left, y: mid.y - box.top },
            tilt: "level",
            path: `M${x(start)} L${x(end)} M${x(a)} L${x(end)} L${x(b)}`,
          });
          continue;
        }
        const crossed = raster(box, [...solid.filter((r) => !holds(r, t)), t]);
        const blocked = raster(box, [...firm, t]);
        const words = raster(
          box,
          marks.filter((m) => m.glyphs && !target.contains(m.e)).map((m) => m.box),
        );
        const threaded = raster(box, [...firm.filter((r) => !holds(r, t)), t]);
        const cells = [...(figure ?? card).querySelectorAll("td, th")].map((e) =>
          e.getBoundingClientRect(),
        );
        // A label in a slot may sit on a card or off it, never across its edge. It sits in a table's
        // cells only when `snug`, as nothing else fits.
        const fits = (spot: Spot, snug: boolean) => {
          const { edge, dir } = spot;
          const label = slot(t, spot, w, h);
          const clear = pad(label);
          const level = {
            ...label,
            left: label.left - HINT_BERTH,
            right: label.right + HINT_BERTH,
          };
          const sits =
            holds(zone, clear) &&
            blocked.covers(clear) === 0 &&
            words.covers(level) === 0 &&
            (snug || cells.every((r) => overlap(label, r) === 0)) &&
            sheets.every((r) => {
              const o = overlap(label, r);
              return o === 0 || o === area(label);
            });
          if (!sits) return undefined;
          const end = landing(t, edge);
          // A full bend first, away from the target, then half a bend when a neighbour sits close.
          const way = (
            dir === 0
              ? [[0]]
              : [
                  [1, -1],
                  [0.5, -0.5],
                ]
          )
            .flatMap((bows) =>
              bows
                .map((bow) => arc(label, end, bow))
                .sort((a, b) => OUTWARD[edge](b) - OUTWARD[edge](a)),
            )
            .find((way) => !way.along.some(threaded.has));
          return way && { label, way };
        };
        const roam = () => {
          const spots: { label: Box; cost: number }[] = [];
          for (
            let y = box.top + h / 2 + HINT_CLEAR;
            y <= box.bottom - h / 2 - HINT_CLEAR;
            y += HINT_STEP
          ) {
            for (
              let x = box.left + w / 2 + HINT_CLEAR;
              x <= box.right - w / 2 - HINT_CLEAR;
              x += HINT_STEP
            ) {
              const label = {
                left: x - w / 2,
                right: x + w / 2,
                top: y - h / 2,
                bottom: y + h / 2,
              };
              const clear = pad(label);
              const gap = apart(label, t);
              let cost =
                (holds(zone, clear) ? 0 : 5000) +
                Math.max(0, HINT_NEAR - gap) * 4 +
                Math.max(0, gap - HINT_FAR) * 4 +
                covered.covers(clear) * 100 +
                words.covers({
                  ...label,
                  left: label.left - HINT_BERTH,
                  right: label.right + HINT_BERTH,
                }) *
                  20;
              for (const r of backdrops) {
                const o = overlap(clear, r);
                cost += Math.min(o, area(clear) - o) * 100;
              }
              spots.push({ label, cost });
            }
          }
          spots.sort((a, b) => a.cost - b.cost);
          return spots
            .filter((spot, i, all) => i < 1500 && spot.cost < (all[0]?.cost ?? 0) + 600)
            .flatMap(({ label, cost }) =>
              EDGES.flatMap((edge) =>
                ([1, -1] as const).map((bow) => {
                  const way = arc(label, landing(t, edge), bow);
                  const hits = way.along.filter(
                    (p) =>
                      crossed.has(p) ||
                      !holds(zone, { left: p.x, right: p.x, top: p.y, bottom: p.y }),
                  ).length;
                  return { label, way, cost: cost + hits * 500 + (way.ny > 0 ? 1 : 0) };
                }),
              ),
            )
            .reduce<(Way & { cost: number }) | undefined>(
              (a, b) => (a && a.cost <= b.cost ? a : b),
              undefined,
            );
        };
        curved.push({ zone: figure?.dataset.side ?? "copy", t, fits, roam });
      }
      // Both panes of a demo take the same slot when one suits them all, so they read alike.
      const tries = [false, true].flatMap((snug) =>
        HINT_SPOTS.map((spot) => [spot, snug] as const),
      );
      const shared = tries.find((at) => curved.every((c) => c.fits(...at)));
      for (const { zone, t, fits, roam } of curved) {
        const pick =
          (shared && fits(...shared)) ?? tries.map((at) => fits(...at)).find(Boolean) ?? roam();
        if (!pick) continue;
        const { label, way } = pick;
        const cx = (label.left + label.right) / 2;
        next.push({
          zone,
          at: { x: cx - box.left, y: (label.top + label.bottom) / 2 - box.top },
          tilt: cx < t.left + (t.right - t.left) / 2 ? "down" : "up",
          path: `M${x(way.start)} C${x(way.c1)} ${x(way.c2)} ${x(way.end)} M${x(way.wings[0])} L${x(way.end)} L${x(way.wings[1])}`,
        });
      }
      setHints(next);
    };
    // Measuring is costly, so a card measures only near the screen, and never while a page
    // transition plays: that work would hold the old page frozen or drop the dive's frames.
    let near = false;
    let frame = 0;
    const soon = () => {
      cancelAnimationFrame(frame);
      if (!near) return;
      const settle = () => {
        frame = requestAnimationFrame(isTransitioning() ? settle : place);
      };
      settle();
    };
    const resized = new ResizeObserver(soon);
    // Demos below the fold can mount their controls late, so measure again on the way in.
    const entered = new IntersectionObserver(
      ([entry]) => {
        near = entry?.isIntersecting ?? false;
        soon();
      },
      { rootMargin: "50% 0px" },
    );
    resized.observe(card);
    entered.observe(card);
    void document.fonts.ready.then(soon);
    return () => {
      resized.disconnect();
      entered.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [side]);

  useEffect(() => {
    const card = layerRef.current?.parentElement;
    if (!card) return;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        seen.disconnect();
        setShown(true);
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    seen.observe(card);
    const touch = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const zone =
        event.target.closest<HTMLElement>("figure[data-side]")?.dataset.side ??
        (event.target.closest("[data-hint]") ? "copy" : null);
      if (zone) setDone((now) => (now.has(zone) ? now : new Set(now).add(zone)));
    };
    const kinds = ["pointerdown", "keydown", "input"] as const;
    for (const kind of kinds) card.addEventListener(kind, touch, true);
    return () => {
      seen.disconnect();
      for (const kind of kinds) card.removeEventListener(kind, touch, true);
    };
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
      <button type="button" onClick={share} {...stylex.props(styles.action)}>
        {copied ? (
          <CheckIcon size={16} weight="bold" aria-hidden="true" />
        ) : (
          <ShareNetworkIcon size={16} weight="bold" aria-hidden="true" />
        )}
        <span {...stylex.props(arcade.srOnly)} aria-live="polite">
          {label}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      {...stylex.props(button.base, button.soft, button.sm, shell.share, shell.in, shell.first)}
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
      // The root's break-word would split a long word instead of letting it overflow, hiding it here.
      title.style.overflowWrap = "normal";
      const width = title.scrollWidth;
      title.style.removeProperty("overflow-wrap");
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

// The island trades the page's tags for its title once the heading has scrolled out of view.
function useTitleSwap(titleRef: RefObject<HTMLElement | null>, slot: HTMLElement | null) {
  useEffect(() => {
    const title = titleRef.current;
    const label = slot?.parentElement;
    if (!title || !label) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry)
        label.toggleAttribute(
          "data-swap",
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        );
    });
    observer.observe(title);
    return () => {
      observer.disconnect();
      label.removeAttribute("data-swap");
    };
  }, [titleRef, slot]);
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
    <button type="button" {...stylex.props(button.base, button.go)} onClick={handleCopy}>
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

const said = stylex.keyframes({ from: { opacity: 0, translate: "0 6px" } });
const stamp = stylex.keyframes({ from: { opacity: 0, scale: 0.6, rotate: "-12deg" } });
const shake = stylex.keyframes({
  "20%": { translate: "-6px 0" },
  "40%": { translate: "6px 0" },
  "60%": { translate: "-4px 0" },
  "80%": { translate: "4px 0" },
});
const burst = stylex.keyframes({
  from: { transform: "translate(18px) scale(1)", opacity: 1 },
  to: { transform: "translate(64px) scale(0)", opacity: 0 },
});

const STACKED = "@media (max-width: 960px)";
const PHONE = "@media (max-width: 640px)";
const TINY = "@media (max-width: 400px)";
const COMPACT = ':is(:root:has(.arc-bar[data-mode="compact"]) *)';
// Only the page being opened: when a pager card opens the next rule, the old page holds the card.
const RULE_OPEN = ":is(html:active-view-transition-type(rule-open):not(:has([data-opening])) *)";
const NARROW = "@media (max-width: 480px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";

const shell = stylex.create({
  root: {
    "--c-ink": `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
    "--key-c": "color-mix(in oklab, var(--c) 60%, #000)",
    position: "relative",
    isolation: "isolate",
    overflowWrap: "break-word",
  },
  // Off while the header is compact: the island carries the way back then.
  crumbRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: { default: "16px", [TINY]: "6px" },
    gridColumn: "1 / -1",
    justifySelf: "stretch",
    // Stacked, the rows' gap opens for the cover; the crumbs keep closer to the title.
    marginBottom: { default: 0, [STACKED]: "-16px" },
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
    "::before": { display: "none" },
  },
  crumbLink: {
    userSelect: "none",
    marginBlock: "-12px",
    paddingBlock: "12px",
    color: {
      default: null,
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
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
    gridTemplateColumns: {
      default: "minmax(0, 1.15fr) minmax(0, 1fr)",
      [STACKED]: "minmax(0, 1fr)",
    },
    gridTemplateRows: { default: "auto 1fr", [STACKED]: "auto" },
    columnGap: "56px",
    rowGap: { default: "24px", [STACKED]: "40px" },
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
  },
  // useTitleFit caps the size with --fit.
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
      [stylex.when.ancestor("[data-rev-on]", reveal)]:
        `opacity ${motion["--t-panel"]} ${motion["--out"]}, translate ${motion["--t-panel"]} ${motion["--out"]}`,
    },
  },
});

const TAB = `@media ${TABBED}`;
const PAIRED = "@media (max-width: 860px)";
const BAD_PANE = ':is([data-side="bad"])';

const text = stylex.create({
  wrap: {
    display: "inline-block",
    maxWidth: "100%",
    overflowWrap: "anywhere",
  },
  chip: {
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "6px",
    backgroundColor: palette["--soft-key"],
    boxShadow: `0 2px 0 ${palette["--soft-key-drop"]}`,
    fontWeight: 600,
    fontSize: "0.86em",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  },
  tint: {
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "6px",
    backgroundColor: palette["--soft-key"],
    fontSize: "0.86em",
    color: palette["--text"],
  },
  bright: {
    color: palette["--text"],
  },
  lesson: {
    maxWidth: "62ch",
    fontSize: "16px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  },
  tip: {
    paddingBlock: "10px",
    paddingInline: "14px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
    fontSize: "14px",
  },
});

const HINT_BLUE = `color-mix(in oklab, ${palette["--cw"]} ${palette["--ink-mix"]}, #000)`;

const hintKit = stylex.create({
  layer: {
    position: "absolute",
    inset: 0,
    zIndex: 3,
    pointerEvents: "none",
  },
  svg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "visible",
    transition: `opacity 220ms ease`,
  },
  arrow: {
    fill: "none",
    stroke: HINT_BLUE,
    strokeWidth: 2.25,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeDasharray: 1,
    strokeDashoffset: { default: 1, [REDUCE]: 0 },
    transition: { default: `stroke-dashoffset 700ms ${OUT} 250ms`, [REDUCE]: "none" },
  },
  drawn: {
    strokeDashoffset: 0,
  },
  label: {
    position: "absolute",
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    whiteSpace: "nowrap",
    color: HINT_BLUE,
    textShadow: `0 0 3px ${kit["--code-bg"]}, 0 0 3px ${kit["--code-bg"]}`,
    transition: { default: `opacity 260ms ease 120ms`, [REDUCE]: "none" },
  },
  ruler: {
    visibility: "hidden",
  },
  up: {
    transform: "translate(-50%, -50%) rotate(-4deg)",
  },
  down: {
    transform: "translate(-50%, -50%) rotate(4deg)",
  },
  level: {
    transform: "translate(-50%, -50%)",
  },
  onPanel: {
    textShadow: `0 0 3px ${palette["--panel"]}, 0 0 3px ${palette["--panel"]}`,
  },
  gone: {
    opacity: 0,
  },
});

const lessonKit = stylex.create({
  section: {
    paddingTop: "64px",
    paddingBottom: 0,
    scrollMarginTop: "8px",
  },
  secHead: {
    display: "grid",
    gap: "14px",
    marginBottom: "48px",
  },
  headItem: {
    justifySelf: "start",
  },
  secTitle: {
    fontWeight: 900,
    fontSize: "clamp(32px, 4vw, 52px)",
    lineHeight: 1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.04em",
  },
  secText: {
    maxWidth: "60ch",
    fontSize: "17px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  },
  lessons: {
    display: "grid",
    gap: "24px",
  },
  lesson: {
    position: "relative",
    display: "grid",
    gap: "28px",
    paddingTop: { default: "32px", [PHONE]: "20px" },
    paddingRight: { default: "32px", [PHONE]: "20px" },
    paddingBottom: { default: "32px", [PHONE]: "20px" },
    paddingLeft: { default: "36px", [PHONE]: "20px" },
    borderRadius: "20px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 6px 0 ${palette["--drop-ink"]}`,
  },
  copy: {
    display: "grid",
    gap: "12px",
    justifyItems: "start",
  },
  exception: {
    paddingBlock: "3px",
    paddingInline: "8px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--c-ink)",
    borderRadius: "6px",
    fontWeight: 900,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--c-ink)",
    rotate: "-3deg",
  },
  title: {
    color: palette["--text"],
    fontWeight: 900,
    fontSize: { default: "28px", [PHONE]: "24px" },
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
  },
  demo: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr) minmax(0, 1fr)", [TAB]: "minmax(0, 1fr)" },
    gap: { default: "16px", [TAB]: "12px" },
  },
  well: {
    borderRadius: "14px",
    backgroundColor: kit["--code-bg"],
    boxShadow: palette["--sink"],
  },
  pane: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: { default: "auto 1fr auto", [TAB]: "1fr auto" },
    gridArea: { default: null, [TAB]: "2 / 1" },
    gap: "16px",
    paddingTop: { default: "16px", [PHONE]: "14px" },
    paddingRight: { default: "18px", [PHONE]: "12px" },
    paddingBottom: { default: "18px", [PHONE]: "14px" },
    paddingLeft: { default: "18px", [PHONE]: "12px" },
  },
  behind: {
    visibility: { default: null, [TAB]: "hidden" },
  },
  caption: {
    display: { default: "inline-flex", [TAB]: "none" },
    justifySelf: "start",
    alignItems: "center",
    gap: "6px",
    minHeight: "34px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderRadius: "9px",
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  mark: {
    fontSize: "11px",
  },
  bad: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 16%, transparent)`,
    backgroundPosition: "initial",
    color: kit["--no-ink"],
  },
  good: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    backgroundPosition: "initial",
    color: kit["--yes-ink"],
  },
  flip: {
    display: { default: "none", [TAB]: "inline-flex" },
    justifySelf: "start",
    maxWidth: "100%",
    gap: "4px",
    padding: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
  },
  // `background: transparent` minifies to a 0 0 position; the pressed key's background resets it.
  flipKey: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    minWidth: { default: null, [PHONE]: 0 },
    minHeight: "34px",
    paddingBlock: { default: 0, [PHONE]: "6px" },
    paddingInline: { default: "12px", [PHONE]: "10px" },
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "9px",
    backgroundColor: "transparent",
    backgroundPosition: "0 0",
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
    whiteSpace: { default: "nowrap", [PHONE]: "normal" },
    textWrap: { default: null, [PHONE]: "balance" },
    cursor: cursors["--cursor-point"],
    transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease`,
  },
  costs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  cost: {
    paddingBlock: "3px",
    paddingInline: "8px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
  },
  costIn: {
    animationName: { default: null, [TAB]: { default: said, [REDUCE]: "none" } },
    animationDuration: { default: null, [TAB]: "200ms" },
    animationTimingFunction: { default: null, [TAB]: motion["--out"] },
  },
  badCost: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 16%, transparent)`,
    color: kit["--no-ink"],
  },
  goodCost: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  sheetWrap: {
    display: "grid",
    gap: "20px",
    marginTop: "72px",
  },
  sheetTitle: {
    color: palette["--text"],
    fontWeight: 900,
    fontSize: { default: "28px", [PHONE]: "24px" },
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
  },
  panel: {
    borderRadius: "20px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 6px 0 ${palette["--drop-ink"]}`,
  },
  sheet: {
    display: "grid",
    padding: "8px",
  },
  sheetRow: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) minmax(0, 1.2fr)",
      [PAIRED]: "minmax(0, 1fr)",
    },
    gap: { default: "24px", [PAIRED]: "4px" },
    alignItems: "baseline",
    paddingBlock: "16px",
    paddingInline: "18px",
    borderTopWidth: { default: null, ":not(:first-child)": "1px" },
    borderTopStyle: { default: null, ":not(:first-child)": "solid" },
    borderTopColor: { default: null, ":not(:first-child)": palette["--hair"] },
    textWrap: "pretty",
  },
  situation: {
    color: palette["--dim"],
  },
  answer: {
    fontWeight: 700,
    fontSize: "17px",
    lineHeight: 1.35,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.015em",
    color: palette["--text"],
  },
});

const tree = stylex.create({
  list: {
    display: "grid",
    gap: "4px",
    fontSize: "13px",
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
  },
  inPane: {
    alignContent: "start",
    minHeight: { default: null, [TAB]: "calc(var(--rows) * 32px)" },
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "28px",
    paddingLeft: { default: "calc(var(--d) * 20px)", [PHONE]: "calc(var(--d) * 14px)" },
    color: palette["--text"],
    textWrap: "pretty",
  },
  dir: { color: palette["--dim"] },
  comp: { color: "var(--c-ink)" },
  more: { color: palette["--mute"] },
  moved: {
    paddingBlock: "3px",
    paddingInline: "10px",
    borderRadius: "8px",
    backgroundColor: {
      default: "var(--c)",
      [stylex.when.ancestor(BAD_PANE)]:
        `color-mix(in srgb, ${kit["--no"]} 22%, ${palette["--panel-2"]})`,
    },
    boxShadow: {
      default: "0 3px 0 var(--key-c)",
      [stylex.when.ancestor(BAD_PANE)]:
        `0 3px 0 color-mix(in srgb, ${kit["--no"]} 40%, ${palette["--drop-ink"]})`,
    },
    fontWeight: 600,
    color: {
      default: "var(--on-c)",
      [stylex.when.ancestor(BAD_PANE)]: kit["--no-ink"],
    },
  },
  calls: {
    paddingBlock: "2px",
    paddingInline: "6px",
    borderRadius: "5px",
    backgroundColor: "color-mix(in srgb, var(--c) 18%, transparent)",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--c-ink)",
    whiteSpace: "nowrap",
  },
});

const ON = "var(--c)";
const ON_TINT = "color-mix(in srgb, var(--c) 16%, transparent)";

const quizKit = stylex.create({
  stars: {
    display: "inline-flex",
    gap: "1px",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  star: {
    fontStyle: "normal",
    color: palette["--hair"],
  },
  starOn: {
    color: "var(--c-ink)",
  },
  level: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 0.92fr) minmax(0, 1.08fr)",
      [PAIRED]: "minmax(0, 1fr)",
    },
    gap: { default: "32px", [PAIRED]: "24px" },
    paddingTop: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    paddingRight: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    paddingBottom: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    paddingLeft: { default: "28px", [PAIRED]: "22px", [PHONE]: "18px" },
    scrollMarginTop: "24px",
  },
  copy: {
    display: "grid",
    gap: "14px",
    alignContent: "start",
  },
  levelHead: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    minHeight: "28px",
  },
  badge: {
    paddingBlock: "5px",
    paddingInline: "9px",
    borderRadius: "8px",
    backgroundColor: ON,
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--on-c)",
  },
  stamp: {
    paddingBlock: "3px",
    paddingInline: "8px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: kit["--yes-ink"],
    borderRadius: "6px",
    fontWeight: 900,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: kit["--yes-ink"],
    rotate: "-4deg",
    animationName: { default: stamp, [REDUCE]: "none" },
    animationDuration: { default: motion["--t-pop"], [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--snap"], [REDUCE]: "ease" },
  },
  title: {
    color: palette["--text"],
    fontWeight: 900,
    fontSize: { default: "26px", [PHONE]: "22px" },
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    textWrap: "pretty",
  },
  prompt: {
    maxWidth: "42ch",
    fontSize: "17px",
    lineHeight: 1.6,
    color: palette["--dim"],
    textWrap: "pretty",
  },
  say: {
    display: "grid",
    gap: "10px",
    alignContent: "start",
    minHeight: "84px",
    marginTop: "4px",
    paddingBlock: "14px",
    paddingInline: "16px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
  },
  sayNo: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 16%, transparent)`,
    color: kit["--no-ink"],
  },
  sayYes: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  said: {
    fontSize: "15px",
    lineHeight: 1.5,
    color: palette["--dim"],
    textWrap: "pretty",
    animationName: { default: said, [REDUCE]: "none" },
    animationDuration: { default: "150ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--out"], [REDUCE]: "ease" },
  },
  saidToned: {
    color: "inherit",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "14px",
    alignContent: "start",
    padding: { default: "18px", [PHONE]: "14px" },
  },
  leadRow: {
    flexWrap: "wrap",
  },
  lead: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    color: palette["--dim"],
  },
  // `background: transparent` minifies to a 0 0 position; each tinted state's background resets it.
  slot: {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    alignItems: "center",
    minWidth: 0,
    minHeight: "36px",
    paddingBlock: "6px",
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "10px",
    backgroundColor: "transparent",
    backgroundPosition: "0 0",
    font: "inherit",
    color: palette["--mute"],
    textAlign: "left",
    overflowWrap: "anywhere",
    textWrap: "pretty",
    transition: `border-color ${kit["--t-fb"]} ease, background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease, opacity ${kit["--t-fb"]} ease, transform ${kit["--t-fb"]} ${motion["--out"]}`,
  },
  slotAfterLead: {
    flexBasis: "7em",
  },
  slotOpen: {
    borderStyle: {
      default: "dashed",
      ":focus-visible": "solid",
      ":hover": { default: null, [HOVER]: "solid" },
    },
    borderColor: {
      default: `color-mix(in srgb, ${ON} 60%, transparent)`,
      ":focus-visible": ON,
      ":hover": { default: null, [HOVER]: ON },
    },
    backgroundColor: {
      default: `color-mix(in srgb, ${ON} 6%, transparent)`,
      ":focus-visible": ON_TINT,
      ":hover": { default: null, [HOVER]: ON_TINT },
    },
    backgroundPosition: "initial",
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    transform: {
      default: null,
      ":focus-visible": { default: "scale(1.03)", [REDUCE]: "none" },
    },
  },
  slotNear: {
    borderStyle: "solid",
    borderColor: ON,
    backgroundColor: ON_TINT,
    backgroundPosition: "initial",
    transform: { default: "scale(1.03)", [REDUCE]: "none" },
  },
  slotMiss: {
    borderColor: kit["--no"],
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 10%, transparent)`,
    backgroundPosition: "initial",
    color: kit["--no-ink"],
    animationName: { default: shake, [REDUCE]: "none" },
    animationDuration: { default: "320ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--cut"], [REDUCE]: "ease" },
  },
  // A missed slot that takes the piece again: hover and focus still outrank the miss tint.
  slotMissOpen: {
    borderColor: {
      default: kit["--no"],
      ":focus-visible": ON,
      ":hover": { default: null, [HOVER]: ON },
    },
    backgroundColor: {
      default: `color-mix(in srgb, ${kit["--no"]} 10%, transparent)`,
      ":focus-visible": ON_TINT,
      ":hover": { default: null, [HOVER]: ON_TINT },
    },
    backgroundPosition: "initial",
    color: kit["--no-ink"],
    animationName: { default: shake, [REDUCE]: "none" },
    animationDuration: { default: "320ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--cut"], [REDUCE]: "ease" },
  },
  slotOff: {
    borderColor: "transparent",
    opacity: 0.4,
    textDecoration: "line-through",
  },
  slotSeat: {
    paddingBlock: "4px",
    paddingInline: "4px",
    borderStyle: "solid",
    borderColor: kit["--yes-ink"],
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 10%, transparent)`,
    backgroundPosition: "initial",
  },
  tray: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "14px",
    alignItems: "center",
    minHeight: "60px",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "12px",
  },
  trayNote: {
    fontSize: "13px",
    color: palette["--mute"],
  },
  piece: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    height: { default: "38px", [PHONE]: "auto" },
    minHeight: { default: null, [PHONE]: "38px" },
    maxWidth: { default: null, [PHONE]: "100%" },
    paddingBlock: 0,
    paddingInline: "14px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "10px",
    backgroundColor: ON,
    boxShadow: "0 4px 0 var(--key-c)",
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: "var(--on-c)",
    whiteSpace: { default: "nowrap", [PHONE]: "normal" },
    cursor: cursors["--cursor-grab"],
    touchAction: "none",
    userSelect: "none",
    transition: `box-shadow ${kit["--t-fb"]} ${motion["--out"]}, translate ${kit["--t-fb"]} ${motion["--out"]}`,
  },
  picked: {
    translate: "0 -4px",
    boxShadow: `0 8px 0 var(--key-c), 0 14px 28px ${palette["--lift"]}`,
  },
  dragging: {
    zIndex: 30,
    boxShadow: `0 10px 0 var(--key-c), 0 20px 36px ${palette["--lift"]}`,
    cursor: cursors["--cursor-grabbing"],
  },
  seated: {
    height: "30px",
    paddingInline: "12px",
    fontSize: "13px",
    boxShadow: "0 3px 0 var(--key-c)",
    cursor: "inherit",
  },
  burst: {
    position: "absolute",
    top: "50%",
    left: "50%",
    pointerEvents: "none",
  },
  spark: {
    position: "absolute",
    width: "6px",
    height: "6px",
    margin: "-3px",
    backgroundColor: ON,
    rotate: "var(--a)",
    animationName: burst,
    animationDuration: "600ms",
    animationDelay: "300ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "both",
  },
});

const takeKit = stylex.create({
  section: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) minmax(0, 1.1fr)",
      [PAIRED]: "minmax(0, 1fr)",
    },
    gap: "40px",
    alignItems: "center",
    paddingTop: { default: "128px", [PHONE]: "88px" },
    paddingBottom: { default: "160px", [PHONE]: "96px" },
  },
  copy: {
    display: "grid",
    gap: "16px",
  },
  title: {
    fontWeight: 900,
    fontSize: { default: "40px", [PHONE]: "30px" },
    lineHeight: 1.05,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.035em",
    textWrap: "balance",
  },
  text: {
    marginBottom: "8px",
    textWrap: "pretty",
  },
  acts: {
    rowGap: "14px",
    columnGap: "14px",
    alignItems: "center",
  },
});

const LIFTED = "translateY(-4px)";
const PRESSED = "translateY(3px)";
const ACCENT = `var(--c, ${palette["--go"]})`;

const pager = stylex.create({
  nav: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
  },
  gap: {
    display: "none",
  },
  card: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBlock: "10px",
    paddingInline: "10px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: ACCENT },
      ":focus-visible": ACCENT,
      ":active": ACCENT,
    },
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
    backgroundColor: palette["--panel"],
    boxShadow: {
      default: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
      ":hover": { default: null, [HOVER]: `${palette["--raise"]}, 0 8px 0 var(--key)` },
      ":focus-visible": `${palette["--raise"]}, 0 8px 0 var(--key)`,
      // Repeated under the media query, which would otherwise let hovering outrank pressing.
      ":active": {
        default: `${palette["--raise"]}, 0 1px 0 var(--key)`,
        [HOVER]: `${palette["--raise"]}, 0 1px 0 var(--key)`,
      },
    },
    transform: {
      default: null,
      // Reduced motion stills only the press; hover and focus keep their lift.
      ":hover": { default: null, [HOVER]: LIFTED },
      ":focus-visible": LIFTED,
      ":active": {
        default: PRESSED,
        [REDUCE]: "none",
        [HOVER]: { default: PRESSED, [REDUCE]: "none" },
      },
    },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transitionProperty: "transform, box-shadow, border-color",
    transitionDuration: { default: "220ms, 220ms, 120ms", ":active": "100ms" },
    transitionDelay: "0s, 0s, 0s",
    transitionBehavior: "normal, normal, normal",
    transitionTimingFunction: `${motion["--snap"]}, ${motion["--snap"]}, ease`,
  },
  next: {
    flexDirection: "row-reverse",
    textAlign: "right",
  },
  all: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: "6px",
    minHeight: "92px",
    textAlign: "right",
  },
  thumb: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: { default: "112px", "@media (max-width: 720px)": "96px" },
  },
  meta: {
    display: "grid",
    gap: "4px",
    minWidth: 0,
  },
  dir: {
    fontWeight: 500,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--mute"],
  },
  number: {
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
  },
  title: {
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: 1.2,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
});

const cover = stylex.create({
  box: {
    "--rx": "0deg",
    "--ry": "0deg",
    position: "relative",
    justifySelf: { default: null, "@media (max-width: 720px)": "start" },
    width: { default: null, "@media (max-width: 720px)": "min(100%, 280px)" },
    maxWidth: { default: null, [STACKED]: "520px" },
    marginLeft: { default: null, "@media (max-width: 720px)": "6px" },
    perspective: "1200px",
  },
  card: {
    position: "relative",
    borderRadius: "18px",
    transform: "rotate(-1.5deg) rotateX(var(--rx)) rotateY(var(--ry))",
    transitionProperty: { default: "transform", [REDUCE]: "none" },
    transitionDuration: { default: motion["--t-panel"], [REDUCE]: "0s" },
    transitionTimingFunction: { default: motion["--out"], [REDUCE]: "ease" },
    // The sheet's mask would clip its own shadow, so the shadow lives on an empty layer behind it.
    // An outer box-shadow never paints inside its box, so the notches stay see-through.
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      boxShadow: `0 8px 0 ${palette["--drop-ink"]}, 0 30px 60px ${palette["--lift"]}`,
    },
  },
  sheet: {
    "--stub": { default: "62px", [PHONE]: "52px" },
    "--notch": "calc(100% - var(--stub) - 1px)",
    position: "relative",
    paddingTop: { default: "12px", [PHONE]: "10px" },
    paddingInline: { default: "12px", [PHONE]: "10px" },
    borderRadius: "inherit",
    backgroundColor: palette["--panel"],
    backgroundImage: `radial-gradient(circle at 0 var(--notch), transparent 10px, ${palette["--hair"]} 10.5px, ${palette["--hair"]} 11.5px, transparent 12px), radial-gradient(circle at 100% var(--notch), transparent 10px, ${palette["--hair"]} 10.5px, ${palette["--hair"]} 11.5px, transparent 12px)`,
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    maskImage:
      "radial-gradient(circle at 0 var(--notch), transparent 10px, #000 10.5px), radial-gradient(circle at 100% var(--notch), transparent 10px, #000 10.5px)",
    maskComposite: "intersect",
  },
  thumb: {
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    viewTransitionName: { default: null, [RULE_OPEN]: "rule-thumb" },
  },
  tear: {
    height: { default: "26px", [PHONE]: "20px" },
    marginInline: "2px",
    borderBottomWidth: "2px",
    borderBottomStyle: "dashed",
    borderBottomColor: palette["--hair"],
  },
  stub: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: { default: "10px", [PHONE]: "6px" },
    height: "var(--stub)",
    paddingInline: { default: "6px", [PHONE]: "2px" },
    fontWeight: 800,
    fontSize: { default: "14px", [PHONE]: "12px" },
    lineHeight: 1,
    fontFamily: fonts["--display"],
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  was: {
    color: palette["--mute"],
    textDecorationLine: "line-through",
    textDecorationThickness: "2px",
  },
  to: {
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
  },
  now: {
    justifySelf: "end",
    paddingBlock: { default: "7px", [PHONE]: "6px" },
    paddingInline: { default: "10px", [PHONE]: "8px" },
    borderRadius: "8px",
    color: "var(--on-c)",
    backgroundColor: "var(--c)",
  },
});

// The live activity this page lends the header island: a back link, a label that trades the
// page's tags for its title once the heading leaves the viewport (useTitleSwap), and Share.
const styles = stylex.create({
  activity: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },
  action: {
    userSelect: "none",
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
      ":hover": { default: null, [HOVER]: palette["--panel-2"] },
      ":active": palette["--panel-2"],
    },
    // `background: none` minifies to a 0 0 position at rest, and the hover's background shorthand
    // resets it to 0% 0%. StyleX would minify a literal 0% 0% back to 0 0, so hover sets initial.
    backgroundPosition: {
      default: "0 0",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
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
  // ellipsis.
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
