import { styles } from "./null-vs-undefined.css";
import { reducedMotion } from "../hooks/media-query";
import {
  arrived,
  DEMOS,
  TITLE,
  verdictOf,
  type Phase,
  type Row,
  type Way,
} from "./null-vs-undefined";
import { flowView, KINDS, paint } from "./null-vs-undefined.view";
import { TABBED } from "./rule-landing.css";
import { onceOnScreen } from "./rule-motion";

const SEND_MS = 460;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function painted(source: string) {
  return paint(source, KINDS).map((part) =>
    part.class ? el("span", part.class, part.text) : document.createTextNode(part.text),
  );
}

/**
 * A save demo (null-flow.astro): a form, the PATCH it sends, and the record it leaves. "clear"
 * removes the reviewer, "rename" edits the title. Each send replays the request and the record,
 * as React's keys remounted them.
 */
class NullFlow extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = <T extends Element = HTMLElement>(name: string) =>
      this.querySelector<T>(`[data-part="${name}"]`)!;
    const clear = this.dataset.demo === "clear";
    const demo = clear ? DEMOS.clear : DEMOS.rename;
    const way: Way = this.dataset.way === "bad" ? "bad" : "good";
    const flow = part("flow");
    const form = part("form");
    let wire = part("wire");
    let record = part("record");

    let phase: Phase = "done";
    let runs = 0;
    let title = TITLE;
    let touched = false;
    let timer = 0;
    let wireKey = "w0";
    let recordKey = "r0";
    let json = "";

    const syncForm = () => {
      if (clear) {
        const cleared = phase !== "idle";
        const label = form.firstElementChild!;
        let again = form.querySelector<HTMLButtonElement>('[data-part="again"]');
        if (cleared && !again) {
          again = el("button", flowView.again, "Reset");
          again.type = "button";
          again.dataset.part = "again";
          const none = part<HTMLTemplateElement>("none").content.firstElementChild!;
          label.nextElementSibling!.replaceWith(document.importNode(none, true), again);
        } else if (!cleared && again) {
          again.remove();
          const chip = part<HTMLTemplateElement>("chip").content.firstElementChild!;
          label.nextElementSibling!.replaceWith(document.importNode(chip, true));
        }
        if (again) again.disabled = phase === "sent";
        return;
      }
      const save = part<HTMLButtonElement>("save");
      save.disabled = phase === "sent";
      save.textContent = phase === "done" ? "Reset" : "Save";
    };

    const syncWire = () => {
      const body = JSON.stringify(demo.body(way, title));
      if (wireKey !== `w${runs}`) {
        wireKey = `w${runs}`;
        const fresh = el("div", styles.wire);
        fresh.dataset.part = "wire";
        const packet = el("i", "");
        packet.setAttribute("aria-hidden", "true");
        fresh.append(el("span", styles.verb, "PATCH /tasks/12"), el("span", ""), packet);
        wire.replaceWith(fresh);
        wire = fresh;
        json = "";
      }
      const middle = wire.children[1]!;
      const packet = wire.lastElementChild!;
      if (phase === "idle") {
        if (middle.tagName !== "SPAN" || middle.className !== styles.idle)
          middle.replaceWith(el("span", styles.idle, "not sent yet"));
        json = "";
      } else {
        let code: Element = middle;
        if (code.tagName !== "CODE") {
          code = el("code", "");
          middle.replaceWith(code);
          json = "";
        }
        code.className = flowView.body(phase === "sent");
        if (json !== body) {
          json = body;
          code.replaceChildren(...painted(body));
        }
      }
      packet.className = flowView.packet(phase === "sent");
    };

    const syncRecord = () => {
      const key = phase === "done" ? `r${runs}` : "before";
      if (key === recordKey) return;
      recordKey = key;
      const after = { ...demo.before, ...arrived(demo.body(way, title)) };
      const row: Row = phase === "done" ? after : demo.before;
      const ran = runs > 0;
      const fresh = el("dl", styles.record);
      fresh.dataset.part = "record";
      demo.fields.forEach((field, index) => {
        const verdict =
          phase === "done" ? verdictOf(field, demo.before, after, demo.intent(title)) : undefined;
        const bad = verdict === "wiped" || verdict === "lost";
        const value = row[field];
        const cell = el("div", flowView.cell(verdict, ran));
        cell.style.setProperty("--i", String(index));
        const dd = el("dd", flowView.value(bad, ran && phase === "done"));
        if (value === null) dd.append(el("span", flowView.nul(bad), "null"));
        else if (value !== undefined) dd.textContent = value;
        cell.append(el("dt", styles.name, field), dd);
        if (verdict) cell.append(el("span", flowView.tag(verdict), verdict));
        fresh.append(cell);
      });
      record.replaceWith(fresh);
      record = fresh;
    };

    const sync = () => {
      syncForm();
      syncWire();
      syncRecord();
    };

    const send = () => {
      clearTimeout(timer);
      runs += 1;
      if (reducedMotion()) {
        phase = "done";
      } else {
        phase = "sent";
        timer = window.setTimeout(() => {
          phase = "done";
          sync();
        }, SEND_MS);
      }
      sync();
    };
    const reset = () => {
      touched = true;
      clearTimeout(timer);
      phase = "idle";
      sync();
    };

    form.addEventListener(
      "click",
      (event) => {
        const target = event.target instanceof Element ? event.target.closest("button") : null;
        if (!target) return;
        const name = target.dataset.part;
        if (name === "remove") {
          touched = true;
          send();
        } else if (name === "again" || (name === "save" && phase === "done")) reset();
        else if (name === "save") {
          touched = true;
          send();
        }
      },
      { signal },
    );
    if (!clear) {
      const input = part<HTMLInputElement>("input");
      input.addEventListener(
        "input",
        () => {
          title = input.value;
          if (phase === "done") reset();
          else sync();
        },
        { signal },
      );
    }

    let stopRewind = () => {};
    if (
      !reducedMotion() &&
      !matchMedia(TABBED).matches &&
      flow.getBoundingClientRect().top >= innerHeight * 0.7
    ) {
      phase = "idle";
      sync();
      let wait = 0;
      const stop = onceOnScreen(flow, () => {
        wait = window.setTimeout(() => {
          if (!touched) send();
        }, 500);
      });
      stopRewind = () => {
        stop();
        clearTimeout(wait);
      };
    }

    this.#stop = () => {
      controller.abort();
      stopRewind();
      clearTimeout(timer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("null-flow", NullFlow);
