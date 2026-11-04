import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [base, next, runs = "6"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(base), ctl: await serve(base), new: await serve(next) };
const browser = await chromium.launch();
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] ?? null; };
const rows = [];
for (let i = 0; i < +runs; i++) for (const k of i % 2 ? ["new", "base", "ctl"] : ["ctl", "base", "new"]) for (const wait of [0, 1500, 6000]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}/`, { waitUntil: "load" });
  if (wait) await page.waitForTimeout(wait);
  const r = await page.evaluate(() => { const root = document.documentElement, t = []; for (let n = 0; n < 40; n++) { const s = performance.now(); root.classList.toggle("light"); document.body.offsetHeight; t.push(performance.now() - s); } const g = (o) => t.filter((_, i) => i % 2 === o); return { all: t, toLight: g(0), toDark: g(1), anims: document.getAnimations().length }; });
  rows.push({ k, wait, med: med(r.all), toLight: med(r.toLight), toDark: med(r.toDark), first: r.all[0], anims: r.anims });
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
for (const wait of [0, 1500, 6000]) for (const k of ["base", "ctl", "new"]) { const r = rows.filter((x) => x.k === k && x.wait === wait); console.log(wait, k, "med", med(r.map((x) => x.med)).toFixed(2), "range", Math.min(...r.map((x) => x.med)).toFixed(1), Math.max(...r.map((x) => x.med)).toFixed(1), "toLight", med(r.map((x) => x.toLight)).toFixed(2), "toDark", med(r.map((x) => x.toDark)).toFixed(2), "first", med(r.map((x) => x.first)).toFixed(1), "anims", med(r.map((x) => x.anims))); }
