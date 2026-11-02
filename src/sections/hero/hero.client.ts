import "./hero-prints.client";
import { SLIDES } from "../../data/home";
import { reducedMotion, watchMedia } from "../../hooks/media-query";
import { glowDots } from "../backdrop-dots";
import { whenIntroDone } from "../intro.client";
import { SCENE_LEAD_MS, SLIDE_MS } from "./hero-prints.styles";
import { barClass, glyphClass, phraseClass } from "./hero.styles";

/**
 * The home hero (hero.astro). The slides advance on a timer once the intro hands off; the pips
 * jump, the button pauses. Each slide gets its full time again when picked, and a pause keeps
 * what was left of it.
 */
class HomeHero extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const { signal } = controller;
    const part = (name: string) => this.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
    const phrases = [...this.querySelectorAll<HTMLElement>("[data-phrase]")];
    const pips = [...this.querySelectorAll<HTMLButtonElement>("[data-pip]")];
    const bench = part("bench");
    const go = part("go");
    const pause = part("pause");
    const playGlyph = pause.querySelector<HTMLElement>(":scope > :first-child")!;
    const pauseGlyph = pause.querySelector<HTMLElement>(":scope > :last-child")!;
    const prints = this.querySelector("hero-prints")!;

    let index = 0;
    let run = 0;
    let lead = 0;
    let introDone = false;
    let pausedByUser: boolean | null = null;
    let reduced = reducedMotion();
    let remaining = SLIDE_MS;
    let timer = 0;
    let armedRun = 0;
    let armedAt = 0;
    // A pip's bar restarts whenever the run it shows changes, as React remounted it by key.
    const barKeys = pips.map((_, at): string => (at === 0 ? "0" : "idle"));

    const userPaused = () => pausedByUser ?? reduced;

    const render = () => {
      const held = userPaused();
      const current = SLIDES[index]!;
      phrases.forEach((phrase, at) => {
        const on = at === index;
        phrase.className = phraseClass(on, introDone && run > 0);
        if (on) phrase.removeAttribute("aria-hidden");
        else phrase.setAttribute("aria-hidden", "true");
      });
      pips.forEach((pip, at) => {
        const on = at === index;
        pip.setAttribute("aria-pressed", String(on));
        pip.style.setProperty("--ms", `${SLIDE_MS + (on ? lead : 0)}ms`);
        const key = on ? String(run) : "idle";
        if (barKeys[at] !== key) {
          barKeys[at] = key;
          pip.replaceChildren(document.createElement("i"));
        }
        pip.firstElementChild!.className = barClass(on, held);
      });
      pause.setAttribute("aria-label", held ? "Play" : "Pause");
      playGlyph.className = glyphClass(!held);
      pauseGlyph.className = glyphClass(held);
      bench.style.setProperty("--c", current.color);
      go.style.setProperty("--c", current.color);
      glowDots("hero", prints, current.color, [0.3, 0.3, 0.7, 0.7]);
      prints.toggleAttribute("data-paused", !introDone || held);
      prints.show(index, run);
    };

    // The timer, re-armed whenever the intro hands off, a pause toggles, or a slide is picked.
    const sync = () => {
      if (timer) {
        clearTimeout(timer);
        timer = 0;
        if (armedRun === run) remaining -= performance.now() - armedAt;
      }
      if (!introDone || userPaused()) return;
      armedRun = run;
      armedAt = performance.now();
      timer = window.setTimeout(() => {
        timer = 0;
        pick((index + 1) % SLIDES.length);
      }, remaining);
    };

    const pick = (next: number) => {
      run += 1;
      lead = reduced ? 0 : SCENE_LEAD_MS;
      remaining = SLIDE_MS + lead;
      index = next;
      render();
      sync();
    };

    const setHeld = (change: () => void) => {
      const was = userPaused();
      change();
      render();
      if (userPaused() !== was) sync();
    };

    pips.forEach((pip, at) => pip.addEventListener("click", () => pick(at), { signal }));
    pause.addEventListener("click", () => setHeld(() => (pausedByUser = !userPaused())), {
      signal,
    });
    const unwatch = watchMedia("(prefers-reduced-motion: reduce)", () =>
      setHeld(() => (reduced = reducedMotion())),
    );

    render();
    const requested = Number(new URLSearchParams(location.search).get("slide"));
    if (requested > 0 && requested < SLIDES.length) pick(requested);
    whenIntroDone(signal, () => {
      introDone = true;
      render();
      sync();
    });

    this.#stop = () => {
      glowDots("hero", null);
      controller.abort();
      unwatch();
      clearTimeout(timer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("home-hero", HomeHero);
