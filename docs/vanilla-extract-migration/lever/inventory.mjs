// Static inventory: every stylex.create namespace and every attrs/props call's argument shapes.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const require = createRequire(path.join(root, "node_modules/.pnpm/@babel+parser@7.29.8/node_modules/@babel/parser/package.json"));
const { parse, parseExpression } = require("@babel/parser");
const files = execSync("git ls-files src scripts", { encoding: "utf8" }).trim().split("\n").filter(f => /\.(ts|tsx|astro)$/.test(f) && readFileSync(f, "utf8").includes("stylex"));
const argKinds = {};
const sites = [];
function describe(n) {
  switch (n.type) {
    case "MemberExpression": { const o = describe(n.object); return n.computed ? `${o}[${n.property.type === "StringLiteral" ? JSON.stringify(n.property.value) : "?"}]` : `${o}.${n.property.name}`; }
    case "Identifier": return n.name;
    case "CallExpression": return `${describe(n.callee)}()`;
    case "NullLiteral": return "null";
    case "BooleanLiteral": return String(n.value);
    case "SpreadElement": return `...${describe(n.argument)}`;
    case "LogicalExpression": return `{${n.operator} ${describe(n.right)}}`;
    case "ConditionalExpression": return `{? ${describe(n.consequent)} : ${describe(n.alternate)}}`;
    case "ArrayExpression": return `[${n.elements.map(describe).join(", ")}]`;
    case "TSAsExpression": case "TSNonNullExpression": case "ParenthesizedExpression": return describe(n.expression);
    default: return `<${n.type}>`;
  }
}
function callsIn(code, file) {
  const re = /stylex\s*\.\s*(attrs|props)\s*\(/g; let m;
  while ((m = re.exec(code))) {
    let d = 1, i = re.lastIndex, q = null;
    for (; i < code.length && d; i++) { const c = code[i];
      if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === "`") q = c; else if (c === "(") d++; else if (c === ")") d--; }
    const src = code.slice(m.index, i);
    try {
      const e = parseExpression(src, { plugins: ["typescript"] });
      sites.push({ file, line: code.slice(0, m.index).split("\n").length, args: e.arguments.map(describe), argc: e.arguments.length, fn: m[1] });
    } catch (err) { sites.push({ file, line: code.slice(0, m.index).split("\n").length, error: src.slice(0, 200) }); }
  }
}
for (const f of files) callsIn(readFileSync(f, "utf8"), f);
const single = sites.filter(s => s.argc === 1).length;
console.log({ files: files.length, sites: sites.length, single, multi: sites.length - single, errors: sites.filter(s => s.error).length });
const heads = {};
for (const s of sites) for (const a of s.args ?? []) {
  const k = a.replace(/\{\S+ /, "{").replace(/[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)?(\[[^\]]*\])?/g, x => x.includes(".") || x.includes("[") ? "X.y" : "v");
  heads[k] = (heads[k] ?? 0) + 1;
}
console.log(Object.entries(heads).sort((a, b) => b[1] - a[1]).slice(0, 40));
const plain = new Set();
for (const s of sites) for (const a of s.args ?? []) if (/^[A-Za-z_$][\w$]*$/.test(a)) plain.add(a);
console.log([...plain].join(" "));
writeFileSync(process.argv[2], JSON.stringify(sites, null, 1));
