import { useEffect, useRef } from "react";

import { jumpTo } from "./smooth-scroll";
import { reducedMotion } from "../hooks/use-media-query";

const REVEAL_PX = 32;
const LINGER_MS = 900;
const MIN_THUMB_PX = 40;
const PAGE_SHARE = 0.9;

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

      const middle = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      const host = middle?.closest<HTMLElement>("[style*='--c']");
      const hue = host && getComputedStyle(host).getPropertyValue("--c").trim();
      const gold = getComputedStyle(html).getPropertyValue("--go").trim();
      track.style.setProperty("--sb-hue", hue && hue !== gold ? hue : "var(--go)");
      track.toggleAttribute("data-gold", !hue || hue === gold);
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
    <div ref={trackRef} className="page-scrollbar" aria-hidden="true">
      <div ref={thumbRef} className="page-scrollbar-thumb" />
    </div>
  );
}
