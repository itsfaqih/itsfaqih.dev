import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LiquidGLLens, LiquidGLRenderer } from "liquid-gl";
import { ensureMobileLiquidGLViewportCorrection, useLiquidGLTarget } from "./use-liquid-glass";

class TestViewport extends EventTarget implements VisualViewport {
  offsetLeft = 12;
  offsetTop = 48;
  pageLeft = 20;
  pageTop = 200;
  width = 390;
  height = 700;
  scale = 1;
  onresize: VisualViewport["onresize"] = null;
  onscroll: VisualViewport["onscroll"] = null;
}

function createRenderer() {
  const el = document.createElement("div");
  el.style.position = "fixed";
  const lens = {
    el,
    updateMetrics: vi.fn(),
    _shadowSyncFn: vi.fn(),
  } satisfies LiquidGLLens;
  return {
    captureSnapshot: vi.fn(async () => true),
    canvas: document.createElement("canvas"),
    _resizeCanvas: vi.fn(),
    _renderLens: vi.fn<(lens: LiquidGLLens) => void>(),
    render: vi.fn(),
    lenses: [lens] satisfies [LiquidGLLens],
  } satisfies LiquidGLRenderer;
}

function GlassTarget() {
  const ref = useLiquidGLTarget<HTMLDivElement>();
  return createElement("div", { ref, "data-testid": "glass" });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: true,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  } satisfies MediaQueryList));
  vi.stubGlobal("visualViewport", new TestViewport());
});

