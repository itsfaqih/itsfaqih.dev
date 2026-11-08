import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

// A key's hard drop is a shadow cast straight down with no blur. Written raw, it stays raised
// while its control is disabled; drawn by drop(), it lies flat (styles.css sets --bevel to 0).
const RAW_DROP = /boxShadow:.*(?<![\w.(-])0 \d+(\.\d+)?px 0 (?!0|\d)/;

const styleFiles = readdirSync("src", { recursive: true, encoding: "utf8" })
  .filter((name) => name.endsWith(".css.ts"))
  .map((name) => `src/${name}`);

describe("bevels", () => {
  it("draw every hard drop with drop(), so a disabled key lies flat", () => {
    const raw = styleFiles.flatMap((path) =>
      readFileSync(path, "utf8")
        .split("\n")
        .flatMap((line, i) => (RAW_DROP.test(line) ? [`${path}:${i + 1}`] : [])),
    );
    expect(styleFiles.length).toBeGreaterThan(0);
    expect(raw).toEqual([]);
  });
});
