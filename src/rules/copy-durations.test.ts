import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

// Copy says how long a scenario takes in plain words ("which takes a few seconds"), not "600ms".
// A figure stays only where it is the advice itself ("Wait 200ms") or a label on a chart or
// timeline the reader can see, so this catches the prose form: a verb of waiting, then a time.
const DESCRIBED_TIME =
  /\b(?:takes?|took|waits|lands?|vanish(?:es)?|fades?|lasts?|sits|hangs)(?: [a-z]+){0,2} (?:for |in |about |at )?\d[\d.]* ?(?:ms|s|secs?|seconds?|minutes?)\b/gi;

const copyFiles = [
  ...readdirSync("src/rules")
    .filter((name) => /\.(astro|ts)$/.test(name) && !/\.(css|client|test)\.ts$/.test(name))
    .map((name) => `src/rules/${name}`),
  ...readdirSync("public/rule-of-thumb").map((name) => `public/rule-of-thumb/${name}`),
];

describe("rule copy", () => {
  it("describes how long things take in words, not exact times", () => {
    const found = copyFiles.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(DESCRIBED_TIME)].map((m) => `${path}: ${m[0]}`),
    );
    expect(found).toEqual([]);
  });
});
