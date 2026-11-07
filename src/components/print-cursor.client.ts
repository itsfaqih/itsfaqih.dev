import { whenIdle } from "../hooks/idle";

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
    hot: [4, 0],
    rows: [
      "..KKKK......",
      "..KFFK......",
      "..KFFK......",
      "..KFFKKKK...",
      "..KFFKFFKKKK",
      "KKKFFKFFKFFK",
      "KFKFFFFFFFFK",
      "KFFFFFFFFFFK",
      "KFFFFFFFFFFK",
      "KKFFFFFFFFFK",
      ".KKFFFFFFFKK",
      "..KFFFFFFFK.",
      "..KKKKKKKKK.",
    ],
  },
  grab: {
    hot: [6, 7],
    rows: [
      ".....KKKK...",
      "..KKKKFFK...",
      "..KFFKFFKKKK",
      "..KFFKFFKFFK",
      "..KFFKFFKFFK",
      "KKKFFKFFKFFK",
      "KFKFFFFFFFFK",
      "KFFFFFFFFFFK",
      "KFFFFFFFFFFK",
      "KKFFFFFFFFFK",
      ".KKFFFFFFFFK",
      "..KKFFFFFFKK",
      "...KKKKKKKK.",
    ],
  },
  grabbing: {
    hot: [6, 4],
    rows: [
      "..KKKKKKKKKK",
      "..KFFKFFKFFK",
      "KKKFFFFFFFFK",
      "KFKFFFFFFFFK",
      "KFFFFFFFFFFK",
      "KFFFFFFFFFFK",
      "KKFFFFFFFFFK",
      ".KKFFFFFFFFK",
      "..KKFFFFFFKK",
      "...KKKKKKKK.",
    ],
  },
  text: {
    hot: [3.5, 6.5],
    rows: [
      "KKKKKKK",
      "KFFFFFK",
      "KKKFKKK",
      "..KFK..",
      "..KFK..",
      "..KFK..",
      "..KFK..",
      "..KFK..",
      "..KFK..",
      "..KFK..",
      "KKKFKKK",
      "KFFFFFK",
      "KKKKKKK",
    ],
  },
  forbid: {
    hot: [6.5, 6.5],
    rows: [
      "...KKKKKKK...",
      "..KKFFFFFKK..",
      ".KKFFFFFFFKK.",
      "KKFFFKKKFFFKK",
      "KFFFFFKKKFFFK",
      "KFFKFFFKKKFFK",
      "KFFKKFFFKKFFK",
      "KFFKKKFFFKFFK",
      "KFFFKKKFFFFFK",
      "KKFFFKKKFFFKK",
      ".KKFFFFFFFKK.",
      "..KKFFFFFKK..",
      "...KKKKKKK...",
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
  text: pathsOf(PIXEL_ART.text),
  forbid: pathsOf(PIXEL_ART.forbid),
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
  if (cursor === "text") return "text";
  if (cursor === "not-allowed") return "forbid";
  if (cursor === "default" || cursor === "auto" || cursor === "none") return "arrow";
  return "native";
}

// The page inherits the arrow everywhere, so selectable text is found by hit-testing its line boxes.
function overText(el: Element, x: number, y: number) {
  if (getComputedStyle(el).userSelect === "none") return false;
  const node =
    document.caretPositionFromPoint?.(x, y)?.offsetNode ??
    document.caretRangeFromPoint?.(x, y)?.startContainer;
  if (node?.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return false;
  const range = document.createRange();
  range.selectNodeContents(node);
  return [...range.getClientRects()].some(
    (r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom,
  );
}

/** The site's cursor: a pixel arrow, hand, I-beam or no-entry sign in ink over a halftone plate printed out of register. */
class PrintCursor extends HTMLElement {
  #stop = () => {};

  connectedCallback() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    const part = (name: string) => this.querySelector(`[data-part="${name}"]`)!;
    const plate = part("plate");
    const parts = { plate: part("plate-dots"), ink: part("ink"), fill: part("fill") };

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

    const sync = () => {
      let mode = target ? modeOf(getComputedStyle(target).cursor) : "arrow";
      if (mode === "arrow" && target && overText(target, x, y)) mode = "text";
      this.dataset.mode = mode;
      this.classList.toggle("down", down);
      if (mode !== "native" && mode !== glyph) {
        glyph = mode;
        parts.plate.setAttribute("d", PATHS[mode].plate);
        parts.ink.setAttribute("d", PATHS[mode].ink);
        parts.fill.setAttribute("d", PATHS[mode].fill);
      }
      const host = target?.closest<HTMLElement>("[style*='--c']");
      const hue = host && getComputedStyle(host).getPropertyValue("--c").trim();
      this.style.setProperty("--pc-hue", hue || "var(--go)");
    };

    const tick = () => {
      vx += (x - lastX - vx) * 0.35;
      vy += (y - lastY - vy) * 0.35;
      lastX = x;
      lastY = y;
      this.style.transform = `translate3d(${x}px, ${y}px, 0)`;

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
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!this.classList.contains("on")) {
        lastX = e.clientX;
        lastY = e.clientY;
      }
      x = e.clientX;
      y = e.clientY;
      target = e.target instanceof Element ? e.target : null;
      this.classList.add("on");
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
    const onLeave = () => this.classList.remove("on");
    // Hover and drag states change classes and attributes without a pointer move. The cursor,
    // user-select and --c that sync reads are set on the target or inherited from an ancestor, so
    // a change off that line, such as an animation's per-frame style, can't change the glyph.
    const observer = new MutationObserver((records) => {
      const at = target;
      if (at && records.some((r) => r.target.contains(at))) sync();
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
    this.#stop = () => {
      html.classList.remove("cur-on");
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      removeEventListener("blur", onLeave);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }

  disconnectedCallback() {
    this.#stop();
  }
}

whenIdle(() => customElements.define("print-cursor", PrintCursor));
