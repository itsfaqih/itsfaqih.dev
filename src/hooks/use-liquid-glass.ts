import { useEffect, useRef } from "react";

const TARGET_ATTRIBUTE = "data-liquid-gl-target";
const INITIALIZED_ATTRIBUTE = "data-liquid-gl-initialized";
const INITIALIZATION_DELAY_MS = 120;
const THEME_TRANSITION_DURATION_MS = 320;

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

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
let liquidGLPromise: Promise<LiquidGL> | undefined;
let themeObserver: MutationObserver | undefined;
let themeRecaptureFrame: number | undefined;
let themeFinalRecaptureTimer: number | undefined;

type LiquidGLWindow = Window & {
  __liquidGLRenderer__?: {
    captureSnapshot?: () => Promise<boolean> | boolean;
    canvas?: HTMLCanvasElement;
  };
};

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
  if (themeObserver || typeof MutationObserver === "undefined") return;

  themeObserver = new MutationObserver(() => {
    if (themeRecaptureFrame !== undefined) {
      window.cancelAnimationFrame(themeRecaptureFrame);
    }
    if (themeFinalRecaptureTimer !== undefined) {
      window.clearTimeout(themeFinalRecaptureTimer);
    }

    const renderer = (window as LiquidGLWindow).__liquidGLRenderer__;

    // Refresh the WebGL snapshot as soon as the root theme class changes.
    // Waiting for the CSS transition to finish leaves the glass rendering the
    // previous theme while the rest of the page is already transitioning.
    themeRecaptureFrame = window.requestAnimationFrame(() => {
      themeRecaptureFrame = undefined;
      void renderer?.captureSnapshot?.();
    });

    // Capture once more after the CSS colors settle so the refracted texture
    // ends on the exact final theme values without delaying the first update.
    themeFinalRecaptureTimer = window.setTimeout(() => {
      themeFinalRecaptureTimer = undefined;
      void renderer?.captureSnapshot?.();
    }, THEME_TRANSITION_DURATION_MS);
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

function initializeLiquidGL(target: HTMLElement, options: LiquidGLTuningOptions = {}) {
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

  loadLiquidGL()
    .then((liquidGL) => {
      if (!target.isConnected) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      liquidGL(liquidGLOptions(prefersReducedMotion, `[${TARGET_ATTRIBUTE}="${id}"]`, options));
      initializedTargets.add(target);
      target.setAttribute(INITIALIZED_ATTRIBUTE, "");
    })
    .catch((error: unknown) => {
      console.warn("liquidGL could not be initialized for the header.", error);
    })
    .finally(() => {
      pendingTargets.delete(target);
    });
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
      initializeLiquidGL(target, getOptions());
    }
  };

  const scheduleIdleWork = () => {
    if (cancelled) return;

    const idleWindow = window as IdleWindow;
    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(attemptInitialization, { timeout: 2000 });
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
      (window as IdleWindow).cancelIdleCallback?.(idleId);
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
    return scheduleLiquidGLInitialization(targetRef.current, () => latestOptionsRef.current);
  }, [enabled]);

  return targetRef;
}

type LiquidGL = (options: {
  target: string;
  snapshot: string;
  resolution: number;
  refraction: number;
  aberration: number;
  bevelDepth: number;
  bevelWidth: number;
  frost: number;
  shadow: boolean;
  specular: boolean;
  reveal: "none" | "fade";
  tilt: boolean;
  tiltFactor: number;
  tiltEase: number;
  magnify: number;
}) => unknown;
