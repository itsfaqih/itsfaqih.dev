// Every film registers one paused GSAP timeline and an optional per-frame function of t.
// The renderer calls window.seek(t) for each frame; nothing reads the wall clock.
// Preview: open the page as is (it loops in real time), or add ?t=3.2 to freeze a moment.

window.FPS = 30;

window.register = function register({ duration, tl, frame }) {
  const seek = (t) => {
    if (tl) {
      tl.pause();
      tl.totalTime(t + 0.001, true);
      tl.totalTime(t, true);
    }
    frame?.(t);
  };
  window.FILM = { duration, fps: window.FPS };
  window.seek = seek;

  const params = new URLSearchParams(location.search);
  if (params.has("render")) return;
  if (params.has("t")) {
    seek(Number(params.get("t")));
    return;
  }
  const start = performance.now();
  const loop = () => {
    seek(((((performance.now() - start) / 1000) % duration) + duration) % duration);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

// Small helpers for per-frame state.
window.clamp01 = (x) => Math.max(0, Math.min(1, x));
window.ease = {
  out: (x) => 1 - Math.pow(1 - x, 4),
  in: (x) => x * x * x,
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};
// Progress of a tween that runs from a to a+d, eased.
window.prog = (t, a, d, fn = window.ease.out) => fn(window.clamp01((t - a) / d));
