import * as stylex from "@stylexjs/stylex";
import {
  addTransitionType,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
  type PointerEvent,
  type RefObject,
} from "react";
import { palette } from "../../theme.stylex";
import { TechIcon, techBadge, techBrand } from "./tech-icon";

export type StackGroup = { label: string; tools: string[] };
type StackUse = { kind: "work" | "project"; name: string; detail: string };

type Peek = { tool: string; anchor: HTMLElement };

const FILTER_ROWS = [
  { kind: "work", label: "Company", color: "var(--ts)" },
  { kind: "project", label: "Project", color: "var(--ar)" },
] as const;

const HEADER_HEIGHT = 72;
const CARD_GAP = 10;
const CARD_TOP_MARGIN = 16;
const CARD_HIDE_DELAY_MS = 80;
const PEEK_ID = "stack-peek";
const STACK_FILTER = "stack-filter";

export function StackShowcase({
  groups,
  sources,
}: {
  groups: StackGroup[];
  sources: { use: StackUse; stack: string[] }[];
}) {
  const [peek, setPeek] = useState<Peek | null>(null);
  const [usedAt, setUsedAt] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);

  usePlaceCard(sectionRef, cardRef, peek);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const show = (tool: string, anchor: HTMLElement) => {
    window.clearTimeout(hideTimer.current);
    setPeek({ tool, anchor });
  };
  const hide = () => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPeek(null), CARD_HIDE_DELAY_MS);
  };
  const fromMouse = (event: PointerEvent) => event.pointerType === "mouse";

  const pick = (name: string | null) => {
    setPeek(null);
    startTransition(() => {
      addTransitionType(STACK_FILTER);
      setUsedAt(name);
    });
  };
  const placesOf = (kind: StackUse["kind"]) =>
    sources.filter(({ use }) => use.kind === kind).map(({ use }) => use.name);
  const usesOf = (tool: string) =>
    sources.filter(({ stack }) => stack.includes(tool)).map(({ use }) => use);
  const isUsedAt = (tool: string, name: string) => usesOf(tool).some((use) => use.name === name);
  const allTools = groups.flatMap((group) => group.tools);
  const shownGroups = groups
    .map((group) => ({
      ...group,
      tools: usedAt ? group.tools.filter((tool) => isUsedAt(tool, usedAt)) : group.tools,
    }))
    .filter((group) => group.tools.length > 0);

  const groupOf = (tool: string) => groups.find((group) => group.tools.includes(tool))?.label;
  const peekUses = peek ? usesOf(peek.tool) : [];
  const work = peekUses.filter((use) => use.kind === "work");
  const projects = peekUses.filter((use) => use.kind === "project");

  return (
    <section ref={sectionRef} id="stack" className="stack">
      <div className="sh2">
        <h2>
          <small data-cut style={{ "--c": "var(--ar)" }}>
            Tools I use
          </small>
          <span data-cut>Stack</span>
        </h2>
      </div>

      <div className="stack-filter">
        <div className="stack-filter-row">
          <span />
          <div className="chips">
            <button
              type="button"
              data-cut
              aria-pressed={usedAt === null}
              style={{ "--c": "var(--go)" }}
              onClick={() => pick(null)}
            >
              <i />
              All
              <b>{allTools.length}</b>
            </button>
          </div>
        </div>
        {FILTER_ROWS.map((row) => (
          <div key={row.kind} className="stack-filter-row">
            <h3 data-cut>{row.label}</h3>
            <div className="chips" role="group" aria-label={`Filter by ${row.label.toLowerCase()}`}>
              {placesOf(row.kind).map((name) => (
                <button
                  key={name}
                  type="button"
                  data-cut
                  aria-pressed={usedAt === name}
                  style={{ "--c": row.color }}
                  onClick={() => pick(usedAt === name ? null : name)}
                >
                  <i />
                  {name}
                  <b>{allTools.filter((tool) => isUsedAt(tool, name)).length}</b>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pups-groups">
        {shownGroups.map((group) => (
          <ViewTransition key={group.label} {...FILTER_MOTION}>
            <div className="pups-group">
              <h3 data-cut>{group.label}</h3>
              <ul className="pups">
                {group.tools.map((tool) => (
                  <ViewTransition key={tool} {...FILTER_MOTION}>
                    <li
                      {...stylex.props(techBadge.badge)}
                      data-cut
                      tabIndex={0}
                      aria-describedby={peek?.tool === tool ? PEEK_ID : undefined}
                      style={techBrand(tool)}
                      onPointerEnter={(event) => fromMouse(event) && show(tool, event.currentTarget)}
                      onPointerLeave={(event) => fromMouse(event) && hide()}
                      onFocus={(event) => show(tool, event.currentTarget)}
                      onBlur={hide}
                      onKeyDown={(event) => event.key === "Escape" && event.currentTarget.blur()}
                    >
                      <TechIcon name={tool} style={styles.toolMark} />
                      {tool}
                    </li>
                  </ViewTransition>
                ))}
              </ul>
            </div>
          </ViewTransition>
        ))}
      </div>

      {peek && (
        <div
          ref={cardRef}
          id={PEEK_ID}
          role="tooltip"
          className={`peek ${stylex.props(techBadge.brand).className}`}
          style={techBrand(peek.tool)}
        >
          <header>
            <TechIcon name={peek.tool} style={styles.peekMark} />
            {peek.tool}
            <small>{groupOf(peek.tool)}</small>
          </header>
          {peekUses.length === 0 && <p>Not part of a role or project listed on this site.</p>}
          {work.length > 0 && <UseList title="Work" uses={work} />}
          {projects.length > 0 && <UseList title="Projects" uses={projects} />}
        </div>
      )}
    </section>
  );
}

const FILTER_MOTION = {
  default: "none",
  update: { [STACK_FILTER]: "stack-move", default: "none" },
  exit: { [STACK_FILTER]: "stack-out", default: "none" },
} as const;

function UseList({ title, uses }: { title: string; uses: StackUse[] }) {
  return (
    <>
      <h4>{title}</h4>
      <ul>
        {uses.map((use) => (
          <li key={use.name}>
            <b>{use.name}</b>
            <span>{use.detail}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function usePlaceCard(
  sectionRef: RefObject<HTMLElement | null>,
  cardRef: RefObject<HTMLElement | null>,
  peek: Peek | null,
) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!peek || !section || !card) return;
    const box = section.getBoundingClientRect();
    const anchor = peek.anchor.getBoundingClientRect();
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const centered = anchor.left + anchor.width / 2 - width / 2 - box.left;
    const left = Math.min(Math.max(centered, 0), box.width - width);
    const fitsAbove = anchor.top - height - CARD_GAP >= HEADER_HEIGHT + CARD_TOP_MARGIN;
    const top = fitsAbove ? anchor.top - height - CARD_GAP : anchor.bottom + CARD_GAP;
    card.style.left = `${left}px`;
    card.style.top = `${top - box.top}px`;
    card.dataset.side = fitsAbove ? "top" : "bottom";
  }, [sectionRef, cardRef, peek]);
}

const styles = stylex.create({
  // A badge lights its mark in its tool's own colour under the pointer and keyboard focus.
  toolMark: {
    color: { default: palette["--mute"], ":is(:hover > *, :focus-visible > *)": "var(--brand)" },
  },
  peekMark: {
    color: "var(--brand)",
  },
});
