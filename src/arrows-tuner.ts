import { ARROWS, ARROWS_CHANGED, downArrow, strokeVar, type ArrowFamily } from "./arrows";
import { retryGhost, routeGhost } from "./sections/hero/hero-scenes";

type Knob = {
  family: ArrowFamily;
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  read: () => number;
  write: (v: number) => void;
};

/** One family's knobs, as [key, label, min, max, step], bound to its live values. */
function family<K extends string>(
  name: ArrowFamily,
  title: string,
  values: Record<K, number>,
  specs: [NoInfer<K>, string, number, number, number][],
) {
  const knobs = specs.map(([key, label, min, max, step]): Knob => ({
    family: name,
    key,
    label,
    min,
    max,
    step,
    initial: values[key],
    read: () => values[key],
    write: (v) => {
      values[key] = v;
    },
  }));
  return { title, knobs };
}

const FAMILIES = [
  family("hint", "Try it arrows", ARROWS.hint, [
    ["stroke", "Stroke", 0.5, 5, 0.25],
    ["wing", "Head length", 2, 20, 0.5],
    ["spread", "Head angle (deg)", 5, 80, 0.5],
    ["reach", "Label distance", 8, 80, 1],
    ["bend", "Shortest curved", 0, 200, 1],
    ["bow", "Curve depth", 0, 1, 0.01],
    ["tail", "Tail straightness", 0, 1, 0.01],
    ["knee", "Curve position", 0, 1, 0.01],
    ["labelGap", "Gap at label", 0, 24, 0.5],
    ["targetGap", "Gap at target", 0, 24, 0.5],
  ]),
  family("toggle", "Arrows beside a toggle in the copy", ARROWS.toggle, [
    ["reach", "Label distance", 8, 80, 1],
    ["labelGap", "Gap at label", 0, 24, 0.5],
    ["targetGap", "Gap at target", 0, 24, 0.5],
  ]),
  family("squint", "Squint arrows", ARROWS.squint, [
    ["stroke", "Stroke", 0.5, 5, 0.25],
    ["length", "Length", 4, 40, 0.5],
    ["wing", "Head length", 1, 16, 0.5],
    ["spread", "Head angle (deg)", 5, 80, 0.5],
  ]),
  family("hero", "Hero queue arrows", ARROWS.hero, [
    ["wing", "Head length", 1, 20, 0.5],
    ["spread", "Head angle (deg)", 5, 80, 0.5],
  ]),
];
const KNOBS = FAMILIES.flatMap((f) => f.knobs);

const saved = (k: Knob) => `arrows-tuner:${k.family}.${k.key}`;
const round = (v: number) => +v.toFixed(3);

function load() {
  try {
    for (const k of KNOBS) {
      const stored = localStorage.getItem(saved(k));
      if (stored !== null && Number.isFinite(Number(stored))) k.write(Number(stored));
    }
  } catch {}
}

function save(k: Knob) {
  try {
    localStorage.setItem(saved(k), String(k.read()));
  } catch {}
}

/** Redraws every arrow on the page from ARROWS. */
function apply() {
  const root = document.documentElement.style;
  root.setProperty(strokeVar("hint"), String(ARROWS.hint.stroke));
  root.setProperty(strokeVar("squint"), String(ARROWS.squint.stroke));
  const squint = downArrow(ARROWS.squint);
  for (const svg of document.querySelectorAll<SVGSVGElement>('svg[data-arrow="squint"]')) {
    svg.setAttribute("viewBox", `0 0 ${squint.width} ${squint.height}`);
    svg.setAttribute("width", String(squint.width));
    svg.setAttribute("height", String(squint.height));
    svg.querySelector("path")?.setAttribute("d", squint.d);
  }
  for (const path of document.querySelectorAll<SVGPathElement>('path[data-arrow="route"]'))
    path.setAttribute("d", routeGhost(Number(path.dataset.y)));
  for (const path of document.querySelectorAll<SVGPathElement>('path[data-arrow="retry"]'))
    path.setAttribute("d", retryGhost());
  window.dispatchEvent(new Event(ARROWS_CHANGED));
}

/** Every value that differs from what ships, in the shape to paste back. */
function changed() {
  const out: Record<string, Record<string, number>> = {};
  for (const k of KNOBS)
    if (round(k.read()) !== round(k.initial)) (out[k.family] ??= {})[k.key] = round(k.read());
  return out;
}

