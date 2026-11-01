import Lenis from "lenis";
import { useEffect } from "react";
import { reducedMotion } from "../hooks/use-media-query";

const GLIDE = 0.07;

let active: Lenis | null = null;

export function jumpTo(top: number) {
  if (active) active.scrollTo(top, { immediate: true, force: true });
  else scrollTo({ top, behavior: "instant" });
}

export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({
      lerp: GLIDE,
      autoRaf: true,
      anchors: true,
      autoToggle: true,
      allowNestedScroll: true,
      virtualScroll: ({ event }) =>
        !event.defaultPrevented &&
        !(event.target instanceof Element && event.target.closest("[role='dialog']")),
    });
    active = lenis;
    return () => {
      lenis.destroy();
      active = null;
    };
  }, []);

  return null;
}
