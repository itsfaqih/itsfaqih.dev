import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const require = createRequire(path.join(root, "node_modules/.pnpm/@babel+parser@7.29.8/node_modules/@babel/parser/package.json"));
const { parse, parseExpression } = require("@babel/parser");
const reg = JSON.parse(readFileSync(process.argv[2], "utf8"));
const NS = reg.namespaces;
const files = execSync("git ls-files src scripts", { encoding: "utf8" }).trim().split("\n").filter((f) => /\.(ts|tsx|astro)$/.test(f) && readFileSync(f, "utf8").includes("stylex"));
const groups = {};
for (const id of Object.keys(NS)) { const [f, rest] = id.split("#"); const [v, ns] = rest.split("."); ((groups[f] ??= {})[v] ??= new Set()).add(ns); }
const walk = (n, fn) => { if (!n || typeof n !== "object") return; if (Array.isArray(n)) return n.forEach((x) => walk(x, fn)); if (n.type) fn(n); for (const k in n) if (k !== "loc" && k !== "extra") walk(n[k], fn); };
const resolveImport = (from, spec) => {
  if (!spec.startsWith(".")) return null;
  const base = path.normalize(path.join(path.dirname(from), spec));
  for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) if (existsSync(c) && !c.endsWith("/")) { try { if (readFileSync(c)) return c; } catch {} }
  return null;
};
const scope = {};
const frontmatter = (f, code) => { if (!f.endsWith(".astro")) return code; const m = code.match(/^---\n([\s\S]*?)\n---/); return m ? m[1] : ""; };
const asts = {};
for (const f of files) {
  const code = frontmatter(f, readFileSync(f, "utf8"));
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"], allowReturnOutsideFunction: true, errorRecovery: true });
  asts[f] = ast;
  const s = (scope[f] = { imports: {}, locals: {}, reexports: {} });
  for (const st of ast.program.body) {
    if (st.type === "ImportDeclaration") for (const sp of st.specifiers) if (sp.type === "ImportSpecifier") s.imports[sp.local.name] = [resolveImport(f, st.source.value), sp.imported.name ?? sp.imported.value];
    const d = st.type === "ExportNamedDeclaration" ? st.declaration : st;
    if (d?.type === "VariableDeclaration") for (const v of d.declarations) if (v.id.type === "Identifier") s.locals[v.id.name] = v.init;
  }
}
// Possible namespaces for an expression; `unknown` collects what we could not follow.
const unknown = {}; const computedSites = [];
const NARROW = { lessonKit: /^(bad|good)(Cost)?$/, tree: /^(dir|comp|more)$/, hintKit: /^(up|down|level)$/ };
function nsOf(file, n, seen = new Set()) {
  if (!n) return [];
  const s = scope[file];
  const miss = () => { const k = `${file}: ${n.type === "Identifier" ? n.name : n.type}`; unknown[k] = (unknown[k] ?? 0) + 1; return []; };
  switch (n.type) {
    case "TSAsExpression": case "TSNonNullExpression": case "ParenthesizedExpression": case "TSSatisfiesExpression": return nsOf(file, n.expression, seen);
    case "LogicalExpression": return [...(n.operator === "&&" ? [] : nsOf(file, n.left, seen)), ...nsOf(file, n.right, seen)];
    case "ConditionalExpression": return [...nsOf(file, n.consequent, seen), ...nsOf(file, n.alternate, seen)];
    case "ArrayExpression": return n.elements.flatMap((e) => nsOf(file, e, seen));
    case "NullLiteral": case "BooleanLiteral": return [];
    case "Identifier": {
      if (n.name === "undefined") return [];
      const key = `${file}:${n.name}`; if (seen.has(key)) return []; seen.add(key);
      if (s.locals[n.name]) return nsOf(file, s.locals[n.name], seen);
      if (s.imports[n.name]) { const [f, name] = s.imports[n.name]; if (f && scope[f]?.locals[name]) return nsOf(f, scope[f].locals[name], seen); }
      return miss();
    }
    case "ObjectExpression": return n.properties.flatMap((p) => p.value ? nsOf(file, p.value, seen) : []);
    case "MemberExpression": {
      if (n.object.type === "Identifier") {
        let f = file, v = n.object.name;
        if (s.imports[v]) [f, v] = s.imports[v];
        if (f && groups[f]?.[v]) {
          if (!n.computed) return groups[f][v].has(n.property.name) ? [`${f}#${v}.${n.property.name}`] : miss();
          if (n.property.type === "StringLiteral") return [`${f}#${v}.${n.property.value}`];
          computedSites.push(`${file}: ${v}[...]`); const keep = NARROW[v]; return [...groups[f][v]].filter((x) => !keep || keep.test(x)).map((x) => `${f}#${v}.${x}`);
        }
        const init = f && scope[f]?.locals[v];
        if (init?.type === "ObjectExpression") {
          if (!n.computed) { const p = init.properties.find((p) => p.key?.name === n.property.name || p.key?.value === n.property.name); if (p?.value) return nsOf(f, p.value, seen); }
          else return nsOf(f, init, seen);
        }
      }
      return miss();
    }
    case "CallExpression": { if (n.callee.property?.name === "defaultMarker" || n.callee.property?.name === "defineMarker") return []; return miss(); }
    default: return miss();
  }
}
const sites = [];
for (const f of files) walk(asts[f], (n) => { if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object.name === "stylex" && ["attrs", "props"].includes(n.callee.property.name)) sites.push({ file: f, line: n.loc.start.line, args: n.arguments }); });
// Template call sites in .astro.
for (const f of files.filter((f) => f.endsWith(".astro"))) {
  const code = readFileSync(f, "utf8"); const fm = code.match(/^---\n[\s\S]*?\n---/)?.[0] ?? ""; const body = code.slice(fm.length);
  const re = /stylex\s*\.\s*(attrs|props)\s*\(/g; let m;
  while ((m = re.exec(body))) { let d = 1, i = re.lastIndex, q = null; for (; i < body.length && d; i++) { const c = body[i]; if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === "`") q = c; else if (c === "(") d++; else if (c === ")") d--; }
    const e = parseExpression(body.slice(m.index, i), { plugins: ["typescript"] }); sites.push({ file: f, line: fm.split("\n").length + body.slice(0, m.index).split("\n").length, args: e.arguments }); }
}
const flatten = (raw, stack = [], out = []) => {
  if (raw === null || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith("::")) { flatten(v, [...stack, k], out); continue; }
    out.push({ key: [...stack, k].join("|"), prop: k, tree: v, pseudoEl: stack.join("|") });
  }
  return out;
};
const SH = { padding: ["paddingBlock", "paddingInline", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "paddingBlockStart", "paddingBlockEnd", "paddingInlineStart", "paddingInlineEnd"], paddingBlock: ["paddingTop", "paddingBottom", "paddingBlockStart", "paddingBlockEnd"], paddingInline: ["paddingLeft", "paddingRight", "paddingInlineStart", "paddingInlineEnd"], margin: ["marginBlock", "marginInline", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginBlockStart", "marginBlockEnd", "marginInlineStart", "marginInlineEnd"], marginBlock: ["marginTop", "marginBottom", "marginBlockStart", "marginBlockEnd"], marginInline: ["marginLeft", "marginRight", "marginInlineStart", "marginInlineEnd"], font: ["fontFamily", "fontSize", "fontStyle", "fontWeight", "lineHeight", "fontVariant", "fontStretch"], background: ["backgroundColor", "backgroundImage", "backgroundPosition", "backgroundSize", "backgroundRepeat", "backgroundClip", "backgroundOrigin", "backgroundAttachment"], inset: ["top", "right", "bottom", "left", "insetBlock", "insetInline", "insetBlockStart", "insetBlockEnd", "insetInlineStart", "insetInlineEnd"], gap: ["rowGap", "columnGap"], overflow: ["overflowX", "overflowY"], outline: ["outlineWidth", "outlineStyle", "outlineColor"], border: ["borderWidth", "borderStyle", "borderColor", "borderTop", "borderBottom", "borderLeft", "borderRight", "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopStyle", "borderBottomStyle", "borderLeftStyle", "borderRightStyle", "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor"], borderWidth: ["borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth"], borderStyle: ["borderTopStyle", "borderBottomStyle", "borderLeftStyle", "borderRightStyle"], borderColor: ["borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor"], borderTop: ["borderTopWidth", "borderTopStyle", "borderTopColor"], borderBottom: ["borderBottomWidth", "borderBottomStyle", "borderBottomColor"], borderLeft: ["borderLeftWidth", "borderLeftStyle", "borderLeftColor"], borderRight: ["borderRightWidth", "borderRightStyle", "borderRightColor"], borderRadius: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"], flex: ["flexGrow", "flexShrink", "flexBasis"], flexFlow: ["flexDirection", "flexWrap"], grid: ["gridTemplate", "gridTemplateColumns", "gridTemplateRows", "gridTemplateAreas", "gridAutoFlow"], gridTemplate: ["gridTemplateColumns", "gridTemplateRows", "gridTemplateAreas"], gridArea: ["gridRow", "gridColumn", "gridRowStart", "gridRowEnd", "gridColumnStart", "gridColumnEnd"], gridRow: ["gridRowStart", "gridRowEnd"], gridColumn: ["gridColumnStart", "gridColumnEnd"], transition: ["transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay"], animation: ["animationName", "animationDuration", "animationTimingFunction", "animationDelay", "animationIterationCount", "animationDirection", "animationFillMode", "animationPlayState"], textDecoration: ["textDecorationLine", "textDecorationColor", "textDecorationStyle", "textDecorationThickness"], listStyle: ["listStyleType", "listStylePosition", "listStyleImage"], placeItems: ["alignItems", "justifyItems"], placeContent: ["alignContent", "justifyContent"], placeSelf: ["alignSelf", "justifySelf"], columns: ["columnCount", "columnWidth"], mask: ["maskImage", "maskSize", "maskPosition", "maskRepeat"], };
const covers = (p, q) => SH[p]?.includes(q);

