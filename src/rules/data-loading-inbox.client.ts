import { styles } from "./data-loading.css";
import { INBOX, inboxRows, replyIn, SPIN_DELAY } from "./data-loading";
import { busy, Demo, el, write } from "./data-loading-demo";
import { view } from "./data-loading.view";

/**
 * An inbox (data-loading-inbox.astro) whose server replies fast or slow. The skeleton shows at
 * once, or with `data-delay` only once the reply has taken `SPIN_DELAY`; each reply brings a new
 * message.
 */
class DataLoadingInbox extends Demo {
  #waiting = false;
  #top = 0;
  #skeleton = false;
  #said: string | null = null;
  #shownTop = 0;

  protected setup(signal: AbortSignal) {
    const delay = this.hasAttribute("data-delay");
    const unread = this.query("unread");
    const mail = this.query("mail");
    const said = this.query("said");
    const buttons = [this.query<HTMLButtonElement>("fast"), this.query<HTMLButtonElement>("slow")];

    const row = ([from, subject]: readonly [string, string]) => {
      const avatar = el("i", view.avatar(this.#skeleton), from.charAt(0));
      avatar.setAttribute("aria-hidden", "true");
      return el(
        "li",
        view.mailRow(this.#skeleton),
        avatar,
        el(
          "span",
          styles.mailText,
          el("b", view.mailFrom(this.#skeleton), from),
          el("em", view.mailSubject(this.#skeleton), subject),
        ),
      );
    };

    const render = () => {
      write(unread.firstChild, String(this.#top + 3));
      if (this.#shownTop !== this.#top) {
        // Fresh rows for each reply, so their entrance plays again.
        mail.replaceChildren(...inboxRows(this.#top).map(row));
        this.#shownTop = this.#top;
      } else {
        for (const li of mail.children) {
          li.className = view.mailRow(this.#skeleton);
          li.querySelector("i")!.className = view.avatar(this.#skeleton);
          li.querySelector("b")!.className = view.mailFrom(this.#skeleton);
          li.querySelector("em")!.className = view.mailSubject(this.#skeleton);
        }
      }
      write(said.firstChild, this.#said ?? "Pick how fast the server replies.");
      for (const button of buttons) busy(button, this.#waiting);
    };

    const load = (ms: number) => {
      const shownFor = delay ? Math.max(0, ms - SPIN_DELAY) : ms;
      const reply = replyIn(ms);
      const next =
        shownFor === 0
          ? `Reply in ${reply}. No skeleton.`
          : delay
            ? `Reply in ${reply}. Skeleton from ${SPIN_DELAY}ms, for ${shownFor}ms.`
            : `Reply in ${reply}. Skeleton flashed for ${shownFor}ms.`;
      this.#waiting = true;
      this.#skeleton = !delay;
      render();
      this.play([
        ...(delay
          ? [
              [
                SPIN_DELAY,
                () => {
                  if (!this.#waiting) return;
                  this.#skeleton = true;
                  render();
                },
              ] as const,
            ]
          : []),
        [
          ms,
          () => {
            this.#waiting = false;
            this.#skeleton = false;
            this.#top += 1;
            this.#said = next;
            render();
          },
        ],
      ]);
    };

    this.onPress(buttons[0]!, () => load(INBOX.fast), signal);
    this.onPress(buttons[1]!, () => load(INBOX.slow), signal);
  }
}

customElements.define("data-loading-inbox", DataLoadingInbox);
