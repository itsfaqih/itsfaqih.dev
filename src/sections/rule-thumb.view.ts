import { button } from "./rule-thumb.css";
type Stroke = { tag: "path" | "rect" | "circle"; attrs: Record<string, string> };

// Each topic's glyph on a 24-unit grid, for rules without art of their own.
export const GLYPHS = new Map<string, Stroke[]>([
  ["Code Writing", [{ tag: "path", attrs: { d: "M8 6l-6 6 6 6M16 6l6 6-6 6" } }]],
  ["UX Design", [{ tag: "path", attrs: { d: "M5 3l6.5 17 2.5-7 7-2.5z" } }]],
  [
    "Architecture",
    [
      { tag: "rect", attrs: { x: "3", y: "3", width: "7", height: "7", rx: "1" } },
      { tag: "rect", attrs: { x: "14", y: "3", width: "7", height: "7", rx: "1" } },
      { tag: "rect", attrs: { x: "8.5", y: "14", width: "7", height: "7", rx: "1" } },
      { tag: "path", attrs: { d: "M6.5 10v2h11v-2M12 12v2" } },
    ],
  ],
  [
    "Best Practices",
    [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M8 12.5l2.5 2.5L16 9" } },
    ],
  ],
  [
    "Accessibility",
    [
      { tag: "circle", attrs: { cx: "12", cy: "4.5", r: "1.8" } },
      { tag: "path", attrs: { d: "M5 8.5l7 1.5 7-1.5M12 10v5M9 21l3-6 3 6" } },
    ],
  ],
]);

export const glyphOf = (label: string) => GLYPHS.get(label) ?? GLYPHS.get("Best Practices")!;

/** The rules with art of their own; every other rule shows its topic's glyph. */
export const ART_IDS = new Set([
  "proximity-principle",
  "button-design",
  "data-loading",
  "null-vs-undefined",
]);

// The progress pips fill one by one; the first is lit throughout.
export const PIP_PLAY = [null, button.pip2Play, button.pip3Play, button.pip4Play, button.pip5Play];
