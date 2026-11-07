/**
 * Marks the `[data-rev]` blocks already on screen with data-in, then sets data-rev-on on `root`,
 * so the rest start hidden and rise in as they scroll into view. Returns the stop.
 */
export function watchReveal(root: HTMLElement) {
  const items = [...root.querySelectorAll<HTMLElement>("[data-rev]")];
  for (const item of items) {
    if (item.getBoundingClientRect().top < innerHeight) item.dataset.in = "";
  }
  root.dataset.revOn = "";
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
        entry.target.dataset.in = "";
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  for (const item of items) if (!("in" in item.dataset)) observer.observe(item);
  return () => observer.disconnect();
}

/**
 * The header island's label trades the page's tags for its title once the heading has scrolled
 * out of view, through data-swap on `label`. Returns the stop.
 */
export function watchTitleSwap(title: HTMLElement, label: HTMLElement) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry)
      label.toggleAttribute("data-swap", !entry.isIntersecting && entry.boundingClientRect.top < 0);
  });
  observer.observe(title);
  return () => {
    observer.disconnect();
    label.removeAttribute("data-swap");
  };
}

/** Whether `element` starts low enough that it should play once scrolled to, not on load. */
export const belowFold = (element: Element) =>
  element.getBoundingClientRect().top >= innerHeight * 0.7;

/** Calls `play` `delay` ms after `element` is mostly on screen, once. Returns the stop. */
export function onceOnScreen(element: Element, delay: number, play: () => void) {
  let timer = 0;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      timer = window.setTimeout(play, delay);
    },
    { threshold: 0.6 },
  );
  observer.observe(element);
  return () => {
    observer.disconnect();
    clearTimeout(timer);
  };
}
