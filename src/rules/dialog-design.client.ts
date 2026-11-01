import { reducedMotion } from "../hooks/media-query";
import { palette } from "../theme.stylex";
import { DRAFT } from "./dialog-design";
import {
  articleView,
  cardView,
  dialogView,
  type ReadTone,
  readView,
  ringView,
  scrimView,
} from "./dialog-design.styles";
import { onceOnScreen } from "./rule-motion";

/**
 * A demo's window (dialog-window.astro) and the parts every demo has: the page under the dialog,
 * the scrim, the keys under the window and the line that reports what happened.
 */
function windowOf(host: HTMLElement, signal: AbortSignal) {
  const part = <T extends HTMLElement = HTMLElement>(name: string) =>
    host.querySelector<T>(`[data-part="${name}"]`)!;
  const read = part("read");
  // Each Key keeps focus where it was, so pressing it acts on the window's focus.
  part("keys").addEventListener(
    "mousedown",
    (event) => {
      if (event.target instanceof Element && event.target.closest("button")) event.preventDefault();
    },
    { signal },
  );
  let said = [...read.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join("|");
  /** Shows `parts` in the read line, one text node per string, rewriting it only on a change. */
  const say = (parts: (string | Node)[], tone: ReadTone) => {
    read.className = readView(tone);
    const next = parts.map((p) => (p instanceof Node ? `<${p.textContent}>` : p)).join("|");
    if (next === said) return;
    said = next;
    read.replaceChildren(...parts);
  };
  return {
    part,
    stage: part("stage"),
    screen: part("screen"),
    page: part("page"),
    scrim: part("scrim"),
    say,
  };
}

type Window = ReturnType<typeof windowOf>;

/**
 * Which `[data-stop]` in the window holds the ring the demo draws, and whether real focus follows
 * it. The demo's own ring lets a scripted walk show focus moving without taking the reader's.
 * `changed` runs when the reader moves focus themselves.
 */
function windowFocus({ screen, page }: Window, signal: AbortSignal, changed: () => void) {
  let at: string | null = null;
  let pending = false;
  // Each stop's own classes, without the ring, recorded the first time it is in the window.
  const looks = new Map<HTMLElement, string>();
  // An input draws no ::after, so its ring goes on the wrap round it.
  const ringOf = (stop: HTMLElement) =>
    stop instanceof HTMLInputElement ? stop.parentElement! : stop;
  const find = (stop: string) => screen.querySelector<HTMLElement>(`[data-stop="${stop}"]`);

  screen.addEventListener(
    "focusin",
    (event) => {
      const stop =
        event.target instanceof HTMLElement
          ? event.target.closest<HTMLElement>("[data-stop]")?.dataset.stop
          : undefined;
      if (!stop || stop === at) return;
      at = stop;
      changed();
    },
    { signal },
  );

  return {
    get at() {
      return at;
    },
    find,
    move(stop: string | null, real: boolean) {
      at = stop;
      pending = real;
    },
    next(within: HTMLElement | null, back: boolean) {
      const stops = [...screen.querySelectorAll<HTMLElement>("[data-stop]")].filter(
        (element) => !element.closest("[inert]") && (!within || within.contains(element)),
      );
      if (stops.length === 0) return null;
      const now = stops.findIndex((element) => element.dataset.stop === at);
      const to =
        now === -1
          ? back
            ? stops.length - 1
            : 0
          : (now + (back ? -1 : 1) + stops.length) % stops.length;
      return stops[to]?.dataset.stop ?? null;
    },
    /** Draws the ring, dashed on a page stop while the dialog is `open`, then focuses as asked. */
    flush(open: boolean) {
      for (const stop of screen.querySelectorAll<HTMLElement>("[data-stop]")) {
        if (!looks.has(stop)) looks.set(stop, ringOf(stop).className);
      }
      for (const [stop, look] of looks) {
        ringOf(stop).className =
          stop.dataset.stop === at ? `${look} ${ringView(open && page.contains(stop))}` : look;
      }
      if (!pending) return;
      pending = false;
      if (at) find(at)?.focus({ preventScroll: true });
    },
  };
}

function setDialog(dialog: HTMLElement, open: boolean, held = false, top = false) {
  dialog.inert = !open || held;
  dialog.className = dialogView(top, open);
}

function stopButton(w: Window, stop: string) {
  return w.screen.querySelector<HTMLElement>(`[data-stop="${stop}"]`)!;
}

/** A demo element: `run` wires it up once connected and gets whether it is the ✓ side. */
function defineDemo(
  name: string,
  run: (host: HTMLElement, sealed: boolean, signal: AbortSignal) => (() => void) | void,
) {
  customElements.define(
    name,
    class extends HTMLElement {
      #stop?: () => void;

      connectedCallback() {
        const controller = new AbortController();
        const stop = run(this, this.hasAttribute("data-sealed"), controller.signal);
        this.#stop = () => {
          controller.abort();
          stop?.();
        };
      }

      disconnectedCallback() {
        this.#stop?.();
      }
    },
  );
}