const recorded = JSON.parse(readFileSync(process.argv[4], "utf8"));
const merges = new Map();
const add = (list, where) => { const k = list.join(" | "); if (!merges.has(k)) merges.set(k, { list, where }); };
for (const k of Object.keys(recorded)) add(k.split(" | "), "ssr");
for (const site of sites) {
  const alts = site.args.map((a) => [...new Set(nsOf(site.file, a.type === "SpreadElement" ? a.argument : a))]).filter((x) => x.length);
  for (let i = 0; i < alts.length; i++) for (let j = i + 1; j < alts.length; j++) for (const a of alts[i]) for (const b of alts[j]) if (a !== b) add([a, b], site.file + ":" + site.line);
}
// edge x -> y : x must sit BELOW y. Each edge records which properties caused it.
const below = new Map();
const addEdge = (x, y, why) => { const m = below.get(x) ?? below.set(x, new Map()).get(x); const l = m.get(y) ?? m.set(y, []).get(y); if (!l.includes(why)) l.push(why); };
let longhandBeats = [];
for (const { list, where } of merges.values()) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
  const a = list[i], b = list[j]; if (a === b) continue;
  const A = flatten(NS[a]), B = flatten(NS[b]);
  for (const x of A) for (const y of B) {
    if (x.pseudoEl !== y.pseudoEl) continue;
    if (x.prop === y.prop) addEdge(a, b, x.key);
    else if (covers(x.prop, y.prop)) addEdge(a, b, x.key + "<" + y.key);
    else if (covers(y.prop, x.prop) && x.tree !== y.tree) { addEdge(b, a, y.key + "<" + x.key + " (longhand in earlier arg)"); longhandBeats.push({ where, a, b, x: x.key, y: y.key }); }
  }
}
const nodes = new Set([...below.keys(), ...[...below.values()].flatMap((m) => [...m.keys()])]);
// Tarjan for strongly connected components: anything in a cycle cannot take one layer.
let idx = 0; const st = []; const on = new Set(); const I = new Map(); const L = new Map(); const sccs = [];
const sc = (v) => { I.set(v, idx); L.set(v, idx); idx++; st.push(v); on.add(v); for (const w of below.get(v)?.keys() ?? []) { if (!I.has(w)) { sc(w); L.set(v, Math.min(L.get(v), L.get(w))); } else if (on.has(w)) L.set(v, Math.min(L.get(v), I.get(w))); } if (L.get(v) === I.get(v)) { const c = []; let w; do { w = st.pop(); on.delete(w); c.push(w); } while (w !== v); sccs.push(c); } };
for (const n of nodes) if (!I.has(n)) sc(n);
const cyc = sccs.filter((c) => c.length > 1);
console.log("computed", [...new Set(computedSites)]); console.log({ merges: merges.size, nodes: nodes.size, cycles: cyc.length, reverseLonghand: longhandBeats.length });
for (const c of cyc) { console.log("--- cycle"); for (const v of c) for (const [w, why] of below.get(v) ?? []) if (c.includes(w)) console.log(" ", v.split("#")[1], "below", w.split("#")[1], "::", why.join(", ")); console.log("  file", c[0].split("#")[0]); }
const rank = new Map();
const R = (v, seen = new Set()) => { if (rank.has(v)) return rank.get(v); if (seen.has(v)) return 0; seen.add(v); let r = 0; for (const w of below.get(v)?.keys() ?? []) r = Math.max(r, 1 + R(w, seen)); rank.set(v, r); return r; };
for (const n of nodes) R(n);
const hist = {}; for (const r of rank.values()) hist[r] = (hist[r] ?? 0) + 1;
console.log("rank histogram", hist);
// Same namespace: a conditional shorthand next to a plain longhand, where specificity and StyleX's priority disagree.
const same = [];
for (const [id, raw] of Object.entries(NS)) { const F = flatten(raw); for (const x of F) for (const y of F) if (x.pseudoEl === y.pseudoEl && covers(x.prop, y.prop)) same.push({ id: id.split("#")[1], file: id.split("#")[0], short: x.key, cond: typeof x.tree === "object" && x.tree ? Object.keys(x.tree) : "", long: y.key, lcond: typeof y.tree === "object" && y.tree ? Object.keys(y.tree) : "" }); }
console.log("same-namespace shorthand+longhand", same.length, "with conditions", same.filter((s) => s.cond).length);
console.log(same.filter((s) => s.cond).slice(0, 25));
const seen = new Set(); console.log("reverse longhand"); for (const l of longhandBeats) { const k = l.a + l.b + l.x + l.y; if (!seen.has(k)) { seen.add(k); console.log(" ", l.where, l.a.split("#")[1], l.x, "<-beats-", l.b.split("#")[1], l.y); } }
writeFileSync(process.argv[3], JSON.stringify({ rank: [...rank], below: [...below].map(([k, m]) => [k, [...m]]), merges: [...merges.values()], cycles: cyc, unknown }, null, 1));
const hasDefault = (t) => t === null ? false : typeof t !== "object" ? true : hasDefault(t.default);
const nullish = {};
for (const { list, where } of merges.values()) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
  const A = flatten(NS[list[i]]), B = flatten(NS[list[j]]);
  for (const x of A) for (const y of B) if (x.key === y.key && !hasDefault(y.tree)) {
    const k = `${list[i].split("#")[1]} ${list[j].split("#")[1]} ${x.key}`;
    nullish[k] ??= { where, file: list[i].split("#")[0], early: x.tree, late: y.tree };
  }
}
console.log("late tree has no default", Object.keys(nullish).length);
for (const [k, v] of Object.entries(nullish)) console.log(k, v.where.split("/").pop(), JSON.stringify(v.early), "=>", JSON.stringify(v.late));
