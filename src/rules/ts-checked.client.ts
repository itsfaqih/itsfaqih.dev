import { reducedMotion } from "../hooks/media-query";
import { OUT, TABBED } from "./rule-landing.css";
import { onceOnScreen } from "./rule-motion";
import { LINE_HEIGHT, styles } from "./typescript-code-writing.css";

/** How far apart, in ms, tsc reaches each line. */
const STEP = 110;

type Phase = "idle" | "run" | "done";

/**
 * A pane of code with tsc's verdict on each line (ts-checked.astro). Run tsc sweeps a cursor down
 * the lines and brings each output in as it passes. A pane that starts below the fold hides its
 * output and runs on its own once it scrolls into view, unless Run tsc was pressed first.
 */
class TsChecked extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const rows = [...this.querySelectorAll<HTMLElement>(".ts-ln")];
    const marks = [...this.querySelectorAll<HTMLElement>(".ts-out, .ts-sq")];
    const cursor = this.querySelector<HTMLElement>(".ts-cursor")!;
    const summary = this.querySelector<HTMLElement>("[aria-live]")!;
    const run = this.querySelector("button")!;
    // As the server rendered it, tsc's verdict: "1 error", "3 errors".
    const verdict = summary.textContent;
    let wait = 0;
    let timer = 0;
    let stopWatch = () => {};

    const show = (phase: Phase) => {
      for (const mark of marks) mark.classList.toggle(styles.unrun, phase === "idle");
      summary.textContent =
        phase === "idle" ? "not run yet" : phase === "run" ? "checking…" : verdict;
      // aria-disabled, not disabled: pressing it disables it, and a disabled button drops focus.
      if (phase === "run") run.setAttribute("aria-disabled", "true");
      else run.removeAttribute("aria-disabled");
    };

    const check = () => {
      clearTimeout(timer);
      if (reducedMotion()) {
        show("done");
        for (const mark of marks) {
          mark.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
        }
        return;
      }
      show("run");
      const total = rows.length * STEP;
      cursor.animate(
        [
          ...rows.map((row, index) => ({
            offset: index / rows.length,
            opacity: 1,
            transform: `translateY(${row.offsetTop}px) scaleY(${row.offsetHeight / LINE_HEIGHT})`,
            easing: OUT,
          })),
          {
            offset: 1,
            opacity: 0,
            transform: `translateY(${rows.at(-1)?.offsetTop ?? 0}px)`,
          },
        ],
        { duration: total },
      );
      rows.forEach((row, index) => {
        const delay = index * STEP + 40;
        row.querySelector(".ts-out")?.animate(
          [
            { opacity: 0, transform: "translateX(-6px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 200, delay, easing: OUT, fill: "backwards" },
        );
        row.querySelector(".ts-sq")?.animate([{ transform: "scaleX(0)" }, { transform: "none" }], {
          duration: 240,
          delay,
          easing: OUT,
          fill: "backwards",
        });
      });
      timer = window.setTimeout(() => show("done"), total);
    };

    run.addEventListener(
      "click",
      () => {
        if (run.hasAttribute("aria-disabled")) return;
        stopWatch();
        clearTimeout(wait);
        check();
      },
      { signal: controller.signal },
    );

    if (
      !reducedMotion() &&
      !matchMedia(TABBED).matches &&
      this.getBoundingClientRect().top >= innerHeight * 0.7
    ) {
      show("idle");
      stopWatch = onceOnScreen(this, () => {
        wait = window.setTimeout(check, 300);
      });
    }

    this.#stop = () => {
      controller.abort();
      stopWatch();
      clearTimeout(wait);
      clearTimeout(timer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("ts-checked", TsChecked);
