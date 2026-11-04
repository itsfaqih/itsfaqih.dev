// Computed-style parity of two built sites. usage: vp node site-diff.mjs <baseDist> <newDist> <out.json> [routes=/,/cv] [widths=390,1440] [themes=dark,light] [motion=reduce,full] [pointer=fine,coarse] [conc=4]
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const pw = require("playwright");
const [baseDir, newDir, outF, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((x) => x.split("=")));
const ROUTES = (opt.routes ?? "/,/blog,/blog/hello-world,/cv,/rule-of-thumb,/rule-of-thumb/button-design,/rule-of-thumb/data-loading,/rule-of-thumb/dialog-design,/rule-of-thumb/handling-timestamps,/rule-of-thumb/null-vs-undefined,/rule-of-thumb/proximity-principle,/rule-of-thumb/table-design,/rule-of-thumb/typescript-code-writing,/404").split(",");
const WIDTHS = (opt.widths ?? "1440,961,959,820,641,639,480,390").split(",").map(Number);
const THEMES = (opt.themes ?? "dark,light").split(",");
const MOTION = (opt.motion ?? "reduce").split(",");
const POINTER = (opt.pointer ?? "fine").split(",");
const FORCE = (opt.force ?? "none").split(",");
const CONC = Number(opt.conc ?? 4);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2", json: "application/json", ico: "image/x-icon", pdf: "application/pdf", md: "text/markdown", txt: "text/plain" };
const serve = (dir) => new Promise((res) => {
  const s = createServer((q, a) => {
    const u = decodeURIComponent(new URL(q.url, "http://x").pathname);
    let f = path.join(dir, u);
    if (u === "/") f = path.join(dir, "index.html");
    else if (!existsSync(f) || statSync(f).isDirectory()) f = `${f}.html`;
    if (!existsSync(f)) { a.writeHead(404); return a.end(); }
    a.writeHead(200, { "content-type": MIME[f.split(".").pop()] ?? "application/octet-stream" });
    a.end(readFileSync(f));
  }).listen(0, "127.0.0.1", () => res({ s, url: `http://127.0.0.1:${s.address().port}` }));
});
const init = (theme) => {
  localStorage.setItem("theme", theme);
  sessionStorage.setItem("intro-seen", "1");
  let seed = 42;
  Math.random = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const collect = () => {
  const hash = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
  const kf = {};
  for (const sheet of document.styleSheets) { const walk = (rules) => { for (const r of rules) { if (r.type === CSSRule.KEYFRAMES_RULE) { kf[r.name] = hash([...r.cssRules].map((f) => { const t = f.style.cssText.replace(/,\s*/g, ",").split(/;\s*/).filter(Boolean).sort().join(";"); return `${f.keyText}{${t}}`; }).join("")); } else if (r.cssRules) walk(r.cssRules); } }; try { walk(sheet.cssRules); } catch {} }
  const canon = (name) => name.split(",").map((n) => { const k = kf[n.trim()]; return k ? `kf_${k}` : n.trim(); }).join(",");
  const list = [...document.querySelectorAll("*")].filter((e) => !["HEAD", "SCRIPT", "STYLE", "META", "LINK", "TITLE", "NOSCRIPT"].includes(e.tagName) && !e.closest("head"));
  const styleOf = (e, pe) => { const cs = getComputedStyle(e, pe); if (pe && cs.content === "none") return null; const o = []; for (let i = 0; i < cs.length; i++) { const p = cs[i]; if (p.startsWith("--lightningcss")) continue; let v = cs.getPropertyValue(p); if (p === "animation-name") v = canon(v); if (p.startsWith("--")) v = v.replace(/\s*,\s*/g, ",").replace(/\s+/g, " ").replace(/(^|[\s,(])0\./g, "$1.").replace(/"/g, "'").trim().toLowerCase(); v = v.split(location.origin).join(""); if (p === "background-position") v = v.replace(/(^|[\s,])0%/g, "$10px"); o.push(`${p}\u0001${v}`); } o.sort(); return o.join("\u0002"); };
  const clean = (v) => v.replace(/\/_astro\/[^"' )]+/g, "/_astro/x");
  const struct = list.map((e) => `${e.tagName}|${[...e.attributes].filter((a) => a.name !== "class").map((a) => `${a.name}=${clean(a.value)}`).sort().join("&")}`);
  const hashes = list.map((e) => `${hash(styleOf(e) ?? "")}.${hash(styleOf(e, "::before") ?? "")}.${hash(styleOf(e, "::after") ?? "")}`);
  window.__diff = { list, styleOf };
  return { struct, hashes };
};
const detail = (ids) => ids.map((i) => { const { list, styleOf } = window.__diff; const e = list[i]; const path = []; for (let x = e; x && x !== document.documentElement && path.length < 4; x = x.parentElement) path.unshift(`${x.tagName.toLowerCase()}${x.id ? `#${x.id}` : ""}`); return { path: path.join(">"), text: (e.textContent ?? "").trim().slice(0, 30), attrs: [...e.attributes].filter((a) => a.name !== "class").map((a) => `${a.name}=${a.value}`).join(" ").slice(0, 80), el: styleOf(e), b: styleOf(e, "::before"), a: styleOf(e, "::after") }; });
const propsDiff = (x, y) => { if (x === y) return []; if (!x || !y) return [["<presence>", x ? "has" : "none", y ? "has" : "none"]]; const pm = (t) => new Map(t.split("\u0002").map((s) => s.split("\u0001"))); const m = pm(x), n = pm(y); const out = []; for (const p of new Set([...m.keys(), ...n.keys()])) if (m.get(p) !== n.get(p)) out.push([p, m.get(p), n.get(p)]); return out; };
const main = async () => {
  const [bs, ns] = await Promise.all([serve(baseDir), serve(newDir)]);
  const browser = await pw[opt.engine ?? "chromium"].launch();
  const jobs = [];
  for (const route of ROUTES) for (const width of WIDTHS) for (const theme of THEMES) for (const motion of MOTION) for (const pointer of POINTER) for (const force of FORCE) jobs.push({ route, width, theme, motion, pointer, force });
  const open = async (url, j) => {
    const ctx = await browser.newContext({ viewport: { width: j.width, height: j.width < 600 ? 844 : 900 }, colorScheme: j.theme, reducedMotion: j.motion === "reduce" ? "reduce" : "no-preference", deviceScaleFactor: 1, hasTouch: j.pointer === "coarse", isMobile: j.pointer === "coarse" });
    await ctx.addInitScript(init, j.theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.clock.setFixedTime(new Date("2026-01-15T09:30:00Z"));
    await page.goto(url + j.route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 420) { await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y); await page.waitForTimeout(Number(opt.step ?? 40)); }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    await page.evaluate(() => { for (const a of document.getAnimations()) { try { a.finish(); } catch { a.pause(); a.currentTime = 0; } } });
    await page.waitForTimeout(60);
    await page.evaluate(() => { for (const a of document.getAnimations()) { try { a.finish(); } catch { a.pause(); a.currentTime = 0; } } });
    const settleOnly = () => page.evaluate(() => { for (const a of document.getAnimations()) { try { a.finish(); } catch { a.pause(); a.currentTime = 0; } } });
    if ((opt.engine ?? "chromium") !== "chromium") return { ctx, page, errors, settle: settleOnly };
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
    const force = async (sel, states) => { const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: sel }); await Promise.all(nodeIds.map((nodeId) => cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: states }))); return nodeIds; };
    const settle = () => page.evaluate(() => { for (const a of document.getAnimations()) { try { a.finish(); } catch { a.pause(); a.currentTime = 0; } } });
    if (j.force !== "none" && !j.force.startsWith("one-")) { await force("body, body *", j.force.split("+")); await settle(); await page.waitForTimeout(40); await settle(); }
    return { ctx, page, errors, cdp, settle };
  };
  const INTERACTIVE = "a,button,[role],summary,input,textarea,select,label";
  const collectOne = ({ i, sel }) => { const hash = (s) => { let h = 0x811c9dc5; for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); }; const e = document.querySelectorAll(sel)[i]; const root = e.parentElement ?? e; const out = []; const raw = []; const clean = (cs) => { const o = []; for (let k = 0; k < cs.length; k++) { const p = cs[k]; if (p.startsWith("--lightningcss") || p === "animation-name" || p === "--cut-order") continue; let v = cs.getPropertyValue(p); if (p.startsWith("--")) v = v.replace(/\s*,\s*/g, ",").replace(/\s+/g, " ").replace(/(^|[\s,(])0\./g, "$1.").replace(/"/g, "'").trim().toLowerCase(); if (p === "background-position") v = v.replace(/(^|[\s,])0%/g, "$10px"); o.push(p + ":" + v.split(location.origin).join("").replace(/\/_astro\/[^"' )]+/g, "x")); } return o.sort().join(";"); }; for (const x of [root, ...root.querySelectorAll("*")]) { const t = clean(getComputedStyle(x)) + clean(getComputedStyle(x, "::before")) + clean(getComputedStyle(x, "::after")); out.push(hash(t)); raw.push(t); } return { tag: e.tagName + " " + (e.getAttribute("aria-label") ?? e.textContent ?? "").trim().slice(0, 40), h: out, raw }; };
  const oneByOne = async (a, b, state) => {
    const pick = (x) => x.page.evaluate((sel) => document.querySelectorAll(sel).length, INTERACTIVE);
    const n = Math.min(await pick(a), await pick(b));
    const bad = [];
    for (const x of [a, b]) { x.dom = await x.cdp.send("DOM.getDocument", { depth: 0 }); x.ids = (await x.cdp.send("DOM.querySelectorAll", { nodeId: x.dom.root.nodeId, selector: INTERACTIVE })).nodeIds; }
    for (let i = 0; i < n; i++) {
      const read = async (x) => { await x.cdp.send("CSS.forcePseudoState", { nodeId: x.ids[i], forcedPseudoClasses: [state] }); await x.settle(); await x.page.waitForTimeout(0); await x.settle(); const r = await x.page.evaluate(collectOne, { i, sel: INTERACTIVE }); await x.cdp.send("CSS.forcePseudoState", { nodeId: x.ids[i], forcedPseudoClasses: [] }); return r; };
      const [ra, rb] = await Promise.all([read(a), read(b)]);
      const off = ra.h.flatMap((h, k) => (h === rb.h[k] ? [] : [k]));
      if (off.length && process.env.ONE_DEBUG && !bad.length) { const A = (ra.raw[off[0]] ?? "").split(";"), B = (rb.raw[off[0]] ?? "").split(";"); console.log("ONE_DEBUG", ra.tag, off.length, A.filter((x, z) => x !== B[z]).slice(0, 8).join(" # ").slice(0, 900), "||", B.filter((x, z) => x !== A[z]).slice(0, 8).join(" # ").slice(0, 900)); }
      if (off.length || ra.h.length !== rb.h.length) bad.push({ i, tag: ra.tag, off: off.length, first: off.slice(0, 5) });
    }
    return { n, bad };
  };
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const label = `${j.route} ${j.width} ${j.theme} ${j.motion} ${j.pointer} ${j.force}`;
      try {
        const [a, b] = await Promise.all([open(bs.url, j), open(ns.url, j)]);
        if (j.force.startsWith("one-")) { const r = await oneByOne(a, b, j.force.slice(4)); results.push({ job: j, label, ...r, mismatched: r.bad.length }); console.log(`${label}: ${r.n} targets, ${r.bad.length} differ`); await Promise.all([a.ctx.close(), b.ctx.close()]); continue; }
        const [ra, rb] = await Promise.all([a.page.evaluate(collect), b.page.evaluate(collect)]);
        const r = { job: j, label, n: ra.struct.length, m: rb.struct.length, errors: { base: a.errors, new: b.errors }, struct: [], diffs: [] };
        const count = Math.min(ra.struct.length, rb.struct.length);
        for (let i = 0; i < count && r.struct.length < 10; i++) if (ra.struct[i] !== rb.struct[i]) r.struct.push({ i, base: ra.struct[i].slice(0, 200), new: rb.struct[i].slice(0, 200) });
        const ids = [];
        if (ra.struct.length === rb.struct.length) for (let i = 0; i < count; i++) if (ra.hashes[i] !== rb.hashes[i]) ids.push(i);
        r.mismatched = ids.length;
        const take = ids.slice(0, 200);
        const [da, db] = await Promise.all([a.page.evaluate(detail, take), b.page.evaluate(detail, take)]);
        take.forEach((id, k) => {
          const d = { path: da[k].path, text: da[k].text, attrs: da[k].attrs, el: propsDiff(da[k].el, db[k].el), b: propsDiff(da[k].b, db[k].b), a: propsDiff(da[k].a, db[k].a) };
          r.diffs.push(d);
        });
        results.push(r);
        console.log(`${label}: ${r.n} els, ${r.struct.length} struct, ${r.mismatched} style, errors ${a.errors.length}/${b.errors.length}`);
        await Promise.all([a.ctx.close(), b.ctx.close()]);
      } catch (e) { console.log(`${label}: FAILED ${e.message.slice(0, 200)}`); results.push({ label, failed: e.message }); }
    }
  };
  await Promise.all(Array.from({ length: CONC }, worker));
  await browser.close(); bs.s.close(); ns.s.close();
  writeFileSync(outF, JSON.stringify(results));
  const props = {};
  for (const r of results) for (const d of r.diffs ?? []) for (const kind of ["el", "b", "a"]) for (const [p] of d[kind]) props[`${kind}:${p}`] = (props[`${kind}:${p}`] ?? 0) + 1;
  console.log("total style mismatches", results.reduce((n, r) => n + (r.mismatched ?? 0), 0), "struct", results.reduce((n, r) => n + (r.struct?.length ?? 0), 0));
  console.log(Object.entries(props).sort((x, y) => y[1] - x[1]).slice(0, 25).map(([k, v]) => `${k} ${v}`).join("\n"));
};
main();
