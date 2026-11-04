import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [base, next, out, runs = "5", route = "/"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(base), new: await serve(next) };
const browser = await chromium.launch();
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] ?? null; };
const rows = []; const sel = { base: new Map(), new: new Map() };
for (let i = 0; i < +runs; i++) for (const k of i % 2 ? ["new", "base"] : ["base", "new"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}${route}`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(page);
  const events = [];
  cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
  await cdp.send("Tracing.start", { transferMode: "ReportEvents", categories: "devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-blink.debug" });
  const js = await page.evaluate(() => { const r = document.documentElement, t = []; for (let n = 0; n < 20; n++) { const s = performance.now(); r.classList.toggle("light"); document.body.offsetHeight; t.push(performance.now() - s); } return t; });
  const done = new Promise((res) => cdp.once("Tracing.tracingComplete", res));
  await cdp.send("Tracing.end"); await done;
  const pick = (n) => events.filter((e) => e.name === n && e.ph === "X");
  const ult = pick("UpdateLayoutTree"), lay = pick("Layout");
  const big = ult.filter((e) => (e.args?.elementCount ?? 0) > 50);
  rows.push({ k, i, jsMs: med(js), style: med(big.map((e) => e.dur / 1000)), styleN: big.length, elements: med(big.map((e) => e.args.elementCount)), layout: med(lay.map((e) => e.dur / 1000)), layoutN: lay.length, ultAll: ult.length, stats: pick("SelectorStats").length });
  for (const e of events) { if (e.name !== "SelectorStats") continue; for (const s of e.args?.selector_stats?.selector_timings ?? []) { const m = sel[k]; const c = m.get(s.selector) ?? { t: 0, att: 0, mat: 0 }; c.t += s["elapsed (us)"] ?? 0; c.att += s.match_attempts ?? 0; c.mat += s.match_count ?? 0; m.set(s.selector, c); } }
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
for (const k of ["base", "new"]) { const r = rows.filter((x) => x.k === k); console.log(k, "js", med(r.map((x) => x.jsMs)).toFixed(2), "style", med(r.map((x) => x.style))?.toFixed(2), "layout", med(r.map((x) => x.layout))?.toFixed(2), "elements", med(r.map((x) => x.elements)), "bigULT", r[0].styleN, "layoutN", r[0].layoutN, "stats", r[0].stats); const top = [...sel[k].entries()].sort((a, b) => b[1].t - a[1].t).slice(0, 12); const tot = [...sel[k].values()].reduce((s, c) => [s[0] + c.t, s[1] + c.att, s[2] + c.mat], [0, 0, 0]); console.log("  selectors", sel[k].size, "total us", tot[0], "attempts", tot[1], "matches", tot[2]); for (const [s, c] of top) console.log("  ", Math.round(c.t), c.att, c.mat, s.slice(0, 90)); }
fs.writeFileSync(out, JSON.stringify({ rows, sel: { base: [...sel.base], new: [...sel.new] } }));
