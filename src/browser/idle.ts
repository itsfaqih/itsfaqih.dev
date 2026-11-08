/** Runs `run` once the browser is idle, for setup that can wait past first paint. */
export function whenIdle(run: () => void) {
  if ("requestIdleCallback" in window) requestIdleCallback(run);
  else setTimeout(run, 200);
}
