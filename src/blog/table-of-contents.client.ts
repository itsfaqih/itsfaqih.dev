import { toc } from "./table-of-contents.styles";

/** Fired on a table of contents entry before it scrolls to its heading, so a drawer can close first. */
export const TOC_NAVIGATE = "toc-navigate";

/** A post's table of contents (table-of-contents.astro). Marks the heading in view and scrolls to the one picked. */
class TableOfContents extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const links = [...this.querySelectorAll("a")];
    const idOf = (link: HTMLAnchorElement) => decodeURIComponent(link.hash.slice(1));
    const activate = (id: string) => {
      for (const link of links) link.className = toc.link(idOf(link) === id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) activate(entry.target.id);
      },
      { rootMargin: "-100px 0px -66%" },
    );
    for (const link of links) {
      const heading = document.getElementById(idOf(link));
      if (heading) observer.observe(heading);
    }

    const controller = new AbortController();
    this.addEventListener(
      "click",
      (event) => {
        const link = event.target instanceof Element && event.target.closest("a");
        if (!link || !links.includes(link)) return;
        event.preventDefault();
        const id = idOf(link);
        this.dispatchEvent(new Event(TOC_NAVIGATE, { bubbles: true }));
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        activate(id);
      },
      { signal: controller.signal },
    );

    this.#stop = () => {
      controller.abort();
      observer.disconnect();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("table-of-contents", TableOfContents);
