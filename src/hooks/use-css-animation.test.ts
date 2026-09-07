import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCssAnimation } from "./use-css-animation";

const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>();
const cancelFrame = vi.fn<(handle: number) => void>();

beforeEach(() => {
  requestFrame.mockReset().mockReturnValue(1);
  cancelFrame.mockReset();
  vi.stubGlobal("requestAnimationFrame", requestFrame);
  vi.stubGlobal("cancelAnimationFrame", cancelFrame);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useCssAnimation playback lifecycle", () => {
  it("does not poll frames while idle", () => {
    const { result } = renderHook(() =>
      useCssAnimation({ duration: 6000, masterAnimationName: "demo" }),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.progress).toBe(0);
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it("preserves autoplay and stops polling when paused", () => {
    const { result } = renderHook(() =>
      useCssAnimation({ duration: 6000, masterAnimationName: "demo", autoplay: true, loop: true }),
    );

    expect(result.current.status).toBe("playing");
    expect(requestFrame).toHaveBeenCalledTimes(1);
    act(() => result.current.togglePlay());
    expect(result.current.status).toBe("paused");
    expect(cancelFrame).toHaveBeenCalledWith(1);
    expect(requestFrame).toHaveBeenCalledTimes(1);

    act(() => result.current.togglePlay());
    expect(result.current.status).toBe("playing");
    expect(requestFrame).toHaveBeenCalledTimes(2);
  });

  it("seeks into a paused state and restarts from zero", () => {
    const { result } = renderHook(() =>
      useCssAnimation({ duration: 4000, masterAnimationName: "demo", autoplay: true, loop: true }),
    );

    act(() => result.current.handleSeek(65));
    expect(result.current.status).toBe("paused");
    expect(result.current.progress).toBe(65);
    expect(cancelFrame).toHaveBeenCalledWith(1);

    act(() => result.current.restart());
    expect(result.current.status).toBe("playing");
    expect(result.current.progress).toBe(0);
  });

  it("cancels the active frame on unmount", () => {
    const { unmount } = renderHook(() =>
      useCssAnimation({ duration: 4000, masterAnimationName: "demo", autoplay: true }),
    );
    unmount();
    expect(cancelFrame).toHaveBeenCalledWith(1);
  });
});
