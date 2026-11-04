import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const serve = (root) => new Promise((ok) => { const s = createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = join(root, p); if (!existsSync(f) && existsSync(f + ".html")) f += ".html"; if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" }); r.end(readFileSync(f)); }).listen(0, "127.0.0.1", () => ok({ s, url: `http://127.0.0.1:${s.address().port}` })); });
const browser = await chromium.launch();
for (const [name, dir] of [["base", process.argv[2]], ["new", process.argv[3]]]) {
  const { s, url } = await serve(dir);
  for (const media of [{ hasTouch: false }, { hasTouch: true, isMobile: true }]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...media });
  const page = await ctx.newPage();
  await page.goto(url + "/rule-of-thumb/data-loading");
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() && b.closest("main,figure,section")).slice(0, 12).map((b) => [b.textContent.trim().slice(0, 18), getComputedStyle(b).cursor.replace(/127\.0\.0\.1:\d+/, "H"), b.disabled, b.className.split(" ").length]));
  console.log(name, media.hasTouch ? "touch" : "fine", JSON.stringify(r));
  await ctx.close();
  }
  s.close();
}
await browser.close();
