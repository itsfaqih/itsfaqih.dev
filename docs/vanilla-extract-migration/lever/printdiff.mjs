import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [baseDir, newDir] = process.argv.slice(2);
const serve = (root) => new Promise((ok) => {
  const s = http.createServer((q, r) => {
    let f = path.join(root, decodeURIComponent(q.url.split("?")[0]));
    if (!path.extname(f)) f += ".html";
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".html") ? "text/html" : f.endsWith(".js") ? "text/javascript" : "application/octet-stream" }); r.end(d); });
  });
  s.listen(0, "127.0.0.1", () => ok(s));
});
const b = await chromium.launch();
const collect = () => [...document.querySelectorAll("*")].filter((e) => !["SCRIPT", "STYLE", "META", "LINK", "TITLE", "HEAD"].includes(e.tagName)).map((e) => {
  const c = getComputedStyle(e), o = {};
  for (const p of c) if (!p.startsWith("--")) o[p] = c.getPropertyValue(p);
  const pc = {};
  for (const ps of ["::before", "::after"]) { const q = getComputedStyle(e, ps); for (const p of ["content", "filter", "backdrop-filter", "mask-image", "mix-blend-mode", "opacity", "position", "display", "background-image", "box-shadow"]) pc[ps + p] = q.getPropertyValue(p); }
  return { tag: e.tagName, cl: e.className?.baseVal ?? e.className, o, pc };
});
const get = async (dir) => {
  const s = await serve(dir);
  const ctx = await b.newContext({ colorScheme: "light", reducedMotion: "reduce" });
  await ctx.addInitScript(() => localStorage.setItem("theme", "light"));
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${s.address().port}/cv`, { waitUntil: "load" });
  await p.emulateMedia({ media: "print" });
  await p.waitForTimeout(800);
  const r = await p.evaluate(collect);
  await ctx.close(); s.close();
  return r;
};
const A = await get(baseDir), B = await get(newDir);
console.log(A.length, B.length);
const counts = {};
A.forEach((x, i) => {
  const y = B[i];
  for (const k of Object.keys(x.o)) if (x.o[k] !== y.o[k]) { const key = `${x.tag} ${k}: ${x.o[k].slice(0, 60)} -> ${y.o[k].slice(0, 60)}`; counts[key] = (counts[key] ?? 0) + 1; }
  for (const k of Object.keys(x.pc)) if (x.pc[k] !== y.pc[k]) { const key = `${x.tag} ${k}: ${x.pc[k].slice(0, 60)} -> ${y.pc[k].slice(0, 60)}`; counts[key] = (counts[key] ?? 0) + 1; }
});
console.log(Object.entries(counts).slice(0, 40).map(([k, v]) => v + " " + k).join("\n"));
const mk = (L) => L.flatMap((x) => ["filter", "backdrop-filter", "mix-blend-mode", "mask-image", "will-change"].filter((p) => x.o[p] && !["none", "normal", "auto"].includes(x.o[p])).map((p) => `${x.tag} ${p}=${x.o[p].slice(0, 70)}`));
console.log("effects base", JSON.stringify(mk(A)).slice(0, 600)); console.log("effects new", JSON.stringify(mk(B)).slice(0, 600));
await b.close();
