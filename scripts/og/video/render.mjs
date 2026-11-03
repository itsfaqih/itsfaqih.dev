// Render an authored film: every frame is window.seek(t) then a screenshot, so none is dropped.
//
//   vp node render.mjs <film>             frames -> out/<film>.mp4 and out/<film>-poster.png
//   vp node render.mjs <film> --stills 12 a contact sheet of 12 evenly spaced moments + the loop seam
//   vp node render.mjs <film> --at 1.2,3.4 stills at those times
//   --q id=button-design --name rule-button-design   one template, many films
//   --poster-at 2.3   the poster is the frame at that time (default 0)
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const [template, ...rest] = process.argv.slice(2);
if (!template) throw new Error("usage: render.mjs <film> [--stills N | --at t1,t2]");
const flag = (name) => {
  const i = rest.indexOf(name);
  return i === -1 ? undefined : rest[i + 1];
};
const film = flag("--name") ?? template;
const query = flag("--q");
const SCALE = 2;
const WORKERS = Number(flag("--workers") ?? 3);
const url = `file://${path.join(here, "films", `${template}.html`)}?render=1${query ? `&${query}` : ""}`;
const outDir = path.join(here, "out");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  args: ["--font-render-hinting=none", "--force-color-profile=srgb", "--disable-lcd-text"],
});
async function openPage() {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: SCALE,
  });
  page.on("pageerror", (e) => console.error("pageerror", e.message));
  page.on("console", (m) => m.type() === "error" && console.error("console", m.text()));
  await page.goto(url);
  await page.waitForFunction(() => window.FILM && document.fonts.status === "loaded");
  return page;
}
const shoot = async (page, t, file) => {
  await page.evaluate((x) => window.seek(x), t);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1200, height: 630 } });
};

const first = await openPage();
const { duration, fps } = await first.evaluate(() => window.FILM);
const frames = Math.round(duration * fps);

const stills = flag("--stills");
const at = flag("--at");
if (stills || at) {
  const dir = path.join(outDir, `${film}-stills`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const times = at
    ? at.split(",").map(Number)
    : [
        ...Array.from({ length: Number(stills) }, (_, i) => (i * duration) / Number(stills)),
        duration - 1 / fps,
      ];
  for (const [i, t] of times.entries()) {
    await shoot(first, t, path.join(dir, `s${String(i).padStart(2, "0")}.png`));
  }
  const cols = 4;
  const rows = Math.ceil(times.length / cols);
  execFileSync("ffmpeg", [
    "-loglevel",
    "error",
    "-y",
    "-framerate",
    "1",
    "-i",
    path.join(dir, "s%02d.png"),
    "-vf",
    `scale=600:-1:flags=lanczos,tile=${cols}x${rows}:padding=6:color=white`,
    "-frames:v",
    "1",
    path.join(outDir, `${film}-sheet.png`),
  ]);
  console.log(times.map((t, i) => `${i}: ${t.toFixed(2)}s`).join("  "));
  console.log(path.join(outDir, `${film}-sheet.png`));
  await browser.close();
  process.exit(0);
}

const frameDir = path.join(outDir, `${film}-frames`);
rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });
const pages = [first, ...(await Promise.all(Array.from({ length: WORKERS - 1 }, openPage)))];
let next = 0;
const started = Date.now();
await Promise.all(
  pages.map(async (page) => {
    while (next < frames) {
      const i = next++;
      await shoot(page, i / fps, path.join(frameDir, `f${String(i).padStart(4, "0")}.png`));
      if (i % 60 === 0) console.log(`frame ${i}/${frames}`);
    }
  }),
);
await browser.close();
if (readdirSync(frameDir).length !== frames) throw new Error("frame count mismatch");
console.log(`captured ${frames} frames in ${((Date.now() - started) / 1000).toFixed(1)}s`);
encode(frameDir, film, fps, frames, Math.round(Number(flag("--poster-at") ?? 0) * fps));

export function encode(dir, name, rate, count, posterFrame = 0) {
  const mp4 = path.join(outDir, `${name}.mp4`);
  execFileSync("ffmpeg", [
    "-loglevel",
    "error",
    "-y",
    "-framerate",
    String(rate),
    "-i",
    path.join(dir, "f%04d.png"),
    "-vf",
    "scale=1200:630:flags=lanczos",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-profile:v",
    "high",
    "-level",
    "4.0",
    "-g",
    String(rate * 2),
    "-frames:v",
    String(count),
    "-movflags",
    "+faststart",
    "-an",
    mp4,
  ]);
  execFileSync("ffmpeg", [
    "-loglevel",
    "error",
    "-y",
    "-i",
    path.join(dir, `f${String(posterFrame).padStart(4, "0")}.png`),
    "-vf",
    "scale=1200:630:flags=lanczos",
    path.join(outDir, `${name}-poster.png`),
  ]);
  console.log(mp4);
}
