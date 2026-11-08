import { globSync, readFileSync } from "node:fs";
import { expect, it } from "vite-plus/test";
import { HOVER, REDUCE, TOUCH } from "./media-query";

it("keeps each shared media query in media-query.ts alone", () => {
  const copies = globSync("src/**/*.{ts,astro}", {
    exclude: ["src/browser/media-query.ts"],
  }).filter((file) => {
    const code = readFileSync(file, "utf8");
    return [HOVER, REDUCE, TOUCH].some((query) => code.includes(`"${query}"`));
  });
  expect(copies).toEqual([]);
});
