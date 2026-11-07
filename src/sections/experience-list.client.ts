import { watchBoxScrollbar } from "../components/box-scrollbar";
import { reducedMotion } from "../hooks/media-query";
import { play } from "../hooks/sound";
import { moreLabel, rowView } from "./experience-list.view";

const MAX_ROWS = 2;
// A badge fades out of its old spot fast and settles into its new one slower.
const PILL_OUT = 110;
const PILL_IN = 320;
// Past this many badges the rest arrive together, so a long stack doesn't keep the row busy.
const STAGGER_CAP = 10;
const FADE_PX = 28;
const OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

type Snapshot = {
  height: number;
  rows: Map<Element, number>;
  pills: Map<Element, { xInRow: number; yInRow: number }>;
};

function snapshotOf(list: HTMLElement): Snapshot {
  const rows = new Map<Element, number>();
  const pills = new Map<Element, { xInRow: number; yInRow: number }>();
  for (const row of list.children) {
    const box = row.getBoundingClientRect();
    rows.set(row, box.top);
    const shown = row.querySelector("[data-stack] > ul")!.getBoundingClientRect();
    row.querySelectorAll("[data-tool], [data-more]").forEach((pill) => {
      const at = pill.getBoundingClientRect();
      // A hidden badge, or one scrolled out of sight, has no spot to glide from or to.
      if (at.width === 0 || at.bottom <= shown.top || at.top >= shown.bottom) return;
      pills.set(pill, { xInRow: at.left - box.left, yInRow: at.top - box.top });
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
  // and only its arrival in the new spot is staggered. Only the badges that move or newly show take
  // a place in the stagger, so one after hidden or unmoved badges doesn't arrive late.
  let stack: Element | null = null;
  let order = 0;
  after.pills.forEach((to, pill) => {
    const from = before.pills.get(pill);
    const dx = from ? from.xInRow - to.xInRow : 0;
    const dy = from ? from.yInRow - to.yInRow : 0;
    if (from && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    if (pill.parentElement !== stack) {
      stack = pill.parentElement;
      order = 0;
    }
    const duration = PILL_OUT + Math.min(order++, STAGGER_CAP) * 18 + PILL_IN;
    const gone = PILL_OUT / duration;
    const back = (duration - PILL_IN) / duration;
    const waiting = { opacity: 0, transform: "translateX(-18px)" };
    pill.animate(
      [
        ...(from
          ? [
              { offset: 0, opacity: 1, transform: `translate(${dx}px, ${dy}px)`, easing: OUT },
              { offset: gone, opacity: 0, transform: `translate(${dx}px, ${dy - 6}px)` },
            ]
          : [{ offset: 0, ...waiting }]),
        { offset: back, ...waiting, easing: glide.easing },
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
  frame: HTMLElement;
  stack: HTMLUListElement;
  track: HTMLElement;
  hint: HTMLElement;
  pills: HTMLElement[];
  more: HTMLElement;
  moreLabel: HTMLElement;
  body: HTMLElement;
  achievements: HTMLTemplateElement;
  shown: number;
};

/**
 * The work history (experience-list.astro). A row's head opens it and closes the one open, and the
 * list glides to the new layout. A closed row holds its tools to two rows, the second ending in a
 * pill counting the rest. The open row shows them all, scrolling within the achievements' height.
 * Opening a row plays a page turn, and closing the open one a flick.
 */
class ExperienceList extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const rows: Row[] = [...this.querySelectorAll<HTMLElement>(":scope > *")].map((element) => {
      const frame = element.querySelector<HTMLElement>(":scope > [data-stack]")!;
      const stack = frame.querySelector<HTMLUListElement>(":scope > ul")!;
      const pills = [...stack.querySelectorAll<HTMLElement>(":scope > [data-tool]")];
      const more = stack.querySelector<HTMLElement>(":scope > [data-more]")!;
      return {
        element,
        head: element.querySelector(":scope > h3 > button")!,
        company: element.querySelector(":scope > h3 > button > :nth-child(2)")!,
        chevron: element.querySelector(":scope > h3 > button > span:last-child")!,
        frame,
        stack,
        track: frame.querySelector(":scope > div[aria-hidden]")!,
        hint: frame.querySelector(":scope > span[aria-hidden]")!,
        pills,
        more,
        moreLabel: more.querySelector(":scope > * > :first-child")!,
        body: element.querySelector(":scope > [data-body]")!,
        achievements: element.querySelector(":scope > template")!,
        shown: pills.length,
      };
    });

    let open = 0;
    let gliding = 0;
    let stopBar = () => {};

    const renderMore = (row: Row) => {
      const hidden = row.pills.length - row.shown;
      row.moreLabel.textContent = moreLabel(hidden);
      row.more.hidden = hidden === 0;
    };

    // Each fade grows with the distance left to scroll, so it's gone by the time that end is reached.
    const renderFades = ({ frame, stack }: Row) => {
      const below = stack.scrollHeight - stack.clientHeight - stack.scrollTop;
      frame.style.setProperty("--fade-top", String(Math.min(1, stack.scrollTop / FADE_PX)));
      frame.style.setProperty("--fade-bottom", String(Math.max(0, Math.min(1, below / FADE_PX))));
    };

    // Measured on the page: lay every tool out, find where the third row starts, then give back
    // tools from the end until the count pill fits on the second row.
    const measure = (row: Row) => {
      const isOpen = rows.indexOf(row) === open;
      const { pills, more, stack } = row;
      const show = (count: number) =>
        pills.forEach((pill, at) => (pill.style.display = at < count ? "" : "none"));
      show(pills.length);
      more.hidden = true;
      const lines = [...new Set(pills.map((pill) => pill.offsetTop))];
      row.shown = pills.length;
      if (!isOpen && lines.length > MAX_ROWS) {
        const lastLine = lines[MAX_ROWS - 1]!;
        let count = pills.findIndex((pill) => pill.offsetTop > lastLine);
        more.hidden = false;
        for (; count > 0; count--) {
          show(count);
          row.moreLabel.textContent = moreLabel(pills.length - count);
          if (more.offsetTop <= lastLine) break;
        }
        row.shown = count;
      }
      renderMore(row);
      renderFades(row);
      // Keyboards can reach a box that scrolls; one that doesn't stays out of the tab order.
      if (isOpen && stack.scrollHeight > stack.clientHeight) stack.tabIndex = 0;
      else stack.removeAttribute("tabindex");
    };

    const renderRow = (row: Row, isOpen: boolean) => {
      const view = rowView(isOpen);
      row.element.toggleAttribute("data-on", isOpen);
      row.head.className = view.head;
      row.head.setAttribute("aria-expanded", String(isOpen));
      row.company.className = view.company;
      row.chevron.className = view.chevron;
      row.frame.className = view.frame;
      row.stack.className = view.stack;
      row.hint.className = view.hint;
      row.stack.removeAttribute("data-gliding");
      row.stack.scrollTop = 0;
      for (const pill of row.pills) {
        pill.className = view.pill;
        const mark = pill.querySelector(":scope > span");
        if (mark) mark.className = view.mark;
      }
      if (isOpen) row.body.replaceChildren(document.importNode(row.achievements.content, true));
      else row.body.replaceChildren();
    };

    const watchOpenBar = () => {
      stopBar();
      const row = rows[open];
      if (!row) {
        stopBar = () => {};
        return;
      }
      const stop = watchBoxScrollbar(row.stack, row.track);
      stopBar = () => {
        stop();
        row.track.setAttribute("hidden", "");
        delete row.track.dataset.shown;
      };
    };

    const toggle = (index: number) => {
      const before = reducedMotion() ? null : snapshotOf(this);
      const was = open;
      open = open === index ? -1 : index;
      play(open === -1 ? "collapse" : "expand");
      for (const at of new Set([was, open])) {
        const row = rows[at];
        if (!row) continue;
        renderRow(row, at === open);
        measure(row);
      }
      watchOpenBar();
      if (!before) return;
      glideFrom(this, before);
      // The box would clip badges gliding in from outside it, so it only clips once they've landed.
      const stack = rows[open]?.stack;
      if (!stack) return;
      const run = ++gliding;
      stack.toggleAttribute("data-gliding", true);
      void Promise.allSettled(
        stack.getAnimations({ subtree: true }).map((animation) => animation.finished),
      ).then(() => {
        if (run === gliding) stack.removeAttribute("data-gliding");
      });
    };

    rows.forEach((row, index) => {
      row.head.addEventListener("click", () => toggle(index), { signal });
      row.stack.addEventListener("scroll", () => renderFades(row), { passive: true, signal });
    });

    const measureAll = () => rows.forEach(measure);
    measureAll();
    watchOpenBar();
    // Web fonts change the badges' widths without changing the list's.
    void document.fonts.ready.then(() => !signal.aborted && measureAll());
    document.fonts.addEventListener("loadingdone", measureAll, { signal });
    const resizes = rows.map((row) => {
      let width = row.stack.offsetWidth;
      const observer = new ResizeObserver(() => {
        renderFades(row);
        if (row.stack.offsetWidth === width) return;
        width = row.stack.offsetWidth;
        measure(row);
      });
      observer.observe(row.stack);
      return observer;
    });

    this.#stop = () => {
      controller.abort();
      stopBar();
      for (const observer of resizes) observer.disconnect();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("experience-list", ExperienceList);
