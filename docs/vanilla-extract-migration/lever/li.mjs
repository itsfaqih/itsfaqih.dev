import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [a, b] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; let f = path.join(dir, p); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html"; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[f.split(".").pop()] || "application/octet-stream" }); r.end(fs.readFileSync(f)); }); s.listen(0, "127.0.0.1", () => res(s)); });
const servers = { base: await serve(a), new: await serve(b) };
const browser = await chromium.launch();
for (const k of ["base", "new"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${servers[k].address().port}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  const r = await page.evaluate(async () => {
    const li = document.querySelector("stack-showcase ul li");
    const c = getComputedStyle(li);
    const snap = () => ({ bc: c.borderTopColor, bw: c.borderTopWidth, bs: c.borderTopStyle, col: c.color, tp: c.transitionProperty, td: c.transitionDuration, cur: c.getPropertyValue("--c") });
    const dark = snap();
    document.documentElement.classList.add("light");
    const immediately = snap();
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    const running = li.getAnimations().map((x) => [x.transitionProperty, x.effect.getTiming().duration, JSON.stringify(x.effect.getKeyframes().map((f) => f[x.transitionProperty.replace(/-(\w)/g, (_, l) => l.toUpperCase())]))]);
    await new Promise((res) => setTimeout(res, 800));
    const light = snap();
    return { cls: li.getAttribute("class"), dark, immediately, running, light };
  });
  console.log(k, JSON.stringify(r).slice(0, 1200));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: "stack-showcase ul li" });
  const m = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
  for (const x of m.matchedCSSRules) { const t = x.rule.style.cssProperties.filter((p) => /border|transition/.test(p.name) && p.text).map((p) => `${p.name}:${p.value}`).slice(0, 8).join("; "); if (t && x.rule.origin === "regular") console.log("  ", x.rule.selectorList.text.slice(0, 70), "=>", t.slice(0, 200)); }
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
