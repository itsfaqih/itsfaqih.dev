import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { palette } from "../../theme.stylex";

const CELL = 22;
const RADIUS = 220;
const PULL = 0.5;
const PALETTE = ["--cw", "--ux", "--ar", "--ts", "--ax", "--go"];
const FOLLOW = 14;
const FADE = 7;
const RIPPLE_REACH = 560;
const RIPPLE_MS = 1100;
const RIPPLE_BAND = 40;
const RIPPLE_AMP = 6;
const SHOCK = 1.8;
const SHOCK_MS = 140;
const MAX_RIPPLES = 4;

export function Backdrop() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(
    <div ref={followPointer} {...stylex.props(styles.root)} aria-hidden="true">
      <i {...stylex.props(styles.layer, styles.grid)} />
      <canvas {...stylex.props(styles.layer)} />
    </div>,
    document.body,
  );
}

const styles = stylex.create({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    // Fade the grid toward the middle so it frames the content instead of sitting under copy.
    mask: "radial-gradient(ellipse 75% 65% at 50% 45%, rgb(0 0 0 / 0.45), #000)",
  },
  layer: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  // The canvas draws the dots inside --hole; the grid skips them there. It is one cell taller, so
  // sliding it up by a part of a cell never bares the bottom edge.
  grid: {
    height: `calc(100% + ${CELL}px)`,
    willChange: "transform",
    backgroundImage: `radial-gradient(circle, ${palette["--dot"]} 1.25px, transparent 1.75px)`,
    backgroundPosition: "0 0",
    backgroundSize: `${CELL}px ${CELL}px`,
    mask: "radial-gradient(circle at var(--mx, 0) var(--my, 0), transparent var(--hole, 0px), #000 var(--hole, 0px))",
  },
});

