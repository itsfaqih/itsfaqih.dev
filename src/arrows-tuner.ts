import {
  ARROWS,
  ARROWS_CHANGED,
  downArrow,
  SECTIONS,
  type ArrowFamily,
  type Brush,
  type BrushArrow,
} from "./arrows";
import { retryGhost, routeGhost } from "./sections/hero/hero-scenes";

type Spec<K extends string> = [key: K, label: string, min: number, max: number, step: number];

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

/** One family's knobs in one section, bound to the values that section draws from. */
function bind<K extends string>(
  family: ArrowFamily,
  base: Record<K, number>,
  own: Partial<Record<K, number>>,
  specs: Spec<NoInfer<K>>[],
): Knob[] {
  return specs.map(([key, label, min, max, step]) => ({
    family,
    key,
    label,
    min,
    max,
    step,
    initial: own[key] ?? base[key],
    read: () => own[key] ?? base[key],
    write: (v) => {
      own[key] = v;
    },
  }));
}

const TITLES: Record<ArrowFamily, string> = {
  hint: "Try it arrows",
  toggle: "Arrows beside a toggle in the copy",
  squint: "Squint arrows",
  hero: "Hero queue arrows",
};

const BRUSH: Spec<keyof Brush>[] = [
  ["tail", "Width at the nock", 0.1, 4, 0.05],
  ["body", "Body width", 0.5, 8, 0.05],
  ["head", "Head length", 2, 24, 0.5],
  ["barb", "Head width", 2, 24, 0.5],
  ["notch", "Notch depth", 0, 10, 0.1],
];
const HINT: Spec<keyof typeof ARROWS.hint>[] = [
  ...BRUSH,
  ["loop", "Shortest curve to loop (0 off)", 0, 200, 1],
  ["curl", "Loop radius", 2, 16, 0.5],
  ["length", "Curve length", 12, 120, 1],
  ["bow", "Curve turn (tan)", 0.05, 1.5, 0.01],
  ["handle", "Curve fullness", 0.1, 0.6, 0.01],
  ["bend", "Tightest bend (radius)", 0, 60, 1],
  ["labelGap", "Gap at label", 0, 24, 0.5],
  ["targetGap", "Gap at target", 0, 24, 0.5],
];
const TOGGLE: Spec<keyof typeof ARROWS.toggle>[] = [
  ["reach", "Label distance", 8, 80, 1],
  ["labelGap", "Gap at label", 0, 24, 0.5],
  ["targetGap", "Gap at target", 0, 24, 0.5],
];
const SQUINT: Spec<keyof typeof ARROWS.squint>[] = [...BRUSH, ["length", "Length", 4, 40, 0.5]];

/** The knobs for the arrows a section draws. Squint and hero arrows live in one section each. */
function knobsOf(key: string, el: HTMLElement): Knob[] {
  const own = SECTIONS.get(key) ?? {};
  SECTIONS.set(key, own);
  const targets = [...el.querySelectorAll("[data-hint]")];
  return [
    ...(targets.length ? bind("hint", ARROWS.hint, (own.hint ??= {}), HINT) : []),
    ...(targets.some((t) => !t.closest("figure[data-side]"))
      ? bind("toggle", ARROWS.toggle, (own.toggle ??= {}), TOGGLE)
      : []),
    ...(el.querySelector('[data-arrow="squint"]')
      ? bind("squint", ARROWS.squint, ARROWS.squint, SQUINT)
      : []),
    ...(key === "hero" ? bind("hero", ARROWS.hero, ARROWS.hero, BRUSH) : []),
  ];
}

type Section = { key: string; el: HTMLElement; title: string; knobs: Knob[] };

const PREFIX = "arrows-tuner:";
const stored = (section: string, k: Knob) => `${PREFIX}${section}|${k.family}|${k.key}`;
const round = (v: number) => +v.toFixed(3);
const sections = new Map<string, Section>();

/** Finds the sections on the page, binding each new one to its saved values. */
function survey() {
  for (const el of document.querySelectorAll<HTMLElement>("[data-arrows]")) {
    const key = el.dataset.arrows ?? "";
    const known = sections.get(key);
    if (known) {
      known.el = el;
      continue;
    }
    const knobs = knobsOf(key, el);
    if (!knobs.length) continue;
    try {
      for (const k of knobs) {
        const v = localStorage.getItem(stored(key, k));
        if (v !== null && Number.isFinite(Number(v))) k.write(Number(v));
      }
    } catch {}
    const title = key === "hero" ? "Hero" : (el.querySelector("h3")?.textContent ?? key);
    sections.set(key, { key, el, title, knobs });
  }
}

/** Repaints a drawn arrow: its mask's centreline, the head a hero ghost keeps whole, and its ink. */
function repaint(arrow: Element, { ink, spine, reveal }: BrushArrow, head?: string) {
  const [line, cap] = arrow.querySelectorAll("mask path");
  for (const path of [line, cap]) path?.setAttribute("stroke-width", String(reveal));
  line?.setAttribute("d", spine);
  if (head) cap?.setAttribute("d", head);
  arrow.querySelector(":scope > path")?.setAttribute("d", ink);
}

/** Redraws every arrow on the page from the registry. */
function apply() {
  const squint = downArrow(ARROWS.squint);
  for (const svg of document.querySelectorAll<SVGSVGElement>('svg[data-arrow="squint"]')) {
    svg.setAttribute("viewBox", `0 0 ${squint.width} ${squint.height}`);
    svg.setAttribute("width", String(squint.width));
    svg.setAttribute("height", String(squint.height));
    repaint(svg, squint);
  }
  for (const g of document.querySelectorAll<SVGGElement>('g[data-arrow="route"]')) {
    const arrow = routeGhost(Number(g.dataset.y));
    repaint(g, arrow, arrow.head);
  }
  for (const g of document.querySelectorAll<SVGGElement>('g[data-arrow="retry"]')) {
    const arrow = retryGhost();
    repaint(g, arrow, arrow.head);
  }
  window.dispatchEvent(new Event(ARROWS_CHANGED));
}

