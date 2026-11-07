import { busy, Demo, spinner } from "./data-loading-demo";

/**
 * A fetch of /users/1 (data-loading-parse.astro) that takes 450ms, then shows what the code above
 * it renders: the profile, or the crash. The outcome is the build's own run of that code.
 */
class DataLoadingParse extends Demo {
  protected setup(signal: AbortSignal) {
    const result = this.query("result");
    const button = this.query<HTMLButtonElement>("fetch");
    const outcome = result.firstElementChild!.cloneNode(true);

    this.onPress(
      button,
      () => {
        busy(button, true);
        result.replaceChildren(spinner(false));
        this.play([
          [
            450,
            () => {
              busy(button, false);
              result.replaceChildren(outcome.cloneNode(true));
            },
          ],
        ]);
      },
      signal,
    );
  }
}

customElements.define("data-loading-parse", DataLoadingParse);
