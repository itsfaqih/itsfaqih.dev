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
  await page.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "stack-showcase *, section#work *" });
  const sel = new Map(); let matched = 0, decl = 0, n = 0, varRefs = 0; const tags = {};
  const step = Math.max(1, Math.floor(nodeIds.length / 500));
  const perTag = {};
  for (let i = 0; i < nodeIds.length; i += step) {
    const m = await cdp.send("CSS.getMatchedStylesForNode", { nodeId: nodeIds[i] }).catch(() => null);
    if (!m) continue; n++;
    const author = (m.matchedCSSRules ?? []).filter((r) => r.rule.origin === "regular");
    matched += author.length;
    const d = await cdp.send("DOM.describeNode", { nodeId: nodeIds[i] });
    const tag = d.node.nodeName; (perTag[tag] ||= { n: 0, rules: 0, decl: 0 }).n++;
    perTag[tag].rules += author.length;
    for (const r of author) { const ps = r.rule.style.cssProperties.filter((p) => !p.disabled && p.text); decl += ps.length; perTag[tag].decl += ps.length; varRefs += ps.filter((p) => /var\(/.test(p.value)).length; const s = r.rule.selectorList.text; sel.set(s, (sel.get(s) ?? 0) + 1); }
  }
  out[k] = { n, total: nodeIds.length, rulesPerEl: +(matched / n).toFixed(2), declPerEl: +(decl / n).toFixed(2), varRefsPerEl: +(varRefs / n).toFixed(2), perTag: Object.fromEntries(Object.entries(perTag).map(([t, v]) => [t, `${v.n} r${(v.rules / v.n).toFixed(1)} d${(v.decl / v.n).toFixed(1)}`]).slice(0, 8)), top: [...sel.entries()].sort((x, y) => y[1] - x[1]).slice(0, 10).map(([s, c]) => `${c} ${s.slice(0, 70)}`) };
  await ctx.close();
}
await browser.close(); for (const s of Object.values(servers)) s.close();
console.log(JSON.stringify(out, null, 1));
