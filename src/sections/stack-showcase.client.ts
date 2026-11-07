import { countClass } from "./chips.view";
import { groupLabelClass, groupWordsClass, toolClass } from "./stack-showcase.view";

const HEADER_HEIGHT = 72;
const CARD_GAP = 10;
const CARD_TOP_MARGIN = 16;
const CARD_HIDE_DELAY_MS = 80;
const PEEK_ID = "stack-peek";
const STACK_FILTER = "stack-filter";

type Shown = { group: HTMLElement; tools: HTMLElement[] };

/**
 * The stack (stack-showcase.astro). The chips filter the badges to one company's, gliding the
 * badges that stay and sliding in the ones that come back in a view transition. A badge under a
 * mouse or keyboard focus peeks a card naming where I used the tool.
 */
class StackShowcase extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const section = this.querySelector("section")!;
    const groupsBox = this.querySelector<HTMLElement>('[data-part="groups"]')!;
    const chipButtons = [...this.querySelectorAll<HTMLButtonElement>("[data-chip]")];
    const groups = [...groupsBox.querySelectorAll<HTMLElement>(":scope > *")].map((group) => ({
      group,
      label: group.querySelector("h3")!,
      words: group.querySelector("h3 > span")!,
      list: group.querySelector("ul")!,
      tools: [...group.querySelectorAll<HTMLElement>("li[data-tool]")],
    }));
    // stack-showcase.astro writes each tool's places as a JSON array of names.
    const placesOf = (li: HTMLElement): string[] => JSON.parse(li.dataset.usedAt!);
    const usedAt = new Map(
      groups.flatMap(({ tools }) => tools.map((li): [HTMLElement, string[]] => [li, placesOf(li)])),
    );
    const cardTemplate = this.querySelector<HTMLTemplateElement>('template[data-part="card"]')!;

    let filtered = false;
    let picked: string | null = null;
    let card: HTMLElement | null = null;
    let peekedTool: HTMLElement | null = null;
    let hideTimer = 0;

    const setPeek = (anchor: HTMLElement | null) => {
      peekedTool?.removeAttribute("aria-describedby");
      peekedTool = anchor;
      if (!anchor) {
        card?.remove();
        card = null;
        return;
      }
      anchor.setAttribute("aria-describedby", PEEK_ID);
      const tool = anchor.dataset.tool!;
      const template = this.querySelector<HTMLTemplateElement>(
        `template[data-peek="${CSS.escape(tool)}"]`,
      )!;
      if (!card) {
        card = document.importNode(
          cardTemplate.content.querySelector<HTMLElement>(`#${PEEK_ID}`)!,
          true,
        );
        groupsBox.after(card);
      }
      card.setAttribute("style", template.dataset.style ?? "");
      if (!template.dataset.style) card.removeAttribute("style");
      const content = document.importNode(template.content, true);
      content.querySelector("header")!.prepend(anchor.firstElementChild!.cloneNode(true));
      card.replaceChildren(content);
      place(anchor, card);
    };

    const place = (anchor: HTMLElement, peek: HTMLElement) => {
      const box = section.getBoundingClientRect();
      const at = anchor.getBoundingClientRect();
      const width = peek.offsetWidth;
      const height = peek.offsetHeight;
      const centered = at.left + at.width / 2 - width / 2 - box.left;
      const left = Math.min(Math.max(centered, 0), box.width - width);
      const fitsAbove = at.top - height - CARD_GAP >= HEADER_HEIGHT + CARD_TOP_MARGIN;
      const top = fitsAbove ? at.top - height - CARD_GAP : at.bottom + CARD_GAP;
      peek.style.left = `${left}px`;
      peek.style.top = `${top - box.top}px`;
      peek.dataset.side = fitsAbove ? "top" : "bottom";
    };

    const show = (anchor: HTMLElement) => {
      clearTimeout(hideTimer);
      setPeek(anchor);
    };
    const hide = () => {
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setPeek(null), CARD_HIDE_DELAY_MS);
    };

    for (const { tools } of groups) {
      for (const li of tools) {
        li.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && show(li), {
          signal,
        });
        li.addEventListener("pointerleave", (event) => event.pointerType === "mouse" && hide(), {
          signal,
        });
        li.addEventListener("focus", () => show(li), { signal });
        li.addEventListener("blur", hide, { signal });
        li.addEventListener(
          "keydown",
          (event) => {
            if (event.key !== "Escape" || peekedTool !== li) return;
            clearTimeout(hideTimer);
            setPeek(null);
          },
          { signal },
        );
      }
    }

    const shownFor = (name: string | null): Shown[] =>
      groups
        .map(({ group, tools }) => ({
          group,
          tools: name ? tools.filter((li) => usedAt.get(li)!.includes(name)) : tools,
        }))
        .filter(({ tools }) => tools.length > 0);

    const apply = (shown: Shown[]) => {
      if (!filtered) {
        filtered = true;
        for (const { label, words, tools } of groups) {
          label.className = groupLabelClass(true);
          label.removeAttribute("data-cut");
          words.className = groupWordsClass(true);
          words.removeAttribute("data-cut");
          for (const li of tools) {
            li.className = toolClass(true);
            li.removeAttribute("data-cut");
          }
        }
      }
      for (const { group, tools } of shown) group.querySelector("ul")!.replaceChildren(...tools);
      groupsBox.replaceChildren(...shown.map(({ group }) => group));
      chipButtons.forEach((chip) => {
        const on = (chip.dataset.chip || null) === picked;
        chip.setAttribute("aria-pressed", String(on));
        chip.querySelector("b")!.className = countClass(on);
      });
    };

    // Names each badge and group in the transition: the ones that stay glide (stack-move), the
    // ones that come back slide in, and the dropped ones fade, as React's <ViewTransition> did.
    // `named` is the latest run's; an earlier run that ends late leaves the latest run's names be.
    let named: HTMLElement[] = [];
    const nameAs = (run: HTMLElement[], element: HTMLElement, kind: string) => {
      element.style.setProperty("view-transition-name", `stack-${run.length}`);
      element.style.setProperty("view-transition-class", kind);
      run.push(element);
    };
    const unname = () => {
      for (const element of named) {
        element.style.removeProperty("view-transition-name");
        element.style.removeProperty("view-transition-class");
      }
      named = [];
    };

    const pick = (next: string | null) => {
      clearTimeout(hideTimer);
      setPeek(null);
      const before = shownFor(picked);
      const after = shownFor(next);
      picked = next;
      if (!document.startViewTransition) {
        apply(after);
        return;
      }
      unname();
      const run = named;
      const was = new Set(before.flatMap(({ group, tools }) => [group, ...tools]));
      const stays = new Set(after.flatMap(({ group, tools }) => [group, ...tools]));
      for (const element of was) {
        nameAs(run, element, stays.has(element) ? "stack-move" : "stack-out");
      }
      const transition = document.startViewTransition({
        update: () => {
          apply(after);
          if (named !== run) return;
          for (const element of stays) if (!was.has(element)) nameAs(run, element, "stack-in");
        },
        types: [STACK_FILTER],
      });
      transition.finished.finally(() => {
        if (named === run) unname();
      });
    };

    chipButtons.forEach((chip) =>
      chip.addEventListener(
        "click",
        () => {
          const name = chip.dataset.chip || null;
          pick(name !== null && picked === name ? null : name);
        },
        { signal },
      ),
    );

    this.#stop = () => {
      controller.abort();
      clearTimeout(hideTimer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("stack-showcase", StackShowcase);
