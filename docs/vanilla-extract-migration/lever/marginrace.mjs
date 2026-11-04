import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [baseDir, newDir, N] = process.argv.slice(2);
const serve = (root) => new Promise((ok) => {
  const s = http.createServer((q, r) => {
    let f = path.join(root, decodeURIComponent(q.url.split("?")[0]));
    if (!path.extname(f)) f += ".html";
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".html") ? "text/html" : f.endsWith(".js") ? "text/javascript" : f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".woff2") ? "font/woff2" : "application/octet-stream" }); r.end(d); });
  });
  s.listen(0, "127.0.0.1", () => ok(s));
});
const b = await chromium.launch();
const run = async (s) => {
  const o = `http://127.0.0.1:${s.address().port}`;
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("intro-seen", "1"); } catch {} });
  const p = await ctx.newPage();
  await p.goto(o + "/rule-of-thumb/dialog-design", { waitUntil: "load" });
  await p.waitForTimeout(400);
  const read = () => p.evaluate(() => { const e = document.querySelector("main rule-landing > div"); const c = getComputedStyle(e); return c.marginLeft + "/" + e.getBoundingClientRect().left + "/" + document.documentElement.clientWidth; });
  const before = await read();
  await p.locator("figure[data-side='good'] button").first().click();
  const at = await read();
  await p.waitForTimeout(700);
  const after = await read();
  await ctx.close();
  return [before, at, after];
};
const sb = await serve(baseDir), sn = await serve(newDir);
const tally = { base: {}, new: {} };
for (let i = 0; i < +N; i++) {
  for (const [k, s] of i % 2 ? [["base", sb], ["new", sn]] : [["new", sn], ["base", sb]]) {
    const r = JSON.stringify(await run(s));
    tally[k][r] = (tally[k][r] ?? 0) + 1;
  }
}
console.log(JSON.stringify(tally, null, 0));
await b.close(); sb.close(); sn.close();
