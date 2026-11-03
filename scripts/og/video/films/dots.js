// The site's dot backdrop (src/sections/backdrop-dots.ts) drawn as a pure function of film time:
// the same turned halftone screen in --dot under the same mask, and the same lights — a glow
// tints the dots around a box in its hue, each dot flickers on like a tube when the light turns on,
// then breathes on its own period and phase. Every number here is the site's.
(() => {
  const U = 5;
  const DOT = 2;
  const DOT_LIFT = 3.5;
  const GLOW_REACH = 240;
  const GLOW_REACH_WIDTH = 0.3;
  const GLOW_ALPHA = 0.95;
  const GLOW_LIFT = 0.45;
  const GLOW_SOURCE_REACH = 1.6;
  const BLIP = [
    [0, 0],
    [45, 1],
    [90, 0.25],
    [150, 1],
    [200, 0.6],
    [320, 1],
  ];
  const BLIP_SPREAD = 350;
  const BLIP_SCATTER = 350;
  const BLIP_SPAN = BLIP_SPREAD + BLIP_SCATTER + BLIP[BLIP.length - 1][0];
  const BREATH_DEPTH = 0.55;
  const BREATH_MIN_MS = 3200;
  const BREATH_MAX_MS = 5600;
  const TINT_STEPS = 48;
  /** A new hue fades in over the old one in this many seconds. */
  window.GLOW_FADE = 0.6;

  const onScreen = (p, q) => (3 * p + q) % 10 === 0;
  const grain = (p, q) => {
    const hash = Math.sin(p * 127.1 + q * 311.7) * 43758.5453;
    return hash - Math.floor(hash);
  };
  const blipLevel = (ms) => {
    if (ms <= 0) return 0;
    const end = BLIP.findIndex(([at]) => at >= ms);
    if (end < 0) return 1;
    const [fromMs, fromLevel] = BLIP[end - 1];
    const [toMs, toLevel] = BLIP[end];
    return fromLevel + ((toLevel - fromLevel) * (ms - fromMs)) / (toMs - fromMs);
  };

  /**
   * The weights of one source's glows at time t, the way the site fades a new hue in over the
   * last: `glows` are { since, ... } in order, the first one on from the start.
   */
  window.fadeGlows = (glows, t) =>
    glows
      .filter((g) => g.since <= t)
      .map((g, i, shown) => {
        const fade = (x) => Math.min(1, Math.max(0, (t - x.since) / window.GLOW_FADE));
        const weight = shown
          .slice(i + 1)
          .reduce((left, newer) => left * (1 - fade(newer)), i === 0 ? 1 : fade(g));
        return { ...g, weight };
      })
      .filter((g) => g.weight > 0.005);

  /**
   * Puts the screen at the back of `stage` and returns draw(t, glows). Each glow is
   * { el, hue, on, from?, strength?, weight? }: `el` an element or a {left, top, right, bottom}
   * box, `on` the second its light turns on (-Infinity: already on), `from` a part of the box as
   * fractions [left, top, right, bottom], `reach` how far out it spreads in px, `gain` how much brighter than the site it lights. Pass CORNER as
   * `el` to light the bottom-right corner. With `loop`, the film's length in seconds, each dot
   * breathes a whole number of times per loop so the seam doesn't show.
   */
  window.createDots = (stage, { loop } = {}) => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: `${W}px`,
      height: `${H}px`,
      // The site fades the screen toward the middle so it frames the content.
      mask: "radial-gradient(ellipse 75% 65% at 50% 45%, rgb(0 0 0 / 0.45), #000)",
    });
    stage.prepend(canvas);
    const scale = Math.max(1, Math.round(devicePixelRatio || 1));
    canvas.width = W * scale;
    canvas.height = H * scale;
    const context = canvas.getContext("2d");
    const resolve = (value) => {
      canvas.style.color = value;
      return getComputedStyle(canvas).color;
    };
    const base = resolve("var(--dot)");
    const inks = new Map();
    const inkOf = (hue) => {
      if (!inks.has(hue))
        inks.set(hue, resolve(`color-mix(in oklab, ${hue} calc(var(--ink-mix) + 20%), #000)`));
      return inks.get(hue);
    };
    const dots = [];
    for (let q = 0; q * U <= H + U; q++)
      for (let p = 0; p * U <= W + U; p++) {
        if (!onScreen(p, q)) continue;
        let period = BREATH_MIN_MS + grain(q, p) * (BREATH_MAX_MS - BREATH_MIN_MS);
        if (loop) period = (loop * 1000) / Math.max(1, Math.round((loop * 1000) / period));
        dots.push({ x: p * U + U / 2, y: q * U + U / 2, scatter: grain(p, q), period });
      }
    const reach = Math.min(GLOW_REACH, W * GLOW_REACH_WIDTH);
    window.CORNER = { left: W - 1, right: W, top: H - 1, bottom: H };

    return (t, glows = []) => {
      const now = t * 1000;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, W, H);
      const lit = glows.flatMap((glow) => {
        const rect = glow.el instanceof Element ? glow.el.getBoundingClientRect() : glow.el;
        const weight = (glow.weight ?? 1) * (glow.strength ?? 1);
        if (weight < 0.01 || rect.right - rect.left <= 0) return [];
        const [l, tp, r, b] = glow.from ?? [0, 0, 1, 1];
        const w = rect.right - rect.left;
        const h = rect.bottom - rect.top;
        const box = {
          left: rect.left + w * l,
          right: rect.left + w * r,
          top: rect.top + h * tp,
          bottom: rect.top + h * b,
        };
        const spread = glow.reach ?? (glow.from ? reach * GLOW_SOURCE_REACH : reach);
        return [
          {
            box,
            spread,
            weight,
            gain: glow.gain ?? 1,
            on: glow.on * 1000,
            colour: inkOf(glow.hue),
            paths: [],
          },
        ];
      });
      const nearness = (glow, x, y, scatter) => {
        const dx = Math.max(glow.box.left - x, 0, x - glow.box.right);
        const dy = Math.max(glow.box.top - y, 0, y - glow.box.bottom);
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / glow.spread);
        const blip =
          now - glow.on < BLIP_SPAN
            ? blipLevel(now - glow.on - (1 - near) * BLIP_SPREAD - scatter * BLIP_SCATTER)
            : 1;
        return Math.min(1, near * near * glow.weight * blip * glow.gain);
      };
      const rest = new Path2D();
      for (const { x, y, scatter, period } of dots) {
        let glowing = 0;
        for (const glow of lit) glowing = Math.max(glowing, nearness(glow, x, y, scatter));
        if (glowing < 0.01) {
          rest.moveTo(x + DOT, y);
          rest.arc(x, y, DOT, 0, Math.PI * 2);
          continue;
        }
        const radius = DOT + Math.min(1, glowing * GLOW_LIFT) * DOT_LIFT;
        rest.moveTo(x + radius, y);
        rest.arc(x, y, radius, 0, Math.PI * 2);
        const wave = Math.sin((now / period + scatter) * Math.PI * 2);
        const breath = 1 - BREATH_DEPTH * (0.5 + wave / 2);
        for (const glow of lit) {
          const step = Math.round(nearness(glow, x, y, scatter) * breath * GLOW_ALPHA * TINT_STEPS);
          if (step < 1) continue;
          const path = (glow.paths[step] ??= new Path2D());
          path.moveTo(x + radius, y);
          path.arc(x, y, radius, 0, Math.PI * 2);
        }
      }
      context.globalAlpha = 1;
      context.fillStyle = base;
      context.fill(rest);
      for (const glow of lit) {
        context.fillStyle = glow.colour;
        glow.paths.forEach((path, step) => {
          context.globalAlpha = step / TINT_STEPS;
          context.fill(path);
        });
      }
      context.globalAlpha = 1;
    };
  };
})();
