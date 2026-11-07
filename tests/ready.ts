/**
 * True once the page answers input: every custom element is defined, or already shows the
 * declarative shadow root it renders without script.
 */
export function pageReady() {
  return Array.from(document.querySelectorAll(":not(:defined)")).every(
    (element) => element.shadowRoot,
  );
}
