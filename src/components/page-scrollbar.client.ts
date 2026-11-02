import { whenIdle } from "../hooks/idle";
import { reducedMotion } from "../hooks/media-query";
import { jumpTo } from "./smooth-scroll";

const REVEAL_PX = 32;
const LINGER_MS = 900;
const MIN_THUMB_PX = 40;
const PAGE_SHARE = 0.9;
const EYEBROW_LINE = 0.6;

/** One bar in the hue of the section being read, shown while scrolling or within reach. */
class PageScrollbar extends HTMLElement {
  #stop = () => {};

  connectedCallback() {
    const thumb = this.querySelector<HTMLElement>("[data-part='thumb']")!;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const html = document.documentElement;

    let thumbTop = 0;
    let thumbHeight = 0;
    let near = false;
    let drag: { pointerY: number; scrollY: number } | null = null;
    let hideTimer = 0;
    let frame = 0;

    const travel = () => Math.max(1, html.scrollHeight - innerHeight);

    const layout = () => {
      frame = 0;
      const overflows = html.scrollHeight > innerHeight + 1;
      this.toggleAttribute("hidden", !overflows);
      if (!overflows) return;
      thumbHeight = Math.max(MIN_THUMB_PX, (innerHeight * innerHeight) / html.scrollHeight);
      thumbTop = (scrollY / travel()) * (innerHeight - thumbHeight);
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;

      const host = hueHost();
      const hue = host && getComputedStyle(host).getPropertyValue("--c").trim();
      const gold = getComputedStyle(html).getPropertyValue("--go").trim();
      this.style.setProperty("--sb-hue", hue && hue !== gold ? hue : "var(--go)");
      this.toggleAttribute("data-gold", !hue || hue === gold);
    };
    // A page with section eyebrows takes the hue of the section being read: the last eyebrow above
    // the screen's lower part, or the last on screen once the page bottoms out. Other pages take the
    // hue of what sits mid-screen.
    const hueHost = () => {
      const eyebrows = document.querySelectorAll<HTMLElement>("[data-eyebrow]");
      if (!eyebrows.length) {
        const middle = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
        return middle?.closest<HTMLElement>("[style*='--c']");
      }
      const line = scrollY >= travel() - 1 ? innerHeight : innerHeight * EYEBROW_LINE;
      let current: HTMLElement | null = null;
      for (const eyebrow of eyebrows)
        if (eyebrow.getBoundingClientRect().top < line) current = eyebrow;
      return current;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(layout);
    };

    const show = () => {
      this.dataset.shown = "";
      clearTimeout(hideTimer);
      if (near || drag) return;
      hideTimer = window.setTimeout(() => delete this.dataset.shown, LINGER_MS);
    };

    const abort = new AbortController();
    const { signal } = abort;
    addEventListener(
      "scroll",
      () => {
        schedule();
        show();
      },
      { passive: true, signal },
    );
    addEventListener("resize", schedule, { signal });
    addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        const wasNear = near;
        near = e.clientX >= innerWidth - REVEAL_PX;
        if (near || wasNear) show();
      },
      { passive: true, signal },
    );
    document.addEventListener(
      "pointerleave",
      () => {
        near = false;
        show();
      },
      { signal },
    );
    this.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== 0 || e.target !== this) return;
        e.preventDefault();
        const direction = e.clientY < thumbTop ? -1 : 1;
        scrollBy({
          top: direction * innerHeight * PAGE_SHARE,
          behavior: reducedMotion() ? "instant" : "smooth",
        });
      },
      { signal },
    );
    thumb.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        thumb.setPointerCapture(e.pointerId);
        drag = { pointerY: e.clientY, scrollY };
        this.dataset.dragging = "";
        show();
      },
      { signal },
    );
    thumb.addEventListener(
      "pointermove",
      (e) => {
        if (!drag) return;
        const perPx = travel() / Math.max(1, innerHeight - thumbHeight);
        jumpTo(drag.scrollY + (e.clientY - drag.pointerY) * perPx);
      },
      { signal },
    );
    const release = () => {
      drag = null;
      delete this.dataset.dragging;
      show();
    };
    thumb.addEventListener("pointerup", release, { signal });
    thumb.addEventListener("pointercancel", release, { signal });

    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    layout();

    this.#stop = () => {
      abort.abort();
      resize.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
    };
  }

  disconnectedCallback() {
    this.#stop();
  }
}

whenIdle(() => customElements.define("page-scrollbar", PageScrollbar));
