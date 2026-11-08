import "./hero-prints.client";
import { SLIDES } from "../../data/home";
import { REDUCE, reducedMotion, watchMedia } from "../../browser/media-query";
import { glowDots } from "../backdrop-dots";
import { whenIntroDone } from "../intro.client";
import { SCENE_LEAD_MS, SLIDE_MS } from "./hero-prints.view";
import { barClass, glyphClass, phraseClass } from "./hero.view";

// The prints sit right on this glow, so it stays quieter than the page's others.
const HERO_GLOW_STRENGTH = 0.6;

/**
 * The home hero (hero.astro). The slides advance on a timer once the intro hands off; the pips
 * jump, the button pauses. Each slide gets its full time again when picked, and a pause keeps
 * what was left of it. The hero also holds while it is off screen or the tab is hidden, without
 * touching the button.
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
    let offScreen = false;
    let reduced = reducedMotion();
    let remaining = SLIDE_MS;
    let timer = 0;
    let armedRun = 0;
    let armedAt = 0;
    // A pip's bar is a new element, so its fill restarts, whenever the run it shows changes.
    const barKeys = pips.map((_, at): string => (at === 0 ? "0" : "idle"));

    const userPaused = () => pausedByUser ?? reduced;
    const held = () => userPaused() || offScreen || document.hidden;

    const render = () => {
      const paused = userPaused();
      const still = held();
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
        pip.firstElementChild!.className = barClass(on, still);
      });
      pause.setAttribute("aria-label", paused ? "Play" : "Pause");
      playGlyph.className = glyphClass(!paused);
      pauseGlyph.className = glyphClass(paused);
      bench.style.setProperty("--c", current.color);
      go.style.setProperty("--c", current.color);
      // Held until the intro hands off, so the light turns on where it's seen.
      if (introDone)
        glowDots("hero", prints, current.color, [0.3, 0.3, 0.7, 0.7], HERO_GLOW_STRENGTH);
      prints.toggleAttribute("data-paused", !introDone || still);
      prints.show(index, run);
    };

    // The timer, re-armed whenever the intro hands off, a pause toggles, or a slide is picked.
    const sync = () => {
      if (timer) {
        clearTimeout(timer);
        timer = 0;
        if (armedRun === run) remaining -= performance.now() - armedAt;
      }
      if (!introDone || held()) return;
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
      const was = held();
      change();
      render();
      if (held() !== was) sync();
    };

    pips.forEach((pip, at) => pip.addEventListener("click", () => pick(at), { signal }));
    pause.addEventListener("click", () => setHeld(() => (pausedByUser = !userPaused())), {
      signal,
    });
    const unwatch = watchMedia(REDUCE, () => setHeld(() => (reduced = reducedMotion())));
    const sight = new IntersectionObserver(([entry]) =>
      setHeld(() => (offScreen = !entry!.isIntersecting)),
    );
    sight.observe(this);
    document.addEventListener("visibilitychange", () => setHeld(() => {}), { signal });

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
      sight.disconnect();
      clearTimeout(timer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("home-hero", HomeHero);
