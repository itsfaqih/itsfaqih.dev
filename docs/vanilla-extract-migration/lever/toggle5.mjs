import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [a, b, runs = "6"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(a), ctl: await serve(a), new: await serve(b) };
const browser = await chromium.launch();
const med = (x) => { const s = [...x].filter((v) => v != null).sort((p, q) => p - q); return s[s.length >> 1] ?? null; };
const rows = [];
const keys = Object.keys(servers);
for (const cpu of [1, 4]) for (let i = 0; i < +runs; i++) for (const k of i % 2 ? [...keys].reverse() : keys) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  const cdp = await ctx.newCDPSession(page);
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  const events = [];
  cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
  await cdp.send("Tracing.start", { transferMode: "ReportEvents", categories: "devtools.timeline" });
  const frame = await page.evaluate(async () => {
    const root = document.documentElement, t = [];
    const raf = () => new Promise((r) => requestAnimationFrame(r));
    for (let n = 0; n < 12; n++) { await raf(); await raf(); const s = performance.now(); root.classList.toggle("light"); await raf(); await new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = r; c.port2.postMessage(0); }); t.push(performance.now() - s); }
    return t;
  });
  const done = new Promise((res) => cdp.once("Tracing.tracingComplete", res));
  await cdp.send("Tracing.end"); await done;
  const dur = (n, min = 0) => events.filter((e) => e.name === n && e.ph === "X" && (e.args?.elementCount ?? 1e9) >= min).map((e) => e.dur / 1000);
  rows.push({ cpu, k, frame: med(frame), style: med(dur("UpdateLayoutTree", 50)), layout: med(dur("Layout")), prepaint: med(dur("PrePaint")), paint: med(dur("Paint")), layerize: med(dur("Layerize")), commit: med(dur("Commit")) });
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
for (const cpu of [1, 4]) for (const k of keys) { const r = rows.filter((x) => x.cpu === cpu && x.k === k); console.log(`cpu${cpu}`, k.padEnd(4), ["frame", "style", "layout", "prepaint", "paint", "layerize", "commit"].map((m) => `${m} ${med(r.map((x) => x[m]))?.toFixed(1)}`).join(" "), "frameRange", Math.min(...r.map((x) => x.frame)).toFixed(0), Math.max(...r.map((x) => x.frame)).toFixed(0)); }
