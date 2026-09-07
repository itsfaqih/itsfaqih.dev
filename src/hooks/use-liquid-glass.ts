import { useEffect, useRef } from "react";
import type liquidGL from "liquid-gl";
import type { LiquidGLRenderer } from "liquid-gl";

const TARGET_ATTRIBUTE = "data-liquid-gl-target";
const INITIALIZED_ATTRIBUTE = "data-liquid-gl-initialized";
const INITIALIZATION_DELAY_MS = 120;
const THEME_TRANSITION_DURATION_MS = 320;

export type LiquidGLTuningOptions = {
  refraction?: number;
  aberration?: number;
  bevelDepth?: number;
  bevelWidth?: number;
  frost?: number;
  shadow?: boolean;
  specular?: boolean;
  tilt?: boolean;
  tiltFactor?: number;
  tiltEase?: number;
  magnify?: number;
};

const initializedTargets = new WeakSet<HTMLElement>();
const pendingTargets = new WeakSet<HTMLElement>();
let targetId = 0;
let liquidGLPromise: Promise<typeof liquidGL> | undefined;
let themeObserver: MutationObserver | undefined;
let themeRecaptureFrame: number | undefined;
let themeFinalRecaptureTimer: number | undefined;
let viewportSyncFrame: number | undefined;
let viewportSyncRegistered = false;

const liquidGLOptions = (
  prefersReducedMotion: boolean,
  target: string,
  tuning: LiquidGLTuningOptions = {},
) => ({
  target,
  snapshot: "body",
  resolution: 0.8,
  refraction: 0.018,
  aberration: 0.012,
  bevelDepth: 0.08,
  bevelWidth: 0.2,
  frost: 0.6,
  shadow: true,
  specular: !prefersReducedMotion,
  reveal: "none" as const,
  tilt: !prefersReducedMotion,
  tiltFactor: 2.5,
  tiltEase: 260,
  magnify: 1,
  ...tuning,
});

function loadLiquidGL() {
  liquidGLPromise ??= import("liquid-gl").then(({ default: liquidGL }) => liquidGL);
  return liquidGLPromise;
}

