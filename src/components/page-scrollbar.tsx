import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

import { jumpTo } from "./smooth-scroll";
import { reducedMotion } from "../hooks/use-media-query";
import { cursors, motion, palette } from "../theme.stylex";

const REVEAL_PX = 32;
const LINGER_MS = 900;
const MIN_THUMB_PX = 40;
const PAGE_SHARE = 0.9;
const EYEBROW_LINE = 0.6;

export function PageScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
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
      track.toggleAttribute("hidden", !overflows);
      if (!overflows) return;
      thumbHeight = Math.max(MIN_THUMB_PX, (innerHeight * innerHeight) / html.scrollHeight);
      thumbTop = (scrollY / travel()) * (innerHeight - thumbHeight);
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;

      const host = hueHost();
      const hue = host && getComputedStyle(host).getPropertyValue("--c").trim();
      const gold = getComputedStyle(html).getPropertyValue("--go").trim();
      track.style.setProperty("--sb-hue", hue && hue !== gold ? hue : "var(--go)");
      track.toggleAttribute("data-gold", !hue || hue === gold);
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
      const wasNear = near;
      near = e.clientX >= innerWidth - REVEAL_PX;
      if (near || wasNear) show();
    };
    const onLeave = () => {
      near = false;
      show();
    };

    const onThumbDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      thumb.setPointerCapture(e.pointerId);
      drag = { pointerY: e.clientY, scrollY };
      track.dataset.dragging = "";
      show();
    };
    const onThumbMove = (e: PointerEvent) => {
      if (!drag) return;
      const perPx = travel() / Math.max(1, innerHeight - thumbHeight);
      jumpTo(drag.scrollY + (e.clientY - drag.pointerY) * perPx);
    };
    const onThumbUp = () => {
      drag = null;
      delete track.dataset.dragging;
      show();
    };
    const onTrackDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.target !== track) return;
      e.preventDefault();
      const direction = e.clientY < thumbTop ? -1 : 1;
      const reduce = reducedMotion();
      scrollBy({
        top: direction * innerHeight * PAGE_SHARE,
        behavior: reduce ? "instant" : "smooth",
      });
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    html.classList.add("sb-own");
    layout();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    track.addEventListener("pointerdown", onTrackDown);
    thumb.addEventListener("pointerdown", onThumbDown);
    thumb.addEventListener("pointermove", onThumbMove);
    thumb.addEventListener("pointerup", onThumbUp);
    thumb.addEventListener("pointercancel", onThumbUp);
    return () => {
      html.classList.remove("sb-own");
      resize.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", schedule);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      track.removeEventListener("pointerdown", onTrackDown);
      thumb.removeEventListener("pointerdown", onThumbDown);
      thumb.removeEventListener("pointermove", onThumbMove);
      thumb.removeEventListener("pointerup", onThumbUp);
      thumb.removeEventListener("pointercancel", onThumbUp);
    };
  }, []);

  return (
    <div ref={trackRef} {...stylex.props(styles.track, stylex.defaultMarker())} aria-hidden="true">
      <div ref={thumbRef} {...stylex.props(styles.thumb)} />
    </div>
  );
}

const REDUCE = "@media (prefers-reduced-motion: reduce)";

// One bar in the hue of the section being read, no track, shown while scrolling or within reach.
// The handlers above set data-shown, data-gold and data-dragging on the track.
const styles = stylex.create({
  track: {
    "--sb-hue": palette["--go"],
    position: "fixed",
    top: 0,
    right: "env(safe-area-inset-right, 0px)",
    bottom: 0,
    zIndex: 2147483646,
    width: "24px",
    pointerEvents: { default: "none", ":is([data-shown])": "auto" },
  },
  thumb: {
    position: "absolute",
    top: 0,
    right: "6px",
    width: {
      default: "6px",
      [stylex.when.ancestor(":is([data-shown]:hover, [data-dragging])")]: "10px",
    },
    borderRadius: {
      default: "3px",
      [stylex.when.ancestor(":is([data-shown]:hover, [data-dragging])")]: "5px",
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
    // The thumb's width grows in place on a fixed bar, so nothing reflows; reduced motion drops it.
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
