/**
 * True once the page answers input, whatever renders it: every eager Astro island has hydrated
 * (Astro drops `ssr` then) and every custom element is defined. Skipped: parts that wake only
 * when scrolled to or matched (`client:visible`, `client:media`, or a `data-lazy` host), and an
 * undefined element that already shows a declarative shadow root, which renders without script.
 */
export function pageReady() {
  const lazy = 'astro-island[ssr]:not([client="load"], [client="idle"]), [data-lazy]';
  return Array.from(
    document.querySelectorAll(
      ':not(:defined), astro-island[ssr][client="load"], astro-island[ssr][client="idle"]',
    ),
  ).every(
    (element) =>
      (element.localName !== "astro-island" && element.shadowRoot) ||
      element.parentElement?.closest(lazy),
  );
}
