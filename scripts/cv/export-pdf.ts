import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { CV_PDF } from "../../src/data/cv";

const PLAYWRIGHT_CLI = "../../node_modules/playwright/cli.js";
const ARIMO_FILES = "../../node_modules/@fontsource/arimo/files";
// Never fetched: the browser asks the build for every file, so no server has to run.
const ORIGIN = "http://cv.build";
const MEDIA_TYPES = new Map([
  [".css", "text/css"],
  [".js", "text/javascript"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

// The ATS version asks for Arial, which only some build machines have: Linux gave it DejaVu, which is
// wider. Arimo has Arial's metrics, so this face prints the same PDF wherever the build runs.
async function arialFace(weight: 400 | 700) {
  const file = path.join(import.meta.dirname, ARIMO_FILES, `arimo-latin-${weight}-normal.woff2`);
  const font = (await readFile(file)).toString("base64");
  return `@font-face { font-family: Arial; font-weight: ${weight}; src: url(data:font/woff2;base64,${font}) format("woff2"); }`;
}

/** Prints the built /cv page to its two PDFs, each as the page shows it with the switch set so. */
export async function writeCvPdfs(outDir: string) {
  // A fresh build machine, like Cloudflare Pages', has the package but not its browser. Installing
  // here holds whatever command starts the build, and does nothing once the browser is there.
  execFileSync(
    process.execPath,
    [path.join(import.meta.dirname, PLAYWRIGHT_CLI), "install", "chromium", "--only-shell"],
    { stdio: "inherit" },
  );
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
    await page.addStyleTag({
      content: (await Promise.all(([400, 700] as const).map(arialFace))).join("\n"),
    });
    await page.getByRole("switch").check();
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load("400 12px Arial"),
        document.fonts.load("700 12px Arial"),
      ]);
      await document.fonts.ready;
    });
    await writeFile(path.join(outDir, CV_PDF.ats.href), await print("15mm"));
  } finally {
    await browser.close();
  }
}
