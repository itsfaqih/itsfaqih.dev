// The media queries the styles and scripts share. A pointer that is fine and can hover is a mouse.
export const HOVER = "(hover: hover) and (pointer: fine)";
export const REDUCE = "(prefers-reduced-motion: reduce)";
export const TOUCH = "(pointer: coarse)";

export const reducedMotion = () => matchMedia(REDUCE).matches;

/** Calls `onChange` whenever `query` starts or stops matching. Returns the unsubscribe. */
export function watchMedia(query: string, onChange: () => void) {
  const list = matchMedia(query);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}
