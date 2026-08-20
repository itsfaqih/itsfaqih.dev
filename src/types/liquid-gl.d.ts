declare module "liquid-gl" {
  const liquidGL: (options: {
    target: string;
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
  }) => unknown;

  export default liquidGL;
}
