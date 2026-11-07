import { tocLink } from "./table-of-contents.view";

/** Fired on a table of contents entry before it scrolls to its heading, so a drawer can close first. */
export const TOC_NAVIGATE = "toc-navigate";

/** A post's table of contents (table-of-contents.astro). Marks the heading in view and scrolls to the one picked. */
class TableOfContents extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const links = [...this.querySelectorAll("a")];
    const idOf = (link: HTMLAnchorElement) => decodeURIComponent(link.hash.slice(1));
    const activate = (id: string) => {
      for (const link of links) link.className = tocLink(idOf(link) === id);
    };

    // The current section is the last whose heading has passed the band's bottom edge, 34% down.
    // A heading leaving the band downward, as a reader scrolls back up, hands the mark to the one
    // above it, which the band alone would not see until it scrolled back in.
    const headings = links.flatMap((link) => document.getElementById(idOf(link)) ?? []);
    const observer = new IntersectionObserver(
      () => {
        const line = innerHeight * 0.34;
        const passed = headings.filter((heading) => heading.getBoundingClientRect().top < line);
        const current = passed[passed.length - 1];
        if (current) activate(current.id);
      },
      { rootMargin: "-100px 0px -66%" },
    );
    for (const heading of headings) observer.observe(heading);

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
