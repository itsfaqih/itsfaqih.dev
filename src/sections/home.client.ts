import { watchCutIns } from "./cut-ins";
import { whenIntroDone } from "./intro.client";

/** The home page (home.astro). Its cut-ins wait for the intro to hand off. */
class HomePage extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    let unwatch: (() => void) | undefined;
    // The intro holds the cut-ins, so the head script's rest fallback must stand down now.
    this.dispatchEvent(new Event("cut-ins", { bubbles: true }));
    whenIntroDone(controller.signal, () => {
      unwatch = watchCutIns(this);
    });
    this.#stop = () => {
      controller.abort();
      unwatch?.();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("home-page", HomePage);
