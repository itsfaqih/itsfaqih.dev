export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Calls `onChange` whenever `query` starts or stops matching. Returns the unsubscribe. */
export function watchMedia(query: string, onChange: () => void) {
  const list = matchMedia(query);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}
