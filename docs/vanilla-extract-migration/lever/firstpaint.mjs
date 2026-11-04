import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [baseDir, newDir] = process.argv.slice(2);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".pdf": "application/pdf" };
const serve = (root) => new Promise((ok) => {
  const s = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let f = path.join(root, p);
    if (!path.extname(f)) f += ".html";
    fs.readFile(f, (e, d) => {
      if (e) { r.writeHead(404); r.end(); return; }
      r.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" });
      r.end(d);
    });
  });
  s.listen(0, "127.0.0.1", () => ok(s));
});
const sb = await serve(baseDir), sn = await serve(newDir);
const url = (s, r) => `http://127.0.0.1:${s.address().port}${r}`;
const browser = await chromium.launch();
const routes = ["/", "/blog", "/cv", "/rule-of-thumb/button-design"];
const earlyProbe = () => {
  const seen = [];
  const sample = () => {
    const root = document.documentElement;
    if (!document.body) return;
    const b = getComputedStyle(document.body);
    seen.push({
      cls: root.className.includes("light") ? "light" : "dark",
      rootBg: getComputedStyle(root).backgroundColor,
      bodyBg: b.backgroundColor,
      color: b.color,
      fontFamily: b.fontFamily.slice(0, 40),
      paper: getComputedStyle(root).getPropertyValue("--paper"),
    });
  };
  new MutationObserver(() => { if (document.body && !seen.length) sample(); }).observe(document, { childList: true, subtree: true });
  window.__seen = seen;
  addEventListener("DOMContentLoaded", sample);
  addEventListener("load", sample);
};
const out = [];
for (const theme of ["dark", "light"]) for (const r of routes) {
  const row = { theme, r };
  for (const [name, s] of [["base", sb], ["new", sn]]) {
    const ctx = await browser.newContext({ colorScheme: theme, viewport: { width: 1280, height: 800 } });
    if (theme === "light") await ctx.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });
    const page = await ctx.newPage();
    await page.addInitScript(earlyProbe);
    const reqs = [];
    page.on("request", (q) => reqs.push(q.resourceType()));
    await page.goto(url(s, r), { waitUntil: "load" });
    const seen = await page.evaluate(() => window.__seen);
    const order = await page.evaluate(() => {
      const head = [...document.head.children].map((e) => e.tagName);
      const first = document.querySelector("style")?.textContent.slice(0, 70);
      const layers = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules].filter((x) => x.constructor.name === "CSSLayerStatementRule").map((x) => x.cssText));
      const beforeBodyStyles = document.querySelectorAll("head style").length;
      const inBody = document.querySelectorAll("body style").length;
      return { firstHead: head.slice(0, 8).join(","), first, layers: layers.slice(0, 2), beforeBodyStyles, inBody };
    });
    row[name] = { first: seen[0], stable: new Set(seen.map((x) => x.bodyBg + x.color + x.cls)).size === 1, n: seen.length, css: reqs.filter((x) => x === "stylesheet").length, order };
    await ctx.close();
  }
  out.push(row);
}
for (const x of out) {
  console.log(x.theme, x.r, JSON.stringify({ sameFirstFrame: JSON.stringify(x.base.first) === JSON.stringify(x.new.first), base: x.base.stable, new: x.new.stable, cssReq: [x.base.css, x.new.css], stylesHeadBody: [[x.base.order.beforeBodyStyles, x.base.order.inBody], [x.new.order.beforeBodyStyles, x.new.order.inBody]] }));
  if (JSON.stringify(x.base.first) !== JSON.stringify(x.new.first)) console.log(" ", JSON.stringify(x.base.first), JSON.stringify(x.new.first));
}
console.log(JSON.stringify(out[0].new.order).slice(0, 400));
await browser.close(); sb.close(); sn.close();
