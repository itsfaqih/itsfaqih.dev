import { play } from "../hooks/sound";
import { view } from "./data-loading.view";

type Step = readonly [at: number, run: () => void];

/**
 * A data-loading demo or quiz board (data-loading-*.astro). A demo's server is a script of timed
 * steps: `play` starts one and drops the steps still pending from the last, and leaving the page
 * drops them too, with every listener `setup` added on its signal.
 */
export abstract class Demo extends HTMLElement {
  #timers: number[] = [];
  #controller?: AbortController;

  protected abstract setup(signal: AbortSignal): void;

  protected query<T extends Element = HTMLElement>(name: string) {
    return this.querySelector<T>(`[data-part="${name}"]`)!;
  }

  /**
   * Runs `run` on each press of `key` that lands while it is not busy. A busy key stays enabled,
   * since disabling the key a reader just pressed drops their focus to the page.
   */
  protected onPress(key: HTMLButtonElement, run: () => void, signal: AbortSignal) {
    key.addEventListener(
      "click",
      () => {
        if (key.getAttribute("aria-disabled") !== "true") run();
      },
      { signal },
    );
  }

  protected play(steps: readonly Step[]) {
    this.#clear();
    for (const [at, run] of steps) this.#timers.push(window.setTimeout(run, at));
  }

  connectedCallback() {
    this.#controller = new AbortController();
    this.setup(this.#controller.signal);
  }

  disconnectedCallback() {
    this.#controller?.abort();
    this.#clear();
  }

  #clear() {
    for (const timer of this.#timers) clearTimeout(timer);
    this.#timers = [];
  }
}

/** Greys out a demo key while its run plays. `onPress` ignores it meanwhile. */
export function busy(key: HTMLButtonElement, on: boolean) {
  key.setAttribute("aria-disabled", String(on));
}

export function spinner(small: boolean, inFigure = false) {
  const span = document.createElement("span");
  span.className = view.spin(small, inFigure);
  span.setAttribute("aria-hidden", "true");
  return span;
}

/** An element with `className` and its text, the shape every demo row is built from. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  ...children: (Node | string)[]
) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

/** Sets a text node in place, as a re-render does, so a live region hears only real changes. */
export function write(node: ChildNode | null, text: string) {
  if (node instanceof Text && node.data !== text) node.data = text;
}

type Slider = {
  board: HTMLElement;
  track: HTMLElement;
  handle: HTMLElement;
  check: HTMLButtonElement;
  /** The value now, and how the board moves it: `set` clamps, snaps and paints it. */
  at: () => number;
  set: (value: number) => void;
  /** How far a drag of `px` pixels moves the value. */
  scale: (px: number) => number;
  /** An arrow key's step, a Page key's, and the range Home and End jump. */
  keys: readonly [step: number, big: number, max: number];
  /** Runs as a drag or a key press starts, and again as the drag lands or the key comes up. */
  hold?: () => void;
  settle?: () => void;
};

/**
 * A quiz board's slider (data-loading-slide.astro, data-loading-skeleton.astro). Grabbing the
 * handle keeps the point under the finger; pressing the lane beside it moves the handle there
 * first. The quiz disables Check once cleared, and the slider takes the same lock.
 */
export function slider(
  { board, track, handle, check, at, set, scale, keys: [step, big, max], hold, settle }: Slider,
  signal: AbortSignal,
) {
  const keys = new Map([
    ["ArrowLeft", -step],
    ["ArrowDown", -step],
    ["ArrowRight", step],
    ["ArrowUp", step],
    ["PageDown", -big],
    ["PageUp", big],
    ["Home", -max],
    ["End", max],
  ]);
  const locked = () => check.disabled;

  let grab: { x: number; from: number } | null = null;
  track.addEventListener(
    "pointerdown",
    (event) => {
      if (locked() || event.button !== 0) return;
      event.preventDefault();
      track.setPointerCapture(event.pointerId);
      handle.focus({ preventScroll: true });
      hold?.();
      play("lift");
      if (!(event.target instanceof Node && handle.contains(event.target)))
        set(scale(event.clientX - track.getBoundingClientRect().left));
      grab = { x: event.clientX, from: at() };
      board.toggleAttribute("data-dragging", true);
    },
    { signal },
  );
  track.addEventListener(
    "pointermove",
    (event) => {
      if (grab) set(grab.from + scale(event.clientX - grab.x));
    },
    { signal },
  );
  const release = (event: PointerEvent) => {
    if (!grab) return;
    grab = null;
    board.removeAttribute("data-dragging");
    play("place");
    if (event.type === "pointerup") settle?.();
  };
  track.addEventListener("pointerup", release, { signal });
  track.addEventListener("pointercancel", release, { signal });

  handle.addEventListener(
    "keydown",
    (event) => {
      const by = keys.get(event.key);
      if (by === undefined || locked()) return;
      event.preventDefault();
      hold?.();
      set(at() + by);
    },
    { signal },
  );
  handle.addEventListener(
    "keyup",
    (event) => {
      if (keys.has(event.key) && !locked()) settle?.();
    },
    { signal },
  );

  const lock = new MutationObserver(() => {
    if (!locked()) return;
    handle.setAttribute("aria-disabled", "true");
    board.toggleAttribute("data-locked", true);
  });
  lock.observe(check, { attributes: true, attributeFilter: ["disabled"] });
  signal.addEventListener("abort", () => lock.disconnect());
}
