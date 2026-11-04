import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const b = await chromium.launch();
for (const r of ["/", "/cv", "/rule-of-thumb/data-loading"]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message.slice(0, 100)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 100)));
  await p.goto("http://127.0.0.1:4393" + r, { waitUntil: "load", timeout: 90000 });
  await p.waitForTimeout(1500);
  const d = await p.evaluate(() => {
    const sheets = [...document.styleSheets];
    const stmts = sheets.flatMap((s) => { try { return [...s.cssRules].filter((x) => x.constructor.name === "CSSLayerStatementRule").map((x) => x.cssText); } catch { return []; } });
    const b = getComputedStyle(document.body);
    return { sheets: sheets.length, styleTags: document.querySelectorAll("style").length, links: document.querySelectorAll("link[rel=stylesheet]").length, firstStatement: stmts[0], bg: b.backgroundColor, h1: getComputedStyle(document.querySelector("h1") ?? document.body).fontSize };
  });
  console.log(r, JSON.stringify(d), "errors", errs.length, errs.slice(0, 3));
  await p.close();
}
await b.close();
