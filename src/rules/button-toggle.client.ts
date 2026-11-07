import { view } from "./button-design.view";

/** A lesson's on/off switch (button-toggle.astro); the demo's styles read its aria-pressed. */
class ButtonToggle extends HTMLElement {
  #controller?: AbortController;

  connectedCallback() {
    this.#controller = new AbortController();
    const toggle = this.querySelector("button")!;
    const dot = toggle.querySelector("span")!;
    let on = false;
    toggle.addEventListener(
      "click",
      () => {
        on = !on;
        toggle.setAttribute("aria-pressed", String(on));
        dot.className = view.dot(on);
      },
      { signal: this.#controller.signal },
    );
  }

  disconnectedCallback() {
    this.#controller?.abort();
  }
}

customElements.define("button-toggle", ButtonToggle);
