import * as stylex from "@stylexjs/stylex";
import { useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import { TechIcon, techBadge, techBrand } from "./tech-icon";
import { loadIn } from "../../components/load-in";

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
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const listRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<Snapshot | null>(null);

  const toggle = (index: number) => {
    const list = listRef.current;
    if (list && !reduced) beforeRef.current = snapshotOf(list);
    setOpen(open === index ? -1 : index);
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
    after.pills.forEach((to, pill) => {
      const from = before.pills.get(pill);
      if (!from) return;
      const dx = from.xInRow - to.xInRow;
      const dy = from.yInRow - to.yInRow;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      pill.animate(
        [
          { offset: 0, opacity: 1, transform: `translate(${dx}px, ${dy}px)`, easing: "ease-in" },
          { offset: 0.38, opacity: 0, transform: `translate(${dx}px, ${dy - 10}px)` },
          { offset: 0.38, opacity: 0, transform: "translateX(-18px)", easing: glide.easing },
          { offset: 1, opacity: 1, transform: "none" },
        ],
        { duration: 520, delay: to.order * 18, fill: "backwards" },
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
              {...stylex.props(styles.head, !isOpen && styles.headCover)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span {...stylex.props(styles.years)}>{job.years}</span>
              <h3 {...stylex.props(styles.company)}>
                {job.company}
                <small {...stylex.props(styles.role)}>{job.role}</small>
              </h3>
              <span {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)} aria-hidden="true" />
            </button>
            <ul {...stylex.props(styles.stack, isOpen && styles.stackOpen)} aria-label={`${job.company} stack`}>
              {job.stack.map((tool) => (
                <li
                  key={tool}
                  {...stylex.props(techBadge.badge, styles.pill, isOpen ? styles.pillOpen : styles.pillClosed)}
                  style={techBrand(tool)}
                >
                  <TechIcon name={tool} style={isOpen ? styles.markOpen : styles.markClosed} />
                  {tool}
                </li>
              ))}
            </ul>
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
      pills.set(pill, { xInRow: at.left - box.left, yInRow: at.top - box.top, order });
    });
  }
  return { height: list.getBoundingClientRect().height, rows, pills };
}

const STACKED = "@media (max-width: 960px)";
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
      ":not([data-on]):hover": `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
      [LIGHT]: {
        default: palette["--bg"],
        ":is([data-on])": palette["--panel"],
        ":not([data-on]):hover": `color-mix(in srgb, ${palette["--panel-2"]} 55%, ${palette["--bg"]})`,
      },
    },
    outline: { default: null, ":has(> button:focus-visible)": `2px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":has(> button:focus-visible)": "-2px" },
    transitionProperty: "background-color",
    transitionDuration: "160ms",
    transitionTimingFunction: "ease",
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
  company: {
    gridArea: "2 / 1",
    margin: 0,
    font: `700 18px/1.2 ${fonts["--display"]}`,
    color: palette["--text"],
  },
  role: {
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
    transitionDuration: "220ms, 120ms",
    transitionTimingFunction: `${motion["--snap"]}, ease`,
    transitionDelay: "0s, 0s",
    transitionBehavior: "normal, normal",
  },
  chevronOpen: {
    borderTopColor: palette["--go-ink"],
    borderRightColor: palette["--go-ink"],
    borderBottomColor: palette["--go-ink"],
    borderLeftColor: palette["--go-ink"],
    transform: "translateY(2px) rotate(-135deg)",
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
    transitionDuration: "120ms",
    transitionTimingFunction: "ease",
  },
  // A closed row lifts its badges' rims and marks together under the pointer; an open row lights
  // the badge under the pointer in its tool's own colour.
  pillClosed: {
    borderColor: { default: palette["--hair"], [stylex.when.ancestor(":hover")]: palette["--hair-hover"] },
  },
  pillOpen: {
    borderColor: { default: palette["--hair"], ":hover": "var(--brand)" },
  },
  markClosed: {
    color: { default: palette["--mute"], [stylex.when.ancestor(":hover")]: palette["--dim"] },
  },
  markOpen: {
    color: { default: palette["--dim"], ":is(:hover > *)": "var(--brand)" },
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
      backgroundColor: palette["--ts"],
    },
  },
});