const PROFILE_STOPS = new Map([
  ["trigger", "Edit profile"],
  ["pay", "Pay now"],
  ["help", "Help"],
  ["name", "Name"],
  ["cancel", "Cancel"],
  ["save", "Save"],
]);
const IN_PROFILE = ["name", "cancel", "save"];
const WALK_START = 500;
const WALK_STEP = 600;
const WALK_PRESSES = 7;

/** "Keep focus inside": Tab through a checkout with Edit profile open. Once on screen it walks. */
defineDemo("dialog-focus", (host, sealed, signal) => {
  const w = windowOf(host, signal);
  const dialog = w.part("dialog");
  let open = false;
  let touched = false;
  const focus = windowFocus(w, signal, () => render());

  const render = () => {
    w.page.inert = sealed && open;
    w.scrim.className = scrimView(false, open);
    setDialog(dialog, open);
    const behind = open && focus.at !== null && !IN_PROFILE.includes(focus.at);
    const where = (focus.at && PROFILE_STOPS.get(focus.at)) ?? "<body>";
    w.say(
      ["Focus: ", where, ...(behind ? [", behind"] : [])],
      behind || (open && !focus.at) ? "no" : undefined,
    );
    focus.flush(open);
  };
  const show = (real: boolean) => {
    open = true;
    focus.move(sealed ? "name" : "trigger", real);
    render();
  };
  const hide = () => {
    open = false;
    const stays = focus.at !== null && !IN_PROFILE.includes(focus.at) ? focus.at : null;
    focus.move(sealed ? "trigger" : stays, true);
    render();
  };
  const tab = (real: boolean, back = false) => {
    focus.move(focus.next(sealed && open ? dialog : null, back), real);
    render();
  };

  for (const kind of ["pointerdown", "keydown"] as const) {
    host.addEventListener(kind, () => (touched = true), { capture: true, signal });
  }
  w.part("tab").addEventListener("click", () => tab(true), { signal });
  w.part("esc").addEventListener("click", () => open && hide(), { signal });
  stopButton(w, "trigger").addEventListener("click", () => show(true), { signal });
  for (const stop of ["cancel", "save"]) {
    stopButton(w, stop).addEventListener("click", hide, { signal });
  }
  w.screen.addEventListener(
    "keydown",
    (event) => {
      if (!open) return;
      if (event.key === "Escape") hide();
      if (event.key === "Tab" && sealed) {
        event.preventDefault();
        tab(true, event.shiftKey);
      }
    },
    { signal },
  );

  if (reducedMotion()) return;
  const timers: number[] = [];
  const later = (at: number, step: () => void) =>
    timers.push(
      window.setTimeout(() => {
        if (!touched) step();
      }, at),
    );
  const stop = onceOnScreen(w.stage, () => {
    later(WALK_START, () => show(false));
    for (let press = 1; press <= WALK_PRESSES; press++) {
      later(WALK_START + press * WALK_STEP, () => tab(false));
    }
  });
  return () => {
    stop();
    for (const timer of timers) clearTimeout(timer);
  };
});

