import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, type RefObject } from "react";

import { reducedMotion } from "../hooks/use-media-query";
import { cursors, motion, palette } from "../theme.stylex";

const REVEAL_PX = 24;
const LINGER_MS = 900;
const MIN_THUMB_PX = 32;
const PAGE_SHARE = 0.9;
// The bar keeps clear of the box's rounded ends.
const INSET_PX = 6;

/**
 * The page scrollbar's bar for a scrolling box: one thumb in the hue of what sits mid-box, no track,
 * shown while the box scrolls or the pointer is within reach of its right edge. Render it as a
 * sibling of the box, inside a positioned wrapper that matches the box's own size.
 */
export function BoxScrollbar({ box: boxRef }: { box: RefObject<HTMLElement | null> }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!box || !track || !thumb) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let thumbTop = 0;
    let thumbHeight = 0;
    let near = false;
    let drag: { pointerY: number; scrollTop: number } | null = null;
    let hideTimer = 0;
    let frame = 0;

    const travel = () => Math.max(1, box.scrollHeight - box.clientHeight);
    const room = () => box.clientHeight - INSET_PX * 2;

    const layout = () => {
      frame = 0;
      const overflows = box.scrollHeight > box.clientHeight + 1;
      track.toggleAttribute("hidden", !overflows);
      if (!overflows) return;
      thumbHeight = Math.max(MIN_THUMB_PX, (room() * box.clientHeight) / box.scrollHeight);
      thumbTop = INSET_PX + (box.scrollTop / travel()) * (room() - thumbHeight);
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;

      const rect = box.getBoundingClientRect();
      const middle = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      const host = box.contains(middle) ? middle?.closest<HTMLElement>("[style*='--c']") : null;
      const hue = host && getComputedStyle(host).getPropertyValue("--c").trim();
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

    const onScroll = () => {
      schedule();
      show();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = box.getBoundingClientRect();
      const wasNear = near;
      near =
        e.clientX <= rect.right &&
        e.clientX >= rect.right - REVEAL_PX &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (near || wasNear) show();
    };

    const onThumbDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      thumb.setPointerCapture(e.pointerId);
      drag = { pointerY: e.clientY, scrollTop: box.scrollTop };
      track.dataset.dragging = "";
      show();
    };
    const onThumbMove = (e: PointerEvent) => {
      if (!drag) return;
      const perPx = travel() / Math.max(1, room() - thumbHeight);
      box.scrollTop = drag.scrollTop + (e.clientY - drag.pointerY) * perPx;
    };
    const onThumbUp = () => {
      drag = null;
      delete track.dataset.dragging;
      show();
    };
    const onTrackDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.target !== track) return;
      e.preventDefault();
      const direction = e.clientY - track.getBoundingClientRect().top < thumbTop ? -1 : 1;
      box.scrollBy({
        top: direction * box.clientHeight * PAGE_SHARE,
        behavior: reducedMotion() ? "instant" : "smooth",
      });
    };

    // The box resizes as levels fit, and its content changes as the query filters it.
    const resize = new ResizeObserver(schedule);
    resize.observe(box);
    const mutation = new MutationObserver(schedule);
    mutation.observe(box, { childList: true, subtree: true });
    layout();
    box.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    track.addEventListener("pointerdown", onTrackDown);
    thumb.addEventListener("pointerdown", onThumbDown);
    thumb.addEventListener("pointermove", onThumbMove);
    thumb.addEventListener("pointerup", onThumbUp);
    thumb.addEventListener("pointercancel", onThumbUp);
    return () => {
      resize.disconnect();
      mutation.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
      box.removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerdown", onTrackDown);
      thumb.removeEventListener("pointerdown", onThumbDown);
      thumb.removeEventListener("pointermove", onThumbMove);
      thumb.removeEventListener("pointerup", onThumbUp);
      thumb.removeEventListener("pointercancel", onThumbUp);
    };
  }, [boxRef]);

  return (
    <div
      ref={trackRef}
      hidden
      {...stylex.props(styles.track, stylex.defaultMarker())}
      aria-hidden="true"
    >
      <div ref={thumbRef} {...stylex.props(styles.thumb)} />
    </div>
  );
}

const FINE = "@media (hover: hover) and (pointer: fine)";

/** Goes on the scrolling box: hides its native bar where BoxScrollbar takes over, a fine pointer. */
export const boxScrollbarHost = stylex.create({
  box: {
    scrollbarWidth: { default: null, [FINE]: "none" },
    "::-webkit-scrollbar": { display: { default: null, [FINE]: "none" } },
  },
});

const REDUCE = "@media (prefers-reduced-motion: reduce)";

// The handlers above set data-shown, data-gold and data-dragging on the track.
const styles = stylex.create({
  track: {
    "--sb-hue": palette["--go"],
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    width: "18px",
    pointerEvents: { default: "none", ":is([data-shown])": "auto" },
  },
  thumb: {
    position: "absolute",
    top: 0,
    right: "4px",
    width: {
      default: "5px",
      [stylex.when.ancestor(":is([data-shown]:hover, [data-dragging])")]: "8px",
    },
    borderRadius: {
      default: "2.5px",
      [stylex.when.ancestor(":is([data-shown]:hover, [data-dragging])")]: "4px",
    },
    backgroundColor: {
      default: `color-mix(in oklab, var(--sb-hue) ${palette["--eyebrow-mix"]}, #000)`,
      [stylex.when.ancestor("[data-gold]")]: palette["--go-ink"],
      "@media (forced-colors: active)": {
        default: "CanvasText",
        [stylex.when.ancestor("[data-gold]")]: palette["--go-ink"],
      },
    },
    opacity: { default: 0, [stylex.when.ancestor("[data-shown]")]: 1 },
    cursor: {
      default: cursors["--cursor-grab"],
      [stylex.when.ancestor("[data-dragging]")]: cursors["--cursor-grabbing"],
    },
    transitionProperty: {
      default: "opacity, width, background-color",
      [REDUCE]: "opacity, background-color",
    },
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [stylex.when.ancestor("[data-shown]")]: motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor("[data-shown]")]: motion["--fast"],
    },
  },
});
