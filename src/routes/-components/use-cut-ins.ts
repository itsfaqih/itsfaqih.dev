import { useEffect, type RefObject } from "react";

const VISIBLE_SHARE = 0.3;
const SCREEN_CAP = 0.75;
const VISIBLE_STEPS = Array.from({ length: 11 }, (_, index) => (index * VISIBLE_SHARE) / 10);

function isShownEnough(entry: IntersectionObserverEntry) {
  const screen = entry.rootBounds?.height ?? innerHeight;
  const fillsCap = entry.intersectionRect.height >= screen * SCREEN_CAP;
  return entry.isIntersecting && (entry.intersectionRatio >= VISIBLE_SHARE || fillsCap);
}

/**
 * Cut-ins: every [data-cut] under the root, including ones mounted later, gets .in once 30% of
 * it is on screen, with --cut-order set to its place among the elements arriving in the same
 * frame. Every [data-loop] pauses while off-screen. Pass `enabled: false` to hold the entrances
 * until something above them (the home intro) has handed off.
 */
export function useCutIns(rootRef: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    const cuts = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!isShownEnough(entry) || !(entry.target instanceof HTMLElement)) continue;
          entry.target.style.setProperty("--cut-order", String(order++));
          entry.target.classList.add("in");
          cuts.unobserve(entry.target);
        }
      },
      { threshold: VISIBLE_STEPS },
    );
    const loops = new IntersectionObserver((entries) =>
      entries.forEach((entry) => entry.target.classList.toggle("paused", !entry.isIntersecting)),
    );
    const mounted = new MutationObserver((records) =>
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-cut]")) cuts.observe(node);
          node.querySelectorAll("[data-cut]").forEach((element) => cuts.observe(element));
        }),
      ),
    );
    root.querySelectorAll("[data-cut]").forEach((element) => cuts.observe(element));
    root.querySelectorAll("[data-loop]").forEach((element) => loops.observe(element));
    mounted.observe(root, { childList: true, subtree: true });
    return () => {
      cuts.disconnect();
      loops.disconnect();
      mounted.disconnect();
    };
  }, [rootRef, enabled]);
}
