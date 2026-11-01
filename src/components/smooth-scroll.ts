import Lenis from "lenis";
import { whenIdle } from "../hooks/idle";
import { reducedMotion } from "../hooks/media-query";

const GLIDE = 0.07;

let active: Lenis | null = null;

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
      !(event.target instanceof Element && event.target.closest("dialog, [role='dialog']")),
  });
});
