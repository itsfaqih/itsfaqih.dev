import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const [baseDir, newDir, out, nRuns] = process.argv.slice(2);
const ORIGIN = "http://cv.local";
const browser = await chromium.launch();
const types = new Map([[".js", "text/javascript"], [".css", "text/css"], [".woff2", "font/woff2"], [".svg", "image/svg+xml"], [".png", "image/png"]]);
const once = async (dir, file) => {
  const context = await browser.newContext({ colorScheme: "light", reducedMotion: "reduce" });
  await context.addInitScript(() => localStorage.setItem("theme", "light"));
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) return route.abort();
    const f = path.join(dir, url.pathname === "/cv" ? "cv.html" : url.pathname);
    const body = await readFile(f).catch(() => null);
    return body ? route.fulfill({ body, contentType: types.get(path.extname(f)) ?? "text/html" }) : route.fulfill({ status: 404, body: "" });
  });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/cv`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const buf = await page.pdf({ printBackground: true, tagged: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  await context.close();
  await writeFile(file, buf);
  const imgs = execSync(`pdfimages -list ${JSON.stringify(file)} | tail -n +3 | wc -l`).toString().trim();
  return { size: buf.length, imgs: +imgs };
};
const res = { base: [], new: [] };
for (let i = 0; i < +nRuns; i++) {
  res.base.push(await once(baseDir, `${out}/b${i}.pdf`));
  res.new.push(await once(newDir, `${out}/n${i}.pdf`));
}
console.log(JSON.stringify(res));
await browser.close();