function followPointer(element: HTMLDivElement) {
  const grid = element.querySelector("i");
  const canvas = element.querySelector("canvas");
  const context = canvas?.getContext("2d");
  if (!grid) return;

  let shift = 0;
  let scrolledRows = 0;
  let redraw = () => {};
  const scroll = () => {
    shift = scrollY % CELL;
    scrolledRows = Math.floor(scrollY / CELL);
    grid.style.transform = `translateY(${-shift}px)`;
    redraw();
  };
  scroll();
  addEventListener("scroll", scroll, { passive: true });
  if (!canvas || !context || !matchMedia("(hover: hover)").matches) {
    return () => removeEventListener("scroll", scroll);
  }
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  let base = "";
  let colours: string[] = [];
  const readColours = () => {
    const resolve = (value: string) => {
      canvas.style.color = value;
      return getComputedStyle(canvas).color;
    };
    base = resolve("var(--dot)");
    colours = PALETTE.map((name) => resolve(`color-mix(in oklab, var(${name}) calc(var(--ink-mix) + 20%), #000)`));
  };

  let scale = 1;
  const resize = () => {
    scale = Math.min(2, devicePixelRatio);
    canvas.width = innerWidth * scale;
    canvas.height = innerHeight * scale;
  };

  const target = { x: 0, y: 0 };
  const field = { x: 0, y: 0 };
  let strength = 0;
  let lit = false;
  let ripples: { x: number; pageY: number; start: number }[] = [];
  let frame = 0;
  let then = 0;

  const colourOf = (column: number, row: number) => {
    const pageRow = row + scrolledRows;
    return colours[((column * 7 + pageRow * 13) ^ (column * pageRow)) % colours.length]!;
  };
  const draw = (now = performance.now()) => {
    ripples = ripples.filter((ripple) => now - ripple.start < RIPPLE_MS);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, innerWidth, innerHeight);
    const rippling = ripples.length > 0;
    const shock = Math.max(0, ...ripples.map((ripple) => Math.exp(-(now - ripple.start) / SHOCK_MS)));
    const pull = still.matches ? 0 : PULL * strength * (1 - SHOCK * shock);
    const waves = ripples.map((ripple) => {
      const progress = (now - ripple.start) / RIPPLE_MS;
      return {
        x: ripple.x,
        y: ripple.pageY - scrollY,
        front: RIPPLE_REACH * (1 - (1 - progress) ** 3),
        energy: 1 - progress,
      };
    });

    const firstColumn = rippling ? 0 : Math.max(0, Math.floor((field.x - RADIUS) / CELL));
    const lastX = rippling ? innerWidth + CELL : field.x + RADIUS;
    const firstRow = rippling ? 0 : Math.max(0, Math.floor((field.y + shift - RADIUS) / CELL));
    const lastY = rippling ? innerHeight + CELL : field.y + RADIUS;
    for (let column = firstColumn; column * CELL <= lastX; column++) {
      for (let row = firstRow; row * CELL - shift <= lastY; row++) {
        const x = column * CELL + CELL / 2;
        const y = row * CELL + CELL / 2 - shift;
        const distance = Math.hypot(field.x - x, field.y - y);
        if (!rippling && distance >= RADIUS) continue;
        const near = distance < RADIUS ? (1 - distance / RADIUS) ** 2 : 0;
        let dotX = x + (field.x - x) * pull * near;
        let dotY = y + (field.y - y) * pull * near;
        let glow = 0;
        for (const wave of waves) {
          const dx = x - wave.x;
          const dy = y - wave.y;
          const fromOrigin = Math.hypot(dx, dy);
          const offset = (fromOrigin - wave.front) / RIPPLE_BAND;
          const crest = Math.exp(-(offset ** 2));
          glow = Math.max(glow, crest * wave.energy);
          if (fromOrigin < 0.5) continue;
          const push = -offset * crest * 2.33 * RIPPLE_AMP * wave.energy;
          dotX += (dx / fromOrigin) * push;
          dotY += (dy / fromOrigin) * push;
        }
        const lift = Math.max(near * strength, glow);
        context.beginPath();
        context.arc(dotX, dotY, 1.5 + lift * 1.5, 0, Math.PI * 2);
        context.globalAlpha = 1;
        context.fillStyle = base;
        context.fill();
        const tint = Math.min(1, Math.max(near * strength * 1.6, glow));
        if (tint < 0.01) continue;
        context.globalAlpha = tint;
        context.fillStyle = colourOf(column, row);
        context.fill();
      }
    }
    element.style.setProperty("--mx", `${field.x}px`);
    element.style.setProperty("--my", `${field.y + shift}px`);
    const hole = rippling ? Math.hypot(innerWidth, innerHeight) * 2 : strength > 0 ? RADIUS : 0;
    element.style.setProperty("--hole", `${hole}px`);
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - then) / 1000);
    then = now;
    const follow = still.matches ? 1 : 1 - Math.exp(-FOLLOW * dt);
    field.x += (target.x - field.x) * follow;
    field.y += (target.y - field.y) * follow;
    strength += ((lit ? 1 : 0) - strength) * (1 - Math.exp(-FADE * dt));
    const caughtUp = Math.hypot(target.x - field.x, target.y - field.y) < 0.3;
    const faded = Math.abs((lit ? 1 : 0) - strength) < 0.005;
    if (caughtUp && faded) {
      field.x = target.x;
      field.y = target.y;
      strength = lit ? 1 : 0;
    }
    draw(now);
    frame = caughtUp && faded && !ripples.length ? 0 : requestAnimationFrame(tick);
  };
  const wake = () => {
    if (frame) return;
    then = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    target.x = event.clientX;
    target.y = event.clientY;
    if (!lit && strength === 0) {
      field.x = target.x;
      field.y = target.y;
    }
    lit = true;
    wake();
  };
  const press = (event: PointerEvent) => {
    if (event.pointerType === "touch" || event.button !== 0 || still.matches) return;
    ripples.push({ x: event.clientX, pageY: event.clientY + scrollY, start: performance.now() });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
    wake();
  };
  const leave = () => {
    lit = false;
    wake();
  };
  const restyle = () => {
    readColours();
    draw();
  };

  redraw = () => {
    if (strength > 0 || ripples.length) draw();
  };
  readColours();
  resize();
  const theme = new MutationObserver(restyle);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const onResize = () => {
    resize();
    draw();
  };
  addEventListener("resize", onResize);
  addEventListener("pointermove", move, { passive: true });
  addEventListener("pointerdown", press, { capture: true, passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  return () => {
    cancelAnimationFrame(frame);
    theme.disconnect();
    removeEventListener("scroll", scroll);
    removeEventListener("resize", onResize);
    removeEventListener("pointermove", move);
    removeEventListener("pointerdown", press, { capture: true });
    document.documentElement.removeEventListener("pointerleave", leave);
  };
}
