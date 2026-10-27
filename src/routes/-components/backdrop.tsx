import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A dot matrix behind the page. Near the pointer the dots light up in the accent,
// like an LED board waking under your hand. Touch screens get the still grid.
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty("--mx", `${event.clientX}px`);
        element.style.setProperty("--my", `${event.clientY}px`);
        element.dataset.lit = "";
      });
    };
    const leave = () => delete element.dataset.lit;
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [mounted]);

  if (!mounted) return null;
  return createPortal(
    <div ref={ref} className="arc-backdrop" aria-hidden="true">
      <i />
    </div>,
    document.body,
  );
}
