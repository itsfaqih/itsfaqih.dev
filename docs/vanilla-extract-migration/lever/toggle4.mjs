import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [a, b, c, runs = "5"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(a), new: await serve(b), flat: await serve(c) };
const browser = await chromium.launch();
const med = (x) => { const s = [...x].sort((p, q) => p - q); return s[s.length >> 1] ?? null; };
const HIDE = ["", "stack-showcase", "section#work", "section#rules", "home-hero", "command-palette"];
const res = {};
const keys = Object.keys(servers);
for (let i = 0; i < +runs; i++) for (const k of i % 2 ? [...keys].reverse() : keys) for (const hide of HIDE) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}/`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const v = await page.evaluate((hide) => { const e = hide && document.querySelector(hide); if (e) e.style.setProperty("display", "none", "important"); document.body.offsetHeight; const root = document.documentElement, t = []; for (let n = 0; n < 30; n++) { const s = performance.now(); root.classList.toggle("light"); document.body.offsetHeight; t.push(performance.now() - s); } t.sort((p, q) => p - q); return t[15]; }, hide);
  ((res[hide || "(nothing)"] ||= {})[k] ||= []).push(v);
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
for (const [h, v] of Object.entries(res)) console.log(h.padEnd(18), keys.map((k) => `${k} ${med(v[k]).toFixed(2)}`).join("  "), "gap new-base", (med(v.new) - med(v.base)).toFixed(2));