/** "Let Escape close it": What's new, closed by Esc and a click outside only on the ✓ side. */
defineDemo("dialog-escape", (host, sealed, signal) => {
  const w = windowOf(host, signal);
  const dialog = w.part("dialog");
  let open = false;
  let said = "Open What's new, then press Esc";
  let ignored = 0;
  const focus = windowFocus(w, signal, () => render());

  const render = () => {
    w.page.inert = open;
    w.scrim.className = scrimView(false, open);
    setDialog(dialog, open);
    w.say([said], ignored > 0 && open ? "no" : undefined);
    focus.flush(open);
  };
  const close = (how: string) => {
    open = false;
    said = `Closed by ${how}`;
    focus.move("trigger", true);
    render();
  };
  const refuse = (what: string) => {
    ignored += 1;
    said = `${what} ignored, ${ignored}×`;
    render();
  };
  const escape = () => {
    if (!open) return;
    if (sealed) close("Esc");
    else refuse("Esc");
  };

  stopButton(w, "trigger").addEventListener(
    "click",
    () => {
      open = true;
      focus.move("ok", true);
      render();
    },
    { signal },
  );
  stopButton(w, "x").addEventListener("click", () => close("×"), { signal });
  stopButton(w, "ok").addEventListener("click", () => close("Got it"), { signal });
  w.part("esc").addEventListener("click", escape, { signal });
  w.screen.addEventListener("keydown", (event) => event.key === "Escape" && escape(), { signal });
  w.scrim.addEventListener(
    "click",
    () => (sealed ? close("a click outside") : refuse("Click outside")),
    { signal },
  );
});

type ConfirmPhase = "idle" | "open" | "deleted";

/** "Focus the safe answer": Delete project, opening on Delete or, on the ✓ side, on Cancel. */
defineDemo("dialog-confirm", (host, sealed, signal) => {
  const w = windowOf(host, signal);
  const dialog = w.part("dialog");
  const card = w.part("card");
  const idle = [...card.childNodes];
  const gone = [
    ...document.importNode(w.part<HTMLTemplateElement>("gone").content, true).childNodes,
  ];
  let phase: ConfirmPhase = "idle";
  let shown = false;
  const focus = windowFocus(w, signal, () => render());

  const render = () => {
    const open = phase === "open";
    const deleted = phase === "deleted";
    w.page.inert = open;
    card.className = cardView(deleted);
    if (deleted !== shown) {
      shown = deleted;
      card.replaceChildren(...(deleted ? gone : idle));
    }
    w.scrim.className = scrimView(false, open);
    setDialog(dialog, open);
    const at = focus.at;
    w.say(
      [
        deleted
          ? "Enter deleted 214 files"
          : open && at
            ? `Enter presses ${at === "delete" ? "Delete" : at === "cancel" ? "Cancel" : "Delete project"}`
            : "Open Delete project, then press Enter",
      ],
      deleted || at === "delete" ? "no" : open ? "yes" : undefined,
    );
    focus.flush(open);
  };
  const go = (next: ConfirmPhase, stop: string) => {
    phase = next;
    focus.move(stop, true);
    render();
  };

  const on = (stop: string, nodes: Node[], act: () => void) => {
    for (const node of nodes) {
      if (node instanceof HTMLElement && node.dataset.stop === stop) {
        node.addEventListener("click", act, { signal });
      }
    }
  };
  on("trigger", idle, () => go("open", sealed ? "cancel" : "delete"));
  on("reset", gone, () => go("idle", "trigger"));
  stopButton(w, "cancel").addEventListener("click", () => go("idle", "trigger"), { signal });
  stopButton(w, "delete").addEventListener("click", () => go("deleted", "reset"), { signal });
  w.part("enter").addEventListener("click", () => focus.at && focus.find(focus.at)?.click(), {
    signal,
  });
  w.screen.addEventListener(
    "keydown",
    (event) => event.key === "Escape" && phase === "open" && go("idle", "trigger"),
    { signal },
  );
});

type DraftPhase = "closed" | "open" | "confirm";

