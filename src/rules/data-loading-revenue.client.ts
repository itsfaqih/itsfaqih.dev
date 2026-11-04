import { money, REVENUE } from "./data-loading";
import { Demo, el, spinner } from "./data-loading-demo";
import { view } from "./data-loading.view";

/**
 * A revenue card (data-loading-revenue.astro) that refetches in 900ms. Without `data-swr` the
 * figure blanks to a spinner meanwhile; with it the old value stays and a small spinner says
 * "Updating".
 */
class DataLoadingRevenue extends Demo {
  #at = 0;
  #fetching = false;
  #fresh = false;
  #shownAt = 0;
  #said = "stale";

  protected setup(signal: AbortSignal) {
    const swr = this.hasAttribute("data-swr");
    const status = this.query("status");
    const figure = this.query("figure");
    const sub = this.query("sub");
    const button = this.query<HTMLButtonElement>("refetch");

    const render = () => {
      const blank = this.#fetching && !swr;
      const say = swr && this.#fetching ? "updating" : this.#fresh ? "fresh" : "stale";
      if (say !== this.#said) {
        this.#said = say;
        if (say === "updating") status.replaceChildren(spinner(true), " Updating");
        else status.replaceChildren(say === "fresh" ? "Updated just now" : "Updated 5 min ago");
      }
      const shown = figure.firstElementChild!;
      if (blank) {
        if (shown.tagName !== "SPAN") shown.replaceWith(spinner(false, true));
      } else if (shown.tagName !== "B" || this.#shownAt !== this.#at) {
        // A new figure each time the value changes, so its entrance plays again.
        shown.replaceWith(
          el("b", view.amount(this.#fresh), money(REVENUE[this.#at % REVENUE.length] ?? 0)),
        );
        this.#shownAt = this.#at;
      }
      sub.className = view.sub(blank);
      button.disabled = this.#fetching;
    };

    button.addEventListener(
      "click",
      () => {
        this.#fetching = true;
        render();
        this.play([
          [
            900,
            () => {
              this.#at += 1;
              this.#fetching = false;
              this.#fresh = true;
              render();
            },
          ],
        ]);
      },
      { signal },
    );
  }
}

customElements.define("data-loading-revenue", DataLoadingRevenue);
