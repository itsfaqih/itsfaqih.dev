import { TAKEN, view } from "./button-design.styles";

/**
 * The post form (button-publish.astro). Publish is off while the URL is empty or taken. The faded
 * version is plain `disabled`; the careful one stays focusable, says why in a tooltip, and opens
 * that tooltip when pressed.
 */
class ButtonPublish extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = <T extends Element = HTMLElement>(name: string) =>
      this.querySelector<T>(`[data-part="${name}"]`);
    const careful = this.dataset.careful === "true";
    const slug = part<HTMLInputElement>("slug")!;
    const publish = part<HTMLButtonElement>("publish")!;
    const tip = part("tip");
    const check = part<HTMLTemplateElement>("check")!.content.firstElementChild!;

    let published = false;
    let nudged = false;
    let publishedTimer = 0;
    let nudgedTimer = 0;

    const reason = () => {
      const value = slug.value.trim();
      return value === "" ? "Add a URL first" : value === TAKEN ? "That URL is taken" : null;
    };

    const render = () => {
      const why = reason();
      const ready = why === null;
      publish.className = view.publish(careful, ready);
      if (published) publish.replaceChildren(check, "Published");
      else publish.replaceChildren("Publish");
      if (!careful) {
        publish.disabled = !ready;
        return;
      }
      if (ready) publish.removeAttribute("aria-disabled");
      else publish.setAttribute("aria-disabled", "true");
      if (!tip) return;
      if (ready) {
        publish.removeAttribute("aria-describedby");
        tip.remove();
        return;
      }
      publish.setAttribute("aria-describedby", tip.id);
      tip.textContent = why;
      tip.className = view.tooltip(nudged);
      if (!tip.isConnected) publish.after(tip);
    };

    const flash = (which: "published" | "nudged") => {
      if (which === "published") {
        if (published) return;
        published = true;
        publishedTimer = window.setTimeout(() => {
          published = false;
          render();
        }, 1400);
      } else {
        if (nudged) return;
        nudged = true;
        nudgedTimer = window.setTimeout(() => {
          nudged = false;
          render();
        }, 1600);
      }
      render();
    };

    slug.addEventListener("input", render, { signal });
    publish.addEventListener(
      "click",
      () => flash(!careful || reason() === null ? "published" : "nudged"),
      { signal },
    );

    this.#stop = () => {
      controller.abort();
      clearTimeout(publishedTimer);
      clearTimeout(nudgedTimer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("button-publish", ButtonPublish);
