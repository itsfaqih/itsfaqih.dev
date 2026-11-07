import { type Fate, FIXES, fateSays, QUERY, type Search, searches, TYPING } from "./data-loading";
import { Demo, el, spinner, write } from "./data-loading-demo";
import { styles } from "./data-loading.css";
import { view } from "./data-loading.view";

/**
 * A search box (data-loading-search.astro) that types "lamp" with a pause after "la". Without
 * `data-debounce` each letter sends a request and the last reply to land shows, stale or not. With
 * it a request waits for the pause, and a new one cancels the one in flight.
 */
class DataLoadingSearch extends Demo {
  protected setup(signal: AbortSignal) {
    const plan = searches(this.hasAttribute("data-debounce") ? FIXES.both : FIXES.none);
    const count = this.query("count");
    const typed = this.query("typed");
    const caret = this.query("caret");
    const results = this.query("results");
    const log = this.query("log");
    const button = this.query<HTMLButtonElement>("type");
    const fates = new Map<string, Fate>();

    const row = (q: string, fate: Fate) => {
      const tag = el("span", view.fate(fate, q !== QUERY), fateSays(fate, q));
      if (fate === "flight") tag.prepend(spinner(true));
      return el("li", styles.logRow, el("span", view.logQuery(fate), `GET ?q=${q}`), tag);
    };
    // A real caret stays lit while keys land and blinks only once typing stops.
    const type = (key: string) => {
      typed.append(key);
      for (const blink of caret.getAnimations()) blink.currentTime = 0;
    };
    const render = () => {
      write(count.firstChild, String(fates.size));
      // Each row mounts once, as its request goes, and only its tag changes after.
      [...fates].forEach(([q, fate], i) => {
        const next = row(q, fate);
        const shown = log.children[i];
        if (!shown) log.append(next);
        else shown.replaceChildren(...next.childNodes);
      });
    };
    // Sending a request cancels the ones still in flight that the plan cancels.
    const send = ({ q }: Search) => {
      for (const s of plan)
        if (s.fate === "canceled" && fates.get(s.q) === "flight") fates.set(s.q, "canceled");
      fates.set(q, "flight");
      render();
    };
    const land = ({ q, matches }: Search) => {
      for (const [other, fate] of fates) if (fate === "shown") fates.set(other, "replaced");
      fates.set(q, "shown");
      results.className = view.results(q !== QUERY);
      results.replaceChildren(
        el("span", "", matches.join(", ")),
        el("span", view.resultsFor(q !== QUERY), `for ${q}`),
      );
      render();
    };

    button.addEventListener(
      "click",
      () => {
        button.disabled = true;
        fates.clear();
        log.replaceChildren();
        typed.textContent = "";
        results.className = view.results(false);
        results.replaceChildren(el("span", styles.status, "No results yet"));
        render();
        const steps = [
          ...TYPING.map(({ key, at }) => [at, () => type(key)] as const),
          ...plan.map((search) => [search.sent, () => send(search)] as const),
          ...plan
            .filter(({ fate }) => fate !== "canceled")
            .map((search) => [search.lands, () => land(search)] as const),
        ];
        const end = Math.max(...steps.map(([at]) => at));
        this.play([
          ...steps,
          [
            end,
            () => {
              button.disabled = false;
            },
          ],
        ]);
      },
      { signal },
    );
  }
}

customElements.define("data-loading-search", DataLoadingSearch);
