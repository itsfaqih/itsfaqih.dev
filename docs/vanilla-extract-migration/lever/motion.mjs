// Compares motion on two built sites: live animations and transitions, scrubbed frames, canvases, and full computed style after each scripted step.
// usage: vp node motion.mjs <baseDist> <newDist> <out.json> [conc=3] [only=substring] [widths=1440,390] [themes=dark,light]
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = require("playwright");
const [baseDir, newDir, outF, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((x) => x.split("=")));
const CONC = Number(opt.conc ?? 3);
const WIDTHS = (opt.widths ?? "1440,390").split(",").map(Number);
const THEMES = (opt.themes ?? "dark,light").split(",");
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2", json: "application/json", ico: "image/x-icon", pdf: "application/pdf" };
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
const init = ({ theme, seen }) => {
  localStorage.setItem("theme", theme);
  if (seen) sessionStorage.setItem("intro-seen", "1");
  let seed = 42;
  Math.random = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const snap = () => {
  const hash = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
  const clean = (v) => String(v).split(location.origin).join("").replace(/,\s*/g, ",").replace(/\s+/g, " ").replace(/(^|[\s,(])0\./g, "$1.").replace(/"/g, "'").trim();
  const pathOf = (e) => { const p = []; for (let n = e; n && n.parentElement; n = n.parentElement) p.unshift(`${n.tagName.toLowerCase()}${[...n.parentElement.children].indexOf(n)}`); return p.join(">"); };
  const short = (e) => { const p = []; for (let n = e; n && n.parentElement && p.length < 4; n = n.parentElement) p.unshift(n.tagName.toLowerCase()); return p.join(">"); };
  const style = (e, pe) => { const cs = getComputedStyle(e, pe); const o = []; for (let i = 0; i < cs.length; i++) { const p = cs[i]; if (p.startsWith("--lightningcss") || p === "animation-name" || p === "transition-behavior") continue; let v = cs.getPropertyValue(p); if (p === "background-position") v = v.replace(/(^|[\s,])0%/g, "$10px"); o.push(`${p}\u0001${clean(v)}`); } o.sort(); return o.join("\u0002"); };
  const anims = document.getAnimations().filter((a) => a.effect?.target?.isConnected);
  const describe = (a) => {
    const t = a.effect.getTiming();
    const kfs = a.effect.getKeyframes();
    const frames = (a.constructor.name === "CSSTransition" ? kfs.slice(-1) : kfs).map((k) => Object.entries(k).filter(([p]) => p !== "computedOffset").map(([p, v]) => `${p}:${clean(v)}`).sort().join(";")).join("|");
    return { key: `${pathOf(a.effect.target)}${a.effect.pseudoElement ?? ""}`, where: short(a.effect.target), kind: a.constructor.name, prop: a.transitionProperty ?? "", state: a.playState, timing: `${t.delay}/${t.duration}/${clean(t.easing)}/${t.iterations}/${t.fill}/${t.direction}/${t.endDelay}`, frames };
  };
  const list = anims.map(describe).sort((x, y) => `${x.key}${x.kind}${x.prop}${x.frames}`.localeCompare(`${y.key}${y.kind}${y.prop}${y.frames}`));
  const targets = [...new Set(anims.map((a) => a.effect.target))];
  const frames = [];
  for (const a of anims) a.pause();
  for (const f of [0, 0.25, 0.5, 0.75, 0.999]) {
    for (const a of anims) { const t = a.effect.getTiming(); const d = typeof t.duration === "number" ? t.duration : 0; a.currentTime = t.delay + f * d; }
    frames.push(targets.map((e) => { const pe = anims.filter((a) => a.effect.target === e).map((a) => a.effect.pseudoElement).find(Boolean); return { p: pathOf(e), h: hash(style(e, pe ?? undefined)), s: short(e) }; }));
  }
  const frameProbe = (f) => frames[f];
  const canvases = [...document.querySelectorAll("canvas")].map((c) => { try { return hash(c.toDataURL()); } catch { return "x"; } });
  for (const a of anims) { if (a.effect.getTiming().iterations === Infinity) { a.currentTime = 0; a.play(); } else a.finish(); }
  return { list, frames, canvases };
};
const settle = () => { for (const a of document.getAnimations()) { if (a.effect?.getTiming().iterations === Infinity) { a.pause(); a.currentTime = 0; } else { try { a.finish(); } catch {} } } return document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity && a.playState === "running").length; };
const pageHash = () => {
  const hash = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
  const clean = (v) => String(v).split(location.origin).join("").replace(/,\s*/g, ",").replace(/\s+/g, " ").replace(/(^|[\s,(])0\./g, "$1.").replace(/"/g, "'").trim();
  const pathOf = (e) => { const p = []; for (let n = e; n && n.parentElement; n = n.parentElement) p.unshift(`${n.tagName.toLowerCase()}${[...n.parentElement.children].indexOf(n)}`); return p.join(">"); };
  const short = (e) => { const p = []; for (let n = e; n && n.parentElement && p.length < 4; n = n.parentElement) p.unshift(n.tagName.toLowerCase()); return p.join(">"); };
  const style = (e, pe) => { const cs = getComputedStyle(e, pe); const o = []; for (let i = 0; i < cs.length; i++) { const p = cs[i]; if (p.startsWith("--lightningcss") || p === "animation-name" || p === "transition-behavior") continue; let v = cs.getPropertyValue(p); if (p === "background-position") v = v.replace(/(^|[\s,])0%/g, "$10px"); o.push(`${p}\u0001${clean(v)}`); } o.sort(); return o.join("\u0002"); };
  const all = [...document.querySelectorAll("body *")].filter((e) => !["SCRIPT", "STYLE", "NOSCRIPT"].includes(e.tagName));
  return all.map((e) => ({ p: pathOf(e), h: hash(style(e) + (getComputedStyle(e, "::before").content !== "none" ? style(e, "::before") : "") + (getComputedStyle(e, "::after").content !== "none" ? style(e, "::after") : "")), s: short(e) }));
};
const detail = ({ p }) => {
  const e = [...document.querySelectorAll("body *")].find((n) => { const q = []; for (let m = n; m && m.parentElement; m = m.parentElement) q.unshift(`${m.tagName.toLowerCase()}${[...m.parentElement.children].indexOf(m)}`); return q.join(">") === p; });
  if (!e) return null;
  const read = (pe) => { const cs = getComputedStyle(e, pe); const o = {}; for (let i = 0; i < cs.length; i++) o[cs[i]] = cs.getPropertyValue(cs[i]); return o; };
  return { el: read(), before: read("::before"), after: read("::after"), cls: e.getAttribute("class")?.slice(0, 160) };
};
const click = (sel) => async (page) => { const l = page.locator(sel).first(); if (await l.count()) await l.click({ force: true, timeout: 3000 }).catch(() => {}); };
const SCENES = [
  { name: "home intro", route: "/", seen: false, steps: [["load"], ["tick", 200], ["tick", 600], ["tick", 1500], ["tick", 3000], ["tick", 6000], ["tick", 12000]] },
  { name: "home hero loop", route: "/", seen: true, steps: [["load"], ["tick", 1000], ["tick", 3000], ["tick", 6000], ["tick", 12000], ["tick", 24000]] },
  { name: "home rows", route: "/", seen: true, widths: [1440, 961, 959, 390], steps: [["load"], ["act", click("[aria-expanded='false']:not(header *)")], ["tick", 120], ["tick", 600], ["act", click("[aria-expanded='true']:not(header *)")], ["tick", 120], ["tick", 600]] },
  { name: "home scroll cut-ins", route: "/", seen: true, steps: [["load"], ["act", (p) => p.evaluate(() => document.querySelectorAll("[data-cut]").forEach((e, i) => e.scrollIntoView({ block: "center", behavior: "instant" })))], ["tick", 100], ["tick", 500], ["act", (p) => p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }))], ["tick", 500]] },
  { name: "palette", route: "/", seen: true, steps: [["load"], ["act", (p) => p.keyboard.press("Control+k")], ["tick", 120], ["tick", 500], ["act", (p) => p.keyboard.press("ArrowDown")], ["tick", 200], ["act", (p) => p.keyboard.press("ArrowRight")], ["tick", 300], ["act", (p) => p.keyboard.press("Escape")], ["tick", 120], ["tick", 700]] },
  { name: "theme switch", route: "/", seen: true, steps: [["load"], ["act", click("button[aria-label='Switch theme']")], ["tick", 100], ["tick", 800]] },
  { name: "rule index", route: "/rule-of-thumb", seen: true, steps: [["load"], ["act", (p) => p.locator("main a[href*='/rule-of-thumb/']").first().hover({ force: true, timeout: 3000 }).catch(() => {})], ["tick", 200], ["tick", 800]] },
  { name: "timestamps quiz", route: "/rule-of-thumb/handling-timestamps", seen: true, steps: [["load"], ["act", (p) => p.locator("article#lv-1").scrollIntoViewIfNeeded().catch(() => {})], ["tick", 400], ["act", click("article#lv-1 button")], ["tick", 200], ["tick", 900]] },
  { name: "dialog design", route: "/rule-of-thumb/dialog-design", seen: true, steps: [["load"], ["act", click("figure[data-side='good'] button")], ["tick", 200], ["tick", 700]] },
  { name: "button design", route: "/rule-of-thumb/button-design", seen: true, steps: [["load"], ["tick", 500], ["act", click("main button")], ["tick", 200], ["tick", 900]] },
  { name: "data loading", route: "/rule-of-thumb/data-loading", seen: true, steps: [["load"], ["tick", 1500], ["tick", 4000]] },
  { name: "table design", route: "/rule-of-thumb/table-design", seen: true, steps: [["load"], ["tick", 1000]] },
  { name: "null vs undefined", route: "/rule-of-thumb/null-vs-undefined", seen: true, steps: [["load"], ["tick", 1500]] },
  { name: "proximity", route: "/rule-of-thumb/proximity-principle", seen: true, steps: [["load"], ["tick", 1000]] },
  { name: "ts code", route: "/rule-of-thumb/typescript-code-writing", seen: true, steps: [["load"], ["tick", 1500]] },
  { name: "blog toc", route: "/blog/hello-world", seen: true, steps: [["load"], ["act", click("toc-drawer [data-part='trigger']")], ["tick", 150], ["tick", 700], ["act", (p) => p.keyboard.press("Escape")], ["tick", 700]] },
  { name: "cv ats", route: "/cv", seen: true, steps: [["load"], ["act", click("cv-page input, cv-page [role='switch'], cv-page button")], ["tick", 200], ["tick", 700]] },
  { name: "404", route: "/does-not-exist", file: "/404", seen: true, steps: [["load"], ["tick", 500]] },
].filter((s) => !opt.only || s.name.includes(opt.only));
const main = async () => {
  const [bs, ns] = await Promise.all([serve(baseDir), serve(newDir)]);
  const browser = await chromium.launch();
  const jobs = [];
  for (const s of SCENES) for (const width of s.widths ?? WIDTHS) for (const theme of THEMES) jobs.push({ s, width, theme, pointer: "fine" });
  for (const name of ["home rows", "palette", "home hero loop"]) { const s = SCENES.find((x) => x.name === name); if (s) jobs.push({ s, width: 390, theme: "dark", pointer: "coarse" }); }
  const open = async (url, j) => {
    const ctx = await browser.newContext({ viewport: { width: j.width, height: 900 }, colorScheme: j.theme, reducedMotion: "no-preference", hasTouch: j.pointer === "coarse", isMobile: j.pointer === "coarse" });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.clock.install({ time: new Date("2026-01-15T09:30:00Z") });
    await page.clock.pauseAt(new Date("2026-01-15T09:30:01Z"));
    await page.addInitScript(init, { theme: j.theme, seen: j.s.seen });
    await page.goto(url + (j.s.file ?? j.s.route), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready.then(() => 1));
    await page.waitForTimeout(250);
    return { ctx, page, errors };
  };
  const results = []; let next = 0;
  const compareSnap = async (A, B, a, b, label, out) => {
    if (a.list.length !== b.list.length) out.push({ label, type: "anim-count", base: a.list.length, new: b.list.length, onlyBase: a.list.filter((x) => !b.list.some((y) => y.key === x.key && y.prop === x.prop)).slice(0, 3).map((x) => [x.where, x.kind, x.prop]), onlyNew: b.list.filter((x) => !a.list.some((y) => y.key === x.key && y.prop === x.prop)).slice(0, 3).map((x) => [x.where, x.kind, x.prop]) });
    else a.list.forEach((x, i) => { const y = b.list[i]; for (const f of ["key", "kind", "prop", "timing", "frames"]) if (x[f] !== y[f]) { out.push({ label, type: `anim-${f}`, where: x.where, base: String(x[f]).slice(0, 240), new: String(y[f]).slice(0, 240) }); break; } });
    a.frames.forEach((fa, fi) => { const fb = b.frames[fi]; if (fa.length !== fb.length) return; fa.forEach((e, i) => { if (e.p === fb[i].p && e.h !== fb[i].h && out.filter((o) => o.type === "frame").length < 6) out.push({ label, type: "frame", frame: fi, where: e.s, p: e.p }); }); });
    if (a.canvases.join() !== b.canvases.join()) out.push({ label, type: "canvas", base: a.canvases, new: b.canvases });
    if (a.page.length !== b.page.length) out.push({ label, type: "page-count", base: a.page.length, new: b.page.length });
    else { const bad = a.page.filter((e, i) => e.h !== b.page[i].h || e.p !== b.page[i].p); if (bad.length) { const first = bad[0]; const [da, db] = await Promise.all([A.evaluate(detail, { p: first.p }), B.evaluate(detail, { p: first.p })]); const props = []; if (da && db) for (const kind of ["el", "before", "after"]) for (const k of Object.keys(da[kind])) if (da[kind][k] !== db[kind][k] && !k.startsWith("--lightningcss")) props.push([kind, k, da[kind][k]?.slice(0, 90), db[kind][k]?.slice(0, 90)]); out.push({ label, type: "page", count: bad.length, where: first.s, props: props.slice(0, 8) }); } }
  };
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const label = `${j.s.name} ${j.width} ${j.theme} ${j.pointer}`;
      const out = []; let anims = 0;
      try {
        const [a, b] = await Promise.all([open(bs.url, j), open(ns.url, j)]);
        let i = 0;
        for (const [kind, arg] of j.s.steps) {
          if (kind === "act") await Promise.all([arg(a.page), arg(b.page)]);
          if (kind === "tick") await Promise.all([a.page.clock.runFor(arg), b.page.clock.runFor(arg)]);
          await Promise.all([a.page.waitForTimeout(60), b.page.waitForTimeout(60)]);
          const [sa, sb] = await Promise.all([a.page.evaluate(snap), b.page.evaluate(snap)]);
          for (let k = 0; k < 6; k++) { await Promise.all([a.page.waitForTimeout(40), b.page.waitForTimeout(40)]); await Promise.all([a.page.evaluate(settle), b.page.evaluate(settle)]); }
          [sa.page, sb.page] = await Promise.all([a.page.evaluate(pageHash), b.page.evaluate(pageHash)]);
          await Promise.all([a.page.evaluate(() => { for (const x of document.getAnimations()) if (x.playState === "paused") x.play(); }), b.page.evaluate(() => { for (const x of document.getAnimations()) if (x.playState === "paused") x.play(); })]);
          anims += sa.list.length;
          await compareSnap(a.page, b.page, sa, sb, `step${i}:${kind}${typeof arg === "number" ? arg : ""}`, out);
          i++;
        }
        if (a.errors.length || b.errors.length) out.push({ type: "errors", base: a.errors.slice(0, 3), new: b.errors.slice(0, 3) });
        await Promise.all([a.ctx.close(), b.ctx.close()]);
        results.push({ label, anims, diffs: out });
        console.log(`${label}: ${anims} anims, ${out.length} diffs`);
      } catch (e) { results.push({ label, failed: e.message.slice(0, 300) }); console.log(`${label}: FAILED ${e.message.slice(0, 160)}`); }
    }
  };
  await Promise.all(Array.from({ length: CONC }, worker));
  await browser.close(); bs.s.close(); ns.s.close();
  writeFileSync(outF, JSON.stringify(results));
  console.log("jobs", results.length, "with diffs", results.filter((r) => r.diffs?.length).length, "failed", results.filter((r) => r.failed).length, "anims seen", results.reduce((n, r) => n + (r.anims ?? 0), 0));
};
main();
