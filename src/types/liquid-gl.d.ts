declare module "liquid-gl" {
  export interface LiquidGLOptions {
    target?: string;
    snapshot?: string;
    resolution?: number;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    reveal?: "none" | "fade";
    tilt?: boolean;
    tiltFactor?: number;
    tiltEase?: number;
    magnify?: number;
  }

  // The runtime surface consumed by the site, verified against liquid-gl 2.0.1.
  export interface LiquidGLLens {
    el: HTMLElement;
    updateMetrics(): void;
    _shadowSyncFn?: () => void;
  }

  export interface LiquidGLRenderer {
    captureSnapshot(): Promise<boolean | undefined>;
    canvas: HTMLCanvasElement;
    _resizeCanvas(): void;
    _renderLens(lens: LiquidGLLens): void;
    render(): void;
    lenses: LiquidGLLens[];
    // Site-owned marker on the shared renderer; survives hook remounts.
    mobileViewportOffsetsPatched?: boolean;
  }

  function liquidGL(
    options?: LiquidGLOptions,
  ): LiquidGLLens | LiquidGLLens[] | Element | Element[] | undefined;

  export default liquidGL;
}

interface Window {
  __liquidGLRenderer__?: import("liquid-gl").LiquidGLRenderer;
}
