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
import { fonts, motion, palette } from "../../theme.stylex";
import { chips } from "./chips";
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
    <section ref={sectionRef} id="stack" {...stylex.props(styles.section)}>
      <div className="sh2">
        <h2>
          <small data-cut style={{ "--c": "var(--ar)" }}>
            Tools I use
          </small>
          <span data-cut>Stack</span>
        </h2>
      </div>

      {/* .stack-filter-row and .pups-group key the veil under their h3 in arcade.css, and .chips
          the chips' focus ring. */}
      <div {...stylex.props(styles.filter)}>
        <div className={`stack-filter-row ${stylex.props(styles.row).className}`}>
          <span {...stylex.props(styles.spacer)} />
          <div className={`chips ${stylex.props(chips.group, styles.chips).className}`}>
            <button
              type="button"
              {...stylex.props(chips.chip)}
              data-cut
              aria-pressed={usedAt === null}
              style={{ "--c": "var(--go)" }}
              onClick={() => pick(null)}
            >
              <i {...stylex.props(chips.dot)} />
              All
              <b {...stylex.props(chips.count, usedAt === null && chips.countOn)}>{allTools.length}</b>
            </button>
          </div>
        </div>
        {FILTER_ROWS.map((row) => (
          <div key={row.kind} className={`stack-filter-row ${stylex.props(styles.row).className}`}>
            <h3 {...stylex.props(styles.rowLabel)} data-cut>
              {row.label}
            </h3>
            <div
              className={`chips ${stylex.props(chips.group, styles.chips).className}`}
              role="group"
              aria-label={`Filter by ${row.label.toLowerCase()}`}
            >
              {placesOf(row.kind).map((name) => (
                <button
                  key={name}
                  type="button"
                  {...stylex.props(chips.chip)}
                  data-cut
                  aria-pressed={usedAt === name}
                  style={{ "--c": row.color }}
                  onClick={() => pick(usedAt === name ? null : name)}
                >
                  <i {...stylex.props(chips.dot)} />
                  {name}
                  <b {...stylex.props(chips.count, usedAt === name && chips.countOn)}>
                    {allTools.filter((tool) => isUsedAt(tool, name)).length}
                  </b>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div {...stylex.props(styles.groups)}>
        {shownGroups.map((group) => (
          <ViewTransition key={group.label} {...FILTER_MOTION}>
            <div className={`pups-group ${stylex.props(styles.group).className}`}>
              <h3 {...stylex.props(styles.groupLabel)} data-cut>
                {group.label}
              </h3>
              <ul {...stylex.props(styles.tools)}>
                {group.tools.map((tool) => (
                  <ViewTransition key={tool} {...FILTER_MOTION}>
                    <li
                      {...stylex.props(techBadge.badge, styles.tool)}
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
          {...stylex.props(techBadge.brand, styles.peek)}
          style={techBrand(peek.tool)}
        >
          <header {...stylex.props(styles.peekHead)}>
            <TechIcon name={peek.tool} style={styles.peekMark} />
            {peek.tool}
            <small {...stylex.props(styles.peekGroup)}>{groupOf(peek.tool)}</small>
          </header>
          {peekUses.length === 0 && (
            <p {...stylex.props(styles.peekNote)}>Not part of a role or project listed on this site.</p>
          )}
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
      <h4 {...stylex.props(styles.useTitle)}>{title}</h4>
      <ul {...stylex.props(styles.uses)}>
        {uses.map((use) => (
          <li key={use.name} {...stylex.props(styles.use)}>
            <b {...stylex.props(styles.useName)}>{use.name}</b>
            <span {...stylex.props(styles.useDetail)}>{use.detail}</span>
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

const STACKED = "@media (max-width: 960px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

const peekIn = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.96)" },
});

const styles = stylex.create({
  section: {
    position: "relative",
  },
  filter: {
    marginBottom: "20px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: { default: "220px 1fr", [STACKED]: "1fr" },
    gap: { default: "16px", [STACKED]: "10px" },
    alignItems: "start",
  },
  // Holds the label column beside "All"; stacked, there is no column to hold.
  spacer: {
    display: { default: null, [STACKED]: "none" },
  },
  rowLabel: {
    margin: 0,
    paddingTop: { default: "8px", [STACKED]: 0 },
    font: `500 13px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  chips: {
    marginBottom: "8px",
  },
  groups: {
    borderTopWidth: "2px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
  },
  group: {
    display: "grid",
    gridTemplateColumns: { default: "220px 1fr", [STACKED]: "1fr" },
    gap: { default: "16px", [STACKED]: "10px" },
    alignItems: "start",
    paddingBlock: "18px",
    paddingInline: 0,
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
  },
  groupLabel: {
    margin: 0,
    paddingTop: { default: "10px", [STACKED]: 0 },
    font: `700 14px ${fonts["--display"]}`,
    color: palette["--text"],
  },
  tools: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  // A [data-cut] piece: hover and focus key on pseudo-classes, so its class list never changes.
  tool: {
    paddingTop: "8px",
    paddingRight: "14px",
    paddingBottom: "8px",
    paddingLeft: "11px",
    borderRadius: "999px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":hover": "var(--brand)",
      ":focus-visible": "var(--brand)",
    },
    font: `500 13px ${fonts["--display"]}`,
    color: palette["--text"],
    transform: { default: null, ":hover": "translateY(-3px)", ":focus-visible": "translateY(-3px)" },
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    transitionProperty: "border-color, transform",
    transitionDuration: "120ms, 200ms",
    transitionTimingFunction: `ease, ${motion["--snap"]}`,
    transitionDelay: "0s, 0s",
    transitionBehavior: "normal, normal",
  },
  // A badge lights its mark in its tool's own colour under the pointer and keyboard focus.
  toolMark: {
    color: { default: palette["--mute"], ":is(:hover > *, :focus-visible > *)": "var(--brand)" },
  },
  // The card that peeks out of a badge, placed above it or below by usePlaceCard.
  peek: {
    position: "absolute",
    zIndex: 20,
    width: "290px",
    paddingTop: "14px",
    paddingInline: "16px",
    paddingBottom: "16px",
    borderRadius: "16px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--brand)",
    boxShadow: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
    pointerEvents: "none",
    transformOrigin: {
      default: null,
      ':is([data-side="bottom"])': "top center",
      ':is([data-side="top"])': "bottom center",
    },
    animationName: { default: peekIn, [REDUCE]: "fade-in" },
    animationDuration: { default: "180ms", [REDUCE]: "120ms" },
    animationTimingFunction: { default: motion["--out"], [REDUCE]: "ease" },
  },
  peekHead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "2px 8px",
    font: `700 15px ${fonts["--display"]}`,
    color: palette["--text"],
  },
  peekMark: {
    color: "var(--brand)",
  },
  peekGroup: {
    flexBasis: "100%",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  peekNote: {
    marginTop: "10px",
    marginInline: 0,
    marginBottom: 0,
    fontSize: "13px",
    color: palette["--dim"],
  },
  useTitle: {
    marginTop: "12px",
    marginInline: 0,
    marginBottom: "6px",
    font: `700 11px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  uses: {
    display: "grid",
    gap: "6px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  use: {
    fontSize: "13px",
    lineHeight: 1.35,
  },
  useName: {
    display: "block",
    fontWeight: 600,
    color: palette["--text"],
  },
  useDetail: {
    color: palette["--dim"],
  },
});