/** Every edit saved on any page, by section then family, in the shape to paste back. */
function edits() {
  const out: Record<string, Record<string, Record<string, number>>> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i) ?? "";
      if (!name.startsWith(PREFIX)) continue;
      const [section = "", family = "", key = ""] = name.slice(PREFIX.length).split("|");
      const v = round(Number(localStorage.getItem(name)));
      const knob = sections.get(section)?.knobs.find((k) => k.family === family && k.key === key);
      if (knob && v === round(knob.initial)) continue;
      ((out[section] ??= {})[family] ??= {})[key] = v;
    }
  } catch {}
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

  const pick = document.createElement("select");
  pick.style.cssText = "display:block;width:100%;font:inherit;margin-top:4px;padding:4px";
  const groups = document.createElement("div");
  const out = document.createElement("textarea");
  out.readOnly = true;
  out.rows = 5;
  out.style.cssText =
    "width:100%;box-sizing:border-box;font:11px/1.4 ui-monospace, monospace;margin-top:8px";
  const showOut = () => {
    out.value = JSON.stringify(edits(), null, 2);
  };

  const row = (section: Section, k: Knob) => {
    const line = document.createElement("label");
    line.style.cssText =
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
      input.value = String(round(k.read()));
      input.addEventListener("input", () => {
        const v = Number(input.value);
        if (input.value === "" || !Number.isFinite(v)) return;
        k.write(v);
        (input === number ? range : number).value = String(v);
        try {
          localStorage.setItem(stored(section.key, k), String(v));
        } catch {}
        showOut();
        apply();
      });
    }
    line.append(name, number, range);
    return line;
  };

  let current: Section | undefined;
  const select = (section: Section | undefined, again = false) => {
    if (section === current && !again) return;
    current?.el.style.removeProperty("outline");
    current?.el.style.removeProperty("outline-offset");
    current = section;
    pick.value = section?.key ?? "";
    groups.replaceChildren();
    if (!section) return;
    section.el.style.outline = "2px dashed #2f6fed";
    section.el.style.outlineOffset = "6px";
    for (const family of new Set(section.knobs.map((k) => k.family))) {
      const group = document.createElement("fieldset");
      group.style.cssText = "border:0;border-top:1px solid #0001;margin:8px 0 0;padding:8px 0 0";
      const legend = document.createElement("legend");
      legend.textContent = TITLES[family];
      legend.style.cssText = "font-weight:600;padding:0";
      group.append(legend);
      for (const k of section.knobs) if (k.family === family) group.append(row(section, k));
      groups.append(group);
    }
  };

  let held = 0;
  pick.addEventListener("change", () => {
    const section = sections.get(pick.value);
    select(section);
    held = performance.now() + 1000;
    section?.el.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  // The section the panel edits follows the page: the one nearest the middle of the screen. A
  // section picked from the list holds while the page scrolls to it, as one near the end of the
  // page can't reach the middle.
  let frame = 0;
  const follow = () => {
    cancelAnimationFrame(frame);
    if (performance.now() < held) return;
    frame = requestAnimationFrame(() => {
      const middle = innerHeight / 2;
      const off = (r: DOMRect) => Math.max(0, r.top - middle, middle - r.bottom);
      const nearest = [...sections.values()]
        .map((s) => ({ s, r: s.el.getBoundingClientRect() }))
        .filter(({ r }) => r.height > 0)
        .sort((a, b) => off(a.r) - off(b.r))[0];
      select(nearest?.s);
    });
  };
  addEventListener("scroll", follow, { passive: true });

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
  const restore = (section: Section) => {
    for (const k of section.knobs) k.write(k.initial);
  };
  const redraw = () => {
    select(current, true);
    showOut();
    apply();
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
  const forget = (from: string) => {
    try {
      for (const name of Object.keys(localStorage))
        if (name.startsWith(from)) localStorage.removeItem(name);
    } catch {}
  };
  button("Reset section", () => {
    if (current) {
      restore(current);
      forget(`${PREFIX}${current.key}|`);
    }
    redraw();
  });
  button("Reset all", () => {
    for (const section of sections.values()) restore(section);
    forget(PREFIX);
    redraw();
  });

  const label = document.createElement("label");
  label.textContent = "Section";
  label.style.cssText = "display:block;margin-top:8px;font-weight:600";
  label.append(pick);
  box.append(summary, label, groups, bar, out);
  document.body.append(box);
  return () => {
    pick.replaceChildren(...[...sections.values()].map(({ key, title }) => new Option(title, key)));
    pick.value = current?.key ?? "";
    showOut();
    follow();
  };
}

survey();
const refresh = panel();
refresh();
apply();
// A lesson opened in place mounts fresh sections and arrows with the shipped values.
let pending = 0;
new MutationObserver((records) => {
  const fresh = records.some((r) =>
    [...r.addedNodes].some(
      (n) =>
        n instanceof Element &&
        (n.matches("[data-arrow], [data-arrows]") ||
          n.querySelector("[data-arrow], [data-arrows]")),
    ),
  );
  if (!fresh) return;
  cancelAnimationFrame(pending);
  pending = requestAnimationFrame(() => {
    survey();
    refresh();
    apply();
  });
}).observe(document.body, { childList: true, subtree: true });
