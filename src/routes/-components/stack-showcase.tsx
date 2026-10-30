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
import { CompanyLogo, ringOf } from "./company-logo";
import { iconLit, TechIcon, techBadge, techBrand } from "./tech-icon";
import { section, veil } from "./section";
import { hoverHold } from "../../components/hover-hold";
import { loadIn } from "../../components/load-in";

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
  // The groups glitch in once, on first sight. After the first filter, badges and groups that
  // come back slide in instead (FILTER_MOTION), so they drop their cut-in.
  const [filtered, setFiltered] = useState(false);
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
      setFiltered(true);
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
    <section ref={sectionRef} id="stack" {...stylex.props(section.block, styles.section)}>
      <div {...stylex.props(section.head)}>
        <h2 {...stylex.props(section.title, veil.soft)}>
          <small {...stylex.props(loadIn.veil, section.eyebrow, veil.dense, veil.fit)} data-cut data-eyebrow style={{ "--c": "var(--ar)" }}>
            <span {...stylex.props(loadIn.piece, loadIn.words)} data-cut>Tools I use</span>
          </small>
          <span {...stylex.props(loadIn.piece, section.titleText)} data-cut>Stack</span>
        </h2>
      </div>

      <div {...stylex.props(styles.filter)}>
        <div {...stylex.props(styles.row)}>
          <span {...stylex.props(styles.spacer)} />
          <div {...stylex.props(chips.group, styles.chips)}>
            <button
              type="button"
              {...stylex.props(loadIn.piece, chips.chip)}
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
        {FILTER_ROWS.filter((row) => placesOf(row.kind).length > 0).map((row) => (
          <div key={row.kind} {...stylex.props(styles.row)}>
            <h3 {...stylex.props(loadIn.veil, veil.dense, styles.rowLabel)} data-cut>
              <span {...stylex.props(loadIn.piece, loadIn.words)} data-cut>{row.label}</span>
            </h3>
            <div
              {...stylex.props(chips.group, styles.chips)}
              role="group"
              aria-label={`Filter by ${row.label.toLowerCase()}`}
            >
              {placesOf(row.kind).map((name) => (
                <button
                  key={name}
                  type="button"
                  {...stylex.props(loadIn.piece, chips.chip, row.kind === "work" && styles.ringChip)}
                  data-cut
                  aria-pressed={usedAt === name}
                  style={{ "--c": row.color, ...(row.kind === "work" ? ringOf(name) : undefined) }}
                  onClick={() => pick(usedAt === name ? null : name)}
                >
                  {row.kind === "work" ? (
                    <CompanyLogo name={name} style={styles.chipLogo} />
                  ) : (
                    <i {...stylex.props(chips.dot)} />
                  )}
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
            <div {...stylex.props(styles.group)}>
              <h3 {...stylex.props(!filtered && loadIn.veil, veil.dense, styles.groupLabel)} data-cut={!filtered || undefined}>
                <span {...stylex.props(!filtered && loadIn.piece, loadIn.words)} data-cut={!filtered || undefined}>
                  {group.label}
                </span>
              </h3>
              <ul {...stylex.props(styles.tools)}>
                {group.tools.map((tool) => (
                  <ViewTransition key={tool} {...FILTER_MOTION}>
                    <li
                      {...stylex.props(!filtered && loadIn.piece, techBadge.badge, iconLit.hover, hoverHold.lift, styles.tool)}
                      data-cut={!filtered || undefined}
                      tabIndex={0}
                      aria-describedby={peek?.tool === tool ? PEEK_ID : undefined}
                      style={techBrand(tool)}
                      onPointerEnter={(event) => fromMouse(event) && show(tool, event.currentTarget)}
                      onPointerLeave={(event) => fromMouse(event) && hide()}
                      onFocus={(event) => show(tool, event.currentTarget)}
                      onBlur={hide}
                      onKeyDown={(event) => event.key === "Escape" && event.currentTarget.blur()}
                    >
                      <TechIcon name={tool} />
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
          {...stylex.props(techBadge.brand, iconLit.on, styles.peek)}
          style={techBrand(peek.tool)}
        >
          <header {...stylex.props(styles.peekHead)}>
            <TechIcon name={peek.tool} />
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
  enter: { [STACK_FILTER]: "stack-in", default: "none" },
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
const LIGHT = ":is(.light *)";
// The panel over a tool's --ring (from techBrand), which shows in the border; a tool with no brand
// colour gets the hairline.
const TOOL_RING = `linear-gradient(${palette["--panel"]}, ${palette["--panel"]}), var(--ring, linear-gradient(${palette["--hair"]}, ${palette["--hair"]}))`;
const WASH = `color-mix(in srgb, ${palette["--panel"]} 86%, transparent)`;

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
  chipLogo: {
    width: "16px",
    height: "16px",
  },
  // A pressed company chip takes its logo's colours (ringOf): the ring on its rim, and a wash of
  // the same ring inside, over the panel. Its logo lights while pressed or under the pointer.
  ringChip: {
    "--lit": { default: null, ":hover": "1", ":focus-visible": "1", ':is([aria-pressed="true"])': "1" },
    "--ring": { default: "var(--ring-dark)", [LIGHT]: "var(--ring-light)" },
    borderColor: { default: palette["--hair"], ':is([aria-pressed="true"])': "transparent" },
    backgroundImage: {
      default: null,
      ':is([aria-pressed="true"])': `linear-gradient(${WASH}, ${WASH}), var(--ring), var(--ring)`,
    },
    backgroundClip: "padding-box, padding-box, border-box",
    backgroundOrigin: "border-box",
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
  // Hover and focus key on pseudo-classes, so a [data-cut] badge's class list never changes
  // while its cut-in plays.
  tool: {
    paddingTop: "8px",
    paddingRight: "14px",
    paddingBottom: "8px",
    paddingLeft: "11px",
    borderRadius: "999px",
    borderWidth: "2px",
    borderStyle: "solid",
    backgroundColor: palette["--panel"],
    // Under the pointer and keyboard focus the hairline gives way to the logo's ring. The ring is
    // drawn only then: under the hairline, its colour would fringe the rounded edge.
    borderColor: { default: palette["--hair"], ":hover": "transparent", ":focus-visible": "transparent" },
    backgroundImage: { default: null, ":hover": TOOL_RING, ":focus-visible": TOOL_RING },
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "border-box",
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
  // The card that peeks out of a badge, placed above it or below by usePlaceCard.
  peek: {
    position: "absolute",
    zIndex: 20,
    width: "290px",
    paddingTop: "14px",
    paddingInline: "16px",
    paddingBottom: "16px",
    borderRadius: "16px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundImage: TOOL_RING,
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "border-box",
    boxShadow: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
    pointerEvents: "none",
    transformOrigin: {
      default: null,
      ':is([data-side="bottom"])': "top center",
      ':is([data-side="top"])': "bottom center",
    },
    animationName: peekIn,
    animationDuration: "180ms",
    animationTimingFunction: motion["--out"],
  },
  peekHead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "2px 8px",
    font: `700 15px ${fonts["--display"]}`,
    color: palette["--text"],
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
