/** The counter the hello-world post embeds (counter.astro). */
class BlogCounter extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const output = this.querySelector('[data-part="count"]')!;
    let count = Number(output.textContent);
    const controller = new AbortController();
    const { signal } = controller;
    const step = (by: number) => () => {
      count += by;
      output.textContent = String(count);
    };
    this.querySelector('[data-part="decrease"]')!.addEventListener("click", step(-1), { signal });
    this.querySelector('[data-part="increase"]')!.addEventListener("click", step(1), { signal });
    this.#stop = () => controller.abort();
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("blog-counter", BlogCounter);
