import { reducedMotion } from "../browser/media-query";
import { Demo, write } from "./data-loading-demo";
import { type Sweep, view } from "./data-loading.view";

/**
 * A request waterfall (data-loading-waterfall.astro). It waits under a cover until Play, then the
 * cover sweeps off the plot and the "on screen" mark lands when the sweep reaches it, while the
 * orders page below draws on the same clock. Replay runs it again.
 */
class DataLoadingWaterfall extends Demo {
  #run = 0;

  protected setup(signal: AbortSignal) {
    const play = this.query("play");
    play.addEventListener(
      "click",
      () => {
        this.#show("run", this.#run + 1);
        write(play.firstChild, "Replay");
      },
      { signal },
    );
    if (!reducedMotion()) this.#show("armed", 0);
  }

  /** `run` numbers each sweep; a new number restarts the animations on fresh copies. */
  #show(sweep: Sweep, run: number) {
    if (run !== this.#run)
      for (const part of ["plot", "screen"])
        this.query(part).replaceWith(this.query(part).cloneNode(true));
    this.#run = run;
    const plot = this.query("plot");
    plot.querySelector('[data-part="paint"]')!.className = view.paint(sweep);
    plot.querySelector('[data-part="cover"]')!.className = view.cover(sweep);
    this.query("screen").className = view.screen(sweep);
  }
}

customElements.define("data-loading-waterfall", DataLoadingWaterfall);
