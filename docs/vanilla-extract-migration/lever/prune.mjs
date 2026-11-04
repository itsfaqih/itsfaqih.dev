// Drops imports and module-private constants the inlining left unread, to a fixed point.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
const root = process.cwd();
const req = createRequire(path.join(root, "node_modules/.pnpm/@babel+parser@7.29.8/node_modules/@babel/parser/package.json"));
const { parse } = req("@babel/parser");
const files = execSync("git ls-files -m -o --exclude-standard src scripts", { encoding: "utf8" }).trim().split("\n").filter((f) => /\.tsx?$/.test(f));
const skip = new Set(["loc", "extra", "leadingComments", "trailingComments", "innerComments", "comments", "errors", "tokens"]);
const removed = [];
for (const f of files) {
  let code; try { code = readFileSync(f, "utf8"); } catch { continue; }
  for (let round = 0; round < 8; round++) {
    const ast = parse(code, { sourceType: "module", plugins: ["typescript", ...(f.endsWith("x") ? ["jsx"] : [])] });
    const used = new Set();
    const walk = (n, parent, inTop) => { if (!n || typeof n !== "object") return; if (Array.isArray(n)) return n.forEach((x) => walk(x, parent)); if (n.type === "ImportDeclaration") return; if (n.type === "Identifier") { const key = parent?.type === "ObjectProperty" && parent.key === n && !parent.computed && parent.value !== n; const mem = parent?.type === "MemberExpression" && parent.property === n && !parent.computed; if (!key && !mem) used.add(n.name); } for (const k in n) if (!skip.has(k)) walk(n[k], n.type ? n : parent); };
    const body = ast.program.body;
    const edits = [];
    for (const st of body) {
      if (st.type === "VariableDeclaration" && st.declarations.length === 1 && st.declarations[0].id.type === "Identifier") {
        const name = st.declarations[0].id.name;
        const others = new Set();
        const u0 = new Set(used);
        used.clear();
        for (const o of body) if (o !== st) walk(o);
        if (!used.has(name)) { let start = st.start; const c = st.leadingComments?.[0]; if (c) start = c.start; edits.push([start, st.end, `const ${name}`]); }
        used.clear();
        for (const x of u0) used.add(x);
      }
    }
    used.clear();
    for (const o of body) walk(o);
    for (const st of body.filter((x) => x.type === "ImportDeclaration")) {
      if (!st.specifiers.length) continue;
      const keep = st.specifiers.filter((sp) => used.has(sp.local.name));
      if (keep.length === st.specifiers.length) continue;
      for (const sp of st.specifiers) if (!used.has(sp.local.name)) removed.push(`${f}: import ${sp.local.name}`);
      const src = code.slice(st.source.start, st.source.end);
      const typed = st.importKind === "type" ? "type " : "";
      const def = keep.filter((s) => s.type !== "ImportSpecifier").map((s) => code.slice(s.start, s.end));
      const named = keep.filter((s) => s.type === "ImportSpecifier").map((s) => code.slice(s.start, s.end));
      edits.push([st.start, st.end, keep.length ? `import ${typed}${[...def, ...(named.length ? [`{ ${named.join(", ")} }`] : [])].join(", ")} from ${src};` : "", `import`]);
    }
    if (!edits.length) break;
    edits.sort((a, b) => b[0] - a[0]);
    for (const [a, b, t, kind] of edits) {
      if (kind) { code = code.slice(0, a) + t + code.slice(b); continue; }
      removed.push(`${f}: ${t}`);
      code = code.slice(0, a) + code.slice(b);
    }
  }
  writeFileSync(f, code);
}
console.log(removed.join("\n"));
