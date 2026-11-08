import { watchCutIns } from "../sections/cut-ins";

/** The Rule of Thumb index (rule-index.astro). It plays the cut-ins under it. */
class RuleIndex extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    this.#stop = watchCutIns(this);
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-index", RuleIndex);
