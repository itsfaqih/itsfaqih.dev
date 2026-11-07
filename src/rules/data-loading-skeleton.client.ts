import { reducedMotion } from "../hooks/media-query";
import { play } from "../hooks/sound";
import {
  type Load,
  type Shown,
  SKELETON,
  shownAt,
  skeletonChoice,
  skeletonSays,
} from "./data-loading";
import { Demo, slider } from "./data-loading-demo";
import { skeletonView } from "./data-loading.view";

type Choice = ReturnType<typeof skeletonChoice>;

const STEP = 0.01;
const BIG_STEP = 0.05;
// A tick plays each time the marker crosses one of these, so a drag sounds its distance.
const TICK = 0.05;
// How long the playhead takes to cross the whole track. The preview runs slower than real time so
// a skeleton set too early stays up long enough to see before the fast reply replaces it.
const TRACK_MS = 3000;

const isLoad = (value: string | undefined): value is Load => value === "fast" || value === "slow";

/**
 * Quiz 4's board (data-loading-skeleton.astro). Dragging the skeleton marker, or its arrow keys,
 * moves when the skeleton shows; letting go, switching the load, or Replay plays that load past the
 * preview. Check carries the answer the marker's zone is.
 */
class DataLoadingSkeleton extends Demo {
  protected setup(signal: AbortSignal) {
    const track = this.query("track");
    const handle = this.query("handle");
    const head = this.query("head");
    const said = this.query("said");
    const matches = [...this.querySelectorAll<HTMLElement>('[data-part="match"]')];
    const keys = [...this.querySelectorAll<HTMLButtonElement>("[data-load]")];
    const check = this.querySelector<HTMLButtonElement>('[data-look="check"]')!;
    const notes: Record<Choice, string> = JSON.parse(this.dataset.notes!);
    const labels: Record<Choice, string> = JSON.parse(this.dataset.labels!);

    let at: number = SKELETON.from;
    let load: Load = "fast";
    let shown: Shown = "data";
    let frame = 0;

    const show = (next: Shown) => {
      if (next === shown) return;
      shown = next;
      for (const match of matches) match.className = skeletonView.match(next, true);
    };

    const halt = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const run = () => {
      halt();
      said.textContent = skeletonSays(load, at);
      if (reducedMotion()) {
        head.hidden = true;
        show("data");
        return;
      }
      const lands = SKELETON.lands[load];
      // A frame's timestamp is when the frame began, which can be earlier than performance.now() at
      // the call, so the clock starts at the first frame's own timestamp.
      let from: number | undefined;
      const step = (now: number) => {
        from ??= now;
        const t = Math.min(lands, (now - from) / TRACK_MS);
        head.style.setProperty("--at", String(t));
        show(shownAt(load, at, t));
        frame = t < lands ? requestAnimationFrame(step) : 0;
      };
      head.style.setProperty("--at", "0");
      show(shownAt(load, at, 0));
      head.hidden = false;
      frame = requestAnimationFrame(step);
    };

    const set = (value: number) => {
      const next = Math.max(0, Math.min(1, Math.round(value * 100) / 100));
      if (next === at) return;
      if (Math.floor(next / TICK) !== Math.floor(at / TICK)) play("move");
      at = next;
      const id = skeletonChoice(at);
      handle.style.setProperty("--at", String(at));
      handle.setAttribute("aria-valuenow", String(Math.round(at * 100)));
      handle.setAttribute("aria-valuetext", labels[id]);
      check.dataset.slot = id;
      check.dataset.note = notes[id];
    };

    // The marker's reach is the lane less the marker, as the styles place it.
    slider(
      {
        board: this,
        track,
        handle,
        check,
        at: () => at,
        set,
        scale: (px) => px / (track.clientWidth - handle.offsetWidth),
        keys: [STEP, BIG_STEP, 1],
        hold: halt,
        settle: run,
      },
      signal,
    );

    for (const key of keys)
      key.addEventListener(
        "click",
        () => {
          const picked = key.dataset.load;
          if (!isLoad(picked)) return;
          load = picked;
          for (const other of keys) {
            const on = other === key;
            other.className = skeletonView.key(on);
            other.setAttribute("aria-pressed", String(on));
          }
          play("tap");
          run();
        },
        { signal },
      );
    this.query("replay").addEventListener("click", run, { signal });
    signal.addEventListener("abort", halt);
  }
}

customElements.define("data-loading-skeleton", DataLoadingSkeleton);
