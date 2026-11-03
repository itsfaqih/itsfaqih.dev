// Compares computed styles of the two lab pages under every condition their style trees name.
// usage: vp node lab-run.mjs <base.html> <new.html> <raw.json> <out.json> [--quick]
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = require("playwright");
const [baseF, newF, rawF, outF, flag] = process.argv.slice(2);
const NS = JSON.parse(readFileSync(rawF, "utf8")).namespaces;

const norm = (css) => css
  .replace(/html:active-view-transition-type\([^)]*\)/g, "[data-f-html][data-f-avt]")
  .replace(/html\[data-vt/g, "[data-f-html][data-vt")
  .replace(/(?<!hover\s*):hover/g, "[data-f-hover]")
  .replace(/:active(?![-\w])/g, "[data-f-active]")
  .replace(/:focus-visible/g, "[data-f-fv]").replace(/:focus-within/g, "[data-f-fw]").replace(/:focus(?![-\w])/g, "[data-f-focus]")
  .replace(/:enabled/g, "[data-f-enabled]").replace(/:disabled/g, "[data-f-disabled]").replace(/:checked/g, "[data-f-checked]")
  .replace(/:first-child/g, "[data-f-first]").replace(/:last-child/g, "[data-f-last]").replace(/:empty/g, "[data-f-empty]")
  .replace(/:nth-child\(\s*([^)]+?)\s*\)/g, (_, a) => `[data-f-nth="${a === "even" ? "2n" : a === "odd" ? "2n+1" : a.replace(/\s/g, "")}"]`);
const LAB = `.lab-o{position:absolute;left:0;top:0;width:400px;height:300px;contain:strict;visibility:hidden}`;
const page = (f) => readFileSync(f, "utf8")
  .replace(/<script[\s\S]*?<\/script>/g, "").replace(/<link rel="modulepreload"[^>]*>/g, "")
  .replace(/<style>([\s\S]*?)<\/style>/g, (_, c) => `<style>${norm(c)}</style>`)
  .replace("</head>", `<style>${LAB}</style></head>`);

const stripNot = (s) => { let out = "", i = 0; while (i < s.length) { if (s.startsWith(":not(", i)) { let d = 1, j = i + 5; while (j < s.length && d) { if (s[j] === "(") d++; else if (s[j] === ")") d--; j++; } i = j; } else out += s[i++]; } return out; };
const atomsOf = (key) => {
  const k = norm(key.replace(/^@when:\w+:/, "").replace(/:(default|m\d+)$/, ""));
  const out = [];
  for (const m of stripNot(k).matchAll(/\.([A-Za-z_][\w-]*)|\[([\w-]+)(?:=['"]?([^'"\]]*)['"]?)?\]/g)) out.push(m[1] ? ["c", m[1]] : ["a", m[2], m[3] ?? ""]);
  return out;
};
const paths = (tree, conds = [], out = []) => {
  if (tree === null || typeof tree !== "object") { if (tree !== null) out.push(conds); return out; }
  for (const [k, v] of Object.entries(tree)) { if (k === "default") paths(v, conds, out); else paths(v, k.startsWith("@media") ? [...conds, k] : [...conds, k], out); }
  return out;
};
const treesOf = (raw, prefix = "", out = {}) => { for (const [k, v] of Object.entries(raw)) { if (k.startsWith("::")) treesOf(v, k, out); else (out[prefix + k] ??= []).push(v); } return out; };

