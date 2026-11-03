import {
  blend,
  blendFrame,
  collapsed,
  type Frame,
  frameOf,
  frameTransform,
  inFrame,
  type Outline,
  shifted,
  toPath,
  traced,
} from "./hero-morph";
import { SCENE_TOKENS, type Token } from "./hero-pieces";
import {
  easeInOut,
  FADE_MS,
  MORPH_MS,
  REST_DEG,
  SCENE_LEAD_MS,
  TOKEN_STAGGER_MS,
  type TopInk,
  TOPS,
} from "./hero-prints.view";
import { reducedMotion } from "../../hooks/media-query";

const HALFTONE_OFFSET = "translate(5 4)";
const LANDING_T = 0.845;
const landing = (u: number) => easeInOut(u * LANDING_T) / easeInOut(LANDING_T);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type Drawn = { outline: Outline; inks: number[]; frame: Frame };

const inksOf = (top: TopInk) => TOPS.map((ink) => (ink === top ? 1 : 0));
const drawnAs = ({ outline, top, frame = shifted() }: Token): Drawn => ({
  outline,
  inks: inksOf(top),
  frame,
});

function isShown(drawing: Element, scene: Element) {
  let opacity = 1;
  for (let at: Element | null = drawing; at && at !== scene; at = at.parentElement) {
    opacity *= Number(getComputedStyle(at).opacity);
  }
  return opacity > 0.05;
}

function drawnIn(scene: SVGGElement, tokens: Token[]): Drawn[] {
  return tokens.map((token, k) => {
    const asToken = drawnAs(token);
    const drawing = [...scene.querySelectorAll<SVGGeometryElement>(`[data-token="${k}"]`)].at(-1);
    const toScene = scene.getCTM();
    const toScreen = drawing?.getCTM();
    if (!drawing || !toScene || !toScreen) return asToken;
    const matrix = DOMMatrix.fromMatrix(toScene).inverse().multiply(DOMMatrix.fromMatrix(toScreen));
    const drawn = traced(drawing, matrix);
    return {
      ...asToken,
      outline: isShown(drawing, scene) ? drawn : collapsed(drawn),
      frame: frameOf(matrix),
    };
  });
}

const fadeOf = (layer: SVGGElement) => Number(layer.style.getPropertyValue("--fade") || 1);
const setFade = (layer: SVGGElement, fade: number) =>
  layer.style.setProperty("--fade", String(fade));

const REACH_DEG = { x: 6, y: 10 };
const EASE_PER_FRAME = 0.12;

/** Tilts the card toward a mouse pointer and back to rest when it leaves. Returns the stop. */
function tiltToCursor(stage: HTMLElement, card: HTMLElement, signal: AbortSignal) {
  if (reducedMotion()) return;
  const clamp = (value: number) => Math.min(1, Math.max(-1, value));
  const target = { ...REST_DEG };
  const now = { ...REST_DEG };
  let frame = 0;

  const tick = () => {
    now.x += (target.x - now.x) * EASE_PER_FRAME;
    now.y += (target.y - now.y) * EASE_PER_FRAME;
    card.style.transform = `rotateX(${now.x.toFixed(2)}deg) rotateY(${now.y.toFixed(2)}deg)`;
    const settled = Math.abs(target.x - now.x) < 0.01 && Math.abs(target.y - now.y) < 0.01;
    frame = settled ? 0 : requestAnimationFrame(tick);
  };
  const aim = (x: number, y: number) => {
    target.x = x;
    target.y = y;
    if (!frame) frame = requestAnimationFrame(tick);
  };
  addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      const box = stage.getBoundingClientRect();
      const dx = clamp((event.clientX - (box.left + box.width / 2)) / (innerWidth / 2));
      const dy = clamp((event.clientY - (box.top + box.height / 2)) / (innerHeight / 2));
      aim(REST_DEG.x - dy * REACH_DEG.x, REST_DEG.y + dx * REACH_DEG.y);
    },
    { signal },
  );
  document.documentElement.addEventListener("pointerleave", () => aim(REST_DEG.x, REST_DEG.y), {
    signal,
  });
  signal.addEventListener("abort", () => cancelAnimationFrame(frame));
}

/**
 * The hero's prints (hero-prints.astro). show() moves to a scene: the shapes of the scene on screen
 * morph into the next scene's opening shapes while its layer fades, then the next layer fades in
 * over them. A show() during a morph picks the shapes up where they are. The hero holds the scene
 * still by setting data-paused.
 */
