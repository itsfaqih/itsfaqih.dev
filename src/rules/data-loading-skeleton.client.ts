import { reducedMotion } from "../hooks/media-query";
import { play } from "../hooks/sound";
import { type Load, type Shown, SKELETON, shownAt, skeletonChoice, skeletonSays } from "./data-loading";
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

const KEY_STEPS = new Map([
  ["ArrowLeft", -STEP],
  ["ArrowDown", -STEP],
  ["ArrowRight", STEP],
  ["ArrowUp", STEP],
  ["PageDown", -BIG_STEP],
  ["PageUp", BIG_STEP],
  ["Home", -1],
  ["End", 1],
]);

/**
 * Quiz 4's board (data-loading-skeleton.astro). Dragging the skeleton marker, or its arrow keys,
 * moves when the skeleton shows; letting go, switching the load, or Replay plays that load past the
 * preview. Check carries the answer the marker's zone is. The quiz locks Check once cleared, and the
 * marker locks with it.
 */
class DataLoadingSkeleton extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = (name: string) => this.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
    const track = part("track");
    const handle = part("handle");
    const head = part("head");
    const preview = part("preview");
    const said = part("said");
    const matches = [...this.querySelectorAll<HTMLElement>('[data-part="match"]')];
    const keys = [...this.querySelectorAll<HTMLButtonElement>("[data-load]")];
    const check = this.querySelector<HTMLButtonElement>('[data-look="check"]')!;
    const notes: Record<Choice, string> = JSON.parse(this.dataset.notes!);
    const labels: Record<Choice, string> = JSON.parse(this.dataset.labels!);

    let at: number = SKELETON.from;
    let load: Load = "fast";
    let shown: Shown = "data";
    let frame = 0;
    const locked = () => check.disabled;

    const show = (next: Shown) => {
      if (next === shown) return;
      shown = next;
      preview.dataset.shown = next;
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

    // Grabbing the marker keeps the point under the finger; pressing the lane beside it moves the
    // marker's edge there first. Its reach is the lane less the marker, as the styles place it.
    let grab: { x: number; from: number } | null = null;
    const reach = () => track.clientWidth - handle.offsetWidth;
    const atX = (x: number) => (x - track.getBoundingClientRect().left) / reach();
    track.addEventListener(
      "pointerdown",
      (event) => {
        if (locked() || event.button !== 0) return;
        event.preventDefault();
        track.setPointerCapture(event.pointerId);
        handle.focus({ preventScroll: true });
        halt();
        play("lift");
        if (!(event.target instanceof Node && handle.contains(event.target))) set(atX(event.clientX));
        grab = { x: event.clientX, from: at };
        this.toggleAttribute("data-dragging", true);
      },
      { signal },
    );
    track.addEventListener(
      "pointermove",
      (event) => {
        if (grab) set(grab.from + (event.clientX - grab.x) / reach());
      },
      { signal },
    );
    const release = (event: PointerEvent) => {
      if (!grab) return;
      grab = null;
      this.removeAttribute("data-dragging");
      play("place");
      if (event.type === "pointerup") run();
    };
    track.addEventListener("pointerup", release, { signal });
    track.addEventListener("pointercancel", release, { signal });

    handle.addEventListener(
      "keydown",
      (event) => {
        const step = KEY_STEPS.get(event.key);
        if (step === undefined || locked()) return;
        event.preventDefault();
        halt();
        set(at + step);
      },
      { signal },
    );
    handle.addEventListener(
      "keyup",
      (event) => {
        if (KEY_STEPS.has(event.key) && !locked()) run();
      },
      { signal },
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
    part("replay").addEventListener("click", run, { signal });

    // The quiz disables Check once it's cleared; the marker takes the same lock.
    const lock = new MutationObserver(() => {
      if (!locked()) return;
      handle.setAttribute("aria-disabled", "true");
      this.toggleAttribute("data-locked", true);
    });
    lock.observe(check, { attributes: true, attributeFilter: ["disabled"] });

    this.#stop = () => {
      controller.abort();
      lock.disconnect();
      halt();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("data-loading-skeleton", DataLoadingSkeleton);
