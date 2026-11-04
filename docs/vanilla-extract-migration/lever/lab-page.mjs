// Writes src/pages/lab.astro in a checkout: one element per namespace and per recorded merge, each
// inside the marker scaffold. usage: lab-page.mjs <checkout> <base|new> <raw.json> <overlap.json> [rename.json]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
const [root, mode, rawF, overF, renameF] = process.argv.slice(2);
const NS = JSON.parse(readFileSync(rawF, "utf8")).namespaces;
const over = JSON.parse(readFileSync(overF, "utf8"));
const rename = renameF ? JSON.parse(readFileSync(renameF, "utf8")) : {};
const combos = new Map();
const add = (l) => combos.set(l.join(" | "), l);
for (const id of Object.keys(NS)) add([id]);
for (const m of over.merges) if (m.list.every((x) => NS[x])) add(m.list);
const files = new Map();
const refOf = (id) => {
  const [f, rest] = id.split("#");
  const dot = rest.indexOf(".");
  const v = rest.slice(0, dot), ns = rest.slice(dot + 1);
  const key = `${f}#${v}`;
  if (!files.has(key)) files.set(key, { f, v, alias: `m${files.size}` });
  return `${files.get(key).alias}[${JSON.stringify(ns)}]`;
};
const list = [...combos.values()].map((l) => ({ key: l.join(" | "), refs: l.map(refOf) }));
for (const { f, v } of files.values()) {
  const file = path.join(root, rename[f] ?? f);
  if (!existsSync(file)) throw new Error(`missing ${file}`);
  let s = readFileSync(file, "utf8");
  const re = new RegExp(`^const ${v}\\b`, "m");
  if (re.test(s)) writeFileSync(file, s.replace(re, `export const ${v}`));
}
const imports = [...files.values()].map(({ f, v, alias }) => {
  const rel = path.relative(path.join(root, "src/pages"), path.join(root, (rename[f] ?? f).replace(/\.ts$/, "")));
  return `import { ${mode === "new" && f === "src/layouts/site.stylex.ts" ? "site" : v} as ${alias} } from ${JSON.stringify(rel)};`;
}).join("\n");
const merged = (r) => (mode === "base" ? `stylex.attrs(${r.join(", ")}).class ?? ""` : `[${r.join(", ")}].join(" ")`);
const markers = mode === "base"
  ? `import * as stylex from "@stylexjs/stylex";\nimport { reveal } from "../rules/rule-landing.stylex";\nimport { row as rowM, tipped } from "../rules/table-design.stylex";\nimport { marker } from "../sections/intro.styles";
const M = stylex.attrs(marker, reveal, rowM, tipped).class ?? "";`
  : `import { marker } from "../when";
import { reveal } from "../rules/rule-landing.vars.css";
import { row as rowM, tipped } from "../rules/table-design.markers";
const M = [marker, reveal, rowM, tipped].join(" ");`;
const page = `---
${markers}
import "../styles.css";
import { THEME_CLASSES } from "../theme";
${imports}
const L: [string, string][] = [
${list.map(({ key, refs }) => `  [${JSON.stringify(key)}, ${merged(refs)}],`).join("\n")}
];
---
<html lang="en" data-themes={JSON.stringify(THEME_CLASSES)}><head><meta charset="utf-8" />${mode === "new" ? `<style is:inline set:html="@layer base, global, under5, under4, under3, under2, under1;"></style>` : ""}<title>lab</title><link rel="canonical" href="https://itsfaqih.dev/lab" /></head><body class="arc">{L.map(([k, c]) => (
<div class:list={["lab-o", M]}><div class:list={["lab-w", M]}><span class:list={["lab-s", M]}></span><div class:list={[c]} data-t={k}><button class="lab-k"></button><a class="lab-k"></a></div></div></div>
))}</body></html>
`;
writeFileSync(path.join(root, "src/pages/lab.astro"), page);
console.log({ elements: list.length, modules: files.size });
