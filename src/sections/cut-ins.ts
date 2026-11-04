const VISIBLE_SHARE = 0.3;
const SCREEN_CAP = 0.75;
const VISIBLE_STEPS = Array.from({ length: 11 }, (_, index) => (index * VISIBLE_SHARE) / 10);

function isShownEnough(entry: IntersectionObserverEntry) {
  const screen = entry.rootBounds?.height ?? innerHeight;
  const fillsCap = entry.intersectionRect.height >= screen * SCREEN_CAP;
  return entry.isIntersecting && (entry.intersectionRatio >= VISIBLE_SHARE || fillsCap);
}

/**
 * Cut-ins: every [data-cut] under `root`, including ones added later, gets .in once 30% of it is
 * on screen, with --cut-order set to its place among the elements arriving in the same frame.
 * Every [data-loop] pauses while off-screen. `onArrive` runs once per frame that brings any in.
 * Returns the stop.
 *
 * It fires `cut-ins` on `root` first, which cancels the head script's rest fallback
 * (head-script.ts) the way an island's `astro:hydrate` does.
 */
export function watchCutIns(root: HTMLElement, onArrive?: () => void) {
  root.dispatchEvent(new Event("cut-ins", { bubbles: true }));
  const cuts = new IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!isShownEnough(entry) || !(entry.target instanceof HTMLElement)) continue;
        entry.target.style.setProperty("--cut-order", String(order++));
        entry.target.classList.add("in");
        cuts.unobserve(entry.target);
      }
      if (order > 0) onArrive?.();
    },
    { threshold: VISIBLE_STEPS },
  );
  const loops = new IntersectionObserver((entries) =>
    entries.forEach((entry) => entry.target.classList.toggle("paused", !entry.isIntersecting)),
  );
  const added = new MutationObserver((records) =>
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
  added.observe(root, { childList: true, subtree: true });
  return () => {
    cuts.disconnect();
    loops.disconnect();
    added.disconnect();
  };
}