const itemsFor = (key) => {
  const ids = key.split(" | ");
  const props = {}; let media = false, pseudo = false;
  for (const id of ids) { const t = treesOf(NS[id] ?? {}); for (const [p, l] of Object.entries(t)) { if (p.startsWith("::")) pseudo = true; (props[p] ??= []).push(...l); } if (JSON.stringify(NS[id] ?? {}).includes("@media")) media = true; if (JSON.stringify(NS[id]).includes('"::')) pseudo = true; }
  const acts = new Map(); const addAct = (a) => { const k = JSON.stringify(a); if (a.length) acts.set(k, a); };
  const scoped = (atoms, s) => atoms.map((x) => [s, ...x]);
  for (const list of Object.values(props)) {
    const ps = list.flatMap((t) => paths(t)).map((c) => c.filter((x) => !x.startsWith("@media"))).filter((c) => c.length);
    const uniq = [...new Map(ps.map((c) => [c.join(" & "), c])).values()].slice(0, 14);
    for (const c of uniq) {
      const atoms = c.flatMap(atomsOf);
      addAct(scoped(atoms, "all")); addAct(scoped(atoms, "self")); addAct(scoped(atoms, "up"));
      if (c.length > 1) for (let i = 0; i < c.length; i++) { const me = atomsOf(c[i]); const rest = c.filter((_, j) => j !== i).flatMap(atomsOf); addAct([...scoped(me, "self"), ...scoped(rest, "up")]); addAct([...scoped(me, "up"), ...scoped(rest, "self")]); }
    }
    for (let i = 0; i < uniq.length; i++) for (let j = i + 1; j < uniq.length; j++) { const atoms = [...uniq[i], ...uniq[j]].flatMap(atomsOf); addAct(scoped(atoms, "all")); addAct(scoped(atoms, "self")); }
  }
  return { key, acts: [...acts.values()], media, pseudo };
};

