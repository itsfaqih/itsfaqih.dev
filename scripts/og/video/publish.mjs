// Copies the rendered share videos into public/og, where src/seo.ts points og:video.
// Run after rendering: vp node scripts/og/video/publish.mjs
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PUBLISHED_GUIDELINES } from "../../../src/data/guidelines.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
const og = path.join(here, "../../../public/og");
const videos = [
  ["headline.mp4", "home.mp4"],
  ["rule-index.mp4", "rule-of-thumb.mp4"],
  ...PUBLISHED_GUIDELINES.map(({ id }) => [`rule-${id}.mp4`, `rule-of-thumb/${id}.mp4`]),
];
for (const [from, to] of videos) {
  const source = path.join(out, from);
  if (!existsSync(source)) throw new Error(`${from} is not rendered yet; see README.md.`);
  mkdirSync(path.dirname(path.join(og, to)), { recursive: true });
  copyFileSync(source, path.join(og, to));
  console.log(`public/og/${to}`);
}
