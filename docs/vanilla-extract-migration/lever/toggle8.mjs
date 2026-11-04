import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [a, b, outFile, runs = "8"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(a), ctl: await serve(a), new: await serve(b) };
const browser = await chromium.launch();
const med = (x) => { const s = [...x].filter((v) => v != null).sort((p, q) => p - q); return s[s.length >> 1] ?? null; };
const keys = Object.keys(servers);
const classes = {};
for (const k of keys) { classes[k] = {}; for (const theme of ["dark", "light"]) { const c = await browser.newContext({ colorScheme: theme }); const p = await c.newPage(); await p.goto(`http://127.0.0.1:${servers[k].address().port}/cv`, { waitUntil: "load" }); classes[k][theme] = await p.evaluate(() => document.documentElement.className); await c.close(); } }
console.log(JSON.stringify(classes.base), JSON.stringify(classes.new));
const rows = [];
for (const route of ["/", "/rule-of-thumb/button-design", "/blog/hello-world", "/cv"]) for (const cpu of [1, 4]) for (let i = 0; i < +runs; i++) for (const k of i % 2 ? [...keys].reverse() : keys) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}${route}`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(page);
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  const r = await page.evaluate(async ({ dark, light }) => {
    const root = document.documentElement, raf = () => new Promise((res) => requestAnimationFrame(res));
    const forced = [], frame = [], counts = [];
    let cur = false;
    const set = () => { cur = !cur; root.className = cur ? light : dark; };
    for (let n = 0; n < 16; n++) { const s = performance.now(); set(); void document.body.offsetHeight; void getComputedStyle(document.body).color; forced.push(performance.now() - s); }
    for (const x of document.getAnimations()) if (x instanceof CSSTransition) x.cancel();
    for (let n = 0; n < 8; n++) { await raf(); await raf(); await new Promise((res) => setTimeout(res, 150)); const before = document.getAnimations().filter((x) => x instanceof CSSTransition).length; const s = performance.now(); set(); await raf(); await new Promise((res) => { const c = new MessageChannel(); c.port1.onmessage = res; c.port2.postMessage(0); }); frame.push(performance.now() - s); counts.push(document.getAnimations().filter((x) => x instanceof CSSTransition).length - before); }
    const m = (x) => [...x].sort((p, q) => p - q)[x.length >> 1];
    return { forced: m(forced), frame: m(frame), transitions: m(counts) };
  }, classes[k]);
  rows.push({ route, cpu, k, ...r });
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
fs.writeFileSync(outFile, JSON.stringify(rows));
for (const route of [...new Set(rows.map((x) => x.route))]) for (const cpu of [1, 4]) for (const k of keys) { const r = rows.filter((x) => x.route === route && x.cpu === cpu && x.k === k); const f = r.map((x) => x.forced), g = r.map((x) => x.frame); console.log(route.slice(0, 22).padEnd(22), `cpu${cpu}`, k.padEnd(4), "forced", med(f).toFixed(1), `[${Math.min(...f).toFixed(1)},${Math.max(...f).toFixed(1)}]`, "frame", med(g).toFixed(1), `[${Math.min(...g).toFixed(1)},${Math.max(...g).toFixed(1)}]`, "transitions", med(r.map((x) => x.transitions))); }
