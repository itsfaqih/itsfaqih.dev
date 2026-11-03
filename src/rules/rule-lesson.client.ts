import { reducedMotion } from "../hooks/media-query";
import { type Hint, watchHintReader, watchHints } from "./hints";
import { lessonView, type SideKey } from "./rule-landing.view";
import { OUT, TABBED } from "./rule-landing.css";
import { onceOnScreen } from "./rule-motion";

const SVG = "http://www.w3.org/2000/svg";
type Drawn = { svg: SVGSVGElement; path: SVGPathElement; label: HTMLElement; hint: Hint };

/**
 * A lesson card (rule-lesson.astro). Its keys flip the demo between the ✕ and ✓ panes, which on
 * phones share one well, so the rows that change place glide there. A phone scrolled to the card
 * first sees ✕, then the card plays ✓ once on screen. "Try it" arrows point at the demo's controls
 * until the reader touches them.
 */
class RuleLesson extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const card = this.querySelector("article")!;
    const part = <T extends Element = HTMLElement>(name: string) =>
      card.querySelector<T>(`[data-part="${name}"]`)!;
    const demo = part("demo");
    const keys = { bad: part("bad"), good: part("good") };
    const panes = {
      bad: demo.querySelector<HTMLElement>('figure[data-side="bad"]')!,
      good: demo.querySelector<HTMLElement>('figure[data-side="good"]')!,
    };
    const layer = part("hints");
    const ruler = part("ruler");

    let side: SideKey = "good";
    let touched = false;
    let rewound = false;
    let placed = new Map<string, { x: number; y: number }>();

    // Records where each row sits in the shown pane, and glides the rows from where they were.
    const glide = () => {
      const pane = panes[side];
      const origin = pane.getBoundingClientRect();
      const animate =
        placed.size > 0 &&
        !reducedMotion() &&
        matchMedia(TABBED).matches &&
        !(rewound && side === "bad");
      if (side === "bad") rewound = false;
      const next = new Map<string, { x: number; y: number }>();
      for (const row of pane.querySelectorAll<HTMLElement>("[data-k]")) {
        const box = row.getBoundingClientRect();
        const at = { x: box.left - origin.left, y: box.top - origin.top };
        next.set(row.dataset.k ?? "", at);
        if (!animate) continue;
        const from = placed.get(row.dataset.k ?? "");
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
      placed = next;
    };

    let drawn = new Map<string, Drawn>();
    let shown = false;
    const done = new Set<string>();
    const paint = ({ svg, path, label, hint }: Drawn) => {
      const gone = !shown || done.has(hint.zone);
      svg.setAttribute("class", lessonView.hintSvg(gone));
      path.setAttribute("class", lessonView.hintArrow(shown));
      label.className = lessonView.hintLabel(hint.tilt, hint.zone === "copy", gone);
    };
    const draw = (hints: Hint[]) => {
      const next = new Map<string, Drawn>();
      for (const hint of hints) {
        const key = `${hint.zone}-${hint.path}`;
        let mark = drawn.get(key);
        if (!mark) {
          const svg = document.createElementNS(SVG, "svg");
          const path = document.createElementNS(SVG, "path");
          path.setAttribute("d", hint.path);
          path.setAttribute("pathLength", "1");
          svg.append(path);
          const label = document.createElement("span");
          label.textContent = "Try it";
          layer.append(svg, label);
          mark = { svg, path, label, hint };
        }
        mark.hint = hint;
        mark.label.style.left = `${hint.at.x}px`;
        mark.label.style.top = `${hint.at.y}px`;
        paint(mark);
        next.set(key, mark);
      }
      for (const [key, { svg, label }] of drawn) {
        if (next.has(key)) continue;
        svg.remove();
        label.remove();
      }
      drawn = next;
    };
    let stopHints = watchHints(card, ruler, draw);
    const stopReader = watchHintReader(
      card,
      () => {
        shown = true;
        for (const mark of drawn.values()) paint(mark);
      },
      (zone) => {
        if (done.has(zone)) return;
        done.add(zone);
        for (const mark of drawn.values()) paint(mark);
      },
    );

    const show = (next: SideKey) => {
      if (next === side) return;
      side = next;
      demo.dataset.show = side;
      for (const key of ["bad", "good"] as const) {
        keys[key].setAttribute("aria-pressed", String(key === side));
        keys[key].className = lessonView.flipKey(key, key === side);
        panes[key].className = lessonView.pane(key === side);
      }
      glide();
      stopHints();
      stopHints = watchHints(card, ruler, draw);
    };
    for (const key of ["bad", "good"] as const) {
      keys[key].addEventListener(
        "click",
        () => {
          touched = true;
          show(key);
        },
        { signal },
      );
    }

    glide();
    let stopRewind = () => {};
    if (
      !reducedMotion() &&
      matchMedia(TABBED).matches &&
      card.getBoundingClientRect().top >= innerHeight * 0.7
    ) {
      rewound = true;
      show("bad");
      let timer = 0;
      const stop = onceOnScreen(card, () => {
        timer = window.setTimeout(() => {
          if (!touched) show("good");
        }, 700);
      });
      stopRewind = () => {
        stop();
        clearTimeout(timer);
      };
    }

    this.#stop = () => {
      controller.abort();
      stopRewind();
      stopHints();
      stopReader();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-lesson", RuleLesson);
