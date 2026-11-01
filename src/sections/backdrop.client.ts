import { animateDots } from "./backdrop-dots";

/**
 * The dot-screen backdrop (backdrop.astro). Without script there is none; with it, the element puts
 * its template's screen at the end of <body>, out of every stacking context the page sets up, and
 * livens it.
 */
class SiteBackdrop extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const template = this.querySelector("template")!;
    const screen = document.importNode(template.content.firstElementChild!, true);
    document.body.append(screen);
    const stopDots = animateDots(screen, this.hasAttribute("data-tide"));
    this.#stop = () => {
      stopDots?.();
      screen.remove();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("site-backdrop", SiteBackdrop);
