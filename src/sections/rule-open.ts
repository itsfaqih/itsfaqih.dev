import { reducedMotion } from "../browser/media-query";

/** Where a tile's click leaves the dive for the head script on the rule page (head-script.ts). */
export const OPENING_KEY = "rule-open";

/** Whether a view transition is running: any, or one of `type` (rule-open, rule-close, page-fade). */
export function isTransitioning(type?: string) {
  try {
    return document.documentElement.matches(
      type ? `:active-view-transition-type(${type})` : ":active-view-transition",
    );
  } catch {
    return false;
  }
}

/** A click that opens the link somewhere else (a new tab or window) is no dive. */
const opensElsewhere = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/**
 * Leaves the dive into `href` for the rule page, zooming from `card`. The
 * transition's pictures live on the rule page, so the origin crosses in sessionStorage.
 */
function recordDive(href: string, card: Element) {
  const box = card.getBoundingClientRect();
  const art = card.querySelector(".thumb")?.getAnimations({ subtree: true })[0];
  const phase = art?.currentTime ?? null;
  const dive = { href, x: box.x, y: box.y, width: box.width, height: box.height, phase };
  try {
    if (reducedMotion()) sessionStorage.removeItem(OPENING_KEY);
    else sessionStorage.setItem(OPENING_KEY, JSON.stringify(dive));
  } catch {}
}

/**
 * Dives into a rule from any `a[data-rule-open]` under `root`. The link, or `panel` when it is on
 * screen, takes data-opening, which names it and its thumbnail and title for the morph (arcade.css).
 */
export function watchRuleOpen(root: HTMLElement, signal: AbortSignal, panel?: HTMLElement) {
  let opening: Element | undefined;
  root.addEventListener(
    "click",
    (event) => {
      const link =
        event.target instanceof Element ? event.target.closest("a[data-rule-open]") : null;
      if (!link || opensElsewhere(event)) return;
      const card = panel?.checkVisibility() ? panel : link;
      recordDive(link.getAttribute("href")!, card);
      opening?.removeAttribute("data-opening");
      opening = card;
      card.setAttribute("data-opening", "");
    },
    { signal },
  );
}
