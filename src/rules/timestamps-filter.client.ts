import {
  FATE,
  filterLines,
  filterOf,
  hhmm,
  shortDay,
  timeOf,
  type Way,
} from "./handling-timestamps";
import { tsView } from "./handling-timestamps.view";
import { patchLine } from "./timestamps-wire";

const texts = (element: Element) =>
  [...element.childNodes].filter((node): node is Text => node.nodeType === Node.TEXT_NODE);

const setData = (node: Text, data: string) => {
  if (node.data !== data) node.data = data;
};

/**
 * The day filter demo (timestamps-filter.astro): Rina picks a day, and the range each way sends decides
 * which of her orders come back.
 */
class TimestampsFilter extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const way: Way = this.dataset.way === "bad" ? "bad" : "good";
    const input = this.querySelector("input")!;
    const lines = this.querySelectorAll("code");
    const items = this.querySelectorAll("li");
    const sync = () => {
      const { from, orders } = filterOf(way, input.value);
      filterLines(way, from).forEach((line, index) => patchLine(lines[index]!, line.c));
      orders.forEach((order, index) => {
        const item = items[index]!;
        item.className = tsView.order(order.fate);
        const when = item.children[1]!;
        when.className = tsView.when(order.fate);
        const [day, , time] = texts(when);
        setData(day!, shortDay(order.wall));
        setData(time!, timeOf(order.wall));
        const [utcDay, , utcTime] = texts(when.lastElementChild!);
        setData(utcDay!, shortDay(order.instant));
        setData(utcTime!, hhmm(order.instant));
        let fate = item.children[2];
        if (!FATE[order.fate]) {
          fate?.remove();
          return;
        }
        if (!fate) {
          fate = document.createElement("span");
          item.append(fate);
        }
        fate.className = tsView.fate(order.fate);
        if (fate.textContent !== FATE[order.fate]) fate.textContent = FATE[order.fate];
      });
    };
    // Both input and change: sync is idempotent, so a picker that fires the pair costs nothing.
    for (const type of ["input", "change"]) {
      input.addEventListener(type, sync, { signal: controller.signal });
    }
    this.#stop = () => controller.abort();
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("timestamps-filter", TimestampsFilter);
