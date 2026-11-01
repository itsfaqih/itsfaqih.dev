import { reducedMotion } from "../hooks/media-query";
import { moreLabel, rowView } from "./experience-list.styles";

const MAX_ROWS = 2;
// A badge fades out of its old spot fast and settles into its new one slower.
const PILL_OUT = 110;
const PILL_IN = 320;
const OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

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

/** Glides the list from `before` to its layout now: its height, the rows, and the moved badges. */
function glideFrom(list: HTMLElement, before: Snapshot) {
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
}

type Row = {
  element: HTMLElement;
  head: HTMLButtonElement;
  company: HTMLElement;
  chevron: HTMLElement;
  stack: HTMLUListElement;
  pills: HTMLElement[];
  more: HTMLElement;
  body: HTMLElement;
  achievements: HTMLTemplateElement;
  fit: { shown: number; overflows: boolean };
};

/**
 * The work history (experience-list.astro). A row's head opens it and closes the one open, and the
 * list glides to the new layout. Each row's tools are held to two rows, the second ending in a
 * pill counting the rest, which shows them all on the open row.
 */
class ExperienceList extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const rows: Row[] = [...this.querySelectorAll<HTMLElement>(":scope > *")].map((element) => {
      const stack = element.querySelector<HTMLUListElement>(":scope > ul")!;
      const pills = [...stack.querySelectorAll<HTMLElement>(":scope > [data-tool]")];
      return {
        element,
        head: element.querySelector(":scope > button")!,
        company: element.querySelector("h3")!,
        chevron: element.querySelector(":scope > button > span:last-child")!,
        stack,
        pills,
        more: stack.querySelector(":scope > [data-more]")!,
        body: element.querySelector(":scope > div")!,
        achievements: element.querySelector(":scope > template")!,
        fit: { shown: pills.length, overflows: false },
      };
    });

    let open = 0;
    let expanded = false;

    // The count pill: a button on the open row, which shows every tool, and a label elsewhere.
    const renderMore = (row: Row, isOpen: boolean) => {
      const rowExpanded = isOpen && expanded;
      const hidden = row.pills.length - row.fit.shown;
      const label = rowExpanded ? "Show less" : moreLabel(hidden);
      let pill = row.more.querySelector<HTMLElement>(":scope > *")!;
      const tag = isOpen ? "BUTTON" : "SPAN";
      if (pill.tagName !== tag) {
        pill = document.createElement(tag.toLowerCase());
        if (isOpen) pill.setAttribute("type", "button");
        row.more.replaceChildren(pill);
      }
      pill.dataset.label = label;
      pill.className = rowView(isOpen).more;
      if (isOpen) {
        pill.setAttribute(
          "aria-label",
          rowExpanded ? "Show fewer tools" : `Show ${hidden} more tools`,
        );
        pill.setAttribute("aria-expanded", String(rowExpanded));
      } else {
        pill.setAttribute("aria-label", `${hidden} more tools`);
      }
      row.more.style.display = row.fit.overflows ? "" : "none";
    };

    // Measured on the page: lay every tool out, find where the third row starts, then give back
    // tools from the end until the count pill fits on the second row.
    const measure = (row: Row) => {
      const isOpen = rows.indexOf(row) === open;
      const { pills, more } = row;
      const label = more.querySelector<HTMLElement>(":scope > *")!;
      const show = (count: number) =>
        pills.forEach((pill, at) => (pill.style.display = at < count ? "" : "none"));
      show(pills.length);
      more.style.display = "none";
      const lines = [...new Set(pills.map((pill) => pill.offsetTop))];
      const overflows = lines.length > MAX_ROWS;
      if (!overflows || (isOpen && expanded)) {
        row.fit = { shown: pills.length, overflows };
      } else {
        const lastLine = lines[MAX_ROWS - 1]!;
        let count = pills.findIndex((pill) => pill.offsetTop > lastLine);
        more.style.display = "";
        for (; count > 0; count--) {
          show(count);
          label.dataset.label = moreLabel(pills.length - count);
          if (more.offsetTop <= lastLine) break;
        }
        row.fit = { shown: count, overflows };
      }
      renderMore(row, isOpen);
    };

    const renderRow = (row: Row, isOpen: boolean) => {
      const view = rowView(isOpen);
      row.element.toggleAttribute("data-on", isOpen);
      row.head.className = view.head;
      row.head.setAttribute("aria-expanded", String(isOpen));
      row.company.className = view.company;
      row.chevron.className = view.chevron;
      row.stack.className = view.stack;
      for (const pill of row.pills) {
        pill.className = view.pill;
        const mark = pill.querySelector(":scope > span");
        if (mark) mark.className = view.mark;
      }
      if (isOpen) row.body.replaceChildren(document.importNode(row.achievements.content, true));
      else row.body.replaceChildren();
      renderMore(row, isOpen);
    };

    const toggle = (index: number) => {
      const before = reducedMotion() ? null : snapshotOf(this);
      const was = open;
      open = open === index ? -1 : index;
      expanded = false;
      for (const at of new Set([was, open])) {
        const row = rows[at];
        if (!row) continue;
        renderRow(row, at === open);
        measure(row);
      }
      if (before) glideFrom(this, before);
    };

    rows.forEach((row, index) => {
      row.head.addEventListener("click", () => toggle(index), { signal });
      row.more.addEventListener(
        "click",
        (event) => {
          if (!(event.target instanceof HTMLButtonElement)) return;
          expanded = !expanded;
          renderMore(row, true);
          measure(row);
        },
        { signal },
      );
    });

    const measureAll = () => rows.forEach(measure);
    measureAll();
    // Web fonts change the badges' widths without changing the list's.
    void document.fonts.ready.then(() => !signal.aborted && measureAll());
    document.fonts.addEventListener("loadingdone", measureAll, { signal });
    const resizes = rows.map((row) => {
      let width = row.stack.offsetWidth;
      const observer = new ResizeObserver(() => {
        if (row.stack.offsetWidth === width) return;
        width = row.stack.offsetWidth;
        measure(row);
      });
      observer.observe(row.stack);
      return observer;
    });

    this.#stop = () => {
      controller.abort();
      for (const observer of resizes) observer.disconnect();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("experience-list", ExperienceList);
