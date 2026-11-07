import { whenIdle } from "../browser/idle";
import { play } from "../browser/sound";
import { watchBoxScrollbar } from "./box-scrollbar";
import { ISLAND_HOME_MS, LIST_PADDING, view, type Step } from "./command-palette.view";
import { placeHighlight } from "./fluid-hover";

const PLACEHOLDER = {
  root: "Search pages, links, or actions...",
  "rule-of-thumb": "Search in Rule of Thumb...",
};
type Level = keyof typeof PLACEHOLDER;

const box = (stage: HTMLElement, name: string, rect: DOMRect) => {
  stage.style.setProperty(`--${name}-x`, `${rect.left}px`);
  stage.style.setProperty(`--${name}-y`, `${rect.top}px`);
  stage.style.setProperty(`--${name}-w`, `${rect.width}px`);
  stage.style.setProperty(`--${name}-h`, `${rect.height}px`);
};

/**
 * How well a query hits a command's search text, its label on the first line. Lower ranks first and
 * -1 misses: the label beats the rest, and a whole word beats the start of one.
 */
function searchRank(text: string, needle: string) {
  const [label, ...rest] = text.split("\n");
  const others = rest.join(" ");
  const wholeWord = (words: string) => ` ${words} `.includes(` ${needle} `);
  const wordStart = (words: string) => ` ${words}`.includes(` ${needle}`);
  return [
    wholeWord(label!),
    wordStart(label!),
    wholeWord(others),
    wordStart(others),
    text.includes(needle),
  ].indexOf(true);
}

// One level's server-rendered parts. Its groups and options are kept here while filtered out of the DOM.
const readLevel = (element: HTMLElement) => ({
  element,
  groups: [...element.querySelectorAll<HTMLElement>("[role=group]")].map((group) => ({
    element: group,
    label: group.firstElementChild!,
    options: [...group.querySelectorAll<HTMLElement>("[role=option]")],
  })),
  highlight: element.querySelector<HTMLElement>('[data-part="highlight"]')!,
  empty: element.querySelector<HTMLElement>('[data-part="empty"]')!,
});

/**
 * The ⌘K command palette (command-palette.astro). Both levels render on the server; this keeps
 * the open level's matching options in the DOM, highlights one, and runs it. Every open pours the
 * header island into the palette and every close pours it back.
 */
