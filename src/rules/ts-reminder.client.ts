import { reminderLines, reminderOf, type Way } from "./handling-timestamps";
import type { TsReaders } from "./ts-readers.client";
import { patchLine } from "./ts-wire";

/**
 * The reminder demo (ts-reminder.astro): Rina picks a date and a time, and the request and both
 * readers' clocks follow what the way sends.
 */
class TsReminder extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const way: Way = this.dataset.way === "bad" ? "bad" : "good";
    const date = this.querySelector<HTMLInputElement>('[data-part="date"]')!;
    const time = this.querySelector<HTMLInputElement>('[data-part="time"]')!;
    const lines = this.querySelectorAll("code");
    const readers = this.querySelector<TsReaders>("ts-readers")!;
    const sync = () => {
      const { wall, meant, readings } = reminderOf(way, date.value, time.value);
      reminderLines(way, wall, meant).forEach((line, index) => patchLine(lines[index]!, line.c));
      readers.show(readings);
    };
    // React's onChange heard both events; sync is idempotent, so a pair costs nothing.
    for (const input of [date, time]) {
      for (const type of ["input", "change"]) {
        input.addEventListener(type, sync, { signal: controller.signal });
      }
    }
    this.#stop = () => controller.abort();
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("ts-reminder", TsReminder);
