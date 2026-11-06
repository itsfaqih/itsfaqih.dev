import { play } from "../hooks/sound";
import { AXIS, rowsAt, SLIDE, slideChoice } from "./data-loading";
import { slideView } from "./data-loading.view";

const STEP = 10;
const BIG_STEP = 50;
// A tick plays each time the start crosses one of these, so a drag sounds its distance.
const TICK = 50;

/**
 * The first quiz's board (data-loading-slide.astro). Dragging GET /invoices, or its arrow keys, moves
 * its start in 10ms steps; the rows' bar and paint line follow, and Check carries the answer that
 * start is. The quiz locks Check once cleared, and the bar locks with it.
 */
const KEY_STEPS = new Map([
  ["ArrowLeft", -STEP],
  ["ArrowDown", -STEP],
  ["ArrowRight", STEP],
  ["ArrowUp", STEP],
  ["PageDown", -BIG_STEP],
  ["PageUp", BIG_STEP],
  ["Home", -AXIS],
  ["End", AXIS],
]);

class DataLoadingSlide extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = (name: string) => this.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
    const track = part("track");
    const handle = part("handle");
    const rows = part("rows");
    const paint = part("paint");
    const tag = part("tag");
    const readout = part("start");
    const check = this.querySelector<HTMLButtonElement>('[data-look="check"]')!;
    const notes: Record<string, string> = JSON.parse(this.dataset.notes!);
    const pct = (ms: number) => `${(ms / AXIS) * 100}%`;

    let start: number = SLIDE.from;
    const locked = () => check.disabled;

    const set = (ms: number) => {
      const next = Math.max(0, Math.min(SLIDE.max, Math.round(ms / STEP) * STEP));
      if (next === start) return;
      if (Math.floor(next / TICK) !== Math.floor(start / TICK)) play("move");
      start = next;
      const shown = rowsAt(start);
      const id = slideChoice(start);
      handle.style.left = pct(start);
      rows.style.left = pct(shown - SLIDE.render);
      paint.style.left = pct(shown);
      tag.className = slideView.tag(shown);
      tag.textContent = `${shown}ms`;
      readout.textContent = `${start}ms`;
      handle.setAttribute("aria-valuenow", String(start));
      handle.setAttribute("aria-valuetext", `${start}ms, rows show at ${shown}ms`);
      check.dataset.slot = id;
      check.dataset.note = notes[id];
    };

    // Grabbing the bar keeps the point under the finger; pressing the lane beside it moves the bar's
    // start there first.
    let grab: { x: number; from: number } | null = null;
    const msAt = (x: number) =>
      ((x - track.getBoundingClientRect().left) / track.clientWidth) * AXIS;
    track.addEventListener(
      "pointerdown",
      (event) => {
        if (locked() || event.button !== 0) return;
        event.preventDefault();
        track.setPointerCapture(event.pointerId);
        handle.focus({ preventScroll: true });
        play("lift");
        if (event.target !== handle) set(msAt(event.clientX));
        grab = { x: event.clientX, from: start };
        this.toggleAttribute("data-dragging", true);
      },
      { signal },
    );
    track.addEventListener(
      "pointermove",
      (event) => {
        if (grab) set(grab.from + ((event.clientX - grab.x) / track.clientWidth) * AXIS);
      },
      { signal },
    );
    const release = () => {
      if (!grab) return;
      grab = null;
      this.removeAttribute("data-dragging");
      play("place");
    };
    track.addEventListener("pointerup", release, { signal });
    track.addEventListener("pointercancel", release, { signal });

    handle.addEventListener(
      "keydown",
      (event) => {
        const step = KEY_STEPS.get(event.key);
        if (step === undefined || locked()) return;
        event.preventDefault();
        set(start + step);
      },
      { signal },
    );

    // The quiz disables Check once it's cleared; the bar takes the same lock.
    const lock = new MutationObserver(() => {
      if (!locked()) return;
      handle.setAttribute("aria-disabled", "true");
      this.toggleAttribute("data-locked", true);
    });
    lock.observe(check, { attributes: true, attributeFilter: ["disabled"] });

    this.#stop = () => {
      controller.abort();
      lock.disconnect();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("data-loading-slide", DataLoadingSlide);
