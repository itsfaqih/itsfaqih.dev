import { reducedMotion } from "../hooks/media-query";
import { OUT, quizView, SNAP } from "./rule-landing.styles";

type Drag = { x0: number; y0: number; lastX: number; lastT: number; rot: number; moved: boolean };

/**
 * A quiz level (rule-quiz.astro). In a place level the reader drags the piece to a spot on the
 * board, or taps it and then a spot, or picks it up from the keyboard. A choose level has no piece,
 * and the reader taps a candidate. A wrong pick shakes and says why; the right one seats the piece,
 * or ticks the candidate, with a burst, and the level shows its stars.
 */
class RuleQuiz extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const article = this.querySelector("article")!;
    const part = <T extends Element = HTMLElement>(name: string) =>
      this.querySelector<T>(`[data-part="${name}"]`)!;
    const answer = this.dataset.answer!;
    const name = this.dataset.piece;
    const board = this.dataset.board;
    const hint = this.dataset.hint!;
    const piece = this.querySelector<HTMLButtonElement>('[data-part="piece"]');
    const say = part("say");
    const note = this.querySelector('[data-part="note"]');
    const head = part("head");
    const slots = new Map(
      [...this.querySelectorAll<HTMLButtonElement>('[data-part="slot"]')].map((slot) => [
        slot.dataset.slot!,
        slot,
      ]),
    );
    const notes = new Map([...slots].map(([id, slot]) => [id, slot.dataset.note!]));
    let said = say.firstElementChild!;
    let saidKey = "hint";

    let placed: string | null = null;
    let miss: { id: string; at: number } | null = null;
    let shook = 0;
    let mistakes = 0;
    let picked = false;
    let dragging = false;
    let near: string | null = null;
    let drag: Drag | null = null;
    let seat: Element | undefined;

    const sync = () => {
      const cleared = placed !== null;
      const open = !cleared && (!piece || picked || dragging);
      for (const [id, slot] of slots) {
        const seated = placed === id;
        const missed = miss?.id === id;
        slot.className = piece
          ? quizView.slot({
              lead: slot.previousElementSibling !== null,
              open,
              near: near === id,
              missed,
              cleared,
              seated,
            })
          : quizView.choice(slot.dataset.look === "spot" ? "spot" : "card", {
              missed,
              cleared,
              seated,
            });
        if (missed && miss!.at !== shook) {
          // A second miss on the same slot keeps its class, so the shake restarts by hand.
          shook = miss!.at;
          slot.style.animation = "none";
          void slot.offsetWidth;
          slot.style.animation = "";
        }
        slot.disabled = !open;
        if (cleared && !seated) slot.dataset.off = "true";
        else slot.removeAttribute("data-off");
        if (seated && !seat) {
          seat = document.importNode(
            part<HTMLTemplateElement>("seat").content.firstElementChild!,
            true,
          );
          if (piece) slot.replaceChildren(seat);
          else slot.append(seat);
        }
      }

      const shown = placed ?? miss?.id;
      const text = shown ? notes.get(shown) : undefined;
      say.className = quizView.say(cleared, text !== undefined);
      const key = text !== undefined ? `${shown}-${miss?.at ?? 0}` : "hint";
      if (key !== saidKey) {
        saidKey = key;
        const fresh = document.createElement("p");
        fresh.className = quizView.said(text !== undefined);
        fresh.textContent = text ?? hint;
        said.replaceWith(fresh);
        said = fresh;
      }

      if (cleared && !head.querySelector("i")) {
        const stars = Math.max(1, 3 - mistakes);
        const clear = document.importNode(part<HTMLTemplateElement>("clear").content, true);
        const meter = clear.lastElementChild!;
        meter.setAttribute("aria-label", `${stars} of 3 stars`);
        meter.querySelectorAll("i").forEach((star, index) => {
          star.className = quizView.star(index + 1 <= stars);
        });
        head.append(clear);
      }
      if (!piece) return;
      if (cleared) piece.remove();
      else {
        piece.className = quizView.piece(picked, dragging);
        if (dragging) piece.dataset.dragging = "true";
        else piece.removeAttribute("data-dragging");
        piece.setAttribute("aria-pressed", String(picked));
        piece.setAttribute(
          "aria-label",
          `${name}. ${picked ? `Picked up. Choose a spot in the ${board}.` : "Pick up"}`,
        );
      }
      note!.textContent = cleared
        ? "In its place."
        : picked
          ? "Choose a spot. Esc puts it back."
          : "Your piece";
    };

    const flyHome = (piece: HTMLElement) => {
      const transform = piece.style.transform;
      piece.style.transform = "";
      if (!transform || reducedMotion()) return;
      piece.animate([{ transform }, { transform: "none" }], { duration: 360, easing: OUT });
    };

    const drop = (id: string) => {
      if (placed !== null) return;
      picked = false;
      if (id === answer) {
        const from = piece && { rect: piece.getBoundingClientRect(), rot: drag?.rot ?? 0 };
        if (piece) piece.style.transform = "";
        placed = id;
        miss = null;
        sync();
        if (!from || !seat || reducedMotion()) return;
        const to = seat.getBoundingClientRect();
        const dx = from.rect.left - to.left;
        const dy = from.rect.top - to.top;
        seat.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) rotate(${from.rot}deg) scale(1.05)` },
            { transform: "none" },
          ],
          { duration: 420, easing: SNAP },
        );
        return;
      }
      mistakes += 1;
      miss = { id, at: performance.now() };
      if (piece) flyHome(piece);
      sync();
    };

    article.addEventListener(
      "click",
      (event) => {
        const slot =
          event.target instanceof Element ? event.target.closest<HTMLElement>("[data-slot]") : null;
        if (slot) drop(slot.dataset.slot!);
      },
      { signal },
    );

    if (piece) {
      const pick = (value: boolean) => {
        picked = value;
        sync();
        if (!picked) return;
        const first = slots.values().next().value;
        if (first && document.activeElement === piece) first.focus();
      };

      const nearest = (x: number, y: number) => {
        let best: string | null = null;
        let bestDistance = 48;
        for (const [id, element] of slots) {
          const box = element.getBoundingClientRect();
          const dx = Math.max(box.left - x, 0, x - box.right);
          const dy = Math.max(box.top - y, 0, y - box.bottom);
          const distance = Math.hypot(dx, dy);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = id;
          }
        }
        return best;
      };

      const endDrag = (cancelled: boolean) => {
        if (!drag) return;
        const target = near;
        near = null;
        if (!drag.moved) {
          drag = null;
          if (cancelled) sync();
          else pick(!picked);
          return;
        }
        dragging = false;
        if (target && !cancelled) drop(target);
        else {
          flyHome(piece);
          sync();
        }
        drag = null;
      };

      piece.addEventListener(
        "pointerdown",
        (event) => {
          if (placed !== null || event.button !== 0) return;
          piece.setPointerCapture(event.pointerId);
          drag = {
            x0: event.clientX,
            y0: event.clientY,
            lastX: event.clientX,
            lastT: event.timeStamp,
            rot: 0,
            moved: false,
          };
        },
        { signal },
      );
      piece.addEventListener(
        "pointermove",
        (event) => {
          if (!drag) return;
          const dx = event.clientX - drag.x0;
          const dy = event.clientY - drag.y0;
          if (!drag.moved) {
            if (Math.hypot(dx, dy) < 4) return;
            drag.moved = true;
            dragging = true;
            picked = false;
            sync();
          }
          const dt = Math.max(event.timeStamp - drag.lastT, 1);
          const lean = reducedMotion()
            ? 0
            : Math.max(-8, Math.min(8, ((event.clientX - drag.lastX) / dt) * 6));
          drag.rot += (lean - drag.rot) * 0.2;
          drag.lastX = event.clientX;
          drag.lastT = event.timeStamp;
          piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${drag.rot}deg) scale(1.05)`;
          const target = nearest(event.clientX, event.clientY);
          if (target !== near) {
            near = target;
            sync();
          }
        },
        { signal },
      );
      piece.addEventListener("pointerup", () => endDrag(false), { signal });
      piece.addEventListener("pointercancel", () => endDrag(true), { signal });
      piece.addEventListener(
        "click",
        (event) => {
          // Pointer taps are handled on pointerup; this is Enter and Space.
          if (event.detail === 0) pick(!picked);
        },
        { signal },
      );
      article.addEventListener(
        "keydown",
        (event) => {
          if (event.key !== "Escape" || !picked) return;
          pick(false);
          piece.focus();
        },
        { signal },
      );
    }

    this.#stop = () => controller.abort();
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-quiz", RuleQuiz);
