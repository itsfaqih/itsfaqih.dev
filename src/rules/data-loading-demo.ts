import { view } from "./data-loading.styles";

type Step = readonly [at: number, run: () => void];

/**
 * A data-loading demo (data-loading-*.astro). Its server is a script of timed steps: `play` starts
 * one and drops the steps still pending from the last, and leaving the page drops them too.
 */
export abstract class Demo extends HTMLElement {
  #timers: number[] = [];
  #controller?: AbortController;

  protected abstract setup(signal: AbortSignal): void;

  protected query<T extends Element = HTMLElement>(name: string) {
    return this.querySelector<T>(`[data-part="${name}"]`)!;
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
