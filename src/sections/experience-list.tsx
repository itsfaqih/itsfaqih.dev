import * as stylex from "@stylexjs/stylex";
import { useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../theme.stylex";
import { CompanyLogo } from "./company-logo";
import { iconLit, TechIcon, techBadge, techBrand } from "./tech-icon";
import { loadIn } from "../components/load-in";

export type Job = {
  years: string;
  company: string;
  role: string;
  stack: string[];
  achievements: string[];
};

/** The work history: one row per job, one open at a time, with the open row's achievements. */
export function ExperienceList({ jobs }: { jobs: Job[] }) {
  const [open, setOpen] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const listRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<Snapshot | null>(null);

  const toggle = (index: number) => {
    const list = listRef.current;
    if (list && !reduced) beforeRef.current = snapshotOf(list);
    setOpen(open === index ? -1 : index);
    setExpanded(false);
  };

  useLayoutEffect(() => {
    const list = listRef.current;
    const before = beforeRef.current;
    beforeRef.current = null;
    if (!list || !before) return;
    const after = snapshotOf(list);
    const glide: KeyframeAnimationOptions = {
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "backwards",
      duration: 380,
    };
    if (before.height !== after.height) {
      list.animate([{ height: `${before.height}px` }, { height: `${after.height}px` }], glide);
    }
    after.rows.forEach((to, row) => {
      const from = before.rows.get(row);
      if (from === undefined || Math.abs(from - to) < 0.5) return;
      row.animate([{ transform: `translateY(${from - to}px)` }, { transform: "none" }], glide);
    });
    // A badge leaves its old spot all at once, before the achievements start in that spot (140ms),
    // and only its arrival in the new spot is staggered.
    after.pills.forEach((to, pill) => {
      const from = before.pills.get(pill);
      if (!from) return;
      const dx = from.xInRow - to.xInRow;
      const dy = from.yInRow - to.yInRow;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      const duration = PILL_OUT + to.order * 18 + PILL_IN;
      const gone = PILL_OUT / duration;
      const back = (duration - PILL_IN) / duration;
      pill.animate(
        [
          { offset: 0, opacity: 1, transform: `translate(${dx}px, ${dy}px)`, easing: OUT },
          { offset: gone, opacity: 0, transform: `translate(${dx}px, ${dy - 6}px)` },
          { offset: back, opacity: 0, transform: "translateX(-18px)", easing: glide.easing },
          { offset: 1, opacity: 1, transform: "none" },
        ],
        { duration },
      );
    });
  }, [open]);

  return (
    <div ref={listRef} {...stylex.props(styles.list)}>
      {jobs.map((job, index) => {
        const isOpen = open === index;
        const panelId = `job-${index}`;
        return (
          <div
            key={job.company}
            {...stylex.props(loadIn.piece, styles.row, stylex.defaultMarker())}
            data-cut
            data-on={isOpen ? "" : undefined}
          >
            <button
              type="button"
              {...stylex.props(styles.head, iconLit.hover, !isOpen && styles.headCover)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span {...stylex.props(styles.years)}>{job.years}</span>
              <h3 {...stylex.props(styles.company, isOpen && iconLit.on)}>
                <CompanyLogo name={job.company} style={styles.logo} />
                {job.company}
                <small {...stylex.props(styles.role)}>{job.role}</small>
              </h3>
              <span
                {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}
                aria-hidden="true"
              />
            </button>
            <Stack
              job={job}
              isOpen={isOpen}
              expanded={isOpen && expanded}
              onExpand={() => setExpanded(!expanded)}
            />
            <div id={panelId} {...stylex.props(styles.body)}>
              {isOpen && (
                <ul {...stylex.props(styles.achievements)}>
                  {job.achievements.map((item, at) => (
                    <li key={item} {...stylex.props(styles.achievement)} style={{ "--j": at }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * A job's tools, held to two rows. When they would run longer, the second row ends in a pill
 * counting the rest, which shows them all on the open row.
 */
function Stack({
  job,
  isOpen,
  expanded,
  onExpand,
}: {
  job: Job;
  isOpen: boolean;
  expanded: boolean;
  onExpand: () => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [fit, setFit] = useState({ shown: job.stack.length, overflows: false });
  const hidden = job.stack.length - fit.shown;

  // Measured on the page: lay every tool out, find where the third row starts, then give back
  // tools from the end until the count pill fits on the second row. The DOM is left as measured,
  // so the list's glide reads the final layout, and the render that follows matches it.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const pills = [...list.querySelectorAll<HTMLElement>(":scope > [data-tool]")];
      const more = list.querySelector<HTMLElement>(":scope > [data-more]");
      const label = more?.querySelector<HTMLElement>("[data-label]");
      if (!more || !label) return;
      const show = (count: number) =>
        pills.forEach((pill, at) => (pill.style.display = at < count ? "" : "none"));
      show(pills.length);
      more.style.display = "none";
      const rows = [...new Set(pills.map((pill) => pill.offsetTop))];
      const overflows = rows.length > MAX_ROWS;
      if (!overflows || expanded) {
        more.style.display = overflows ? "" : "none";
        setFit({ shown: pills.length, overflows });
        return;
      }
      const lastRow = rows[MAX_ROWS - 1]!;
      let count = pills.findIndex((pill) => pill.offsetTop > lastRow);
      more.style.display = "";
      for (; count > 0; count--) {
        show(count);
        label.dataset.label = moreLabel(pills.length - count);
        if (more.offsetTop <= lastRow) break;
      }
      setFit({ shown: count, overflows });
    };
    measure();
    // Web fonts change the badges' widths without changing the list's.
    let live = true;
    void document.fonts.ready.then(() => live && measure());
    document.fonts.addEventListener("loadingdone", measure);
    let width = list.offsetWidth;
    const resize = new ResizeObserver(() => {
      if (list.offsetWidth === width) return;
      width = list.offsetWidth;
      measure();
    });
    resize.observe(list);
    return () => {
      live = false;
      resize.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [isOpen, expanded, job.stack]);

  const label = expanded ? "Show less" : moreLabel(hidden);
  return (
    <ul
      ref={listRef}
      {...stylex.props(styles.stack, isOpen && styles.stackOpen)}
      aria-label={`${job.company} stack`}
    >
      {job.stack.map((tool, at) => (
        <li
          key={tool}
          data-tool
          {...stylex.props(
            techBadge.badge,
            styles.pill,
            isOpen ? styles.pillOpen : styles.pillClosed,
          )}
          style={{ ...techBrand(tool), display: at < fit.shown ? undefined : "none" }}
        >
          <TechIcon name={tool} style={isOpen ? styles.markOpen : styles.markClosed} />
          {tool}
        </li>
      ))}
      <li data-more style={{ display: fit.overflows ? undefined : "none" }}>
        {isOpen ? (
          <button
            type="button"
            data-label={label}
            {...stylex.props(styles.pill, styles.more, styles.moreButton)}
            aria-label={expanded ? "Show fewer tools" : `Show ${hidden} more tools`}
            aria-expanded={expanded}
            onClick={onExpand}
          />
        ) : (
          <span
            data-label={label}
            {...stylex.props(styles.pill, styles.more, styles.pillClosed)}
            aria-label={`${hidden} more tools`}
          />
        )}
      </li>
    </ul>
  );
}

const MAX_ROWS = 2;

function moreLabel(count: number) {
  return `+${count} more`;
}

type Snapshot = {
  height: number;
  rows: Map<Element, number>;
  pills: Map<Element, { xInRow: number; yInRow: number; order: number }>;
};

function snapshotOf(list: HTMLElement): Snapshot {
  const rows = new Map<Element, number>();
  const pills = new Map<Element, { xInRow: number; yInRow: number; order: number }>();
  for (const row of list.children) {
    const box = row.getBoundingClientRect();
    rows.set(row, box.top);
    row.querySelectorAll(":scope > ul > li").forEach((pill, order) => {
      const at = pill.getBoundingClientRect();
      if (at.width === 0) return;
      pills.set(pill, { xInRow: at.left - box.left, yInRow: at.top - box.top, order });
    });
  }
  return { height: list.getBoundingClientRect().height, rows, pills };
}

// A badge fades out of its old spot fast and settles into its new one slower.
const PILL_OUT = 110;
const PILL_IN = 320;
const OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const STACKED = "@media (max-width: 960px)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const LIGHT = ":is(.light *)";

const listIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});

const styles = stylex.create({
  list: {
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "22px",
    boxShadow: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
    overflow: "hidden",
  },
  // A [data-cut] piece: the open state keys on data-on, so its class list never changes and the
  // cut-in's .in survives a re-render. Opaque, so a row sliding down covers the list opening above
  // it. On paper the open row is the white sheet and the closed rows sit back in the page tone, so
  // the row being read has the most contrast.
  row: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: { default: "340px 1fr", [STACKED]: "1fr" },
    gridTemplateRows: { default: null, ":is([data-on])": "auto 1fr" },
    gap: { default: "14px 28px", [STACKED]: "14px" },
    alignItems: { default: "center", ":is([data-on])": "start" },
    paddingBlock: "18px",
    paddingInline: "22px",
    borderTopWidth: { default: "2px", ":first-child": 0 },
    borderTopStyle: { default: "solid", ":first-child": "none" },
    borderTopColor: { default: palette["--hair"], ":first-child": "currentcolor" },
    backgroundColor: {
      default: palette["--panel"],
      ":is([data-on])": palette["--panel-2"],
      ":not([data-on]):hover": {
        default: null,
        [HOVER]: `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
      },
      [LIGHT]: {
        default: palette["--bg"],
        ":is([data-on])": palette["--panel"],
        ":not([data-on]):hover": {
          default: null,
          [HOVER]: `color-mix(in srgb, ${palette["--panel-2"]} 55%, ${palette["--bg"]})`,
        },
      },
    },
    outline: { default: null, ":has(> button:focus-visible)": `2px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":has(> button:focus-visible)": "-2px" },
    transitionProperty: "background-color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":is([data-on])": motion["--t-fast"],
      ":not([data-on]):hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":is([data-on])": motion["--fast"],
      ":not([data-on]):hover": { default: null, [HOVER]: motion["--fast"] },
    },
  },
  // The dates sit over the company and role; the chevron stays at the right.
  head: {
    gridArea: { default: "1 / 1", [STACKED]: "auto" },
    display: "grid",
    gridTemplateColumns: "1fr 20px",
    gap: "6px 18px",
    alignItems: "center",
    padding: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundImage: "none",
    // `background: none` minifies to a 0 0 position, which computes to 0px 0px.
    backgroundPosition: "0 0",
    color: "inherit",
    font: "inherit",
    textAlign: "left",
    cursor: cursors["--cursor-point"],
    outline: "none",
  },
  // A closed row is one big target; an open row only toggles from its head, so its achievements
  // stay selectable.
  headCover: {
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
    },
  },
  years: {
    gridArea: "1 / 1",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--go-ink"],
  },
  // The logo leads the name; the role runs under both.
  company: {
    gridArea: "2 / 1",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "8px",
    alignItems: "center",
    margin: 0,
    font: `700 18px/1.2 ${fonts["--display"]}`,
    color: palette["--text"],
  },
  logo: {
    width: "22px",
    height: "22px",
  },
  role: {
    gridColumn: "1 / -1",
    display: "block",
    font: `400 13px ${fonts["--sans"]}`,
    color: palette["--mute"],
    marginTop: "4px",
  },
  chevron: {
    gridArea: "1 / 2 / span 2",
    justifySelf: "end",
    width: "9px",
    height: "9px",
    borderRightWidth: "2px",
    borderRightStyle: "solid",
    borderRightColor: palette["--mute"],
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--mute"],
    transform: "translateY(-3px) rotate(45deg)",
    transitionProperty: "transform, border-color",
    transitionDuration: `${motion["--t-moderate-exit"]}, ${motion["--t-fast-exit"]}`,
    transitionTimingFunction: motion["--exit"],
  },
  chevronOpen: {
    borderTopColor: palette["--go-ink"],
    borderRightColor: palette["--go-ink"],
    borderBottomColor: palette["--go-ink"],
    borderLeftColor: palette["--go-ink"],
    transform: "translateY(2px) rotate(-135deg)",
    transitionDuration: `${motion["--t-moderate"]}, ${motion["--t-fast"]}`,
    transitionTimingFunction: `${motion["--moderate"]}, ${motion["--fast"]}`,
  },
  // Closed: the stack sits on the right. Open: it fills the left column under the head and the
  // achievements take the right column.
  stack: {
    gridArea: { default: "1 / 2", [STACKED]: "auto" },
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  stackOpen: {
    gridArea: { default: "2 / 1", [STACKED]: "auto" },
    alignContent: "start",
  },
  pill: {
    paddingTop: "5px",
    paddingRight: "10px",
    paddingBottom: "5px",
    paddingLeft: "8px",
    borderRadius: "999px",
    borderWidth: "2px",
    borderStyle: "solid",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--dim"],
    transitionProperty: "border-color",
  },
  // A closed row lifts its badges' rims and marks together under the pointer; an open row lights
  // the badge under the pointer in its tool's own colours.
  pillClosed: {
    borderColor: {
      default: palette["--hair"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: palette["--hair-hover"] },
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--fast"] },
    },
  },
  pillOpen: {
    "--lit": { default: null, ":hover": { default: null, [HOVER]: "1" } },
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: "var(--brand)" },
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
    },
  },
  // The count pill: its words come from data-label, so measuring can try each count without a
  // render.
  more: {
    display: "inline-flex",
    borderStyle: "dashed",
    color: palette["--mute"],
    "::after": {
      content: "attr(data-label)",
    },
  },
  moreButton: {
    backgroundColor: "transparent",
    cursor: cursors["--cursor-point"],
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: palette["--hair-hover"] },
    },
    color: {
      default: palette["--mute"],
      ":hover": { default: null, [HOVER]: palette["--dim"] },
    },
    transitionProperty: "border-color, color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
    },
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "2px" },
  },
  markClosed: {
    color: {
      default: palette["--mute"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: palette["--dim"] },
    },
  },
  markOpen: {
    color: palette["--dim"],
  },
  body: {
    gridArea: { default: "1 / 2 / span 2", [STACKED]: "auto" },
    display: { default: null, ":empty": "none" },
  },
  achievements: {
    display: "grid",
    gap: "10px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  achievement: {
    position: "relative",
    paddingLeft: "20px",
    fontSize: "15px",
    lineHeight: 1.55,
    color: palette["--dim"],
    animationName: listIn,
    animationDuration: "360ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "backwards",
    animationDelay: "calc(140ms + var(--j) * 45ms)",
    "::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "0.6em",
      width: "8px",
      height: "8px",
      borderRadius: "2px",
      backgroundColor: palette["--ts-deep"],
    },
  },
});
