import { styles } from "./data-loading.css";
import { HISTORY, money, type Payment, SPENT } from "./data-loading";
import { busy, Demo, el, spinner, write } from "./data-loading-demo";
import { type Signal, view } from "./data-loading.view";

/**
 * A wallet opened from its disk cache with no signal (data-loading-wallet.astro). Getting signal
 * takes 700ms and brings the laptop bought since. Without `data-careful` the cached balance jumps
 * from $2,140 to $310; with it the balance waits for the connection and the history is dated.
 */
class DataLoadingWallet extends Demo {
  #signal: Signal = "offline";

  protected setup(signal: AbortSignal) {
    const careful = this.hasAttribute("data-careful");
    const status = this.query("signal");
    const balance = this.query("balance");
    const history = this.query("history");
    const button = this.query<HTMLButtonElement>("go");
    const stamp = careful ? this.query("stamp") : null;
    const rows = new Map<Payment, Element>(
      HISTORY.map((row, index) => [row, history.children[index]!]),
    );

    const payment = (row: Payment) =>
      el(
        "li",
        view.histRow(row === SPENT),
        el("span", "", row.label),
        el("b", styles.histAmount, row.amount < 0 ? "−" : "+", money(Math.abs(row.amount))),
      );

    const show = (next: Signal) => {
      const was = this.#signal === "online";
      this.#signal = next;
      const online = next === "online";
      status.className = view.signal(next);
      if (next === "connecting") status.replaceChildren(spinner(true), " Connecting");
      else status.replaceChildren(online ? "Online" : "No signal, day 3");
      if (online !== was) {
        // The live balance is a new figure, so it enters (and jumps) as it lands.
        balance.lastElementChild!.replaceWith(
          el(
            "b",
            view.balance(online, careful),
            online ? money(310) : careful ? "Needs a connection" : money(2140),
          ),
        );
        const shown = online ? [SPENT, ...HISTORY].slice(0, 3) : HISTORY;
        for (const [row, node] of rows) {
          if (shown.includes(row)) continue;
          node.remove();
          rows.delete(row);
        }
        shown.forEach((row, index) => {
          const node = rows.get(row) ?? payment(row);
          rows.set(row, node);
          if (history.children[index] !== node)
            history.insertBefore(node, history.children[index] ?? null);
        });
      }
      write(stamp?.firstChild ?? null, online ? "Updated just now" : "Updated 2 days ago");
      busy(button, next === "connecting");
      write(button.firstChild, online ? "Reopen offline" : "Get signal");
    };

    this.onPress(
      button,
      () => {
        if (this.#signal === "online") {
          show("offline");
          return;
        }
        show("connecting");
        this.play([[700, () => show("online")]]);
      },
      signal,
    );
  }
}

customElements.define("data-loading-wallet", DataLoadingWallet);
