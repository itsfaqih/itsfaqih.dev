import Lenis from "lenis";
import { whenIdle } from "../hooks/idle";
import { reducedMotion } from "../hooks/media-query";

const GLIDE = 0.07;

let active: Lenis | null = null;

/**
 * A `data-own-scroll` box that overflows keeps the wheel to itself, even at either end, so
 * reaching its last line doesn't carry on into the page. Its CSS sets `overscroll-behavior`.
 */
function ownsScroll(target: EventTarget | null) {
  const box = target instanceof Element ? target.closest("[data-own-scroll]") : null;
  return (
    box !== null &&
    box.scrollHeight > box.clientHeight &&
    getComputedStyle(box).overflowY !== "visible"
  );
}

export function jumpTo(top: number) {
  if (active) active.scrollTo(top, { immediate: true, force: true });
  else scrollTo({ top, behavior: "instant" });
}

whenIdle(() => {
  if (reducedMotion()) return;
  active = new Lenis({
    lerp: GLIDE,
    autoRaf: true,
    anchors: true,
    autoToggle: true,
    allowNestedScroll: true,
    virtualScroll: ({ event }) =>
      !event.defaultPrevented &&
      !(event.target instanceof Element && event.target.closest("dialog, [role='dialog']")) &&
      !ownsScroll(event.target),
  });
});
