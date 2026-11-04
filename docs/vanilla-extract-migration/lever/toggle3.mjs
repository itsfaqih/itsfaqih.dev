import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [base, next, runs = "4"] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(base), new: await serve(next) };
const browser = await chromium.launch();
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] ?? null; };
const SECTIONS = ["none", "site-header", "#hero", "section#stack", "#experience", "#contact", "footer", "svg", "stack-svg"];
const res = {};
for (let i = 0; i < +runs; i++) for (const k of i % 2 ? ["new", "base"] : ["base", "new"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}/`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const r = await page.evaluate((secs) => {
    const root = document.documentElement;
    const time = () => { const t = []; for (let n = 0; n < 30; n++) { const s = performance.now(); root.classList.toggle("light"); document.body.offsetHeight; t.push(performance.now() - s); } t.sort((a, b) => a - b); return t[15]; };
    const out = {};
    const tops = [...document.querySelectorAll("body > *, main > *, home-page > *, home-page > div > *")].filter((e) => e.children.length).map((e) => e);
    out.none = time();
    for (const e of tops) { const n = e.querySelectorAll("*").length; if (n < 60) continue; const prev = e.style.display; e.style.setProperty("display", "none", "important"); const key = `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}[${n}]`; out[key] = time(); e.style.display = prev; }
    return out;
  }, SECTIONS);
  for (const [s, v] of Object.entries(r)) ((res[s] ||= { base: [], new: [] })[k]).push(v);
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
for (const [s, v] of Object.entries(res)) console.log(s.padEnd(34), "hidden: base", med(v.base).toFixed(2), "new", med(v.new).toFixed(2), "gap", (med(v.new) - med(v.base)).toFixed(2));
