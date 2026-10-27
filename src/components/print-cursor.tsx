import { useEffect, useRef } from "react";

// Pixel art on CELL px squares: K is the ink outline, F the fill. hot is the hotspot in cells.
const PIXEL_ART = {
  arrow: {
    hot: [0, 0],
    rows: [
      "K.........",
      "KK........",
      "KFK.......",
      "KFFK......",
      "KFFFK.....",
      "KFFFFK....",
      "KFFFFFK...",
      "KFFFFFFK..",
      "KFFFFFFFK.",
      "KFFFKKKKK.",
      "KFFK......",
      "KFK.......",
      "KK........",
    ],
  },
  point: {
    hot: [4.5, 0],
    rows: [
      "....KK.......",
      "...KFFK......",
      "...KFFK......",
      "...KFFK......",
      "...KFFKKK....",
      "...KFFKFFKKK.",
      "...KFFKFFKFFK",
      "KK.KFFKFFKFFK",
      "KFKKFFFFFFFFK",
      "KFFKFFFFFFFFK",
      ".KFFFFFFFFFFK",
      "..KFFFFFFFFFK",
      "..KFFFFFFFFK.",
      "...KFFFFFFK..",
      "...KKKKKKKK..",
    ],
  },
  grab: {
    hot: [6.5, 7],
    rows: [
      "...KK.KK.KK.",
      "..KFFKFFKFFK",
      "..KFFKFFKFFK",
      "..KFFKFFKFFK",
      "..KFFKFFKFFK",
      "..KFFKFFKFFK",
      "KKKFFKFFKFFK",
      "KFFKFFFFFFFK",
      "KFFFKFFFFFFK",
      ".KFFFFFFFFFK",
      ".KFFFFFFFFFK",
      "..KFFFFFFFK.",
      "...KFFFFFK..",
      "...KKKKKKK..",
    ],
  },
  grabbing: {
    hot: [6, 5],
    rows: [
      "..KK.KK.KK..",
      ".KFFKFFKFFK.",
      ".KFFKFFKFFKK",
      ".KFFKFFKFFKK",
      "KKKKKKKKKFFK",
      "KFFFFFFFKFFK",
      "KFFFFFFFFFFK",
      "KFFFFFFFFFFK",
      ".KFFFFFFFFK.",
      "..KKKKKKKK..",
    ],
  },
} as const;

type Glyph = keyof typeof PIXEL_ART;
type Mode = Glyph | "native";

const CELL = 2;
function pathsOf({ hot, rows }: (typeof PIXEL_ART)[Glyph]) {
  const cells = (keep: string) =>
    rows
      .flatMap((row, y) =>
        [...row].map((cell, x) =>
          keep.includes(cell)
            ? `M${(x - hot[0]) * CELL} ${(y - hot[1]) * CELL}h${CELL}v${CELL}h-${CELL}z`
            : "",
        ),
      )
      .join("");
  return { ink: cells("K"), fill: cells("F"), plate: cells("KF") };
}
const PATHS = {
  arrow: pathsOf(PIXEL_ART.arrow),
  point: pathsOf(PIXEL_ART.point),
  grab: pathsOf(PIXEL_ART.grab),
  grabbing: pathsOf(PIXEL_ART.grabbing),
} satisfies Record<Glyph, ReturnType<typeof pathsOf>>;

const isGlyph = (name: string | undefined): name is Glyph => !!name && name in PIXEL_ART;

// The plate rests out of register by this much and slips up to PLATE_SLIP behind fast moves.
const PLATE_REST = [3, 2.5] as const;
const PLATE_SLIP = 9;

// arcade.css points the --cursor tokens at /cursors/none.svg#<glyph> while this cursor is on,
// so the cursor an element already asks for says which glyph to draw.
function modeOf(cursor: string): Mode {
  const marker = /none\.svg#(\w+)/.exec(cursor)?.[1];
  if (isGlyph(marker)) return marker;
  if (cursor === "pointer") return "point";
  if (cursor === "default" || cursor === "auto" || cursor === "none") return "arrow";
  return "native";
}