/** "Ask before you drop a draft": New issue with a typed title, kept on the ✓ side. */
defineDemo("dialog-draft", (host, sealed, signal) => {
  const w = windowOf(host, signal);
  const dialog = w.part("dialog");
  const input = w.screen.querySelector<HTMLInputElement>('[data-stop="title"]')!;
  const top = sealed
    ? {
        scrim: w.part("scrim-top"),
        dialog: w.part("confirm"),
        body: w.part("confirm").querySelector<HTMLElement>('[data-part="body"]')!,
      }
    : null;
  let phase: DraftPhase = "closed";
  let draft = DRAFT;
  let said = `Draft: ${DRAFT.length} chars`;
  const dirty = () => draft.trim() !== "";
  const focus = windowFocus(w, signal, () => render());

  const render = () => {
    const open = phase !== "closed";
    w.page.inert = open;
    w.scrim.className = scrimView(false, open);
    setDialog(dialog, open, phase === "confirm");
    if (input.value !== draft) input.value = draft;
    if (top) {
      top.scrim.className = scrimView(true, phase === "confirm");
      setDialog(top.dialog, phase === "confirm", false, true);
      top.body.textContent = `You'll lose ${draft.length} characters.`;
    }
    w.say(
      [said],
      said.endsWith("gone")
        ? "no"
        : said.startsWith("Asked") || said.endsWith("open")
          ? "yes"
          : undefined,
    );
    focus.flush(open);
  };
  const drop = (how: string) => {
    phase = "closed";
    focus.move("trigger", true);
    said = dirty() ? `${how}: ${draft.length} chars gone` : `Closed by ${how}`;
    draft = "";
    render();
  };
  const leave = (how: string) => {
    if (!sealed || !dirty()) return drop(how);
    phase = "confirm";
    focus.move("keep", true);
    said = "Asked first";
    render();
  };
  const strayClick = () => {
    if (!sealed || !dirty()) return drop("A click outside");
    said = "Click outside: still open";
    render();
    if (reducedMotion()) {
      dialog.animate(
        [{ boxShadow: `0 0 0 2px ${palette["--no"]}` }, { boxShadow: "0 0 0 2px transparent" }],
        { duration: 480, easing: "ease-out" },
      );
      return;
    }
    dialog.animate(
      [
        { transform: "none" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "none" },
      ],
      { duration: 320, easing: "cubic-bezier(0.83, 0, 0.17, 1)" },
    );
  };
  const keepEditing = () => {
    phase = "open";
    focus.move("title", true);
    said = `Draft: ${draft.length} chars`;
    render();
  };
  const escape = () => {
    if (phase === "open") leave("Esc");
    else if (phase === "confirm") keepEditing();
  };

  stopButton(w, "trigger").addEventListener(
    "click",
    () => {
      phase = "open";
      focus.move("title", true);
      said = dirty() ? `Draft: ${draft.length} chars` : "Draft: empty";
      render();
    },
    { signal },
  );
  stopButton(w, "x").addEventListener("click", () => leave("×"), { signal });
  stopButton(w, "create").addEventListener(
    "click",
    () => {
      phase = "closed";
      focus.move("trigger", true);
      said = "Issue created";
      draft = DRAFT;
      render();
    },
    { signal },
  );
  input.addEventListener(
    "input",
    () => {
      draft = input.value;
      render();
    },
    { signal },
  );
  if (top) {
    stopButton(w, "keep").addEventListener("click", keepEditing, { signal });
    stopButton(w, "discard").addEventListener("click", () => drop("Discarded"), { signal });
  }
  w.part("esc").addEventListener("click", escape, { signal });
  w.part("retype").addEventListener(
    "click",
    () => {
      draft = DRAFT;
      said = `Draft: ${DRAFT.length} chars`;
      render();
    },
    { signal },
  );
  w.screen.addEventListener("keydown", (event) => event.key === "Escape" && escape(), { signal });
  w.scrim.addEventListener("click", () => phase === "open" && strayClick(), { signal });
});

