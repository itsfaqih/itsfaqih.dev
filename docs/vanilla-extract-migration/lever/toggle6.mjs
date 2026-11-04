import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [a, b, runs = "3"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(a), new: await serve(b) };
const browser = await chromium.launch();
const med = (x) => { const s = [...x].filter((v) => v != null).sort((p, q) => p - q); return s[s.length >> 1] ?? null; };
for (let i = 0; i < +runs; i++) for (const k of i % 2 ? ["new", "base"] : ["base", "new"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const events = [];
  cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
  await cdp.send("Tracing.start", { transferMode: "ReportEvents", categories: "devtools.timeline" });
  const r = await page.evaluate(async () => {
    const root = document.documentElement, t = [], counts = [];
    const raf = () => new Promise((res) => requestAnimationFrame(res));
    for (let n = 0; n < 8; n++) { await raf(); await raf(); const before = document.getAnimations().length; const s = performance.now(); root.classList.toggle("light"); await raf(); await new Promise((res) => { const c = new MessageChannel(); c.port1.onmessage = res; c.port2.postMessage(0); }); t.push(performance.now() - s); const an = document.getAnimations(); counts.push([before, an.length, an.filter((a) => a instanceof CSSTransition).length]); }
    const tr = document.getAnimations().filter((a) => a instanceof CSSTransition).slice(0, 400).map((a) => a.transitionProperty); const c = {}; for (const p of tr) c[p] = (c[p] ?? 0) + 1;
    return { t, counts, props: c };
  });
  const done = new Promise((res) => cdp.once("Tracing.tracingComplete", res));
  await cdp.send("Tracing.end"); await done;
  const ult = events.filter((e) => e.name === "UpdateLayoutTree" && e.ph === "X");
  const big = ult.filter((e) => e.args?.elementCount > 100).map((e) => [e.args.elementCount, Math.round(e.dur / 1000)]);
  const fns = {};
  for (const e of events) if (e.ph === "X" && e.dur > 2000) { fns[e.name] = (fns[e.name] ?? 0) + e.dur / 1000; }
  console.log(k, "frame", med(r.t).toFixed(1), "counts", JSON.stringify(r.counts.slice(2, 5)), "transitions", JSON.stringify(r.props).slice(0, 160));
  console.log("   big ULT", big.length, JSON.stringify(big.slice(0, 8)), "total by name", JSON.stringify(Object.fromEntries(Object.entries(fns).map(([n, v]) => [n, Math.round(v)]).sort((x, y) => y[1] - x[1]).slice(0, 7))));
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