function ensureThemeSynchronization() {
  if (themeObserver || globalThis.MutationObserver === undefined) return;

  themeObserver = new MutationObserver(() => {
    if (themeRecaptureFrame !== undefined) {
      window.cancelAnimationFrame(themeRecaptureFrame);
    }
    if (themeFinalRecaptureTimer !== undefined) {
      window.clearTimeout(themeFinalRecaptureTimer);
    }

    const renderer = window.__liquidGLRenderer__;

    // Refresh the WebGL snapshot as soon as the root theme class changes.
    // Waiting for the CSS transition to finish leaves the glass rendering the
    // previous theme while the rest of the page is already transitioning.
    themeRecaptureFrame = window.requestAnimationFrame(() => {
      themeRecaptureFrame = undefined;
      void renderer?.captureSnapshot();
    });

    // Capture once more after the CSS colors settle so the refracted texture
    // ends on the exact final theme values without delaying the first update.
    themeFinalRecaptureTimer = window.setTimeout(() => {
      themeFinalRecaptureTimer = undefined;
      void renderer?.captureSnapshot();
    }, THEME_TRANSITION_DURATION_MS);
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

export function ensureMobileLiquidGLViewportCorrection(renderer: LiquidGLRenderer) {
  if (renderer.mobileViewportOffsetsPatched) return;

  const originalRenderLens = renderer._renderLens;
  renderer._renderLens = (lens) => {
    const isMobileFixedLens =
      window.matchMedia("(max-width: 639px)").matches &&
      window.getComputedStyle(lens.el).position === "fixed";
    const viewport = window.visualViewport;

    if (!isMobileFixedLens || !viewport || Math.abs(viewport.scale - 1) >= 0.01) {
      originalRenderLens.call(renderer, lens);
      return;
    }

    // liquidGL adds visualViewport.offsetTop to fixed lens coordinates. On
    // Android Chrome, fixed getBoundingClientRect() values are already in the
    // visual viewport, so that compensation moves the WebGL lens below its
    // button by the toolbar height. Keep the real viewport object for all
    // other code and neutralize the offset only during this renderer call.
    const viewportDescriptor = Object.getOwnPropertyDescriptor(window, "visualViewport");
    const correctedViewport: VisualViewport = {
      offsetTop: 0,
      offsetLeft: 0,
      get height() { return viewport.height; },
      get width() { return viewport.width; },
      get pageTop() { return viewport.pageTop; },
      get pageLeft() { return viewport.pageLeft; },
      get scale() { return viewport.scale; },
      get onresize() { return viewport.onresize; },
      get onscroll() { return viewport.onscroll; },
      addEventListener: viewport.addEventListener.bind(viewport),
      removeEventListener: viewport.removeEventListener.bind(viewport),
      dispatchEvent: viewport.dispatchEvent.bind(viewport),
    };

    try {
      Object.defineProperty(window, "visualViewport", {
        configurable: true,
        value: correctedViewport,
      });
      originalRenderLens.call(renderer, lens);
    } finally {
      if (viewportDescriptor) {
        Object.defineProperty(window, "visualViewport", viewportDescriptor);
      } else {
        Reflect.deleteProperty(window, "visualViewport");
      }
    }
  };
  renderer.mobileViewportOffsetsPatched = true;
}

function syncLiquidGLViewport() {
  const renderer = window.__liquidGLRenderer__;
  if (!renderer) return;

  ensureMobileLiquidGLViewportCorrection(renderer);

  // liquidGL skips its debounced resize work while scrolling. Android Chrome
  // can resize or move the visual viewport as its browser chrome collapses, so
  // refresh the shared canvas and every lens on the next paint frame instead.
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = renderer.canvas;
  const canvasNeedsResize =
    canvas.width !== window.innerWidth * dpr ||
    canvas.height !== window.innerHeight * dpr;

  if (canvasNeedsResize) {
    renderer._resizeCanvas();
  }

  renderer.lenses.forEach((lens) => {
    lens.updateMetrics();
    lens._shadowSyncFn?.();
  });
  renderer.render();
}

function ensureViewportSynchronization() {
  if (viewportSyncRegistered || globalThis.window === undefined) return;

  const scheduleSync = () => {
    if (viewportSyncFrame !== undefined) return;

    viewportSyncFrame = window.requestAnimationFrame(() => {
      viewportSyncFrame = undefined;
      syncLiquidGLViewport();
    });
  };

  window.addEventListener("resize", scheduleSync, { passive: true });
  window.addEventListener("scroll", scheduleSync, { passive: true });
  window.addEventListener("orientationchange", scheduleSync, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleSync, { passive: true });
  window.visualViewport?.addEventListener("scroll", scheduleSync, { passive: true });
  viewportSyncRegistered = true;
}

async function initializeLiquidGL(target: HTMLElement, options: LiquidGLTuningOptions = {}) {
  if (
    initializedTargets.has(target) ||
    pendingTargets.has(target) ||
    target.hasAttribute(INITIALIZED_ATTRIBUTE)
  ) {
    return;
  }

  pendingTargets.add(target);
  const id = `liquid-gl-${++targetId}`;
  target.setAttribute(TARGET_ATTRIBUTE, id);

  try {
    const liquidGL = await loadLiquidGL();
    if (!target.isConnected) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    liquidGL(liquidGLOptions(prefersReducedMotion, `[${TARGET_ATTRIBUTE}="${id}"]`, options));
    initializedTargets.add(target);
    target.setAttribute(INITIALIZED_ATTRIBUTE, "");
    syncLiquidGLViewport();
  } catch (error) {
    console.warn("liquidGL could not be initialized for the header.", error);
  } finally {
    pendingTargets.delete(target);
  }
}

function scheduleLiquidGLInitialization(
  target: HTMLElement,
  getOptions: () => LiquidGLTuningOptions = () => ({}),
) {
  let cancelled = false;
  let delayId: number | undefined;
  let idleId: number | undefined;
  let loadListener: (() => void) | undefined;

  const attemptInitialization = () => {
    if (!cancelled && target.isConnected) {
      void initializeLiquidGL(target, getOptions());
    }
  };

  const scheduleIdleWork = () => {
    if (cancelled) return;

    if (window.requestIdleCallback) {
      idleId = window.requestIdleCallback(attemptInitialization, { timeout: 2000 });
    } else {
      attemptInitialization();
    }
  };

  const scheduleAfterLoad = () => {
    delayId = window.setTimeout(scheduleIdleWork, INITIALIZATION_DELAY_MS);
  };

  if (document.readyState === "complete") {
    scheduleAfterLoad();
  } else {
    loadListener = scheduleAfterLoad;
    window.addEventListener("load", loadListener, { once: true });
  }

  return () => {
    cancelled = true;
    if (loadListener) window.removeEventListener("load", loadListener);
    if (delayId !== undefined) window.clearTimeout(delayId);
    if (idleId !== undefined) {
      window.cancelIdleCallback?.(idleId);
    }
  };
}

export function useLiquidGLTarget<T extends HTMLElement>(enabled = true, options: LiquidGLTuningOptions = {}) {
  const targetRef = useRef<T>(null);
  const latestOptionsRef = useRef(options);
  latestOptionsRef.current = options;

  useEffect(() => {
    if (!enabled || !targetRef.current) return;
    ensureThemeSynchronization();
    ensureViewportSynchronization();
    return scheduleLiquidGLInitialization(targetRef.current, () => latestOptionsRef.current);
  }, [enabled]);

  return targetRef;
}
