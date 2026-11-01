/** Runs `run` once the browser is idle, when Astro's `client:idle` would have hydrated. */
export function whenIdle(run: () => void) {
  if ("requestIdleCallback" in window) requestIdleCallback(run);
  else setTimeout(run, 200);
}
