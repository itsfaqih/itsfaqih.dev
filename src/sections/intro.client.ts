const SKIP_GRACE_MS = 1200;

/**
 * Calls `onDone` once the intro is over: now when it already is (html.no-intro), or on the
 * intro-done event its element sends.
 */
export function whenIntroDone(signal: AbortSignal, onDone: () => void) {
  if (document.documentElement.classList.contains("no-intro")) return onDone();
  addEventListener("intro-done", onDone, { once: true, signal });
}

/**
 * The intro (intro.astro), driven by classes on its element: .play starts the run, .out ends it.
 * The element's own animation times the run, and a click or key skips it after a grace period.
 */
class HomeIntro extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const html = document.documentElement;
    if (html.classList.contains("no-intro")) {
      this.remove();
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    const openedAt = performance.now();
    let removeTimer = 0;
    const finish = () => {
      if (this.classList.contains("out")) return;
      this.classList.add("out");
      html.classList.add("no-intro");
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
      dispatchEvent(new Event("intro-done"));
      removeTimer = window.setTimeout(() => this.remove(), 700);
    };
    const skip = () => {
      if (performance.now() - openedAt > SKIP_GRACE_MS) finish();
    };

    this.addEventListener(
      "animationend",
      (event) => {
        if (event.target === this) finish();
      },
      { signal },
    );
    this.addEventListener("click", skip, { signal });
    addEventListener(
      "keydown",
      (event) => {
        if (["Escape", "Enter", " "].includes(event.key)) skip();
      },
      { signal },
    );
    this.classList.add("play");
    this.#stop = () => {
      controller.abort();
      clearTimeout(removeTimer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("home-intro", HomeIntro);
