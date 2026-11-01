import { view } from "./button-design.styles";

/** A lesson's on/off switch (button-toggle.astro); the demo's styles read its aria-pressed. */
class ButtonToggle extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
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
      { signal: controller.signal },
    );
    this.#stop = () => controller.abort();
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("button-toggle", ButtonToggle);
