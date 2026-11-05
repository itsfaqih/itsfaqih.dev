import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Each cue in src/hooks/sound.ts and the soundcn registry item it plays (https://soundcn.xyz). */
const SOURCES = {
  tap: "click-004",
  move: "click-002",
  open: "open-002",
  close: "close-002",
  enter: "select-001",
  back: "back-001",
  on: "switch-on",
  off: "switch-off",
  success: "success-chime",
  error: "error-buzz",
  lift: "card-slide-4",
  place: "drop-002",
  flicker: "glitch-001",
  dive: "maximize-006",
  turn: "book-flip-2",
  fold: "book-flip-3",
};

/** Cues played as another cue's clip run backwards, made with ffmpeg once the sources are in. */
const REVERSED = {
  rise: "dive",
};

// The fields read from a registry item; the checks below reject anything else.
type RegistryItem = {
  meta?: { license?: unknown };
  files?: { content?: unknown }[];
};

const out = path.resolve(import.meta.dirname, "../public/sounds");
mkdirSync(out, { recursive: true });

for (const [cue, item] of Object.entries(SOURCES)) {
  const response = await fetch(`https://soundcn.xyz/r/${item}.json`);
  if (!response.ok) throw new Error(`${item}: HTTP ${response.status}`);
  const registry: RegistryItem = await response.json();
  const license = registry.meta?.license;
  if (license !== "CC0") throw new Error(`${item}: license is ${license}, not CC0`);
  const base64 = registry.files
    ?.map((file) =>
      /dataUri:\s*"data:audio\/mpeg;base64,([A-Za-z0-9+/=]+)"/.exec(String(file.content)),
    )
    .find((match) => match)?.[1];
  if (!base64) throw new Error(`${item}: no data:audio/mpeg dataUri in its files`);
  const bytes = Buffer.from(base64, "base64");
  writeFileSync(path.join(out, `${cue}.mp3`), bytes);
  console.log(`${cue}.mp3  ${item}  ${(bytes.length / 1024).toFixed(1)} KB`);
}

for (const [cue, source] of Object.entries(REVERSED)) {
  const from = path.join(out, `${source}.mp3`);
  const to = path.join(out, `${cue}.mp3`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", from, "-af", "areverse", "-b:a", "64k", to]);
  console.log(`${cue}.mp3  ${source}.mp3 reversed`);
}
