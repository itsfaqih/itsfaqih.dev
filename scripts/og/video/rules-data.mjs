// Writes films/rules-data.js from src/data/guidelines.ts, so every word in the rule films comes
// from the site's own data. Run: vp node --experimental-strip-types rules-data.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { colorOf, PUBLISHED_GUIDELINES } from "../../../src/data/guidelines.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
// The dark palette's value for each topic token.
const HEX = {
  cw: "#4dd4ff",
  ux: "#ff6ad5",
  ar: "#ffb02e",
  ts: "#7dff6a",
  ax: "#bca2ff",
  go: "#ffe14d",
};
const rules = PUBLISHED_GUIDELINES.map((rule) => {
  const [from, to] = rule.coverTag.split("→").map((side) => side.trim());
  return {
    id: rule.id,
    label: rule.label,
    title: rule.title,
    claim: rule.claim,
    from,
    to,
    hue: HEX[colorOf(rule.label).match(/--(\w+)/)[1]],
  };
});
writeFileSync(
  path.join(here, "films", "rules-data.js"),
  `window.RULES = ${JSON.stringify(rules, null, 2)};\n`,
);
console.log(rules.map((r) => `${r.id}: ${r.label} | ${r.from} → ${r.to} | ${r.hue}`).join("\n"));