afterEach(async () => {
  cleanup();
  delete window.__liquidGLRenderer__;
  document.documentElement.className = "";
  await Promise.resolve();
  await vi.advanceTimersByTimeAsync(400);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("liquidGL mobile viewport correction", () => {
  it("only zeros offsets during rendering and preserves native event receivers", () => {
    const viewport = window.visualViewport;
    const descriptor = Object.getOwnPropertyDescriptor(window, "visualViewport");
    const renderer = createRenderer();
    const listener = vi.fn();
    renderer._renderLens.mockImplementation(function (this: LiquidGLRenderer, lens) {
      expect(this).toBe(renderer);
      expect(lens).toBe(renderer.lenses[0]);
      const corrected = window.visualViewport;
      expect(corrected).not.toBe(viewport);
      expect(corrected?.offsetTop).toBe(0);
      expect(corrected?.offsetLeft).toBe(0);
      expect(corrected?.pageTop).toBe(200);
      expect(corrected?.pageLeft).toBe(20);
      expect(corrected?.width).toBe(390);
      expect(corrected?.height).toBe(700);
      expect(corrected?.scale).toBe(1);
      corrected?.addEventListener("resize", listener);
      viewport?.dispatchEvent(new Event("resize"));
      corrected?.dispatchEvent(new Event("resize"));
      corrected?.removeEventListener("resize", listener);
      viewport?.dispatchEvent(new Event("resize"));
    });
    const original = renderer._renderLens;
    ensureMobileLiquidGLViewportCorrection(renderer);
    const patched = renderer._renderLens;
    ensureMobileLiquidGLViewportCorrection(renderer);
    expect(renderer._renderLens).toBe(patched);
    renderer._renderLens(renderer.lenses[0]);
    expect(original).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(window.visualViewport).toBe(viewport);
    expect(Object.getOwnPropertyDescriptor(window, "visualViewport")).toEqual(descriptor);
  });

  it.each(["desktop", "not-fixed", "zoomed", "missing"])(
    "leaves the viewport unchanged for %s lenses",
    (condition) => {
      const renderer = createRenderer();
      if (condition === "desktop") {
        vi.stubGlobal("matchMedia", () => ({ matches: false }));
      } else if (condition === "not-fixed") {
        renderer.lenses[0].el.style.position = "absolute";
      } else if (condition === "zoomed") {
        const viewport = new TestViewport();
        viewport.scale = 1.5;
        vi.stubGlobal("visualViewport", viewport);
      } else {
        vi.stubGlobal("visualViewport", null);
      }
      const viewport = window.visualViewport;
      renderer._renderLens.mockImplementation(() => {
        expect(window.visualViewport).toBe(viewport);
      });
      const original = renderer._renderLens;
      ensureMobileLiquidGLViewportCorrection(renderer);
      renderer._renderLens(renderer.lenses[0]);
      expect(original).toHaveBeenCalledOnce();
      expect(window.visualViewport).toBe(viewport);
    },
  );

  it("restores the viewport descriptor when rendering throws", () => {
    const renderer = createRenderer();
    const descriptor = Object.getOwnPropertyDescriptor(window, "visualViewport");
    renderer._renderLens.mockImplementation(() => {
      throw new Error("render failed");
    });
    ensureMobileLiquidGLViewportCorrection(renderer);
    expect(() => renderer._renderLens(renderer.lenses[0])).toThrow("render failed");
    expect(Object.getOwnPropertyDescriptor(window, "visualViewport")).toEqual(descriptor);
  });

  it("removes its temporary property when the viewport is inherited", () => {
    const viewport = new TestViewport();
    const windowPrototype: Window = Object.getPrototypeOf(window);
    const inheritedDescriptor = Object.getOwnPropertyDescriptor(windowPrototype, "visualViewport");
    Object.defineProperty(windowPrototype, "visualViewport", { configurable: true, value: viewport });
    Reflect.deleteProperty(window, "visualViewport");
    try {
      expect(window.visualViewport).toBe(viewport);
      const renderer = createRenderer();
      ensureMobileLiquidGLViewportCorrection(renderer);
      renderer._renderLens(renderer.lenses[0]);
      expect(Object.hasOwn(window, "visualViewport")).toBe(false);
      expect(window.visualViewport).toBe(viewport);
    } finally {
      if (inheritedDescriptor) {
        Object.defineProperty(windowPrototype, "visualViewport", inheritedDescriptor);
      } else {
        Reflect.deleteProperty(windowPrototype, "visualViewport");
      }
    }
  });
});

describe("liquidGL hook lifecycle", () => {
  it("runs the real package CSS fallback without creating a shared renderer", async () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const view = render(createElement(GlassTarget));
    window.dispatchEvent(new Event("load"));
    await vi.advanceTimersByTimeAsync(120);
    await vi.dynamicImportSettled();
    const target = view.getByTestId("glass");
    expect(target.hasAttribute("data-liquid-gl-initialized")).toBe(true);
    expect(target.style.backdropFilter).toBe("blur(12px)");
    expect(window.__liquidGLRenderer__).toBeUndefined();
    expect(warning).toHaveBeenCalledWith(
      "liquidGL: WebGL not available – falling back to CSS backdrop-filter.",
    );
  });

  it("shares viewport synchronization and captures immediate and settled theme colors", async () => {
    const renderer = createRenderer();
    window.__liquidGLRenderer__ = renderer;
    const first = render(createElement(GlassTarget));
    const second = render(createElement(GlassTarget));
    // Cancel pending initialization but retain the page-wide renderer listeners.
    first.unmount();
    second.unmount();
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    await vi.advanceTimersByTimeAsync(16);
    expect(renderer._resizeCanvas).toHaveBeenCalledOnce();
    expect(renderer.lenses[0].updateMetrics).toHaveBeenCalledOnce();
    expect(renderer.lenses[0]._shadowSyncFn).toHaveBeenCalledOnce();
    expect(renderer.render).toHaveBeenCalledOnce();
    expect(window.__liquidGLRenderer__).toBe(renderer);

    document.documentElement.classList.add("dark");
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(16);
    expect(renderer.captureSnapshot).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(304);
    expect(renderer.captureSnapshot).toHaveBeenCalledTimes(2);
  });

  it("cancels idle initialization on unmount", async () => {
    const requestIdle = vi.fn(() => 41);
    const cancelIdle = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdle);
    vi.stubGlobal("cancelIdleCallback", cancelIdle);
    const view = render(createElement(GlassTarget));
    window.dispatchEvent(new Event("load"));
    await vi.advanceTimersByTimeAsync(120);
    expect(requestIdle).toHaveBeenCalledOnce();
    const target = view.getByTestId("glass");
    view.unmount();
    expect(cancelIdle).toHaveBeenCalledWith(41);
    expect(target.hasAttribute("data-liquid-gl-initialized")).toBe(false);
  });
});
