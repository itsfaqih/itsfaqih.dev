// Compares the dot canvas on two built sites: live animations and transitions, scrubbed frames, canvases, and full computed style after each scripted step.
// usage: vp node motion.mjs <baseDist> <newDist> <out.json> [conc=3] [only=substring] [widths=1440,390] [themes=dark,light]
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = require("playwright");
const [baseDir, newDir, outF, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((x) => x.split("=")));
const CONC = Number(opt.conc ?? 3);
const WIDTHS = (opt.widths ?? "1440,390").split(",").map(Number);
const THEMES = (opt.themes ?? "dark,light").split(",");
const MIME = { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", woff2: "font/woff2", json: "application/json", ico: "image/x-icon", pdf: "application/pdf" };
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
const init = ({ theme, seen }) => {
  localStorage.setItem("theme", theme);
  if (seen) sessionStorage.setItem("intro-seen", "1");
  let seed = 42;
  Math.random = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const tile = () => [...document.querySelectorAll("canvas")].map((c) => {
  const g = c.getContext("2d");
  const { width: w, height: h } = c;
  if (!g || !w || !h) return { w, h, tiles: [], lit: 0, sum: 0 };
  const px = g.getImageData(0, 0, w, h).data;
  const T = 48;
  const tiles = [];
  let lit = 0, sum = 0;
  for (let y = 0; y < h; y += T) for (let x = 0; x < w; x += T) {
    let t = 0x811c9dc5;
    for (let yy = y; yy < Math.min(y + T, h); yy++) for (let xx = x; xx < Math.min(x + T, w); xx++) {
      const i = (yy * w + xx) * 4;
      for (let k = 0; k < 4; k++) t = Math.imul(t ^ px[i + k], 16777619);
      if (px[i + 3]) { lit++; sum += px[i + 3]; }
    }
    tiles.push(t);
  }
  return { w, h, tiles, lit, sum };
});
const STEPS = [["load"], ["tick", 16], ["tick", 45], ["tick", 90], ["tick", 150], ["tick", 200], ["tick", 400], ["tick", 700], ["tick", 1000], ["tick", 3000], ["tick", 5600], ["press"], ["tick", 60], ["tick", 140], ["release"], ["tick", 300], ["tick", 900], ["scroll"], ["tick", 200], ["tick", 700], ["tick", 3000]];
const main = async () => {
  const [bs, ns] = await Promise.all([serve(baseDir), serve(newDir)]);
  const browser = await chromium.launch();
  const out = [];
  for (const route of (opt.routes ?? "/,/cv,/rule-of-thumb/button-design,/blog/hello-world").split(",")) for (const width of WIDTHS) for (const theme of THEMES) {
    const open = async (url) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.clock.install({ time: new Date("2026-01-15T09:30:00Z") });
      await page.clock.pauseAt(new Date("2026-01-15T09:30:01Z"));
      await page.addInitScript(init, { theme, seen: true });
      await page.goto(url + route, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => 1));
      await page.waitForTimeout(300);
      return { ctx, page };
    };
    const sides = await Promise.all([open(bs.url), open(bs.url), open(ns.url)]);
    let i = 0;
    for (const [kind, arg] of STEPS) {
      for (const { page } of sides) {
        if (kind === "tick") await page.clock.runFor(arg);
        if (kind === "press") { await page.mouse.move(width / 2, 450); await page.mouse.down(); }
        if (kind === "release") await page.mouse.up();
        if (kind === "scroll") await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
        if (kind !== "tick") await page.clock.runFor(16);
        await page.waitForTimeout(30);
      }
      const [a, c, n] = await Promise.all(sides.map(({ page }) => page.evaluate(tile)));
      const cmp = (x, y) => x.map((v, k) => ({ size: v.w === y[k]?.w && v.h === y[k]?.h, tiles: v.tiles.filter((t, j) => t !== y[k]?.tiles[j]).length, of: v.tiles.length, lit: v.lit, litOther: y[k]?.lit, sum: v.sum, sumOther: y[k]?.sum }));
      out.push({ route, width, theme, step: `${i}:${kind}${arg ?? ""}`, ctl: cmp(a, c), neu: cmp(a, n) });
      i++;
    }
    await Promise.all(sides.map(({ ctx }) => ctx.close()));
  }
  await browser.close();
  bs.s.close();
  ns.s.close();
  writeFileSync(outF, JSON.stringify(out));
  const bad = (k) => out.filter((r) => r[k].some((c) => c.tiles || !c.size)).length;
  console.log("steps", out.length, "control differs", bad("ctl"), "new differs", bad("neu"), "canvases", out[0]?.neu.length, "lit steps", out.filter((r) => r.neu.some((c) => c.lit)).length);
};
main();
