import { useRouter } from "@tanstack/react-router";
import Lenis from "lenis";
import { useEffect } from "react";

// Lower glides further after each wheel tick (Lenis defaults to 0.1).
const GLIDE = 0.07;

let active: Lenis | null = null;

/** Moves the page at once, cancelling any glide that would carry on past it. */
export function jumpTo(top: number) {
  if (active) active.scrollTo(top, { immediate: true, force: true });
  else scrollTo({ top, behavior: "instant" });
}

/** Wheel scrolling on every page glides to a stop instead of stepping. Touch keeps native momentum. */
export function SmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: GLIDE,
      autoRaf: true,
      anchors: true,
      // Pauses while a dialog's scroll lock sets overflow: hidden on <html>.
      autoToggle: true,
      allowNestedScroll: true,
      // The rule deck takes sideways wheels itself, and dialogs scroll their own content.
      virtualScroll: ({ event }) =>
        !event.defaultPrevented &&
        !(event.target instanceof Element && event.target.closest("[role='dialog']")),
    });
    active = lenis;
    // A glide still in flight would carry on past the scroll position a navigation restores.
    // Not stop() then start(): with autoToggle, stop() only clips <html> and stops on the
    // next transitionend, so the start() is a no-op and the page stays locked.
    const unsubscribe = router.subscribe("onBeforeNavigate", () => {
      lenis.scrollTo(scrollY, { immediate: true, force: true });
    });
    return () => {
      unsubscribe();
      lenis.destroy();
      active = null;
    };
  }, [router]);

  return null;
}
