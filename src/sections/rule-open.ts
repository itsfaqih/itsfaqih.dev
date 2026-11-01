import { reducedMotion } from "../hooks/media-query";

/** Where a tile's click leaves the dive for the head script on the rule page (head-script.ts). */
export const OPENING_KEY = "rule-open";

export function isTransitioning() {
  try {
    return document.documentElement.matches(":active-view-transition");
  } catch {
    return false;
  }
}

/** A click that opens the link somewhere else (a new tab or window) is no dive. */
export const opensElsewhere = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/**
 * Leaves the dive into `href` for the rule page, zooming from the centre of `card`. The
 * transition's pictures live on the rule page, so the origin crosses in sessionStorage.
 */
export function recordDive(href: string, card: Element) {
  const box = card.getBoundingClientRect();
  const dive = { href, x: box.x + box.width / 2, y: box.y + box.height / 2 };
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
