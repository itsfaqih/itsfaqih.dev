import { reducedMotion } from "../hooks/media-query";
import { Demo } from "./data-loading-demo";
import { type Sweep, view } from "./data-loading.styles";
import { onceOnScreen } from "./rule-motion";

/**
 * A request waterfall (data-loading-waterfall.astro). Once it is on screen a cover sweeps off the
 * plot and the "on screen" mark lands when the sweep reaches it. Replay runs it again.
 */
class DataLoadingWaterfall extends Demo {
  #run = 0;

  protected setup(signal: AbortSignal) {
    this.query("replay").addEventListener("click", () => this.#show("run", this.#run + 1), {
      signal,
    });
    if (reducedMotion()) return;
    this.#show("armed", 0);
    signal.addEventListener("abort", onceOnScreen(this, () => this.#show("run", 1)));
  }

  /** `run` numbers each sweep; a new number restarts the plot's animations on a fresh copy. */
  #show(sweep: Sweep, run: number) {
    if (run !== this.#run) this.query("plot").replaceWith(this.query("plot").cloneNode(true));
    this.#run = run;
    const plot = this.query("plot");
    plot.querySelector('[data-part="paint"]')!.className = view.paint(sweep);
    plot.querySelector('[data-part="cover"]')!.className = view.cover(sweep);
  }
}

customElements.define("data-loading-waterfall", DataLoadingWaterfall);
