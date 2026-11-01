import { reducedMotion } from "../hooks/media-query";
import { followTheme, toggleTheme } from "../hooks/theme-store";
import { watchFluidHover } from "./fluid-hover";
import { menuGlyphs, SEGS, segView, type HeaderState } from "./header.styles";

// The capsule's width folds on a spring, but a grid column never opens past its content, so the
// spring's overshoot is lost and the capsule would stop dead. Its ground carries the rest: it keeps
// the speed the width had when it stopped, runs a few pixels on and springs back.
const STIFFNESS = 0.0196; // rad/ms: a swing of about 320ms
const DAMPING = 0.45;
const FRAME_MS = 16;
// The ground takes more than the speed the fold lost, so the bounce reads at a glance.
const GAIN = 1.8;
// The push the ground gets when the palette's drop lands back in the island, in px/ms.
const CATCH_SPEED = 0.18;

/** `since` is how long ago, in ms, the width stopped, so the bounce picks up where it would be. */
function bounce(ground: HTMLElement, width: number, speed: number, since = 0) {
  const swing = STIFFNESS * Math.sqrt(1 - DAMPING ** 2);
  const reach = (speed * GAIN) / swing;
  const frames: Keyframe[] = [];
  for (let t = 0; Math.abs(reach) * Math.exp(-DAMPING * STIFFNESS * t) > 0.1; t += FRAME_MS) {
    const stretch = reach * Math.exp(-DAMPING * STIFFNESS * t) * Math.sin(swing * t);
    frames.push({ transform: `scaleX(${1 + stretch / width})` });
  }
  frames.push({ transform: "none" });
  for (const running of ground.getAnimations()) running.cancel();
  const play = ground.animate(frames, { duration: (frames.length - 1) * FRAME_MS });
  play.currentTime = since;
}

/**
 * The site header (header.astro). It folds to a compact capsule once the page scrolls, unfolds
 * from the menu button, and holds whatever a page portals into `[data-island-activity]` while
 * compact (the rule frame's island in src/rules/rule-landing.astro).
 */
class SiteHeader extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const island = this.querySelector("header")!;
    const part = (name: string) => this.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
    const ground = part("ground");
    const toggle = part("menu");
    const host = this.querySelector("[data-island-activity]")!;
    const segs = SEGS.map((name) => {
      const seg = this.querySelector<HTMLElement>(`[data-seg="${name}"]`)!;
      return { name, seg, row: seg.querySelector(".row")! };
    });
    const hashLinks = this.querySelectorAll<HTMLAnchorElement>("[data-hash]");

    const controller = new AbortController();
    const { signal } = controller;
    const clearHover = watchFluidHover(island, part("highlight"), signal);
    const state: HeaderState = { scrolled: false, open: false, live: false };
    let frame = 0;
    let closeOnScroll: AbortController | undefined;

    // Watches the capsule's width after a fold and bounces its ground on the speed it stopped at.
    const watchFold = () => {
      cancelAnimationFrame(frame);
      if (reducedMotion()) return;
      let last = island.getBoundingClientRect().width;
      let lastAt = performance.now();
      let speed = 0;
      let idle = 0;
      const watch = (now: number) => {
        const width = island.getBoundingClientRect().width;
        const moved = width - last;
        if (Math.abs(moved) > 0.05) {
          speed = moved / Math.max(1, now - lastAt);
          idle = 0;
        } else if (Math.abs(speed) > 0.03) {
          bounce(ground, width, speed, now - lastAt);
          return;
        } else if (++idle > 6) {
          return;
        }
        last = width;
        lastAt = now;
        frame = requestAnimationFrame(watch);
      };
      frame = requestAnimationFrame(watch);
    };

    const set = (next: Partial<HeaderState>) => {
      const was = { ...state };
      Object.assign(state, next);
      if (state.scrolled === was.scrolled && state.open === was.open && state.live === was.live)
        return;
      const compact = state.scrolled && !state.open;
      this.toggleAttribute("data-scrolled", state.scrolled);
      this.dataset.mode = compact ? "compact" : "full";
      this.toggleAttribute("data-open", state.open);
      for (const { name, seg, row } of segs) {
        const view = segView(name, state);
        seg.className = view.seg;
        seg.inert = !view.on;
        row.className = view.row;
      }
      if (state.open !== was.open) {
        toggle.setAttribute("aria-expanded", String(state.open));
        toggle.setAttribute("aria-label", state.open ? "Close menu" : "Open menu");
        const glyphs = menuGlyphs(state.open);
        part("list").setAttribute("class", glyphs.list);
        part("x").setAttribute("class", glyphs.x);
        if (state.open) watchMenu();
        else closeOnScroll?.abort();
      }
      watchFold();
      clearHover();
    };

    const watchMenu = () => {
      closeOnScroll = new AbortController();
      const menuSignal = AbortSignal.any([signal, closeOnScroll.signal]);
      const from = scrollY;
      addEventListener(
        "scroll",
        () => {
          if (Math.abs(scrollY - from) > 24) set({ open: false });
        },
        { passive: true, signal: menuSignal },
      );
      document.addEventListener(
        "keydown",
        (event) => {
          if (event.key !== "Escape") return;
          set({ open: false });
          toggle.focus();
        },
        { signal: menuSignal },
      );
      document.addEventListener(
        "pointerdown",
        (event) => {
          if (event.target instanceof Node && !island.contains(event.target)) set({ open: false });
        },
        { signal: menuSignal },
      );
    };

    const markHash = () => {
      for (const link of hashLinks) {
        if (link.dataset.hash === location.hash) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    };
    markHash();
    addEventListener("hashchange", markHash, { signal });

    const onScroll = () => set({ scrolled: scrollY > 8 });
    onScroll();
    addEventListener("scroll", onScroll, { passive: true, signal });

    const onActivity = () => set({ live: host.childElementCount > 0 });
    onActivity();
    const activity = new MutationObserver(onActivity);
    activity.observe(host, { childList: true });

    island.addEventListener(
      "click",
      (event) => {
        if (event.target instanceof Element && event.target.closest("a")) set({ open: false });
      },
      { signal },
    );
    toggle.addEventListener("click", () => set({ open: !state.open }), { signal });
    part("search").addEventListener(
      "click",
      () =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
        ),
      { signal },
    );
    const themeButton = part("theme");
    themeButton.addEventListener(
      "click",
      () => {
        const box = themeButton.getBoundingClientRect();
        toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      },
      { signal },
    );

    const root = document.documentElement;
    let away = root.hasAttribute("data-island-away");
    const landing = new MutationObserver(() => {
      const home = away && !root.hasAttribute("data-island-away");
      away = root.hasAttribute("data-island-away");
      if (home && !reducedMotion())
        bounce(ground, island.getBoundingClientRect().width, CATCH_SPEED);
    });
    landing.observe(root, { attributes: true, attributeFilter: ["data-island-away"] });

    const unfollowTheme = followTheme();
    this.#stop = () => {
      controller.abort();
      activity.disconnect();
      landing.disconnect();
      unfollowTheme();
      cancelAnimationFrame(frame);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("site-header", SiteHeader);
