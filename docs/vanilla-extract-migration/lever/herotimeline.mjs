import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [base, next, out, runs = "6"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2", webp: "image/webp", jpg: "image/jpeg", pdf: "application/pdf" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const sa = await serve(base), sb = await serve(next);
const urls = { base: `http://127.0.0.1:${sa.address().port}/`, new: `http://127.0.0.1:${sb.address().port}/` };
const browser = await chromium.launch();
const rows = [];
for (let i = 0; i < +runs; i++) for (const k of i % 2 ? ["new", "base"] : ["base", "new"]) for (const width of [1440, 959, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: "no-preference", colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(urls[k], { waitUntil: "load" });
  const t0 = Date.now(); const samples = [];
  while (Date.now() - t0 < 9000) {
    samples.push(await page.evaluate(() => { const roots = [...document.querySelectorAll("[data-scene],[data-hero-scene]")]; return { nodes: document.querySelectorAll("body *").length, shown: roots.map((r) => getComputedStyle(r).opacity + "/" + r.dataset.scene).join(","), attrs: [...document.querySelectorAll("section")][0]?.getAttribute("data-active") ?? null }; }).then((s) => ({ t: Date.now() - t0, ...s })));
    await page.waitForTimeout(250);
  }
  rows.push({ k, i, width, samples });
  await ctx.close();
}
await browser.close(); sa.close(); sb.close();
fs.writeFileSync(out, JSON.stringify(rows));
const sum = {};
for (const r of rows) { const key = `${r.k} ${r.width}`; const nodes = r.samples.map((s) => s.nodes); const changes = []; for (let i = 1; i < nodes.length; i++) if (nodes[i] !== nodes[i - 1]) changes.push(`${r.samples[i].t}:${nodes[i]}`); (sum[key] ||= []).push(`${nodes[0]}>${changes.slice(0, 6).join(" ")}`); }
for (const k of Object.keys(sum).sort()) console.log(k, "\n  " + sum[k].join("\n  "));