/** "Lock the page behind": Share over an article, which still scrolls on the ✕ side. */
defineDemo("dialog-scroll", (host, sealed, signal) => {
  const w = windowOf(host, signal);
  const dialog = w.part("dialog");
  let open = false;
  let moved = 0;
  let base = 0;
  const focus = windowFocus(w, signal, () => render());

  const render = () => {
    w.page.inert = open;
    w.page.className = articleView(sealed && open);
    w.scrim.className = scrimView(false, open);
    setDialog(dialog, open);
    w.say(
      [open ? `Page moved ${moved}px` : "Open Share, then scroll"],
      open ? (moved > 0 ? "no" : "yes") : undefined,
    );
    focus.flush(open);
  };
  const nudge = (by: number) => {
    if (sealed && open) return;
    w.page.scrollTop += by;
    if (!open) return;
    moved = Math.abs(Math.round(w.page.scrollTop - base));
    render();
  };
  // Only while the dialog is open, as a wheel listener that may cancel holds up native scrolling.
  let wheel: AbortController | null = null;
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (!sealed) nudge(event.deltaY);
  };
  const hide = () => {
    open = false;
    wheel?.abort();
    focus.move("trigger", true);
    render();
  };

  stopButton(w, "trigger").addEventListener(
    "click",
    () => {
      base = w.page.scrollTop;
      moved = 0;
      open = true;
      wheel?.abort();
      wheel = new AbortController();
      w.screen.addEventListener("wheel", onWheel, { passive: false, signal: wheel.signal });
      focus.move("copy", true);
      render();
    },
    { signal },
  );
  stopButton(w, "x").addEventListener("click", hide, { signal });
  stopButton(w, "copy").addEventListener("click", hide, { signal });
  w.part("scroll").addEventListener("click", () => nudge(60), { signal });
  w.screen.addEventListener("keydown", (event) => event.key === "Escape" && open && hide(), {
    signal,
  });
  return () => wheel?.abort();
});

/** What a screen reader says as focus lands on `target` in `dialog`. */
function announce(dialog: HTMLElement, target: HTMLElement) {
  const textOf = (ids: string | null) =>
    (ids ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
  const parts: string[] = [];
  const role = dialog.getAttribute("role");
  if (role) parts.push(`${textOf(dialog.getAttribute("aria-labelledby"))}, ${role}.`);
  const description = textOf(dialog.getAttribute("aria-describedby"));
  if (description) parts.push(description);
  parts.push(
    target instanceof HTMLInputElement
      ? `${target.labels?.[0]?.firstElementChild?.textContent ?? ""}, edit text, ${target.value}`
      : `${target.textContent ?? ""}, button`,
  );
  return parts.join(" ");
}

/** "Give it a name": Rename, read aloud as focus moves, a named dialog only on the ✓ side. */
defineDemo("dialog-name", (host, sealed, signal) => {
  const w = windowOf(host, signal);
  const dialog = w.part("dialog");
  const speaker = w.part<HTMLTemplateElement>("speech");
  let open = false;
  let speech = "";
  let heard: [boolean, string | null] = [false, null];
  const focus = windowFocus(w, signal, () => render());

  const render = () => {
    w.page.inert = open;
    w.scrim.className = scrimView(false, open);
    setDialog(dialog, open);
    // Spoken again only when it opens, closes or focus moves, not as the name is edited.
    if (heard[0] !== open || heard[1] !== focus.at) {
      heard = [open, focus.at];
      const target = focus.at ? focus.find(focus.at) : null;
      speech = open && target && dialog.contains(target) ? announce(dialog, target) : "";
    }
    let line: string | Node = "Open Rename to hear it";
    if (speech) {
      const span = document.importNode(speaker.content.firstElementChild!, true);
      span.append("“", speech, "”");
      line = span;
    }
    w.say([line], speech ? (sealed ? "yes" : "no") : undefined);
    focus.flush(open);
  };
  const hide = () => {
    open = false;
    focus.move("trigger", true);
    render();
  };

  stopButton(w, "trigger").addEventListener(
    "click",
    () => {
      open = true;
      focus.move("name", true);
      render();
    },
    { signal },
  );
  for (const stop of ["cancel", "save"]) {
    stopButton(w, stop).addEventListener("click", hide, { signal });
  }
  w.part("tab").addEventListener(
    "click",
    () => {
      focus.move(focus.next(open ? dialog : null, false), true);
      render();
    },
    { signal },
  );
  w.screen.addEventListener("keydown", (event) => event.key === "Escape" && open && hide(), {
    signal,
  });
});
