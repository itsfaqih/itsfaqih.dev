import { play } from "../hooks/sound";
import { MARKS, marked, markChoice, type Mark, type MarkField } from "./null-vs-undefined";
import { KINDS, markView, paint } from "./null-vs-undefined.view";

const isMark = (key: string | undefined): key is Mark => MARKS.some(([mark]) => mark === key);

/**
 * A mark board (null-mark-board.astro). Each field's segments pick its mark and rewrite its line;
 * once every field has one, Check carries the choice that set is. The quiz locks Check once
 * cleared, and the segments lock with it.
 */
class NullMarkBoard extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const fields: MarkField[] = JSON.parse(this.dataset.fields!);
    const notes: Record<string, string> = JSON.parse(this.dataset.notes!);
    const check = this.querySelector<HTMLButtonElement>('[data-look="check"]')!;
    const left = this.querySelector<HTMLElement>('[data-part="left"]')!;
    const lines = [...this.querySelectorAll<HTMLElement>('[data-part="line"]')];
    const groups = [...this.querySelectorAll<HTMLElement>("[data-field]")];
    const marks: (Mark | undefined)[] = fields.map(() => undefined);

    const paintLine = (line: HTMLElement, source: string) => {
      line.replaceChildren(
        ...paint(source, KINDS).map((part) => {
          if (!part.class) return document.createTextNode(part.text);
          const span = document.createElement("span");
          span.className = part.class;
          span.textContent = part.text;
          return span;
        }),
      );
    };

    const set = (index: number, mark: Mark) => {
      marks[index] = mark;
      paintLine(lines[index]!, marked(fields[index]!, mark));
      groups[index]!.querySelectorAll<HTMLButtonElement>("[data-mark]").forEach((key) => {
        const on = key.dataset.mark === mark;
        key.setAttribute("aria-pressed", String(on));
        key.className = markView.key(on);
      });
      const picked = marks.filter(isMark);
      const unpicked = fields.length - picked.length;
      check.setAttribute("aria-disabled", String(unpicked > 0));
      left.textContent = unpicked > 0 ? `${unpicked} left to pick.` : "Press Check to try it.";
      if (unpicked > 0) return;
      const id = markChoice(picked);
      check.dataset.slot = id;
      check.dataset.note = notes[id];
    };

    groups.forEach((group, index) =>
      group.addEventListener(
        "click",
        (event) => {
          const key = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-mark]") : null;
          const mark = key?.dataset.mark;
          if (!isMark(mark) || check.disabled || key?.getAttribute("aria-pressed") === "true") return;
          play("tap");
          set(index, mark);
        },
        { signal },
      ),
    );

    // Until every field has a mark, Check has no answer to carry, so the quiz never hears it.
    check.addEventListener(
      "click",
      (event) => {
        if (check.getAttribute("aria-disabled") !== "true") return;
        event.stopPropagation();
        play("error");
        left.textContent = `Pick a mark for ${fields.filter((_, index) => !marks[index]).map((field) => field.name).join(" and ")} first.`;
      },
      { signal },
    );

    // The quiz disables Check once it's cleared; the segments take the same lock.
    const lock = new MutationObserver(() => {
      if (!check.disabled) return;
      left.textContent = "";
      this.querySelectorAll<HTMLButtonElement>("[data-mark]").forEach((key) => {
        key.disabled = true;
      });
    });
    lock.observe(check, { attributes: true, attributeFilter: ["disabled"] });

    this.#stop = () => {
      controller.abort();
      lock.disconnect();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("null-mark-board", NullMarkBoard);
