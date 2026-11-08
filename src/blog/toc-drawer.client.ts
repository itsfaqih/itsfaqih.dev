import { play } from "../browser/sound";
import { EASE, SLIDE, SLIDE_MS } from "./toc-drawer.view";
import { TOC_NAVIGATE } from "./table-of-contents.client";

const SLIDE_TRANSITION = `transform ${SLIDE} ${EASE}`;
const FADE_TRANSITION = `opacity ${SLIDE} ${EASE}`;

// Vaul's drag rules, for a drawer that slides up from the bottom.
const VELOCITY_THRESHOLD = 0.4;
const CLOSE_THRESHOLD = 0.25;
const SCROLL_LOCK_MS = 100;

const translateY = (element: Element) =>
  new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;

/**
 * The post's table of contents drawer (toc-drawer.astro). Open, its layer joins the end of the body
 * over an inert page, and leaves once its exit animation ends.
 */
class TocDrawer extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const trigger = this.querySelector<HTMLButtonElement>('[data-part="trigger"]')!;
    const template = this.querySelector<HTMLTemplateElement>('[data-part="layer"]')!;
    const layer = [...document.importNode(template.content, true).children].filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    const part = (name: string) => layer.find((node) => node.dataset.part === name)!;
    const overlay = part("overlay");
    const content = layer.find((node) => node instanceof HTMLDialogElement)!;
    const [startGuard, endGuard] = layer.filter((node) => node.dataset.part === "guard");

    let isOpen = false;
    let closing = false;
    let openedAt = 0;
    let inerted: HTMLElement[] = [];
    const root = document.documentElement;

    const setState = (state: "open" | "closed") => {
      trigger.dataset.state = state;
      trigger.setAttribute("aria-expanded", String(state === "open"));
      overlay.dataset.state = state;
      content.dataset.state = state;
    };

    const unmount = () => {
      closing = false;
      content.close();
      for (const node of layer) node.remove();
      for (const element of [content, overlay]) element.removeAttribute("style");
    };

    const open = () => {
      if (isOpen) return;
      isOpen = true;
      play("open");
      closing = false;
      openedAt = Date.now();
      setState("open");
      document.body.append(...layer);
      content.show();
      inerted = [...document.body.children].filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && !layer.includes(element) && !element.inert,
      );
      for (const element of inerted) element.inert = true;
      root.style.overflow = "hidden";
      root.style.scrollBehavior = "auto";
      content.focus({ preventScroll: true });
    };

    const close = () => {
      if (!isOpen) return;
      isOpen = false;
      play("close");
      dragging = false;
      start = null;
      setState("closed");
      root.style.removeProperty("overflow");
      root.style.removeProperty("scroll-behavior");
      for (const element of inerted) element.inert = false;
      inerted = [];
      trigger.focus({ preventScroll: true });
      closing = true;
      Promise.allSettled(content.getAnimations().map((animation) => animation.finished)).then(
        () => {
          if (closing) unmount();
        },
      );
    };

    // A press anywhere on the drawer can drag it down. Vaul's rules decide when a move drags and
    // whether a release closes or springs back.
    let start: { x: number; y: number } | null = null;
    let dragging = false;
    let allowed = false;
    let startY = 0;
    let pressedAt = 0;
    let height = 0;
    let preventedAt = 0;

    const shouldDrag = (target: EventTarget | null, draggingUp: boolean) => {
      const now = Date.now();
      if (now - openedAt < SLIDE_MS) return false;
      const swipe = translateY(content);
      if (swipe > 0) return true;
      if (window.getSelection()?.toString()) return false;
      if (now - preventedAt < SCROLL_LOCK_MS && swipe === 0) {
        preventedAt = now;
        return false;
      }
      if (draggingUp) {
        preventedAt = now;
        return false;
      }
      for (
        let element = target instanceof Element ? target : null;
        element;
        element = element.parentElement
      ) {
        if (element.scrollHeight > element.clientHeight) {
          if (element.scrollTop !== 0) {
            preventedAt = now;
            return false;
          }
          if (element === content) return true;
        }
      }
      return true;
    };

    const drag = (event: PointerEvent) => {
      if (!dragging) return;
      const dragged = startY - event.pageY;
      const draggingUp = dragged > 0;
      if (!allowed && !shouldDrag(event.target, draggingUp)) return;
      allowed = true;
      content.style.transition = "none";
      overlay.style.transition = "none";
      if (draggingUp) {
        const dampened = 8 * (Math.log(dragged + 1) - 2);
        content.style.transform = `translate3d(0, ${Math.min(-dampened, 0)}px, 0)`;
        return;
      }
      overlay.style.opacity = String(1 - Math.abs(dragged) / height);
      content.style.transform = `translate3d(0, ${Math.abs(dragged)}px, 0)`;
    };

    const reset = () => {
      content.style.transform = "translate3d(0, 0, 0)";
      content.style.transition = SLIDE_TRANSITION;
      overlay.style.transition = FADE_TRANSITION;
      overlay.style.opacity = "1";
    };

    const release = (event: PointerEvent) => {
      start = null;
      if (!dragging) return;
      dragging = false;
      allowed = false;
      const swipe = translateY(content);
      if (!shouldDrag(event.target, false) || !swipe || Number.isNaN(swipe)) return;
      const moved = startY - event.pageY;
      const velocity = Math.abs(moved) / (Date.now() - pressedAt);
      if (moved > 0) reset();
      else if (velocity > VELOCITY_THRESHOLD) close();
      else if (
        Math.abs(swipe) >=
        Math.min(content.getBoundingClientRect().height, innerHeight) * CLOSE_THRESHOLD
      )
        close();
      else reset();
    };

    const controller = new AbortController();
    const { signal } = controller;
    trigger.addEventListener("click", open, { signal });
    content.addEventListener(
      "pointerdown",
      (event) => {
        start = { x: event.pageX, y: event.pageY };
        height = content.getBoundingClientRect().height;
        dragging = true;
        pressedAt = Date.now();
        startY = event.pageY;
        if (event.target instanceof Element) event.target.setPointerCapture(event.pointerId);
      },
      { signal },
    );
    content.addEventListener(
      "pointermove",
      (event) => {
        if (!start) return;
        const dx = event.pageX - start.x;
        const dy = event.pageY - start.y;
        const threshold = event.pointerType === "touch" ? 10 : 2;
        const horizontal = Math.abs(dx) > Math.abs(dy);
        const towardClose = dy >= 0 && dy <= threshold ? horizontal : !horizontal;
        if (towardClose) drag(event);
        else if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) start = null;
      },
      { signal },
    );
    content.addEventListener("pointerup", release, { signal });
    content.addEventListener("pointercancel", release, { signal });
    content.addEventListener(TOC_NAVIGATE, close, { signal });
    // A mouse press outside closes it, but a tap only once it lands as a click.
    overlay.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType !== "touch") close();
      },
      { signal },
    );
    overlay.addEventListener("click", close, { signal });
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && isOpen) close();
      },
      { signal },
    );
    const links = () => [...content.querySelectorAll("a")];
    startGuard!.addEventListener("focus", () => (links().at(-1) ?? content).focus(), { signal });
    endGuard!.addEventListener("focus", () => (links()[0] ?? content).focus(), { signal });

    this.#stop = () => {
      controller.abort();
      if (isOpen) close();
      unmount();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("toc-drawer", TocDrawer);
