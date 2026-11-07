import { play } from "../hooks/sound";
import { landed, pickChoice, type FieldOption, type PickField } from "./null-vs-undefined";
import { paintedNodes, pickView } from "./null-vs-undefined.view";

const LIST = new Intl.ListFormat("en", { type: "conjunction" });

/**
 * A pick board (null-pick-board.astro). Each field's segments pick its option and rewrite its line;
 * once every field has one, Check carries the choice that set is. The quiz locks Check once
 * cleared, and the segments lock with it.
 */
class NullPickBoard extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const fields: PickField[] = JSON.parse(this.dataset.fields!);
    const notes: Record<string, string> = JSON.parse(this.dataset.notes!);
    const noun = this.dataset.noun!;
    const check = this.querySelector<HTMLButtonElement>('[data-look="check"]')!;
    const left = this.querySelector<HTMLElement>('[data-part="left"]')!;
    const result = this.querySelector<HTMLElement>('[data-part="result"]');
    const lines = [...this.querySelectorAll<HTMLElement>('[data-part="line"]')];
    const groups = [...this.querySelectorAll<HTMLElement>("[data-field]")];
    const picks: (FieldOption | undefined)[] = fields.map(() => undefined);

    const set = (index: number, option: FieldOption) => {
      picks[index] = option;
      lines[index]!.replaceChildren(...paintedNodes(option.line));
      groups[index]!.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((key) => {
        const on = key.dataset.key === option.key;
        key.setAttribute("aria-pressed", String(on));
        key.className = pickView.key(on);
      });
      const picked = picks.filter((pick) => pick !== undefined);
      const unpicked = fields.length - picked.length;
      left.removeAttribute("data-missed");
      left.textContent = unpicked > 0 ? `${unpicked} left to pick.` : "Press Check to try it.";
      if (unpicked > 0) return;
      const id = pickChoice(picked.map((pick) => pick.key));
      check.dataset.slot = id;
      check.dataset.note = notes[id];
    };

    groups.forEach((group, index) =>
      group.addEventListener(
        "click",
        (event) => {
          const key =
            event.target instanceof Element
              ? event.target.closest<HTMLButtonElement>("[data-key]")
              : null;
          const option = fields[index]!.options.find(
            (candidate) => candidate.key === key?.dataset.key,
          );
          if (!option || check.disabled || key?.getAttribute("aria-pressed") === "true") return;
          play("tap");
          set(index, option);
        },
        { signal },
      ),
    );

    // Each field lands what its pick sends, tinted by whether it matches what the answer lands.
    const send = () => {
      if (!result) return;
      result.replaceChildren(
        ...fields.map((field, index) => {
          const answer = field.options.find((option) => option.key === field.answer)!;
          const value = landed(field, picks[index]!);
          const line = document.createElement("span");
          line.className = pickView.result(value === landed(field, answer));
          line.append(...paintedNodes(`${field.name}: ${value}`));
          return line;
        }),
      );
    };

    // Until every field has a pick, Check has no answer to carry, so the quiz never hears it.
    check.addEventListener(
      "click",
      (event) => {
        if (picks.every((pick) => pick !== undefined)) return send();
        event.stopPropagation();
        play("error");
        left.toggleAttribute("data-missed", true);
        left.textContent = `Pick a ${noun} for ${LIST.format(fields.filter((_, index) => !picks[index]).map((field) => field.name))} first.`;
      },
      { signal },
    );

    // The quiz disables Check once it's cleared; the segments take the same lock.
    const lock = new MutationObserver(() => {
      if (!check.disabled) return;
      left.textContent = "";
      this.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((key) => {
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

customElements.define("null-pick-board", NullPickBoard);
