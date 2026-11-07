import { reducedMotion } from "../browser/media-query";

const LINGER_MS = 900;
const PAGE_SHARE = 0.9;

/** What a scrollbar reads and moves: a scrolling box, or the window for the page. */
export type Scrolled = {
  target: HTMLElement | Window;
  top(): number;
  height(): number;
  scrollHeight(): number;
  jump(top: number): void;
  /** Whether a mouse at this point is within reach of the bar. */
  near(e: PointerEvent): boolean;
  /** The hue of what is being read, or "" for gold. */
  hue(): string;
  /** The room the bar keeps clear at either end. */
  inset: number;
  minThumb: number;
};

/**
 * One thumb in the hue of what is being read, no track, shown while `scrolled` scrolls or a mouse is
 * within reach. Sets data-shown, data-gold and data-dragging on the track, and `--sb-hue`.
 */
export function watchScrollbar(track: HTMLElement, thumb: HTMLElement, scrolled: Scrolled) {
  let thumbTop = 0;
  let thumbHeight = 0;
  let near = false;
  let drag: { pointerY: number; top: number } | null = null;
  let hideTimer = 0;
  let frame = 0;

  const travel = () => Math.max(1, scrolled.scrollHeight() - scrolled.height());
  const room = () => scrolled.height() - scrolled.inset * 2;

  const layout = () => {
    frame = 0;
    const overflows = scrolled.scrollHeight() > scrolled.height() + 1;
    track.toggleAttribute("hidden", !overflows);
    if (!overflows) return;
    thumbHeight = Math.max(
      scrolled.minThumb,
      (room() * scrolled.height()) / scrolled.scrollHeight(),
    );
    thumbTop = scrolled.inset + (scrolled.top() / travel()) * (room() - thumbHeight);
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
    const hue = scrolled.hue();
    track.style.setProperty("--sb-hue", hue || "var(--go)");
    track.toggleAttribute("data-gold", !hue);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(layout);
  };

  const show = () => {
    track.dataset.shown = "";
    clearTimeout(hideTimer);
    if (near || drag) return;
    hideTimer = window.setTimeout(() => delete track.dataset.shown, LINGER_MS);
  };

  const abort = new AbortController();
  const { signal } = abort;
  scrolled.target.addEventListener(
    "scroll",
    () => {
      schedule();
      show();
    },
    { passive: true, signal },
  );
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      const wasNear = near;
      near = scrolled.near(e);
      if (near || wasNear) show();
    },
    { passive: true, signal },
  );
  track.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0 || e.target !== track) return;
      e.preventDefault();
      const direction = e.clientY - track.getBoundingClientRect().top < thumbTop ? -1 : 1;
      scrolled.target.scrollBy({
        top: direction * scrolled.height() * PAGE_SHARE,
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
      drag = { pointerY: e.clientY, top: scrolled.top() };
      track.dataset.dragging = "";
      show();
    },
    { signal },
  );
  thumb.addEventListener(
    "pointermove",
    (e) => {
      if (!drag) return;
      const perPx = travel() / Math.max(1, room() - thumbHeight);
      scrolled.jump(drag.top + (e.clientY - drag.pointerY) * perPx);
    },
    { signal },
  );
  const release = () => {
    drag = null;
    delete track.dataset.dragging;
    show();
  };
  thumb.addEventListener("pointerup", release, { signal });
  thumb.addEventListener("pointercancel", release, { signal });
  layout();

  return {
    schedule,
    /** Drops the pointer's reach, for a pointer that left the page. */
    leave: () => {
      near = false;
      show();
    },
    stop: () => {
      abort.abort();
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
    },
  };
}
