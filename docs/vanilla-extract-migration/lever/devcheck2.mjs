import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const b = await chromium.launch();
const collect = () => {
  const props = ["display", "position", "color", "backgroundColor", "fontSize", "fontWeight", "lineHeight", "padding", "margin", "gap", "borderRadius", "boxShadow", "width", "transition", "animationName"];
  const out = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("astro-dev-toolbar,vite-error-overlay") || ["SCRIPT", "STYLE"].includes(el.tagName)) continue;
    const c = getComputedStyle(el);
    out.push(el.tagName + "|" + props.map((p) => (p === "animationName" ? (c[p] === "none" ? "none" : "named") : c[p])).join("|"));
  }
  return out;
};
const get = async (origin, r) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(origin + r, { waitUntil: "load", timeout: 90000 });
  await p.waitForTimeout(2500);
  const x = await p.evaluate(collect);
  await ctx.close();
  return x;
};
for (const [dev, prod] of [["/cv", "/cv.html"], ["/rule-of-thumb/button-design", "/rule-of-thumb/button-design.html"], ["/blog/hello-world", "/blog/hello-world.html"], ["/", "/index.html"]]) {
  const a = await get("http://127.0.0.1:4393", dev), c = await get("http://127.0.0.1:4394", prod);
  let bad = 0, ex = null;
  for (let i = 0; i < Math.min(a.length, c.length); i++) if (a[i] !== c[i]) { bad++; if (!ex) { const pa = a[i].split("|"), pc = c[i].split("|"); ex = [i, pa[0], pa.map((v, j) => (v !== pc[j] ? `${j}:${v} vs ${pc[j]}` : "")).filter(Boolean).slice(0, 3)]; } }
  console.log(dev, "elements", a.length, c.length, "mismatch", bad, JSON.stringify(ex));
}
await b.close();
