import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { CV_PDF } from "../../src/data/cv";

// Never fetched: the browser asks the build for every file, so no server has to run.
const ORIGIN = "http://cv.build";
const MEDIA_TYPES = new Map([
  [".css", "text/css"],
  [".js", "text/javascript"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

/** Prints the built /cv page to its two PDFs, each as the page shows it with the switch set so. */
export async function writeCvPdfs(outDir: string) {
  const browser = await chromium.launch();
  try {
    // Light, so the designed CV reads on paper. Reduced motion, so nothing is mid-animation.
    const context = await browser.newContext({ colorScheme: "light", reducedMotion: "reduce" });
    await context.addInitScript(() => localStorage.setItem("theme", "light"));
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== ORIGIN) return route.abort();
      const file = path.join(outDir, url.pathname === "/cv" ? "cv.html" : url.pathname);
      const type = MEDIA_TYPES.get(path.extname(file)) ?? "text/html";
      const body = await readFile(file).catch(() => null);
      return body
        ? route.fulfill({ body, contentType: type })
        : route.fulfill({ status: 404, body: "" });
    });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/cv`, { waitUntil: "load" });
    await page.evaluate(
      (title) => {
        document.title = title;
        return document.fonts.ready.then(() => undefined);
      },
      CV_PDF.design.fileName.replace(/\.pdf$/, ""),
    );
    const print = (margin: string) =>
      page.pdf({
        format: "A4",
        printBackground: true,
        tagged: true,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
      });
    await writeFile(path.join(outDir, CV_PDF.design.href), await print("0"));
    await page.getByRole("switch").check();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await writeFile(path.join(outDir, CV_PDF.ats.href), await print("15mm"));
  } finally {
    await browser.close();
  }
}
