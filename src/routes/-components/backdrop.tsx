import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// A dot matrix behind the page. Near the pointer the dots wake up in the site's topic colours and
// lean toward it, like an LED board pulled by a magnet. The CSS grid holds every other dot; the
// canvas redraws only the circle around the pointer, and the grid leaves a hole there to match.
// Touch screens get the still grid.

const CELL = 22;
const RADIUS = 220;
/** At most a dot moves this share of its distance to the pointer, so rings never cross. */
const PULL = 0.5;
const PALETTE = ["--cw", "--ux", "--ar", "--ts", "--ax", "--go"];
/** Per second, how fast the field catches up with the pointer and how fast it fades in or out. */
const FOLLOW = 14;
const FADE = 7;

export function Backdrop() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(
    <div ref={followPointer} className="arc-backdrop" aria-hidden="true">
      <i />
      <canvas />
    </div>,
    document.body,
  );
}

/** The backdrop's ref. It runs the pointer field from mount until React calls the returned cleanup. */
function followPointer(element: HTMLDivElement) {
  const canvas = element.querySelector("canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context || !matchMedia("(hover: hover)").matches) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  let base = "";
  let colours: string[] = [];
  // Light mode darkens each hue a little less than accent text does: enough to read on a pale
  // ground, little enough to stay a colour.
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
  let frame = 0;
  let then = 0;

  const draw = () => {
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, innerWidth, innerHeight);
    const pull = still.matches ? 0 : PULL * strength;
    const firstColumn = Math.max(0, Math.floor((field.x - RADIUS) / CELL));
    const firstRow = Math.max(0, Math.floor((field.y - RADIUS) / CELL));
    for (let column = firstColumn; column * CELL <= field.x + RADIUS; column++) {
      for (let row = firstRow; row * CELL <= field.y + RADIUS; row++) {
        const x = column * CELL + CELL / 2;
        const y = row * CELL + CELL / 2;
        const distance = Math.hypot(field.x - x, field.y - y);
        if (distance >= RADIUS) continue;
        const near = (1 - distance / RADIUS) ** 2;
        const dotX = x + (field.x - x) * pull * near;
        const dotY = y + (field.y - y) * pull * near;
        const radius = 1.5 + near * strength * 1.5;
        context.beginPath();
        context.arc(dotX, dotY, radius, 0, Math.PI * 2);
        context.globalAlpha = 1;
        context.fillStyle = base;
        context.fill();
        context.globalAlpha = Math.min(1, near * strength * 1.6);
        context.fillStyle = colours[((column * 7 + row * 13) ^ (column * row)) % colours.length]!;
        context.fill();
      }
    }
    element.style.setProperty("--mx", `${field.x}px`);
    element.style.setProperty("--my", `${field.y}px`);
    element.style.setProperty("--hole", strength > 0 ? `${RADIUS}px` : "0px");
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
    draw();
    frame = caughtUp && faded ? 0 : requestAnimationFrame(tick);
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
  const leave = () => {
    lit = false;
    wake();
  };
  const restyle = () => {
    readColours();
    draw();
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
  document.documentElement.addEventListener("pointerleave", leave);
  return () => {
    cancelAnimationFrame(frame);
    theme.disconnect();
    removeEventListener("resize", onResize);
    removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", leave);
  };
}