class CommandPalette extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const part = <T extends HTMLElement>(name: string) =>
      this.querySelector<T>(`[data-part="${name}"]`)!;
    const backdrop = this.querySelector<HTMLElement>(":scope > [data-pour]")!;
    const stage = this.querySelector("dialog")!;
    const panel = this.querySelector<HTMLElement>("[data-cmd-panel]")!;
    const crumb = part("crumb");
    const input = this.querySelector("input")!;
    const list = this.querySelector<HTMLElement>("[role=listbox]")!;
    const ghosts = part("ghosts");
    const track = list.nextElementSibling;
    const foot = part("foot");
    const backHint = part("back-hint");
    const footHints = [...foot.children].filter((hint) => hint !== backHint);
    const levels = Object.fromEntries(
      [...list.querySelectorAll<HTMLElement>(":scope > [data-level]")].map(
        (element): [string, ReturnType<typeof readLevel>] => [
          element.dataset.level ?? "",
          readLevel(element),
        ],
      ),
    );
    const copyOption = this.querySelector<HTMLElement>("[data-copy]")!;
    const back = part("back");
    const status = part("status");
    const [startGuard, endGuard] = this.querySelectorAll<HTMLElement>('[data-part="guard"]');

    let isOpen = false;
    let closing = false;
    let level: Level = "root";
    // Which way the last level change went, so the new list slides in from that side. Null on a
    // fresh open, where the pour already brings the list in.
    let step: Step = null;
    let query = "";
    let highlighted = 0;
    let copied = false;
    let flat: HTMLElement[] = [];
    let shown: HTMLElement | undefined;
    let returnFocus: Element | null = null;
    let inerted: HTMLElement[] = [];
    let copiedTimer = 0;
    let resetTimer = 0;
    let homeTimer = 0;
    let followFrame = 0;
    let stopScrollbar = () => {};

    const render = () => {
      const current = levels[level]!;
      const needle = query.trim().toLowerCase();
      const rankOf = (option: HTMLElement) =>
        needle
          ? searchRank(option.dataset.search!, needle)
          : option.dataset.searchOnly === undefined
            ? 0
            : -1;
      const hits = current.groups
        .map((group) => ({
          group,
          options: group.options
            .map((option) => ({ option, rank: rankOf(option) }))
            .filter(({ rank }) => rank >= 0)
            .sort((a, b) => a.rank - b.rank),
        }))
        .filter(({ options }) => options.length > 0)
        .sort((a, b) => a.options[0]!.rank - b.options[0]!.rank);
      flat = [];
      const groups = hits.map(({ group, options }) => {
        const matches = options.map(({ option }) => option);
        group.element.replaceChildren(group.label, ...matches);
        flat.push(...matches);
        return group;
      });
      groups.forEach((group, index) => {
        const later = view.group(index > 0);
        if (later) group.element.className = later;
        else group.element.removeAttribute("class");
      });
      current.empty.textContent = `No results for "${query}"`;
      current.element.replaceChildren(
        current.highlight,
        ...(flat.length ? groups.map((group) => group.element) : [current.empty]),
      );
      current.element.className = view.level(step);

      const selected = flat[flat.length === 0 ? -1 : Math.min(highlighted, flat.length - 1)];
      for (const option of flat) {
        const on = option === selected;
        option.setAttribute("aria-selected", String(on));
        option.className = view.item(on);
        option.firstElementChild!.className = view.icon(on);
      }
      if (selected) input.setAttribute("aria-activedescendant", selected.id);
      else input.removeAttribute("aria-activedescendant");

      crumb.inert = level === "root";
      crumb.className = view.crumb(level !== "root");
      input.placeholder = PLACEHOLDER[level];
      foot.replaceChildren(...footHints, ...(level === "root" ? [] : [backHint]));

      copyOption.querySelector('[data-part="mail"]')!.className = view.glyph(copied);
      copyOption.querySelector('[data-part="check"]')!.className = view.glyph(!copied);
      copyOption.querySelector<HTMLElement>('[data-part="copied"]')!.hidden = !copied;
      const said = copied ? "Email address copied" : "";
      if (status.textContent !== said) status.textContent = said;

      // One fill follows the highlighted option, whether the pointer or the arrow keys moved it, and
      // springs between options instead of blinking (fluid-hover.ts). A fresh fill fades in where it
      // lands instead of sliding there.
      if (selected)
        placeHighlight(current.highlight, { y: selected.offsetTop, h: selected.offsetHeight });
      else current.highlight.removeAttribute("data-on");
      if (selected && selected !== shown) selected.scrollIntoView({ block: "nearest" });
      shown = selected;
    };

    // Sizes the list to its level's content, so a level change can ease the height between levels.
    // The height eases only while the new level slides in; filtering as you type resizes at once.
    let fitting = new AbortController();
    let resize: ResizeObserver | undefined;
    const fitLevel = () => {
      const element = levels[level]!.element;
      fitting.abort();
      fitting = new AbortController();
      resize?.disconnect();
      element.toggleAttribute("data-shifting", step !== null);
      element.addEventListener("animationend", () => element.removeAttribute("data-shifting"), {
        once: true,
        signal: fitting.signal,
      });
      const fit = () => {
        // Capped here rather than by max-height alone, so an ease from a capped level starts moving
        // at once instead of sitting at the cap.
        const cap = parseFloat(getComputedStyle(list).maxHeight) || Infinity;
        list.style.height = `${Math.min(element.offsetHeight + LIST_PADDING, cap)}px`;
      };
      fit();
      resize = new ResizeObserver(fit);
      resize.observe(element);
    };

    const focusInput = () => requestAnimationFrame(() => input.focus());

    // The level being left slides out the other way as the new one slides in. It leaves as a copy of
    // its last frame, so the live list can switch levels at once.
    const switchLevel = (to: Level, toward: "left" | "right") => {
      const leaving = levels[level]!.element;
      const ghost = leaving.cloneNode(true);
      if (ghost instanceof HTMLElement) {
        for (const element of ghost.querySelectorAll("[id]")) element.removeAttribute("id");
        ghost.className = view.leaving(toward);
        ghost.style.cssText = `position: absolute; top: ${leaving.offsetTop - list.scrollTop}px; left: ${leaving.offsetLeft}px; width: ${leaving.offsetWidth}px`;
        ghost.addEventListener("animationend", () => ghost.remove(), { once: true });
        ghosts.replaceChildren(ghost);
      }
      list.scrollTop = 0;
      leaving.hidden = true;
      level = to;
      levels[level]!.element.hidden = false;
      query = "";
      input.value = "";
    };

    const enterSubmenu = () => {
      play("enter");
      switchLevel("rule-of-thumb", "left");
      step = "in";
      highlighted = 0;
      render();
      fitLevel();
      focusInput();
    };

    const goBack = () => {
      play("back");
      switchLevel("root", "right");
      step = "out";
      highlighted = 0;
      render();
      highlighted = Math.max(
        flat.findIndex((option) => option.dataset.submenu === "rule-of-thumb"),
        0,
      );
      render();
      fitLevel();
      focusInput();
    };

    const run = async (option: HTMLElement) => {
      const { href, external, copy, submenu } = option.dataset;
      if (submenu) enterSubmenu();
      else if (href) {
        play("enter");
        location.assign(href);
        close();
      } else if (external) {
        play("enter");
        window.open(external, "_blank", "noopener,noreferrer");
        close();
      } else if (copy) {
        try {
          await navigator.clipboard.writeText(copy);
          copied = true;
          play("success");
          render();
          clearTimeout(copiedTimer);
          copiedTimer = window.setTimeout(close, 1500);
        } catch (error) {
          console.warn("Could not copy the email address.", error);
        }
      }
    };

    // Reads the header island the palette pours out of, and the panel's own box (again on every
    // resize), before the first frame paints. While closing it reads the island every frame, since
    // picking a page can resize the island under the drop on its way home.
    const measure = () => {
      const island = document.querySelector(".island")?.getBoundingClientRect();
      box(stage, "anchor", island ?? new DOMRect(innerWidth / 2 - 24, 12, 48, 48));
      box(stage, "to", panel.getBoundingClientRect());
    };
    const panelResize = new ResizeObserver(measure);
    const follow = () => {
      measure();
      followFrame = requestAnimationFrame(follow);
    };

    const root = document.documentElement;
    const open = () => {
      if (isOpen) return;
      isOpen = true;
      play("open");
      clearTimeout(resetTimer);
      clearTimeout(homeTimer);
      if (closing) {
        closing = false;
        cancelAnimationFrame(followFrame);
        backdrop.removeAttribute("data-ending-style");
        stage.removeAttribute("data-ending-style");
      } else {
        returnFocus = document.activeElement;
        // Lifts the island over the backdrop for as long as the palette shows, closing included, so
        // the pour lands back on a sharp island.
        root.toggleAttribute("data-palette", true);
        backdrop.hidden = false;
        startGuard!.hidden = false;
        endGuard!.hidden = false;
        stage.show();
        backdrop.toggleAttribute("data-starting-style", true);
        stage.toggleAttribute("data-starting-style", true);
        requestAnimationFrame(() => {
          backdrop.removeAttribute("data-starting-style");
          stage.removeAttribute("data-starting-style");
        });
        render();
        fitLevel();
        measure();
        panelResize.observe(panel);
        addEventListener("resize", measure);
        if (track instanceof HTMLElement) stopScrollbar = watchBoxScrollbar(list, track);
      }
      root.style.overflow = "hidden";
      inerted = [...document.body.children].filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element !== this && !element.inert,
      );
      for (const element of inerted) element.inert = true;
      root.toggleAttribute("data-island-away", true);
      focusInput();
    };

    const hide = () => {
      closing = false;
      cancelAnimationFrame(followFrame);
      panelResize.disconnect();
      removeEventListener("resize", measure);
      stopScrollbar();
      backdrop.removeAttribute("data-ending-style");
      stage.removeAttribute("data-ending-style");
      backdrop.hidden = true;
      startGuard!.hidden = true;
      endGuard!.hidden = true;
      stage.close();
      root.removeAttribute("data-palette");
    };

    const close = () => {
      if (!isOpen) return;
      isOpen = false;
      clearTimeout(copiedTimer);
      copied = false;
      render();
      resetTimer = window.setTimeout(() => {
        if (level !== "root") switchLevel("root", "right");
        ghosts.replaceChildren();
        step = null;
        query = "";
        input.value = "";
        highlighted = 0;
        render();
        fitLevel();
      }, 300);
      // The island hides while it is out being the palette. On the way home it shows again as the
      // drop reaches it, so the two cross-fade instead of the island popping in after the drop is
      // gone.
      homeTimer = window.setTimeout(() => root.removeAttribute("data-island-away"), ISLAND_HOME_MS);
      root.style.removeProperty("overflow");
      for (const element of inerted) element.inert = false;
      inerted = [];
      if (returnFocus instanceof HTMLElement || returnFocus instanceof SVGElement)
        returnFocus.focus();
      else if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

      closing = true;
      backdrop.toggleAttribute("data-ending-style", true);
      stage.toggleAttribute("data-ending-style", true);
      follow();
      Promise.allSettled(stage.getAnimations().map((animation) => animation.finished)).then(() => {
        if (closing) hide();
      });
    };

    // Closing after an option runs stays quiet; the option already sounded.
    const dismiss = () => {
      if (isOpen) play("close");
      close();
    };

    const controller = new AbortController();
    const { signal } = controller;
    document.addEventListener(
      "keydown",
      (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "k") {
          event.preventDefault();
          // The header's search button opens the palette with a synthetic ⌘K, the only untrusted one.
          if (!event.isTrusted || !isOpen) open();
          else dismiss();
        } else if (event.key === "Escape" && isOpen) {
          dismiss();
        }
      },
      { signal },
    );
    backdrop.addEventListener("click", dismiss, { signal });
    back.addEventListener("click", goBack, { signal });
    endGuard!.addEventListener("focus", () => (crumb.inert ? input : back).focus(), { signal });
    startGuard!.addEventListener(
      "focus",
      () => {
        // A scrolling list is the last tab stop in browsers that make scrollers focusable.
        list.focus();
        if (document.activeElement !== list) input.focus();
      },
      { signal },
    );
    input.addEventListener(
      "input",
      () => {
        query = input.value;
        highlighted = 0;
        render();
      },
      { signal },
    );
    input.addEventListener(
      "keydown",
      (event) => {
        const total = flat.length;
        const selected = flat[Math.min(highlighted, total - 1)];
        switch (event.key) {
          case "ArrowDown":
          case "ArrowUp": {
            event.preventDefault();
            if (total === 0) return;
            highlighted = (highlighted + (event.key === "ArrowDown" ? 1 : total - 1)) % total;
            if (total > 1) play("move");
            render();
            break;
          }
          case "Enter": {
            event.preventDefault();
            if (selected) void run(selected);
            break;
          }
          case "ArrowRight": {
            if (selected?.dataset.submenu) {
              event.preventDefault();
              enterSubmenu();
            }
            break;
          }
          case "ArrowLeft":
          case "Backspace": {
            if (query === "" && level !== "root") {
              event.preventDefault();
              goBack();
            }
            break;
          }
        }
      },
      { signal },
    );
    list.addEventListener(
      "click",
      (event) => {
        const option = event.target instanceof Element && event.target.closest("[role=option]");
        if (option instanceof HTMLElement && flat.includes(option)) void run(option);
      },
      { signal },
    );
    list.addEventListener(
      "pointermove",
      (event) => {
        const option = event.target instanceof Element && event.target.closest("[role=option]");
        const index = option instanceof HTMLElement ? flat.indexOf(option) : -1;
        if (index < 0 || index === Math.min(highlighted, flat.length - 1)) return;
        highlighted = index;
        play("move");
        render();
      },
      { signal },
    );

    render();
    this.#stop = () => {
      controller.abort();
      fitting.abort();
      resize?.disconnect();
      clearTimeout(copiedTimer);
      clearTimeout(resetTimer);
      clearTimeout(homeTimer);
      if (isOpen || closing) hide();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

const early = new AbortController();
const define = () => {
  early.abort();
  if (!customElements.get("command-palette"))
    customElements.define("command-palette", CommandPalette);
};
// A ⌘K, or the header search button's synthetic one, can come before the browser idles. Defining
// here, in the capture phase at window, adds the palette's document listener in time to take it.
addEventListener(
  "keydown",
  (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") define();
  },
  { capture: true, signal: early.signal },
);
whenIdle(define);
