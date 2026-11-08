import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

// A left accent bar (an inset shadow along the left edge) runs straight, so the box it marks keeps
// square left corners; a rounded corner bends the bar.
const LEFT_BAR = /boxShadow: [`"]inset \d+px 0 0 /;
const SQUARE_LEFT = /borderTopLeftRadius: 0,[\s\S]*borderBottomLeftRadius: 0,/;

const styleFiles = ["src/rules", "src/sections", "src/components"].flatMap((dir) =>
  readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".css.ts"))
    .map((name) => `${dir}/${name}`),
);

describe("accent bars", () => {
  it("square the left corners of every box with a left bar", () => {
    const bent = styleFiles.flatMap((path) =>
      readFileSync(path, "utf8")
        .split(/(?=\n {2}\w+: style\()/)
        .filter((block) => LEFT_BAR.test(block) && !SQUARE_LEFT.test(block))
        .map((block) => `${path}: ${block.trim().split(":")[0]}`),
    );
    expect(styleFiles.length).toBeGreaterThan(0);
    expect(bent).toEqual([]);
  });
});
