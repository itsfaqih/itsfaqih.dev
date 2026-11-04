// Reads every custom property by name in Firefox on both builds, because enumerating computed style lists a different subset per build.
// usage: vp node ffprobe.mjs <baseDist> <newDist>
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const { firefox } = require("playwright");
const [baseDir, newDir] = process.argv.slice(2);
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2" };
const serve = (dir) => new Promise((res) => {
  const s = createServer((q, a) => {
    const u = decodeURIComponent(new URL(q.url, "http://x").pathname);
    let f = path.join(dir, u);
    if (u === "/") f = path.join(dir, "index.html");
    else if (!existsSync(f) || statSync(f).isDirectory()) f = `${f}.html`;
    if (!existsSync(f)) { a.writeHead(404); return a.end(); }
    a.writeHead(200, { "content-type": MIME[f.split(".").pop()] ?? "application/octet-stream" });
    a.end(readFileSync(f));
  }).listen(0, "127.0.0.1", () => res({ s, url: `http://127.0.0.1:${s.address().port}` }));
});
const NAMES = [...new Set([...readFileSync(path.join(newDir, "index.html"), "utf8").matchAll(/(--[a-zA-Z][\w-]*)\s*:/g)].map((m) => m[1]))];
const norm = (v) => v.trim().replace(/\s+/g, " ").replace(/,\s*/g, ",").replace(/(^|[\s,(])0\./g, "$1.").toLowerCase();
const read = ({ names, sels }) => sels.map((sel) => {
  const e = document.querySelector(sel);
  if (!e) return { sel, missing: true };
  const cs = getComputedStyle(e);
  const enumerated = [];
  for (let i = 0; i < cs.length; i++) if (cs[i].startsWith("--")) enumerated.push(cs[i]);
  return { sel, enumerated: enumerated.length, vals: Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n)])) };
});
const main = async () => {
  const [b, n] = await Promise.all([serve(baseDir), serve(newDir)]);
  const browser = await firefox.launch();
  let diffs = 0, compared = 0;
  const sample = [];
  for (const route of ["/", "/cv", "/rule-of-thumb/button-design", "/blog/hello-world"]) for (const theme of ["dark", "light"]) {
    const out = [];
    for (const url of [b.url, n.url]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.addInitScript((t) => { localStorage.setItem("theme", t); sessionStorage.setItem("intro-seen", "1"); }, theme);
      await page.goto(url + route, { waitUntil: "load" });
      await page.waitForTimeout(500);
      out.push(await page.evaluate(read, { names: NAMES, sels: ["html", "body", "main", "header", "main a", "main p"] }));
      await ctx.close();
    }
    out[0].forEach((row, i) => {
      const other = out[1][i];
      if (row.missing || other.missing) return;
      for (const name of NAMES) {
        compared++;
        if (norm(row.vals[name]) !== norm(other.vals[name])) {
          diffs++;
          if (sample.length < 12) sample.push([route, theme, row.sel, name, row.vals[name].slice(0, 70), other.vals[name].slice(0, 70)]);
        }
      }
      if (i === 0) console.log(route, theme, "enumerated custom props", row.enumerated, other.enumerated);
    });
  }
  await browser.close();
  b.s.close();
  n.s.close();
  console.log("names", NAMES.length, "compared", compared, "diffs", diffs);
  for (const s of sample) console.log(s.join(" | "));
};
main();
