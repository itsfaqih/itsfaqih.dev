import { whenIdle } from "../browser/idle";
import { watchScrollbar } from "./scrollbar";
import { jumpTo } from "./smooth-scroll";
import { HOVER } from "../browser/media-query";

const REVEAL_PX = 32;
const MIN_THUMB_PX = 40;
const EYEBROW_LINE = 0.6;

/** One bar in the hue of the section being read, shown while scrolling or within reach. */
class PageScrollbar extends HTMLElement {
  #stop = () => {};

  connectedCallback() {
    const thumb = this.querySelector<HTMLElement>("[data-part='thumb']")!;
    if (!matchMedia(HOVER).matches) return;
    const html = document.documentElement;

    // A page with section eyebrows takes the hue of the section being read: the last eyebrow above
    // the screen's lower part, or the last on screen once the page bottoms out. Other pages take the
    // hue of what sits mid-screen.
    const hueHost = () => {
      const eyebrows = document.querySelectorAll<HTMLElement>("[data-eyebrow]");
      if (!eyebrows.length) {
        const middle = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
        return middle?.closest<HTMLElement>("[style*='--c']");
      }
      const bottomedOut = scrollY >= Math.max(1, html.scrollHeight - innerHeight) - 1;
      const line = bottomedOut ? innerHeight : innerHeight * EYEBROW_LINE;
      let current: HTMLElement | null = null;
      for (const eyebrow of eyebrows)
        if (eyebrow.getBoundingClientRect().top < line) current = eyebrow;
      return current;
    };

    const bar = watchScrollbar(this, thumb, {
      target: window,
      top: () => scrollY,
      height: () => innerHeight,
      scrollHeight: () => html.scrollHeight,
      jump: jumpTo,
      near: (e) => e.clientX >= innerWidth - REVEAL_PX,
      hue: () => {
        const host = hueHost();
        const hue = host ? getComputedStyle(host).getPropertyValue("--c").trim() : "";
        const gold = getComputedStyle(html).getPropertyValue("--go").trim();
        return hue === gold ? "" : hue;
      },
      inset: 0,
      minThumb: MIN_THUMB_PX,
    });

    const abort = new AbortController();
    addEventListener("resize", bar.schedule, { signal: abort.signal });
    document.addEventListener("pointerleave", bar.leave, { signal: abort.signal });
    const resize = new ResizeObserver(bar.schedule);
    resize.observe(document.body);

    this.#stop = () => {
      abort.abort();
      resize.disconnect();
      bar.stop();
    };
  }

  disconnectedCallback() {
    this.#stop();
  }
}

whenIdle(() => customElements.define("page-scrollbar", PageScrollbar));
