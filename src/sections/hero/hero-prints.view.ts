import { cx, type ClassValue } from "../../cx";
import { styles } from "./hero-prints.css";
export type TopInk = "solid" | "hue" | "outline";

export const pct = (n: number) => `${+n.toFixed(2)}%`;
export const SCENE_MS = 3200;
const SCENE_REST_MS = 1000;
export const SLIDE_MS = SCENE_MS + SCENE_REST_MS;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

export const TOKEN_COUNT = 4;
export const TOPS: TopInk[] = ["solid", "hue", "outline"];
export const MORPH_MS = 1100;
export const FADE_MS = 180;
export const TOKEN_STAGGER_MS = 60;
export const SCENE_LEAD_MS = MORPH_MS - FADE_MS;

export const REST_DEG = { x: 4, y: -6 };
export const REST_TRANSFORM = `rotateX(${REST_DEG.x}deg) rotateY(${REST_DEG.y}deg)`;

/** Custom properties as an inline style string, each name given without its leading dashes. */
export const vars = (v: Record<string, string | number>) =>
  Object.entries(v)
    .map(([k, value]) => `--${k}:${value}`)
    .join(";");

// Every shape and group the prints draw: it holds still while the hero is paused or its layer is
// on the way out, and turns about its own box. The halftone copies carry a transform attribute
// instead, so they take the hold alone.
export const draw = (...more: (ClassValue | false)[]) => cx(styles.part, styles.box, ...more);
