import { placeHighlight } from "../components/fluid-hover";
import { HOLD_MS, type Step, UNDO_MS, view } from "./button-design.styles";

const GUARDS = ["confirm", "hold", "undo"] as const;
type Guard = (typeof GUARDS)[number];

const HOLD_KEYS = new Set([" ", "Enter"]);
const COPY: Record<Step, { name: string; meta: string }> = {
  idle: { name: "Moonbase", meta: "214 files · edited 2h ago" },
  confirm: { name: "Delete Moonbase?", meta: "Its 214 files go too. You can't undo this." },
  undo: { name: "Moonbase deleted", meta: "Undo within 5 seconds" },
  deleted: { name: "Moonbase deleted", meta: "214 files deleted" },
};
const LABEL: Record<Exclude<Step, "confirm">, string> = {
  idle: "Delete project",
  undo: "Undo",
  deleted: "Reset demo",
};

/**
 * The project card (button-delete.astro). One click deletes it, or, carefully, a guard stands in
 * the way: a confirm that names what goes, a hold, or Undo for 5 seconds. Nodes that stay in place
 * between steps are patched rather than replaced, so only what mounts fresh plays its step-in.
 */
class ButtonDelete extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = <T extends Element = HTMLElement>(name: string) =>
      this.querySelector<T>(`[data-part="${name}"]`)!;
    const fresh = (name: string) =>
      document
        .importNode(part<HTMLTemplateElement>(`new-${name}`).content, true)
        .querySelector<HTMLElement>("*")!;
    const textOf = (element: Element) =>
      [...element.childNodes].find((node) => node instanceof Text)!;
    const careful = this.dataset.careful === "true";
    const project = part("project");
    const name = part("name");
    const meta = part("meta");
    const guards = GUARDS.flatMap((kind) => {
      const button = this.querySelector<HTMLButtonElement>(`[data-guard="${kind}"]`);
      return button ? [{ kind, button }] : [];
    });
    const pill = this.querySelector<HTMLElement>('[data-part="pill"]');

    let step: Step = "idle";
    let guard: Guard = "confirm";
    let holding = false;
    let moved = false;
    // The press that finished a hold is still down, and its release would click Reset demo.
    let spent = false;
    let holdTimer = 0;
    let undoTimer = 0;

    // A pristine copy, taken before any step patches it, to mount again on the way back to idle.
    const idleAction = document.importNode(part("action"), true);
    let action: HTMLElement | null = part("action");
    let label = textOf(action);
    let fill: HTMLElement | null = null;
    let row: HTMLElement | null = null;
    let drain: HTMLElement | null = null;

    const held = () => careful && guard === "hold";

    // One pill slides to the pressed guard (fluid-hover.ts). Until this runs, the server-rendered
    // Confirm button paints the pill itself, so placing it `instant` swaps the two with no flash.
    const showGuard = (instant = false) => {
      for (const { kind, button } of guards) {
        const on = kind === guard;
        button.setAttribute("aria-pressed", String(on));
        button.className = view.guard(on);
      }
      const pressed = guards.find(({ kind }) => kind === guard)?.button;
      if (!pill || !pressed) return;
      const area = pill.parentElement!.getBoundingClientRect();
      const box = pressed.getBoundingClientRect();
      placeHighlight(
        pill,
        { x: box.left - area.left, y: box.top - area.top, w: box.width, h: box.height },
        { instant },
      );
    };

    const render = () => {
      project.className = view.project(step);
      name.className = view.projectName(step === "deleted" || step === "undo");
      name.textContent = COPY[step].name;
      meta.textContent = COPY[step].meta;
      showGuard();

      if (step === "confirm") {
        action?.remove();
        action = null;
        fill = null;
        if (!row) {
          row = fresh("confirm");
          name.parentElement!.after(row);
        }
      } else {
        row?.remove();
        row = null;
        if (!action) {
          action = document.importNode(idleAction, true);
          label = textOf(action);
          name.parentElement!.after(action);
        }
        const idle = step === "idle";
        action.className = view.action(step, held());
        if (idle) action.dataset.hint = "true";
        else action.removeAttribute("data-hint");
        if (idle && held()) {
          if (!fill) {
            fill = fresh("fill");
            action.prepend(fill);
          }
          fill.className = view.holdFill(holding);
        } else {
          fill?.remove();
          fill = null;
        }
        const text = idle && held() ? "Hold to delete" : LABEL[step];
        if (label.data !== text) label.data = text;
      }

      if (step === "undo") {
        if (!drain) {
          drain = fresh("drain");
          project.append(drain);
        }
      } else {
        drain?.remove();
        drain = null;
      }
    };

    const update = (next: { step?: Step; guard?: Guard; holding?: boolean }) => {
      const was = { step, holding };
      step = next.step ?? step;
      guard = next.guard ?? guard;
      holding = next.holding ?? holding;
      render();
      if (holding !== was.holding) {
        clearTimeout(holdTimer);
        if (holding) {
          holdTimer = window.setTimeout(() => {
            spent = true;
            moved = true;
            update({ holding: false, step: "deleted" });
          }, HOLD_MS);
        }
      }
      if (step !== was.step) {
        if (moved) this.querySelector<HTMLElement>("[data-autofocus]")?.focus();
        clearTimeout(undoTimer);
        if (step === "undo") undoTimer = window.setTimeout(() => go("deleted"), UNDO_MS);
      }
    };

    const go = (next: Step) => {
      moved = true;
      update({ step: next });
    };

    const holdKey = (event: Event) =>
      held() &&
      step === "idle" &&
      event.target instanceof Element &&
      event.target.closest("button") === action;

    for (const { kind, button } of guards) {
      button.addEventListener(
        "click",
        () => {
          moved = false;
          update({ guard: kind, holding: false, step: "idle" });
        },
        { signal },
      );
    }

    this.addEventListener(
      "click",
      (event) => {
        if (!spent) return;
        event.preventDefault();
        event.stopPropagation();
      },
      { capture: true, signal },
    );
    const release = () => {
      if (spent) setTimeout(() => (spent = false));
    };
    this.addEventListener("pointerup", release, { capture: true, signal });
    this.addEventListener("keyup", release, { capture: true, signal });

    project.addEventListener(
      "click",
      (event) => {
        const target = event.target instanceof Element ? event.target.closest("button") : null;
        if (!target) return;
        const next = target.dataset.step;
        if (next === "idle" || next === "deleted") go(next);
        else if (target !== action || (step === "idle" && held())) return;
        else if (step !== "idle") go("idle");
        else go(!careful ? "deleted" : guard === "confirm" ? "confirm" : "undo");
      },
      { signal },
    );
    project.addEventListener(
      "pointerdown",
      (event) => {
        if (!holdKey(event)) return;
        action!.setPointerCapture(event.pointerId);
        update({ holding: true });
      },
      { signal },
    );
    for (const type of ["pointerup", "pointercancel", "focusout"]) {
      project.addEventListener(
        type,
        (event) => {
          if (holdKey(event)) update({ holding: false });
        },
        { signal },
      );
    }
    project.addEventListener(
      "contextmenu",
      (event) => {
        if (holdKey(event)) event.preventDefault();
      },
      { signal },
    );
    project.addEventListener(
      "keydown",
      (event) => {
        if (!holdKey(event) || !HOLD_KEYS.has(event.key)) return;
        event.preventDefault();
        if (!event.repeat) update({ holding: true });
      },
      { signal },
    );
    project.addEventListener(
      "keyup",
      (event) => {
        if (holdKey(event) && HOLD_KEYS.has(event.key)) update({ holding: false });
      },
      { signal },
    );

    showGuard(true);
    // Fonts landing or the viewport changing resize the guards, so the pill follows them at once.
    const resize = new ResizeObserver(() => showGuard(true));
    if (pill) resize.observe(pill.parentElement!);

    this.#stop = () => {
      controller.abort();
      resize.disconnect();
      clearTimeout(holdTimer);
      clearTimeout(undoTimer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("button-delete", ButtonDelete);
