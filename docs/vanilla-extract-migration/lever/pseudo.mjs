import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [baseDir, newDir, out] = process.argv.slice(2);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const serve = (root) => new Promise((ok) => {
  const s = createServer((q, r) => {
    let p = decodeURIComponent(q.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    let f = join(root, p);
    if (!existsSync(f) && existsSync(f + ".html")) f += ".html";
    if (!existsSync(f)) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
    r.end(readFileSync(f));
  }).listen(0, "127.0.0.1", () => ok({ s, url: `http://127.0.0.1:${s.address().port}` }));
});
const ROUTES = ["/", "/rule-of-thumb/dialog-design", "/rule-of-thumb/table-design", "/rule-of-thumb/button-design", "/blog/hello-world", "/cv"];
const PSEUDOS = ["::placeholder", "::selection", "::-webkit-scrollbar", "::-webkit-scrollbar-thumb", "::-webkit-scrollbar-track", "::backdrop", "::marker"];
const collect = (pseudos) => {
  const res = [];
  const els = [document.documentElement, ...document.body.querySelectorAll("*")];
  els.forEach((e, i) => {
    for (const p of pseudos) {
      if (p === "::placeholder" && !(e.tagName === "INPUT" || e.tagName === "TEXTAREA")) continue;
      if (p === "::marker" && getComputedStyle(e).display !== "list-item") continue;
      if (p === "::backdrop" && e.tagName !== "DIALOG") continue;
      if (p.includes("scrollbar") && !["auto", "scroll"].includes(getComputedStyle(e).overflowY) && e !== document.documentElement) continue;
      const cs = getComputedStyle(e, p);
      const o = {};
      for (const k of cs) if (!k.startsWith("--")) o[k] = cs.getPropertyValue(k);
      res.push([`${e.tagName}#${i}${p}`, o]);
    }
  });
  return res;
};
const browser = await chromium.launch();
const [a, b] = await Promise.all([serve(baseDir), serve(newDir)]);
const report = [];
const scale = (v) => String(v).replace(/\s+/g, " ").replace(/127\.0\.0\.1:\d+/g, "H");
for (const route of ROUTES) for (const theme of ["dark", "light"]) for (const touch of [false, true]) {
  const runs = [];
  for (const srv of [a, b]) {
    const ctx = await browser.newContext({ viewport: { width: touch ? 390 : 1440, height: 844 }, colorScheme: theme, hasTouch: touch, isMobile: touch, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e)));
    await page.goto(srv.url + route, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const pseudo = await page.evaluate(collect, PSEUDOS);
    const box = await page.evaluate(() => ({
      thumbs: document.querySelectorAll("[data-part='thumb'],[data-scrollbar],.box-scrollbar").length,
      sbOwn: document.documentElement.classList.contains("sb-own"),
      sbw: getComputedStyle(document.documentElement).scrollbarWidth,
      inner: window.innerWidth, client: document.documentElement.clientWidth,
      nodes: document.body.querySelectorAll("*").length,
    }));
    runs.push({ pseudo, box, errs });
    await ctx.close();
  }
  const [x, y] = runs;
  const my = new Map(y.pseudo);
  let diffs = [];
  for (const [k, o] of x.pseudo) {
    const n = my.get(k);
    if (!n) { diffs.push([k, "missing"]); continue; }
    for (const p of Object.keys(o)) if (scale(o[p]) !== scale(n[p])) diffs.push([k, p, o[p], n[p]]);
  }
  const boxSame = JSON.stringify(x.box) === JSON.stringify(y.box);
  report.push({ route, theme, touch, compared: x.pseudo.length, other: y.pseudo.length, diffs, boxSame, box: [x.box, y.box], errs: [x.errs, y.errs] });
  console.log(route, theme, touch ? "touch" : "fine", "pseudo", x.pseudo.length, y.pseudo.length, "diffs", diffs.length, "box", boxSame, "errs", x.errs.length, y.errs.length);
}
writeFileSync(out, JSON.stringify(report));
await browser.close(); a.s.close(); b.s.close();
