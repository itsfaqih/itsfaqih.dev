import { reducedMotion, watchMedia } from "../hooks/media-query";
import { glowDots } from "./backdrop-dots";
import { watchRuleOpen } from "./rule-open";
import { number } from "./rule-spread.css";
import { pad } from "./rule-spread.view";
import { cx, type ClassValue } from "../cx";
const STEP = 0.68;
const RUBBER = 0.35;
const STIFFNESS = 140;
const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.82;
const PROJECT_S = 0.12;
const FLICK_PX = 30;
const DRAG_START_PX = 6;
const HIDDEN_AT = 2.95;
const WHEEL_SETTLE_MS = 120;

type Grab = {
  x: number;
  position: number;
  unit: number;
  samples: { x: number; t: number }[];
  dragging: boolean;
};

const digits = (value: number, ...more: ClassValue[]) => {
  const span = document.createElement("span");
  span.className = cx(number.digits, ...more);
  span.textContent = pad(value);
  return span;
};

/**
 * The deck of rules (rule-spread.astro). Cards fan out from the active one; a drag, a sideways
 * scroll, the arrow keys or the step buttons move it, and it springs to rest on a card. Clicking a
 * card dives into its rule.
 */
class RuleSpread extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = <T extends HTMLElement = HTMLElement>(name: string) =>
      this.querySelector<T>(`[data-part="${name}"]`)!;
    const stage = part("stage");
    const slots = [...stage.querySelectorAll<HTMLElement>(":scope > *")];
    const cards = [...stage.querySelectorAll<HTMLAnchorElement>(":scope > * > a")];
    const thumbs = cards.map((card) => card.querySelector(".thumb")!);
    const title = part("title");
    const previous = part<HTMLButtonElement>("previous");
    const next = part<HTMLButtonElement>("next");
    const slideNumber = part("number");

    const last = slots.length - 1;
    const initial = Math.floor(last / 2);
    let active = initial;
    let shownNumber = initial + 1;
    let reduced = reducedMotion();
    const deck = {
      position: initial,
      velocity: 0,
      target: initial,
      frame: 0,
      wheelTimer: 0,
      justDragged: false,
    };
    let grab: Grab | null = null;
    const clamp = (index: number) => Math.max(0, Math.min(last, index));

    // The count rolls: the old number leaves and the new one comes in, down when it went back.
    const showNumber = (value: number) => {
      const was = shownNumber;
      shownNumber = value;
      slideNumber.dataset.dir = value < was ? "down" : "up";
      const old = digits(was, number.was);
      old.setAttribute("aria-hidden", "true");
      slideNumber.replaceChildren(old, digits(value, number.now));
    };

    const activate = (index: number) => {
      if (index === active) return;
      cards[active]!.removeAttribute("aria-current");
      thumbs[active]!.removeAttribute("data-play");
      active = index;
      const card = cards[index]!;
      card.setAttribute("aria-current", "true");
      thumbs[index]!.setAttribute("data-play", "");
      title.textContent = card.querySelector(".t")!.textContent;
      previous.disabled = index === 0;
      next.disabled = index === last;
      showNumber(index + 1);
    };

    const paint = () => {
      const { position } = deck;
      slots.forEach((slot, index) => {
        const offset = index - position;
        slot.style.setProperty("--d", offset.toFixed(4));
        slot.style.setProperty("--ad", Math.abs(offset).toFixed(4));
        slot.style.zIndex = String(10 - Math.round(Math.abs(offset)));
        slot.style.visibility = Math.abs(offset) > HIDDEN_AT ? "hidden" : "";
      });
      activate(clamp(Math.round(position)));
      glow();
    };
    const glow = () =>
      glowDots("rule-spread", cards[active]!, cards[active]!.style.getPropertyValue("--c"));
    glow();

    const settle = () => {
      cancelAnimationFrame(deck.frame);
      if (reduced) {
        deck.position = deck.target;
        deck.velocity = 0;
        paint();
        return;
      }
      let then = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.032, (now - then) / 1000);
        then = now;
        deck.velocity += ((deck.target - deck.position) * STIFFNESS - deck.velocity * DAMPING) * dt;
        deck.position += deck.velocity * dt;
        const atRest =
          Math.abs(deck.target - deck.position) < 0.001 && Math.abs(deck.velocity) < 0.01;
        if (atRest) {
          deck.position = deck.target;
          deck.velocity = 0;
        }
        paint();
        if (!atRest) deck.frame = requestAnimationFrame(tick);
      };
      deck.frame = requestAnimationFrame(tick);
    };

    const goTo = (index: number) => {
      deck.target = clamp(index);
      settle();
    };

    const cardUnit = () => (slots[0]?.offsetWidth ?? 300) * STEP;

    stage.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0) return;
        cancelAnimationFrame(deck.frame);
        deck.justDragged = false;
        grab = {
          x: event.clientX,
          position: deck.position,
          unit: cardUnit(),
          samples: [{ x: event.clientX, t: performance.now() }],
          dragging: false,
        };
      },
      { signal },
    );
    stage.addEventListener(
      "pointermove",
      (event) => {
        if (!grab) return;
        const dx = event.clientX - grab.x;
        if (!grab.dragging) {
          if (Math.abs(dx) < DRAG_START_PX) return;
          grab.dragging = true;
          stage.setPointerCapture(event.pointerId);
          stage.dataset.dragging = "";
        }
        let position = grab.position - dx / grab.unit;
        if (position < 0) position *= RUBBER;
        if (position > last) position = last + (position - last) * RUBBER;
        deck.position = position;
        const t = performance.now();
        grab.samples = [
          ...grab.samples.filter((sample) => t - sample.t < 100),
          { x: event.clientX, t },
        ];
        paint();
      },
      { signal },
    );
    const release = (event: PointerEvent) => {
      const current = grab;
      grab = null;
      if (!current) return;
      if (!current.dragging) {
        settle();
        return;
      }
      delete stage.dataset.dragging;
      const first = current.samples[0]!;
      const seconds = Math.max(0.016, (performance.now() - first.t) / 1000);
      const velocity = -((event.clientX - first.x) / seconds) / current.unit;
      const from = clamp(Math.round(current.position));
      const dx = event.clientX - current.x;
      let target = clamp(Math.round(deck.position + velocity * PROJECT_S));
      if (target === from && Math.abs(dx) > FLICK_PX) target = clamp(from - Math.sign(dx));
      deck.velocity = velocity;
      deck.justDragged = true;
      goTo(target);
    };
    stage.addEventListener("pointerup", release, { signal });
    stage.addEventListener("pointercancel", release, { signal });
    stage.addEventListener(
      "click",
      (event) => {
        if (!deck.justDragged) return;
        deck.justDragged = false;
        event.preventDefault();
        event.stopPropagation();
      },
      { capture: true, signal },
    );
    stage.addEventListener(
      "keydown",
      (event) => {
        const move = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
        if (move === undefined) return;
        event.preventDefault();
        goTo(deck.target + move);
      },
      { signal },
    );
    // Passive by default, and stopping the page from scrolling sideways needs preventDefault.
    stage.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        cancelAnimationFrame(deck.frame);
        deck.velocity = 0;
        const moved = deck.position + event.deltaX / cardUnit();
        deck.position = Math.max(-RUBBER, Math.min(last + RUBBER, moved));
        paint();
        clearTimeout(deck.wheelTimer);
        deck.wheelTimer = window.setTimeout(() => goTo(Math.round(deck.position)), WHEEL_SETTLE_MS);
      },
      { passive: false, signal },
    );
    cards.forEach((card, index) =>
      card.addEventListener(
        "focus",
        () => {
          if (card.matches(":focus-visible")) goTo(index);
        },
        { signal },
      ),
    );
    previous.addEventListener("click", () => goTo(active - 1), { signal });
    next.addEventListener("click", () => goTo(active + 1), { signal });
    watchRuleOpen(this, signal);
    const unwatch = watchMedia("(prefers-reduced-motion: reduce)", () => {
      reduced = reducedMotion();
    });

    this.#stop = () => {
      glowDots("rule-spread", null);
      controller.abort();
      unwatch();
      clearTimeout(deck.wheelTimer);
      cancelAnimationFrame(deck.frame);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-spread", RuleSpread);
