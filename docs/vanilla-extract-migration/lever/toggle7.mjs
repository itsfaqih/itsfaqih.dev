import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [a, b] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(a), new: await serve(b) };
const browser = await chromium.launch();
const out = {};
for (const k of ["base", "new"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  out[k] = await page.evaluate(async () => {
    const root = document.documentElement;
    const raf = () => new Promise((res) => requestAnimationFrame(res));
    const pathOf = (e) => { const p = []; for (let n = e, i = 0; n && n !== document.body && i < 4; n = n.parentElement, i++) p.unshift(n.tagName.toLowerCase() + (n.id ? "#" + n.id : "")); return p.join(">"); };
    await raf(); await raf();
    root.classList.toggle("light");
    await raf(); await raf();
    const tr = document.getAnimations().filter((x) => x instanceof CSSTransition);
    const by = {}, props = {};
    const els = new Set();
    for (const t of tr) { const e = t.effect.target; els.add(e); const key = pathOf(e); by[key] = (by[key] ?? 0) + 1; props[t.transitionProperty] = (props[t.transitionProperty] ?? 0) + 1; }
    const sample = [...els].slice(0, 6).map((e) => { const c = getComputedStyle(e); return { path: pathOf(e), cls: (e.getAttribute("class") ?? "").slice(0, 80), tp: c.transitionProperty.slice(0, 80), td: c.transitionDuration.slice(0, 40) }; });
    return { n: tr.length, els: els.size, props, top: Object.entries(by).sort((x, y) => y[1] - x[1]).slice(0, 10), sample };
  });
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
console.log(JSON.stringify(out, null, 0).replace(/\},"new"/, '},\n"new"'));
