import { Demo } from "./data-loading-demo";

/**
 * Quiz 5's board (data-loading-fix.astro). Picking a fix shows the search box as that fix leaves
 * it, so a wrong pick shows which problem is left. The quiz itself judges the pick and says its note.
 */
class DataLoadingFix extends Demo {
  protected setup(signal: AbortSignal) {
    const boxes = [...this.querySelectorAll<HTMLElement>("[data-fix]")];
    this.addEventListener(
      "click",
      (event) => {
        const slot =
          event.target instanceof Element ? event.target.closest<HTMLElement>("[data-slot]") : null;
        if (!slot) return;
        for (const box of boxes) box.hidden = box.dataset.fix !== slot.dataset.slot;
      },
      { signal },
    );
  }
}

customElements.define("data-loading-fix", DataLoadingFix);
