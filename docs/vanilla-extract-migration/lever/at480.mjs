import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const serve = (root) => new Promise((ok) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(new URL(q.url, "http://x").pathname); if (p.endsWith("/")) p += "index"; let f = path.join(root, p); if (!path.extname(f)) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } const ty = {".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(f)] || "application/octet-stream"; r.writeHead(200, {"content-type": ty}); fs.createReadStream(f).pipe(r); }); s.listen(0, () => ok(s)); });
const b = await chromium.launch();
for (const [name, root] of [["base", process.argv[2]], ["new", process.argv[3]]]) {
  const s = await serve(root);
  for (const w of [481, 480, 479]) {
    const c = await b.newContext({ viewport: { width: w, height: 800 }, reducedMotion: "reduce" });
    const p = await c.newPage();
    await p.goto(`http://localhost:${s.address().port}/`);
    await p.waitForTimeout(400);
    console.log(name, w, JSON.stringify(await p.evaluate(() => ({ iw: innerWidth, doc: document.documentElement.clientWidth, m480: matchMedia("(width<=480px)").matches, m48001: matchMedia("(width>=480.01px)").matches, header: [...document.querySelectorAll("header *")].filter((e) => getComputedStyle(e).paddingLeft !== "0px" || e.tagName === "NAV").slice(0, 4).map((e) => [e.tagName, e.className.slice(0, 60), getComputedStyle(e).padding]), }))));
    await c.close();
  }
  s.close();
}
await b.close();
