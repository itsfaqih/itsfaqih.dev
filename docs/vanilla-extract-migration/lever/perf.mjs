// usage: vp node perf.mjs <baseDist> <newDist> <out.json> rounds=10 scenarios=desktop,mobile routes=/,/cv
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { brotliCompressSync, constants } from "node:zlib";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = require("playwright");
const [baseDir, newDir, outF, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((x) => x.split("=")));
const ROUNDS = +(opt.rounds ?? 10);
const ROUTES = (opt.routes ?? "/,/cv,/rule-of-thumb/button-design,/blog/hello-world").split(",");
const SCENARIOS = {
  desktop: { width: 1440, height: 900, cpu: 1, net: null, mobile: false },
  mobile: { width: 390, height: 844, cpu: 4, net: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }, mobile: true },
};
const scenarioNames = (opt.scenarios ?? "desktop,mobile").split(",");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".pdf": "application/pdf", ".json": "application/json", ".ico": "image/x-icon", ".webp": "image/webp", ".txt": "text/plain", ".xml": "application/xml" };
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".svg", ".json", ".txt", ".xml"]);
const serve = (dir) => new Promise((ok) => {
  const cache = new Map();
  const s = createServer((q, a) => {
    let u = decodeURIComponent(new URL(q.url, "http://x").pathname);
    if (u.endsWith("/")) u += "index.html";
    let f = path.join(dir, u);
    if (!existsSync(f) || statSync(f).isDirectory()) f += ".html";
    if (!existsSync(f)) { a.writeHead(404); a.end(); return; }
    const ext = path.extname(f);
    let e = cache.get(f);
    if (!e) {
      const raw = readFileSync(f);
      const br = COMPRESSIBLE.has(ext) ? brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: raw.length } }) : null;
      e = { raw, br };
      cache.set(f, e);
    }
    const useBr = e.br && /\bbr\b/.test(q.headers["accept-encoding"] ?? "");
    a.writeHead(200, { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": "no-store", ...(useBr ? { "content-encoding": "br" } : {}) });
    a.end(useBr ? e.br : e.raw);
  });
  for (const rel of readdirSync(dir, { recursive: true })) {
    const f = path.join(dir, String(rel));
    if (!COMPRESSIBLE.has(path.extname(f)) || statSync(f).isDirectory()) continue;
    const raw = readFileSync(f);
    cache.set(f, { raw, br: brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: raw.length } }) });
  }
  s.listen(0, "127.0.0.1", () => ok({ s, url: `http://127.0.0.1:${s.address().port}` }));
});
const OBS = () => {
  const m = (window.__m = { fcp: null, lcp: null, cls: 0, longtasks: [] });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") m.fcp = e.startTime; }).observe({ type: "paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) m.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) m.longtasks.push([e.startTime, e.duration]); }).observe({ type: "longtask", buffered: true });
};
const SIDES = { base: baseDir, control: opt.control ?? baseDir, new: newDir };
const servers = Object.fromEntries(await Promise.all(Object.entries(SIDES).map(async ([k, d]) => [k, await serve(d)])));
const browser = await chromium.launch();
const measure = async (side, route, sc) => {
  const cfg = SCENARIOS[sc];
  const ctx = await browser.newContext({ viewport: { width: cfg.width, height: cfg.height }, isMobile: cfg.mobile, hasTouch: cfg.mobile, deviceScaleFactor: cfg.mobile ? 2 : 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  page.on("requestfailed", (r) => errors.push("failed " + r.url().slice(-60)));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url().slice(-60)); });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Network.enable");
  let transfer = 0, requests = 0;
  cdp.on("Network.loadingFinished", (e) => { transfer += e.encodedDataLength; requests++; });
  if (cfg.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cfg.cpu });
  if (cfg.net) await cdp.send("Network.emulateNetworkConditions", { offline: false, ...cfg.net });
  await page.addInitScript(OBS);
  if (opt.trace) await browser.startTracing(page, { categories: ["devtools.timeline", "blink.user_timing", "disabled-by-default-devtools.timeline"] });
  await page.goto(servers[side].url + route, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(3000);
  const traced = {};
  if (opt.trace) {
    const trace = JSON.parse((await browser.stopTracing()).toString());
    const events = trace.traceEvents ?? trace;
    const names = new Set(["ParseHTML", "ParseAuthorStyleSheet", "UpdateLayoutTree", "Layout", "EvaluateScript", "FunctionCall", "PrePaint", "Paint", "Layerize", "Commit"]);
    for (const e of events) if (e.ph === "X" && names.has(e.name)) traced["t" + e.name] = (traced["t" + e.name] ?? 0) + (e.dur ?? 0) / 1000;
  }
  const cdpm = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]));
  const inPage = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0], m = window.__m;
    const tbt = m.longtasks.filter(([s]) => s >= (m.fcp ?? 0)).reduce((t, [, d]) => t + Math.max(0, d - 50), 0);
    return { ttfb: n.responseStart, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, fcp: m.fcp, lcp: m.lcp, cls: m.cls, tbt, html: n.encodedBodySize, htmlDecoded: n.decodedBodySize, els: document.querySelectorAll("*").length, sheets: document.styleSheets.length, h1: !!document.querySelector("h1,main") };
  });
  await page.evaluate(() => new Promise((ok) => { const go = () => requestAnimationFrame(() => setTimeout(ok, 50)); go(); }));
  const toggle = await page.evaluate(() => {
    const root = document.documentElement, times = [];
    for (let i = 0; i < 20; i++) {
      const t = performance.now();
      root.classList.toggle("light");
      void document.body.offsetHeight;
      void getComputedStyle(document.body).color;
      times.push(performance.now() - t);
    }
    times.sort((a, b) => a - b);
    return times[10];
  });
  await ctx.close();
  return { ...inPage, ...traced, transfer, requests, errors, recalcMs: cdpm.RecalcStyleDuration * 1000, recalcCount: cdpm.RecalcStyleCount, layoutMs: cdpm.LayoutDuration * 1000, layoutCount: cdpm.LayoutCount, scriptMs: cdpm.ScriptDuration * 1000, taskMs: cdpm.TaskDuration * 1000, heapMb: cdpm.JSHeapUsedSize / 1048576, toggleMs: toggle };
};
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rows = [];
const started = Date.now();
for (let round = 0; round < ROUNDS; round++) {
  const jobs = [];
  for (const sc of scenarioNames) for (const route of ROUTES) for (const side of Object.keys(SIDES)) jobs.push({ sc, route, side });
  for (const j of shuffle(jobs)) {
    try { rows.push({ round, ...j, ...(await measure(j.side, j.route, j.sc)) }); }
    catch (e) { rows.push({ round, ...j, fatal: e.message.slice(0, 200) }); }
  }
  writeFileSync(outF, JSON.stringify(rows));
  console.log(`round ${round + 1}/${ROUNDS} ${Math.round((Date.now() - started) / 1000)}s`);
}
await browser.close();
for (const { s } of Object.values(servers)) s.close();
