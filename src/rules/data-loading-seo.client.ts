import { RENDERS } from "./data-loading";
import { busy, Demo, spinner } from "./data-loading-demo";
import { styles } from "./data-loading.css";
import { view } from "./data-loading.view";

/**
 * A load of /lamp (data-loading-seo.astro). From the server the product paints with the first
 * response; in the browser the frame stays blank while app.js loads and fetches, then paints.
 */
class DataLoadingSeo extends Demo {
  protected setup(signal: AbortSignal) {
    const { steps, paint, painted } =
      RENDERS[this.hasAttribute("data-server") ? "server" : "browser"];
    const status = this.query("status");
    const frame = this.query("frame");
    const button = this.query<HTMLButtonElement>("load");
    const product = this.query<HTMLTemplateElement>("product").content;

    const say = (text: string, waiting: boolean) => {
      status.className = styles.status;
      status.replaceChildren(...(waiting ? [spinner(true), ` ${text}`] : [text]));
    };

    this.onPress(
      button,
      () => {
        busy(button, true);
        frame.className = view.frame(true);
        frame.replaceChildren();
        this.play([
          ...steps.map(([at, text]) => [at, () => say(text, true)] as const),
          [
            paint,
            () => {
              frame.className = view.frame(false);
              frame.replaceChildren(product.cloneNode(true));
              say(painted, false);
              busy(button, false);
            },
          ],
        ]);
      },
      signal,
    );
  }
}

customElements.define("data-loading-seo", DataLoadingSeo);