class HeroPrints extends HTMLElement {
  #stop?: () => void;
  #svg!: SVGSVGElement;
  #layer!: SVGGElement;
  #layerIndex = 0;
  #run = 0;
  #phase: "still" | "leaving" | "entering" = "still";
  #morph?: SVGGElement;
  #drawn: Drawn[] = [];
  #frame = 0;

  connectedCallback() {
    const controller = new AbortController();
    this.#svg = this.querySelector("svg")!;
    this.#layer = this.#svg.querySelector<SVGGElement>(":scope > g")!;
    const card = this.#svg.parentElement!;
    tiltToCursor(card.parentElement!, card, controller.signal);
    this.#stop = () => {
      controller.abort();
      cancelAnimationFrame(this.#frame);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }

  #fromTemplate(selector: string) {
    const template = this.querySelector<HTMLTemplateElement>(`:scope > template${selector}`)!;
    return document.importNode(template.content.querySelector<SVGGElement>("svg > g")!, true);
  }

  show(index: number, run: number) {
    if (run === this.#run) return;
    this.#run = run;
    const label = this.querySelector(`:scope > template[data-scene="${index}"]`)!;
    this.#svg.setAttribute("aria-label", label.getAttribute("data-label")!);
    cancelAnimationFrame(this.#frame);
    const next = this.#fromTemplate(`[data-scene="${index}"]`);

    const settle = () => {
      this.#morph?.remove();
      this.#morph = undefined;
      this.#layer.replaceWith(next);
      this.#layer = next;
      this.#layerIndex = index;
    };
    if (reducedMotion()) {
      settle();
      this.#phase = "still";
      return;
    }

    const leavingLayer = this.#layer;
    const leavingFrom = fadeOf(leavingLayer);
    const from =
      this.#phase === "leaving"
        ? this.#drawn
        : drawnIn(leavingLayer, SCENE_TOKENS[this.#layerIndex]!.exit);
    const to = SCENE_TOKENS[index]!.enter.map(drawnAs);

    const startedAt = performance.now();
    let mounted = false;
    const paint = (elapsed: number) => {
      const fadeOut = 1 - clamp01(elapsed / FADE_MS);
      const morph = this.#morph;
      if (morph) {
        this.#drawn = from.map((start, k) => {
          const t = landing(
            clamp01((elapsed - k * TOKEN_STAGGER_MS) / (SCENE_LEAD_MS - k * TOKEN_STAGGER_MS)),
          );
          return {
            outline: blend(start.outline, to[k]!.outline, t),
            inks: start.inks.map((ink, i) => ink + (to[k]!.inks[i]! - ink) * t),
            frame: blendFrame(start.frame, to[k]!.frame, t),
          };
        });
        morph.querySelectorAll<SVGGElement>(":scope > g").forEach((group, k) => {
          const { outline, inks, frame } = this.#drawn[k]!;
          const d = toPath(outline);
          group.querySelectorAll("path").forEach((path) => {
            const ink = TOPS.findIndex((top) => top === path.dataset.top);
            if (ink >= 0) {
              path.setAttribute("d", d);
              path.style.opacity = String(inks[ink]);
              return;
            }
            // The dots lie in the frame the scene draws them in, or they'd jump at each handoff.
            path.setAttribute("d", toPath(inFrame(outline, frame)));
            path.setAttribute("transform", `${frameTransform(frame)} ${HALFTONE_OFFSET}`);
          });
        });
      }
      if (leavingLayer.isConnected) setFade(leavingLayer, leavingFrom * fadeOut);
      if (mounted) setFade(next, clamp01((elapsed - SCENE_LEAD_MS) / FADE_MS));
    };
    const tick = (now: number) => {
      const elapsed = now - startedAt;
      paint(elapsed);
      if (!mounted && elapsed >= SCENE_LEAD_MS) {
        mounted = true;
        settle();
        this.#phase = "entering";
        paint(elapsed);
      }
      if (elapsed < MORPH_MS) {
        this.#frame = requestAnimationFrame(tick);
        return;
      }
      next.style.removeProperty("--fade");
      this.#phase = "still";
    };

    this.#phase = "leaving";
    leavingLayer.setAttribute("data-leaving", "");
    if (!this.#morph) {
      this.#morph = this.#fromTemplate("[data-morph]");
      this.#svg.append(this.#morph);
    }
    paint(0);
    this.#frame = requestAnimationFrame(tick);
  }
}

customElements.define("hero-prints", HeroPrints);

declare global {
  interface HTMLElementTagNameMap {
    "hero-prints": HeroPrints;
  }
}
