import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "node_modules/.pnpm/@babel+parser@7.29.8/node_modules/@babel/parser/package.json"));
const { parse } = require("@babel/parser");
const files = execSync("git ls-files src scripts tests", { encoding: "utf8" }).trim().split("\n").filter((f) => /\.(ts|tsx)$/.test(f) && readFileSync(f, "utf8").match(/stylex/));
const c = (f, n) => `${f}:${n.loc.start.line}`;
const walk = (n, fn, p) => { if (!n || typeof n !== "object") return; if (Array.isArray(n)) return n.forEach((x) => walk(x, fn, p)); if (n.type) fn(n, p); for (const k in n) if (!["loc", "extra", "leadingComments", "trailingComments", "innerComments"].includes(k)) walk(n[k], fn, n.type ? n : p); };
const out = { nsNotObject: [], nsSpread: [], propNotLeaf: [], propSpread: [], keyComputed: {}, createNotTop: [], kfNotTop: [], attrsCtx: {}, exportsFn: {}, whenCalls: {}, other: {} };
const isStylex = (n, m) => n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object?.name === "stylex" && (!m || n.callee.property.name === m);
const src = {};
for (const f of files) {
  const code = readFileSync(f, "utf8"); src[f] = code;
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const text = (n) => code.slice(n.start, n.end);
  for (const st of ast.program.body) {
    const d = st.type === "ExportNamedDeclaration" ? st.declaration : st;
    if (st.type === "ExportNamedDeclaration" && d) {
      const decls = d.type === "VariableDeclaration" ? d.declarations : [d];
      for (const v of decls) { const init = v.init ?? v; if (/Function/.test(init.type) ) (out.exportsFn[f] ??= []).push(v.id?.name); else if (init.type && !isStylex(init) && !["StringLiteral", "NumericLiteral", "TemplateLiteral", "TSTypeAliasDeclaration", "TSInterfaceDeclaration"].includes(init.type) && d.type === "VariableDeclaration") (out.other[f] ??= []).push(`${v.id.name}:${init.type}`); }
    }
  }
  walk(ast.program, (n, p) => {
    if (isStylex(n, "create")) {
      const arg = n.arguments[0];
      for (const ns of arg.properties) {
        if (ns.type === "SpreadElement") { out.nsSpread.push(c(f, ns)); continue; }
        if (ns.value.type !== "ObjectExpression") { out.nsNotObject.push(`${c(f, ns)} ${text(ns).slice(0, 70)}`); continue; }
        const visit = (o, depth) => { for (const pr of o.properties) {
          if (pr.type === "SpreadElement") { out.propSpread.push(`${c(f, pr)} ${text(pr).slice(0, 50)}`); continue; }
          if (pr.computed) { const k = text(pr.key).slice(0, 40); out.keyComputed[k.replace(/"[^"]*"/g, '"…"')] = (out.keyComputed[k.replace(/"[^"]*"/g, '"…"')] ?? 0) + 1; }
          if (pr.value?.type === "ObjectExpression") visit(pr.value, depth + 1);
          else if (pr.value && !["StringLiteral", "NumericLiteral", "NullLiteral", "TemplateLiteral", "MemberExpression", "Identifier", "UnaryExpression", "BinaryExpression"].includes(pr.value.type)) out.propNotLeaf.push(`${c(f, pr)} ${text(pr).slice(0, 70)}`);
          else if (pr.value?.type === "Identifier" && !/^[A-Z_0-9]+$/.test(pr.value.name)) out.propNotLeaf.push(`ID ${c(f, pr)} ${text(pr).slice(0, 70)}`);
        } };
        visit(ns.value, 0);
      }
    }
    if (isStylex(n, "attrs") || isStylex(n, "props")) {
      const ctx = p?.type === "MemberExpression" && p.object === n ? `.${p.property.name}` : p?.type ?? "?";
      out.attrsCtx[ctx] = (out.attrsCtx[ctx] ?? 0) + 1; if (![".class", ".className"].includes(ctx)) (out.attrsCtxWhere ??= []).push(`${c(f, n)} ${ctx}`);
    }
    if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object?.object?.name === "stylex") { const k = n.callee.property.name; out.whenCalls[k] = (out.whenCalls[k] ?? 0) + 1; }
  });
}
for (const [k, v] of Object.entries(out)) console.log(k, k === "propNotLeaf" ? "\n" + v.join("\n") : JSON.stringify(v).slice(0, 300));
