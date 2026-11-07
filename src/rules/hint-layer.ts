import { cellTimes, HINT_MOTION } from "../arrows";
import { type Hint, watchHintReader, watchHints } from "./hints";
import { lessonView } from "./rule-landing.view";
import { hintKit } from "./rule-landing.css";
import { marker } from "../when";

const SVG = "http://www.w3.org/2000/svg";
type Drawn = {
  halo: HTMLElement;
  group: HTMLElement;
  svg: SVGSVGElement;
  ring: SVGRectElement;
  label: HTMLElement;
  hint: Hint;
};

const attrs = (e: Element, values: Record<string, number>) => {
  for (const [name, value] of Object.entries(values)) e.setAttribute(name, String(value));
};

// How far the blur behind a hint reaches past its line and label, feather included.
const HALO = 16;

/**
 * Fits the blur behind a hint to the hint, masked solid round the arrow's line and its label and
 * feathered out past them, so it has no hard edge.
 */
function halo(e: HTMLElement, { spine, label, bounds }: Hint) {
  const left = bounds.left - HALO;
  const top = bounds.top - HALO;
  const h = label.bottom - label.top;
  const svg =
    `<svg xmlns="${SVG}"><filter id="f" filterUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">` +
    `<feGaussianBlur stdDeviation="3"/></filter><g filter="url(#f)"><g transform="translate(${-left} ${-top})">` +
    `<path d="${spine}" fill="none" stroke="#000" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<rect x="${label.left - 6}" y="${label.top - 5}" width="${label.right - label.left + 12}" height="${h + 10}" rx="${h / 2 + 5}"/>` +
    `</g></g></svg>`;
  const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  Object.assign(e.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${bounds.right + HALO - left}px`,
    height: `${bounds.bottom + HALO - top}px`,
    maskImage: mask,
    webkitMaskImage: mask,
  });
}

/**
 * Draws the arrows into the card's hint layer (hint-layer.astro), one to each `[data-hint]`,
 * once the card is on screen, and fades each once the reader touches its zone. `redraw` measures
 * again after the card changes what it shows. `middle` aims every line at the middle of a side.
 */
export function mountHints(card: HTMLElement, middle = false) {
  const layer = card.querySelector<HTMLElement>('[data-part="hints"]')!;
  const ruler = layer.querySelector<HTMLElement>('[data-part="ruler"]')!;
  let drawn = new Map<string, Drawn>();
  let shown = false;
  const done = new Set<string>();
  const paint = ({ halo, group, svg, ring, label, hint }: Drawn) => {
    const left = done.has(hint.zone);
    halo.className = lessonView.hintHalo(hint.zone === "copy", !shown || left);
    group.toggleAttribute("data-left", left);
    svg.setAttribute("class", lessonView.hintSvg(!shown));
    svg.toggleAttribute("data-drawn", shown);
    ring.setAttribute("class", lessonView.hintRing(left));
    label.className = lessonView.hintLabel(!shown);
  };
  const draw = (hints: Hint[]) => {
    const next = new Map<string, Drawn>();
    for (const hint of hints) {
      const key = `${hint.zone}-${hint.say}-${hint.spine}`;
      let mark = drawn.get(key);
      if (!mark) {
        const svg = document.createElementNS(SVG, "svg");
        const ring = document.createElementNS(SVG, "rect");
        svg.append(ring);
        hint.cells.forEach(({ x, y }, i) => {
          const cell = document.createElementNS(SVG, "rect");
          attrs(cell, { x, y, width: hint.grid, height: hint.grid });
          cell.setAttribute("class", hintKit.cell);
          const { at, out } = cellTimes(i, hint.cells.length);
          cell.style.setProperty("--at", `${at}ms`);
          cell.style.setProperty("--out", `${out}ms`);
          svg.append(cell);
        });
        const label = document.createElement("span");
        label.innerHTML = ruler.innerHTML;
        label.lastChild!.textContent = hint.say;
        const blur = document.createElement("div");
        halo(blur, hint);
        // The arrow and its label leave as one, so they fade together in one layer. The blur stays
        // out of it, since fading the layer would cut it off from the pane it blurs.
        const group = document.createElement("div");
        group.className = `${hintKit.group} ${marker}`;
        group.append(svg, label);
        layer.append(blur, group);
        mark = { halo: blur, group, svg, ring, label, hint };
      }
      mark.hint = hint;
      const { box, radius } = hint.ring;
      const w = box.right - box.left;
      const h = box.bottom - box.top;
      attrs(mark.ring, { x: box.left, y: box.top, width: w, height: h, rx: radius });
      const out = 2 * HINT_MOTION.ringGrows;
      mark.ring.style.setProperty("--sx", String((w + out) / w));
      mark.ring.style.setProperty("--sy", String((h + out) / h));
      mark.label.style.left = `${hint.at.x}px`;
      mark.label.style.top = `${hint.at.y}px`;
      paint(mark);
      next.set(key, mark);
    }
    for (const [key, { halo, group }] of drawn) {
      if (next.has(key)) continue;
      halo.remove();
      group.remove();
    }
    drawn = next;
  };
  let stopHints = watchHints(card, ruler, draw, middle);
  const stopReader = watchHintReader(
    card,
    () => {
      shown = true;
      for (const mark of drawn.values()) paint(mark);
    },
    (zone) => {
      if (done.has(zone)) return;
      done.add(zone);
      for (const mark of drawn.values()) paint(mark);
    },
  );
  return {
    redraw() {
      stopHints();
      stopHints = watchHints(card, ruler, draw, middle);
    },
    stop() {
      stopHints();
      stopReader();
    },
  };
}