const inPage = async ({ items, full, cap }) => {
  const [A, B] = ["a", "b"].map((id) => document.getElementById(id).contentDocument);
  const collect = (doc) => { const props = new Set(), kf = new Map(); const walk = (rules) => { for (const r of rules) { if (r.type === 7) { kf.set(r.name, [...r.cssRules].map((x) => { const d = [...x.style].sort().map((p) => `${p}:${x.style.getPropertyValue(p)}${x.style.getPropertyPriority(p) ? "!" : ""}`).join(";"); return `${x.keyText}{${d}}`; }).join("")); continue; } if (r.style) for (const p of r.style) props.add(p); if (r.cssRules) walk(r.cssRules); } }; for (const s of doc.styleSheets) walk(s.cssRules); return { props, kf }; };
  const ca = collect(A), cb = collect(B);
  const props = [...new Set([...ca.props, ...cb.props])].filter((p) => !/^(-webkit-|cursor$)/.test(p) || p === "cursor").sort();
  const canon = (kf) => { const map = new Map(); for (const [n, body] of kf) map.set(n, "kf:" + body); return map; };
  const ma = canon(ca.kf), mb = canon(cb.kf);
  const fix = (v, m) => (v.includes("-") || m.size ? v.replace(/[A-Za-z_-][\w-]*/g, (t) => m.get(t) ?? t) : v);
  const MAP = (doc) => { const m = new Map(); for (const el of doc.querySelectorAll("[data-t]")) m.set(el.dataset.t, el); return m; };
  const EA = MAP(A), EB = MAP(B);
  const missing = items.filter((i) => !EA.has(i.key) || !EB.has(i.key)).map((i) => i.key);
  const targets = (el) => { const w = el.parentElement, o = w.parentElement, s = w.querySelector(".lab-s"), kids = [...el.children]; return { all: [o, w, s, el, ...kids], self: [el, ...kids], up: [o, w, s] }; };
  const apply = (el, act, on) => { const T = targets(el); for (const [scope, kind, name, val] of act) for (const n of T[scope]) { if (kind === "c") n.classList.toggle(name, on); else if (on) n.setAttribute(name, val); else n.removeAttribute(name); } };
  const settle = (el) => { for (const a of el.parentElement.parentElement.getAnimations({ subtree: true })) { try { a.finish(); } catch { a.cancel(); } } };
  const read = (win, el, pe, m) => { const cs = win.getComputedStyle(el, pe); const out = new Array(props.length); for (let i = 0; i < props.length; i++) out[i] = fix(cs.getPropertyValue(props[i]), m); return out; };
  let compared = 0, states = 0; const bad = []; const winA = A.defaultView, winB = B.defaultView;
  const same = (v, p) => {
    let x = String(v).replace(/\s*,\s*/g, ",").replace(/\s+/g, " ").trim();
    if (p.startsWith("background-position")) x = x.replace(/(^|,| )0%/g, "$10px");
    if (p.startsWith("--")) x = x.replace(/(^|[\s,(])0\./g, "$1.").replace(/"/g, "'").toLowerCase();
    return x;
  };
  for (const it of items) {
    const a = EA.get(it.key), b = EB.get(it.key); if (!a || !b) continue;
    const wholeRun = full || it.media;
    const acts = [[], ...(wholeRun ? it.acts : [])];
    const pes = it.pseudo ? [null, "::before", "::after"] : [null];
    for (const act of acts) {
      apply(a, act, true); apply(b, act, true); settle(a); settle(b); states++;
      for (const pe of pes) {
        const ra = read(winA, a, pe, ma), rb = read(winB, b, pe, mb); compared++;
        for (let i = 0; i < props.length; i++) if (same(ra[i], props[i]) !== same(rb[i], props[i])) { if (bad.length < cap) bad.push({ key: it.key, act, pe, prop: props[i], base: ra[i].slice(0, 200), next: rb[i].slice(0, 200) }); else bad.over = (bad.over ?? 0) + 1; }
      }
      apply(a, act, false); apply(b, act, false); settle(a); settle(b);
    }
  }
  return { props: props.length, compared, states, missing: missing.slice(0, 30), missingCount: missing.length, bad, over: bad.over ?? 0, kfA: ca.kf.size, kfB: cb.kf.size };
};

const base = page(baseF), next = page(newF);
const themes = (doc) => JSON.parse(doc.match(/data-themes="([^"]*)"/)[1].replaceAll("&quot;", '"'));
const items = [...new Set([...base.matchAll(/data-t="([^"]*)"/g)].map((m) => m[1].replaceAll("&quot;", '"').replaceAll("&#34;", '"')))].map(itemsFor);
console.log("elements", items.length, "activations", items.reduce((n, i) => n + i.acts.length, 0));
const WIDTHS = flag === "--quick" ? [1440, 390] : [1440, 961, 959, 820, 641, 639, 480, 390];
const browser = await chromium.launch();
const report = [];
for (const pointer of flag === "--quick" ? ["fine"] : ["fine", "coarse"]) {
  const ctx = await browser.newContext(pointer === "coarse" ? { hasTouch: true, isMobile: true, viewport: { width: 1600, height: 900 } } : { viewport: { width: 1600, height: 900 } });
  await ctx.route("http://lab.local/**", (r) => { const u = new URL(r.request().url()).pathname; if (u === "/a") return r.fulfill({ contentType: "text/html", body: base }); if (u === "/b") return r.fulfill({ contentType: "text/html", body: next }); if (u === "/") return r.fulfill({ contentType: "text/html", body: `<!doctype html><iframe id=a src="/a" style="position:absolute;height:900px;width:1440px"></iframe><iframe id=b src="/b" style="position:absolute;height:900px;width:1440px"></iframe>` }); return r.fulfill({ status: 404, body: "" }); });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("pageerror", e.message));
  await p.goto("http://lab.local/", { waitUntil: "load" });
  const A = themes(readFileSync(baseF, "utf8")), B = themes(readFileSync(newF, "utf8"));
  for (const reduce of ["no-preference", "reduce"]) for (const theme of ["dark", "light"]) for (const w of WIDTHS) {
    if (reduce === "reduce" && ![1440, 390].includes(w)) continue;
    await p.emulateMedia({ reducedMotion: reduce });
    await p.evaluate(({ w, theme, A, B }) => { for (const [id, T] of [["a", A], ["b", B]]) { const f = document.getElementById(id); f.style.width = w + "px"; const c = f.contentDocument.documentElement.classList; c.remove(...T.light, ...T.dark); c.add(...T[theme]); } }, { w, theme, A, B });
    const full = pointer === "fine" && reduce === "no-preference" && theme === "dark" && w === 1440;
    const t = Date.now();
    const r = await p.evaluate(inPage, { items, full, cap: 3000 });
    const mode = `${pointer} ${reduce} ${theme} ${w}`;
    console.log(mode, { compared: r.compared, states: r.states, props: r.props, mismatches: r.bad.length + r.over, missing: r.missingCount, ms: Date.now() - t });
    report.push({ mode, ...r });
    writeFileSync(outF, JSON.stringify(report));
  }
  await ctx.close();
}
await browser.close();
const tot = report.reduce((n, r) => n + r.bad.length + r.over, 0);
console.log({ modes: report.length, comparisons: report.reduce((n, r) => n + r.compared, 0), mismatches: tot });
