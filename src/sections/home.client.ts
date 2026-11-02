import { glowDots } from "./backdrop-dots";
import { watchCutIns } from "./cut-ins";
import { whenIntroDone } from "./intro.client";

/**
 * The home page (home.astro). Its cut-ins wait for the intro to hand off, and its fixed lights tint
 * the backdrop's dots: orange and blue on opposite corners of the work history, purple around the
 * contact card.
 */
class HomePage extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    let unwatch: (() => void) | undefined;
    const work = this.querySelector("experience-list");
    const contact = this.querySelector("#contact");
    const light = () => {
      glowDots("work-top", work, "var(--ar)", [1, 0, 1, 0]);
      glowDots("work-bottom", work, "var(--cw)", [0, 1, 0, 1]);
      glowDots("contact", contact, "var(--ax)");
    };
    light();
    // A row opening or closing moves these boxes with no scroll to redraw the dots.
    const reflow = new ResizeObserver(light);
    reflow.observe(this);
    // The intro holds the cut-ins, so the head script's rest fallback must stand down now.
    this.dispatchEvent(new Event("cut-ins", { bubbles: true }));
    whenIntroDone(controller.signal, () => {
      unwatch = watchCutIns(this);
    });
    this.#stop = () => {
      controller.abort();
      unwatch?.();
      reflow.disconnect();
      for (const source of ["work-top", "work-bottom", "contact"]) glowDots(source, null);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("home-page", HomePage);