/** The site's cursor: a pixel arrow or hand in ink over a halftone plate printed out of register. */
export function PrintCursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cur = root.current;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    if (!cur || !fine.matches) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    const plate = cur.querySelector<SVGGElement>(".pc-plate")!;
    const parts = {
      plate: cur.querySelector<SVGPathElement>(".pc-plate path")!,
      ink: cur.querySelector<SVGPathElement>(".pc-ink")!,
      fill: cur.querySelector<SVGPathElement>(".pc-fill")!,
    };

    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    let vx = 0;
    let vy = 0;
    let offX: number = PLATE_REST[0];
    let offY: number = PLATE_REST[1];
    let offVx = 0;
    let offVy = 0;
    let down = false;
    let target: Element | null = null;
    let glyph: Glyph | null = null;
    let frame = 0;

    function sync() {
      const mode = target ? modeOf(getComputedStyle(target).cursor) : "arrow";
      cur!.dataset.mode = mode;
      cur!.classList.toggle("down", down);
      if (mode !== "native" && mode !== glyph) {
        glyph = mode;
        parts.plate.setAttribute("d", PATHS[mode].plate);
        parts.ink.setAttribute("d", PATHS[mode].ink);
        parts.fill.setAttribute("d", PATHS[mode].fill);
      }
      const host = target?.closest<HTMLElement>("[style*='--c']");
      const style = host && getComputedStyle(host);
      const hue = style?.getPropertyValue("--c").trim();
      cur!.style.setProperty("--pc-hue", hue || "var(--go)");
      // A hand filled with the hue of the thing under it would read only as an outline.
      cur!.toggleAttribute("data-on-hue", !!hue && style!.backgroundColor === hue);
    }

    function tick() {
      vx += (x - lastX - vx) * 0.35;
      vy += (y - lastY - vy) * 0.35;
      lastX = x;
      lastY = y;
      cur!.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      // Pressing (and holding a grab) pulls the plate into register.
      const inRegister = down || glyph === "grabbing";
      let tx = inRegister ? 0 : PLATE_REST[0] - vx * 0.6;
      let ty = inRegister ? 0 : PLATE_REST[1] - vy * 0.6;
      const len = Math.hypot(tx, ty);
      if (len > PLATE_SLIP) {
        tx *= PLATE_SLIP / len;
        ty *= PLATE_SLIP / len;
      }
      if (reduce.matches || inRegister) {
        offX = tx;
        offY = ty;
        offVx = offVy = 0;
      } else {
        offVx = (offVx + (tx - offX) * 0.2) * 0.7;
        offVy = (offVy + (ty - offY) * 0.2) * 0.7;
        offX += offVx;
        offY += offVy;
      }
      plate.setAttribute("transform", `translate(${offX.toFixed(2)} ${offY.toFixed(2)})`);

      const settled =
        Math.abs(vx) + Math.abs(vy) < 0.01 &&
        Math.abs(tx - offX) + Math.abs(ty - offY) + Math.abs(offVx) + Math.abs(offVy) < 0.01;
      frame = settled ? 0 : requestAnimationFrame(tick);
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!cur.classList.contains("on")) {
        lastX = e.clientX;
        lastY = e.clientY;
      }
      x = e.clientX;
      y = e.clientY;
      target = e.target instanceof Element ? e.target : null;
      cur.classList.add("on");
      sync();
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      sync();
      wake();
    };
    const onUp = () => {
      down = false;
      sync();
      wake();
    };
    const onLeave = () => cur.classList.remove("on");
    // Hover and drag states change classes and attributes without a pointer move.
    const observer = new MutationObserver((records) => {
      if (target && records.some((r) => r.target !== cur)) sync();
    });

    html.classList.add("cur-on");
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    addEventListener("blur", onLeave);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-dragging", "disabled"],
    });
    return () => {
      html.classList.remove("cur-on");
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      removeEventListener("blur", onLeave);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={root} className="print-cursor" aria-hidden="true">
      <svg viewBox="-24 -24 48 48">
        <defs>
          <pattern
            id="pc-dots"
            width="3.6"
            height="3.6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(18)"
          >
            <circle cx="1.8" cy="1.8" r="1.3" />
          </pattern>
        </defs>
        <g className="pc-body">
          <g className="pc-plate">
            <path fill="url(#pc-dots)" />
          </g>
          <path className="pc-ink" />
          <path className="pc-fill" />
        </g>
      </svg>
    </div>
  );
}
