import { play } from "../browser/sound";
import { AXIS, rowsAt, SLIDE, slideChoice, slideSays } from "./data-loading";
import { Demo, slider } from "./data-loading-demo";
import { pct, slideView } from "./data-loading.view";

type Choice = ReturnType<typeof slideChoice>;

const STEP = 10;
const BIG_STEP = 50;
// A tick plays each time the start crosses one of these, so a drag sounds its distance.
const TICK = 50;

/**
 * Quiz 2's board (data-loading-slide.astro). Dragging GET /invoices, or its arrow keys, moves its
 * start a step at a time; the rows' bar and paint line follow, and Check carries the answer that
 * start is.
 */
class DataLoadingSlide extends Demo {
  protected setup(signal: AbortSignal) {
    const track = this.query("track");
    const handle = this.query("handle");
    const rows = this.query("rows");
    const paint = this.query("paint");
    const tag = this.query("tag");
    const readout = this.query("start");
    const check = this.querySelector<HTMLButtonElement>('[data-look="check"]')!;
    const notes: Record<Choice, string> = JSON.parse(this.dataset.notes!);
    const labels: Record<Choice, string> = JSON.parse(this.dataset.labels!);

    let start: number = SLIDE.from;

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
      readout.textContent = labels[id];
      handle.setAttribute("aria-valuenow", String(start));
      handle.setAttribute("aria-valuetext", slideSays(labels[id], start));
      check.dataset.slot = id;
      check.dataset.note = notes[id];
    };

    slider(
      {
        board: this,
        track,
        handle,
        check,
        at: () => start,
        set,
        scale: (px) => (px / track.clientWidth) * AXIS,
        keys: [STEP, BIG_STEP, AXIS],
      },
      signal,
    );
  }
}

customElements.define("data-loading-slide", DataLoadingSlide);
