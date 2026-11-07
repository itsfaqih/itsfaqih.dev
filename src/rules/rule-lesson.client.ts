import { reducedMotion } from "../hooks/media-query";
import { mountHints } from "./hint-layer";
import { lessonView, type SideKey } from "./rule-landing.view";
import { OUT, TABBED } from "./rule-landing.css";
import { belowFold, onceOnScreen } from "./rule-motion";

/**
 * A lesson card (rule-lesson.astro). Its keys flip the demo between the ✕ and ✓ panes, which on
 * phones share one well, so the rows that change place glide there. A phone scrolled to the card
 * first sees ✕, then the card plays ✓ once on screen. Hint arrows point at the demo's controls
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

    const hints = mountHints(card);

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
      hints.redraw();
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
    if (!reducedMotion() && matchMedia(TABBED).matches && belowFold(card)) {
      rewound = true;
      show("bad");
      stopRewind = onceOnScreen(card, 700, () => {
        if (!touched) show("good");
      });
    }

    this.#stop = () => {
      controller.abort();
      stopRewind();
      hints.stop();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-lesson", RuleLesson);