function panel() {
  const box = document.createElement("details");
  box.dataset.arrowsTuner = "";
  box.style.cssText = [
    "position:fixed",
    "right:16px",
    "bottom:16px",
    "z-index:2147483647",
    "width:min(320px, calc(100vw - 32px))",
    "max-height:min(80vh, 720px)",
    "overflow:auto",
    "background:#fff",
    "color:#111",
    "border:1px solid #0002",
    "border-radius:10px",
    "box-shadow:0 8px 30px #0003",
    "font:12px/1.4 system-ui, sans-serif",
    "padding:8px 12px",
  ].join(";");
  const summary = document.createElement("summary");
  summary.textContent = "Arrows";
  summary.style.cssText = "cursor:pointer;font-weight:600;font-size:13px";
  box.append(summary);

  const refreshers: (() => void)[] = [];
  for (const { title, knobs } of FAMILIES) {
    const group = document.createElement("fieldset");
    group.style.cssText = "border:0;border-top:1px solid #0001;margin:8px 0 0;padding:8px 0 0";
    const legend = document.createElement("legend");
    legend.textContent = title;
    legend.style.cssText = "font-weight:600;padding:0";
    group.append(legend);
    box.append(group);
    for (const k of knobs) {
      const row = document.createElement("label");
      row.style.cssText =
        "display:grid;grid-template-columns:1fr 64px;gap:2px 8px;align-items:center;margin:6px 0";
      const name = document.createElement("span");
      name.textContent = k.label;
      const number = document.createElement("input");
      number.type = "number";
      number.style.cssText = "width:64px;font:inherit";
      const range = document.createElement("input");
      range.type = "range";
      range.style.cssText = "grid-column:1 / -1;width:100%;margin:0";
      for (const input of [number, range]) {
        input.min = String(k.min);
        input.max = String(k.max);
        input.step = String(k.step);
        input.addEventListener("input", () => {
          const v = Number(input.value);
          if (input.value === "" || !Number.isFinite(v)) return;
          k.write(v);
          (input === number ? range : number).value = String(v);
          save(k);
          apply();
        });
      }
      refreshers.push(() => {
        number.value = String(round(k.read()));
        range.value = number.value;
      });
      row.append(name, number, range);
      group.append(row);
    }
  }

  const out = document.createElement("textarea");
  out.readOnly = true;
  out.rows = 5;
  out.style.cssText =
    "width:100%;box-sizing:border-box;font:11px/1.4 ui-monospace, monospace;margin-top:8px";
  const showOut = () => {
    out.value = JSON.stringify(changed(), null, 2);
  };
  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;gap:8px;margin-top:10px";
  const button = (text: string, run: (b: HTMLButtonElement) => void) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.style.cssText = "flex:1;font:inherit;padding:6px;cursor:pointer";
    b.addEventListener("click", () => run(b));
    bar.append(b);
  };
  button("Copy values", (b) => {
    showOut();
    out.select();
    void navigator.clipboard?.writeText(out.value).then(
      () => (b.textContent = "Copied"),
      () => (b.textContent = "Copy the box below"),
    );
    setTimeout(() => (b.textContent = "Copy values"), 1500);
  });
  button("Reset", () => {
    for (const k of KNOBS) k.write(k.initial);
    try {
      for (const k of KNOBS) localStorage.removeItem(saved(k));
    } catch {}
    for (const refresh of refreshers) refresh();
    showOut();
    apply();
  });
  box.addEventListener("input", showOut);
  box.append(bar, out);
  for (const refresh of refreshers) refresh();
  showOut();
  document.body.append(box);
}

load();
panel();
apply();
// A lesson opened in place mounts fresh arrows with the shipped values.
let pending = 0;
new MutationObserver((records) => {
  const fresh = records.some((r) =>
    [...r.addedNodes].some(
      (n) => n instanceof Element && (n.matches("[data-arrow]") || n.querySelector("[data-arrow]")),
    ),
  );
  if (!fresh) return;
  cancelAnimationFrame(pending);
  pending = requestAnimationFrame(apply);
}).observe(document.body, { childList: true, subtree: true });
