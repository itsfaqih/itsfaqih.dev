import { useEffect, type RefObject } from "react";

/**
 * Cut-ins: every [data-cut] under the root gets .in once it enters the viewport, and every
 * [data-loop] pauses while off-screen. Pass `enabled: false` to hold the entrances until
 * something above them (the home intro) has handed off.
 */
export function useCutIns(rootRef: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    const cuts = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          cuts.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    const loops = new IntersectionObserver((entries) =>
      entries.forEach((entry) => entry.target.classList.toggle("paused", !entry.isIntersecting)),
    );
    root.querySelectorAll("[data-cut]").forEach((element) => cuts.observe(element));
    root.querySelectorAll("[data-loop]").forEach((element) => loops.observe(element));
    return () => {
      cuts.disconnect();
      loops.disconnect();
    };
  }, [rootRef, enabled]);
}
