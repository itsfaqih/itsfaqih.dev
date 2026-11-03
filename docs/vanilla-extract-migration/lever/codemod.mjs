// StyleX to vanilla-extract. Run from a clean tree: vp node codemod.mjs <overlap.json> <out-rename.json>
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const req = createRequire(path.join(root, "node_modules/.pnpm/@babel+parser@7.29.8/node_modules/@babel/parser/package.json"));
const { parse } = req("@babel/parser");
const { getPriority } = createRequire(path.join(root, "node_modules/.pnpm/@stylexjs+shared@0.19.1/node_modules/@stylexjs/shared/package.json"))("./lib/index.js").default ?? createRequire(path.join(root, "node_modules/.pnpm/@stylexjs+shared@0.19.1/node_modules/@stylexjs/shared/package.json"))("./lib/index.js");
const [overF, renameF] = process.argv.slice(2);
const rank = new Map(JSON.parse(readFileSync(overF, "utf8")).rank);
const SH = { padding: ["paddingBlock", "paddingInline", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "paddingBlockStart", "paddingBlockEnd", "paddingInlineStart", "paddingInlineEnd"], paddingBlock: ["paddingTop", "paddingBottom", "paddingBlockStart", "paddingBlockEnd"], paddingInline: ["paddingLeft", "paddingRight", "paddingInlineStart", "paddingInlineEnd"], margin: ["marginBlock", "marginInline", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginBlockStart", "marginBlockEnd", "marginInlineStart", "marginInlineEnd"], marginBlock: ["marginTop", "marginBottom", "marginBlockStart", "marginBlockEnd"], marginInline: ["marginLeft", "marginRight", "marginInlineStart", "marginInlineEnd"], font: ["fontFamily", "fontSize", "fontStyle", "fontWeight", "lineHeight"], background: ["backgroundColor", "backgroundImage", "backgroundPosition", "backgroundPositionX", "backgroundPositionY", "backgroundSize", "backgroundRepeat", "backgroundClip", "backgroundOrigin", "backgroundAttachment"], backgroundPosition: ["backgroundPositionX", "backgroundPositionY"], inset: ["top", "right", "bottom", "left", "insetBlock", "insetInline", "insetBlockStart", "insetBlockEnd", "insetInlineStart", "insetInlineEnd"], gap: ["rowGap", "columnGap"], overflow: ["overflowX", "overflowY"], outline: ["outlineWidth", "outlineStyle", "outlineColor"], border: ["borderWidth", "borderStyle", "borderColor", "borderTop", "borderBottom", "borderLeft", "borderRight", "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopStyle", "borderBottomStyle", "borderLeftStyle", "borderRightStyle", "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor"], borderWidth: ["borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth"], borderStyle: ["borderTopStyle", "borderBottomStyle", "borderLeftStyle", "borderRightStyle"], borderColor: ["borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor"], borderRadius: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"], flex: ["flexGrow", "flexShrink", "flexBasis"], flexFlow: ["flexDirection", "flexWrap"], gridTemplate: ["gridTemplateColumns", "gridTemplateRows", "gridTemplateAreas"], gridArea: ["gridRow", "gridColumn", "gridRowStart", "gridRowEnd", "gridColumnStart", "gridColumnEnd"], gridRow: ["gridRowStart", "gridRowEnd"], gridColumn: ["gridColumnStart", "gridColumnEnd"], transition: ["transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay"], animation: ["animationName", "animationDuration", "animationTimingFunction", "animationDelay", "animationIterationCount", "animationDirection", "animationFillMode", "animationPlayState"], textDecoration: ["textDecorationLine", "textDecorationColor", "textDecorationStyle", "textDecorationThickness"], placeItems: ["alignItems", "justifyItems"], placeContent: ["alignContent", "justifyContent"], placeSelf: ["alignSelf", "justifySelf"], mask: ["maskImage", "maskSize", "maskPosition", "maskRepeat"] };

const HAND = { "src/theme.stylex.ts": "src/theme.vars.css", "src/theme.ts": "src/theme", "src/rules/rule-landing.stylex.ts": "src/rules/rule-landing.vars.css", "src/rules/table-design.stylex.ts": "src/rules/table-design.markers" };
const SKIP = new Set([...Object.keys(HAND), "scripts/og/card.tsx"]);
const tracked = execSync("git ls-files src scripts tests", { encoding: "utf8" }).trim().split("\n").filter((f) => existsSync(f));
const trackedSet = new Set(tracked);
const tsFiles = tracked.filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".d.ts"));
const stylexFiles = tsFiles.filter((f) => /@stylexjs\/stylex/.test(readFileSync(f, "utf8")) && !SKIP.has(f));
const allStyle = [...new Set([...stylexFiles, ...tsFiles.filter((f) => /\.styles?$|\.styles\.ts$/.test(f))])];

const walk = (n, fn, parent) => { if (!n || typeof n !== "object") return; if (Array.isArray(n)) return n.forEach((x) => walk(x, fn, parent)); if (n.type) { if (fn(n, parent) === false) return; } for (const k in n) if (!["loc", "extra", "leadingComments", "trailingComments", "innerComments", "comments", "errors", "tokens"].includes(k)) walk(n[k], fn, n.type ? n : parent); };
const unwrap = (n) => { while (n && ["TSAsExpression", "TSSatisfiesExpression", "ParenthesizedExpression", "TSNonNullExpression"].includes(n.type)) n = n.expression; return n; };
const isSx = (n, m) => n?.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object?.name === "stylex" && (!m || n.callee.property.name === m);
const isWhen = (n) => n?.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object?.object?.name === "stylex" && n.callee.object?.property?.name === "when";
const rootsCall = (n) => isSx(n, "create") || isSx(n, "keyframes");

const mods = {};
const load = (f) => {
  if (mods[f]) return mods[f];
  const code = readFileSync(f, "utf8");
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", ...(f.endsWith("x") ? ["jsx"] : [])] });
  const m = (mods[f] = { f, code, ast, locals: {}, imports: {}, stmts: [] });
  let prevEnd = 0;
  for (const st of ast.program.body) {
    let end = st.end;
    const nl = code.indexOf("\n", end);
    const tail = code.slice(end, nl < 0 ? code.length : nl);
    if (/^\s*\/\//.test(tail)) end = nl;
    const s = { node: st, start: prevEnd, end, defs: [], refs: new Set(), kind: "other" };
    prevEnd = end;
    const d = st.type === "ExportNamedDeclaration" ? st.declaration : st;
    s.exported = st.type === "ExportNamedDeclaration" && !!st.declaration;
    if (st.type === "ImportDeclaration") { s.kind = "import"; for (const sp of st.specifiers) if (sp.type === "ImportSpecifier") m.imports[sp.local.name] = [st.source.value, sp.imported.name ?? sp.imported.value]; }
    else if (d?.type === "VariableDeclaration") for (const v of d.declarations) { if (v.id.type === "Identifier") { s.defs.push(v.id.name); m.locals[v.id.name] = v.init; } else walk(v.id, (x) => { if (x.type === "Identifier") s.defs.push(x.name); }); }
    else if (d?.type === "FunctionDeclaration") s.defs.push(d.id.name);
    else if (d?.type === "TSTypeAliasDeclaration" || d?.type === "TSInterfaceDeclaration") { s.defs.push(d.id.name); s.kind = "type"; }
    if (s.kind !== "import") walk(st, (n, p) => { if (n.type === "Identifier") { if (p?.type === "MemberExpression" && p.property === n && !p.computed) return; if (p?.type === "ObjectProperty" && p.key === n && !p.computed && p.value !== n) return; s.refs.add(n.name); } });
    m.stmts.push(s);
  }
  m.tailStart = prevEnd;
  return m;
};
const resolveSpec = (from, spec) => { if (!spec.startsWith(".")) return null; const base = path.normalize(path.join(path.dirname(from), spec)); for (const c of [`${base}.ts`, `${base}.tsx`, base, `${base}/index.ts`]) if (trackedSet.has(c) && /\.tsx?$/.test(c)) return c; return null; };

// Condition keys are evaluated, not guessed, so priorities come from the same strings StyleX saw.
const evalStr = (m, n, stack = 0) => {
  n = unwrap(n);
  if (stack > 20) throw new Error("cycle");
  if (n.type === "StringLiteral") return n.value;
  if (n.type === "TemplateLiteral") return n.quasis.map((q, i) => q.value.cooked + (n.expressions[i] ? evalStr(m, n.expressions[i], stack + 1) : "")).join("");
  if (n.type === "BinaryExpression") return evalStr(m, n.left, stack + 1) + evalStr(m, n.right, stack + 1);
  if (n.type === "Identifier") {
    if (m.locals[n.name]) return evalStr(m, m.locals[n.name], stack + 1);
    if (m.imports[n.name]) { const [spec, name] = m.imports[n.name]; const f = resolveSpec(m.f, spec); if (f && f.startsWith("src")) { const t = load(f); if (t.locals[name]) return evalStr(t, t.locals[name], stack + 1); } }
    throw new Error(`cannot eval ${n.name} in ${m.f}`);
  }
  if (isWhen(n)) { const kind = n.callee.property.name; const st = evalStr(m, n.arguments[0], stack + 1); const mk = n.arguments[1]?.name ? `marker-${n.arguments[1].name}` : "x-default-marker"; return kind === "ancestor" ? `:where(.${mk}${st} *)` : `:where(.${mk}${st} ~ *)`; }
  throw new Error(`cannot eval ${n.type} in ${m.f}:${n.loc?.start.line}`);
};
const spec = (sel) => {
  let a = 0, b = 0, i = 0; const s = sel;
  const args = (o) => { let d = 1, j = o, parts = [], st = o; while (j < s.length && d) { const c = s[j]; if (c === "(") d++; else if (c === ")") { d--; if (!d) break; } else if (c === "," && d === 1) { parts.push(s.slice(st, j)); st = j + 1; } j++; } parts.push(s.slice(st, j)); return { parts, end: j + 1 }; };
  while (i < s.length) {
    const r = s.slice(i);
    let x;
    if ((x = r.match(/^::[\w-]+/))) { b++; i += x[0].length; }
    else if ((x = r.match(/^:(is|not|has|where)\(/))) { const { parts, end } = args(i + x[0].length); if (x[1] !== "where") { let best = [0, 0]; for (const p of parts) { const q = spec(p); if (q[0] > best[0] || (q[0] === best[0] && q[1] > best[1])) best = q; } a += best[0]; b += best[1]; } i = end; }
    else if ((x = r.match(/^:[\w-]+\(/))) { const { end } = args(i + x[0].length); a++; i = end; }
    else if ((x = r.match(/^:[\w-]+/))) { a++; i += x[0].length; }
    else if ((x = r.match(/^\.[\w-]+/))) { a++; i += x[0].length; }
    else if ((x = r.match(/^\[[^\]]*\]/))) { a++; i += x[0].length; }
    else if ((x = r.match(/^[a-zA-Z][\w-]*/))) { b++; i += x[0].length; }
    else i++;
  }
  return [a, b];
};
const cmp = (x, y) => { for (let i = 0; i < x.length; i++) { if (x[i] < y[i]) return -1; if (x[i] > y[i]) return 1; } return 0; };
const lit = (s) => JSON.stringify(s);
const tmpl = (parts) => { if (parts.every((p) => p.lit !== undefined)) return lit(parts.map((p) => p.lit).join("")); return "`" + parts.map((p) => (p.lit !== undefined ? p.lit.replace(/[`\\$]/g, "\\$&") : "${" + p.expr + "}")).join("") + "`"; };

const MAX_PX = /^@media \(max-width: (\d+)px\)$/;
const rangeOf = (c) => {
  const top = c.ev.match(MAX_PX), lows = (c.neg ?? []).map((o) => o.ev.match(MAX_PX)).filter(Boolean).map((x) => +x[1]);
  if (!top || !lows.length) return null;
  const low = Math.max(...lows);
  if (low >= +top[1]) throw new Error(`empty range: ${c.ev} after ${low}`);
  return { low, text: `(min-width: ${low}.01px) and (max-width: ${top[1]}px)` };
};
const report = { fnOnCss: [], lostComments: [], usedNonKey: [], treeCalls: [], negated: [], deadQueries: [], ties: [] };
const moved = {}; // old file -> { name -> new spec path without .ts }
const usedLayers = new Set();

function convertNamespace(m, id, node, subst = {}) {
  const text = (n) => { let t = m.code.slice(n.start, n.end); return t; };
  const leaves = []; const comments = [];
  const cm = (n) => (n.leadingComments ?? []).map((c) => m.code.slice(c.start, c.end));
  const trailing = (n) => (n.trailingComments ?? []).filter((c) => m.code.slice(n.end, c.start).trim() === "," || m.code.slice(n.end, c.start).trim() === "").map((c) => m.code.slice(c.start, c.end));
  const condOf = (pr) => {
    if (!pr.computed) { const v = pr.key.value ?? pr.key.name; return v.startsWith("@media") ? { media: { lit: v.replace(/^@media\s*/, "") }, ev: v } : { sel: { lit: v }, ev: v }; }
    const k = unwrap(pr.key); const ev = evalStr(m, k);
    if (ev.startsWith("@media")) { const t = text(k); return { media: { expr: /^[`"']@media\s/.test(t) ? t[0] + t.slice(1).replace(/^@media\s+/, "") : t }, ev }; }
    if (isWhen(k)) return { sel: { expr: text(k).replace(/^stylex\.when/, "when") }, ev, when: true };
    const initOf = k.type === "Identifier" ? (m.locals[k.name] ? unwrap(m.locals[k.name]) : null) : null;
    return { sel: { expr: text(k) }, ev, when: ev.startsWith(":where(") };
  };
  const leaf = (prop, pe, conds, valueNode, sub, cs) => {
    let v = unwrap(valueNode);
    if (v.type === "Identifier" && sub[v.name] !== undefined) { const s = sub[v.name]; if (s === null) return; leaves.push({ prop, pe, conds, value: s, cs, idx: leaves.length }); return; }
    if (v.type === "NullLiteral") { if (cs.length) comments.push(...cs); return; }
    leaves.push({ prop, pe, conds, valueNode, value: text(valueNode), numeric: v.type === "NumericLiteral" || v.type === "UnaryExpression", cs, idx: leaves.length });
  };
  const tree = (prop, pe, conds, n, sub, cs) => {
    n = unwrap(n);
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && m.locals[n.callee.name]?.type === "ArrowFunctionExpression" && unwrap(m.locals[n.callee.name].body).type === "ObjectExpression") {
      const fn = m.locals[n.callee.name]; const inner = { ...sub }; fn.params.forEach((p, i) => { const a = unwrap(n.arguments[i]); inner[p.name] = a.type === "NullLiteral" ? null : text(a); });
      report.treeCalls.push(`${m.f}:${n.loc.start.line}`);
      return tree(prop, pe, conds, unwrap(fn.body), inner, cs);
    }
    if (n.type === "Identifier" && m.locals[n.name] && unwrap(m.locals[n.name]).type === "ObjectExpression" && !sub[n.name]) return tree(prop, pe, conds, unwrap(m.locals[n.name]), sub, cs);
    if (n.type !== "ObjectExpression") return leaf(prop, pe, conds, n, sub, cs);
    let first = cs;
    const entries = n.properties.map((pr) => ({ pr, key: !pr.computed ? (pr.key.value ?? pr.key.name) : null, cond: !pr.computed && (pr.key.value ?? pr.key.name) === "default" ? null : condOf(pr) }));
    const medias = entries.filter((e) => e.cond?.media);
    entries.forEach((e, i) => {
      const pc = [...first, ...cm(e.pr)]; first = [];
      if (e.key === "default") return tree(prop, pe, conds, e.pr.value, sub, pc);
      if (e.cond.media && medias.slice(medias.indexOf(e) + 1).some((o) => !o.cond.ev.includes("("))) { report.deadQueries.push(`${id} ${prop} ${e.cond.ev}`); return; }
      if (e.cond.media) { const mine = medias.indexOf(e); e.cond.neg = medias.slice(mine + 1).map((o) => o.cond); if (e.cond.neg.length) report.negated.push(`${id} ${prop}`); }
      tree(prop, pe, [...conds, e.cond], e.pr.value, sub, pc);
    });
  };
  const top = (obj, pe, sub) => {
    for (const pr of obj.properties) {
      if (pr.type === "SpreadElement") { const a = unwrap(pr.argument); const t = a.type === "Identifier" ? unwrap(m.locals[a.name]) : null; if (t?.type !== "ObjectExpression") throw new Error(`spread ${m.f}:${pr.loc.start.line}`); top(t, pe, sub); continue; }
      const key = pr.computed ? evalStr(m, pr.key) : (pr.key.value ?? pr.key.name);
      if (key.startsWith("::")) { comments.push(...cm(pr)); top(unwrap(pr.value), key, sub); continue; }
      tree(key, pe, [], pr.value, sub, [...cm(pr)]);
    }
  };
  const obj = unwrap(node);
  if (obj.type === "Identifier") top(unwrap(m.locals[obj.name]), null, subst); else top(obj, null, subst);

  // Branches: StyleX's specificity and sort order against the order these rules print in here.
  for (const l of leaves) {
    l.media = l.conds.filter((c) => c.media); l.sel = l.conds.filter((c) => c.sel);
    l.mediaKey = l.media.map((c) => c.ev + (c.neg ?? []).map((o) => ` !${o.ev}`).join("")).join(" & ");
    l.selEv = l.sel.map((c) => c.ev).join("");
    const when = l.sel.some((c) => c.ev.startsWith(":where(") && c.when !== false && c.when);
    const doubled = l.media.length > 0 || when;
    const [a, b] = spec(l.selEv + (l.pe ?? ""));
    l.sx = [1 + (doubled ? 1 : 0) + a, b];
    l.pri = l.conds.reduce((n, c) => n + getPriority(c.ev), 0);
    l.bump = 0;
  }
  const byProp = {}; for (const l of leaves) (byProp[(l.pe ?? "") + "|" + l.prop] ??= []).push(l);
  // StyleX folds `max-width: A and not max-width: B` into `min-width: B.01px and max-width: A`, and sorts it after plain
  // queries. Chrome rounds 480.01px to 480, so at exactly B both match and the range wins. Keep that order.
  const low = (l) => { for (const c of l.media) { const r = rangeOf(c); if (r) return r.low; } return 0; };
  const edges = new Map(); const firstSeen = new Map();
  for (const l of leaves) if (l.mediaKey && !firstSeen.has(l.mediaKey)) firstSeen.set(l.mediaKey, firstSeen.size);
  for (const list of Object.values(byProp)) for (const x of list) for (const y of list) if (x.mediaKey && y.mediaKey && x.mediaKey !== y.mediaKey && x.pri === y.pri && cmp(x.sx, y.sx) === 0 && (low(x) === low(y) ? x.idx < y.idx : low(x) < low(y))) { if (!edges.has(x.mediaKey)) edges.set(x.mediaKey, new Set()); edges.get(x.mediaKey).add(y.mediaKey); }
  const queryRank = new Map();
  { const left = new Set(firstSeen.keys()); while (left.size) { const free = [...left].filter((k) => ![...left].some((o) => edges.get(o)?.has(k))); const pick = (free.length ? free : [...left]).sort((a, b) => firstSeen.get(a) - firstSeen.get(b))[0]; queryRank.set(pick, queryRank.size); left.delete(pick); } }
  const order = (l) => [l.media.length ? 1 : 0, queryRank.get(l.mediaKey) ?? -1, l.sel.length || l.bump || l.pe ? 1 : 0, l.pri, l.selEv];
  const specOf = (x) => { const q = spec(x.selEv + (x.pe ?? "")); return [1 + q[0] + x.bump, q[1]]; };
  // StyleX breaks a tie by the declaration's text, so a pair of states can flip with its values.
  const valueOf = (l) => { try { return String(evalStr(m, l.valueNode)); } catch { return l.value; } };
  const veAhead = (x, y) => { const c = cmp(specOf(x), specOf(y)); if (c) return c > 0; return cmp(order(x), order(y)) > 0; };
  const sxAhead = (x, y) => { const c = cmp(x.sx, y.sx); if (c) return c > 0; if (x.pri !== y.pri) return x.pri > y.pri; if (x.mediaKey !== y.mediaKey && x.mediaKey && y.mediaKey) return low(x) === low(y) ? x.idx > y.idx : low(x) > low(y); const byValue = valueOf(x).localeCompare(valueOf(y)); if (byValue) return byValue > 0; return `${x.mediaKey}${x.selEv}`.localeCompare(`${y.mediaKey}${y.selEv}`) > 0; };
  for (const list of Object.values(byProp)) for (const x of list) for (const y of list) if (x.idx < y.idx && x.mediaKey === y.mediaKey && x.selEv !== y.selEv && x.pri === y.pri && cmp(x.sx, y.sx) === 0) report.ties.push(`${id} ${x.prop}: ${x.selEv} ${sxAhead(x, y) ? ">" : "<"} ${y.selEv}`);
  for (const list of Object.values(byProp)) {
    for (let round = 0; round < 6; round++) {
      let changed = false;
      for (const x of list) for (const y of list) if (x !== y && sxAhead(x, y) && !veAhead(x, y)) { x.bump++; changed = true; }
      if (!changed) break;
    }
  }
  // Groups.
  const G = new Map();
  const groupKey = (l) => [l.mediaKey, l.sel.map((c) => c.sel.expr ?? c.sel.lit).join("") + "|" + l.bump + "|" + (l.pe ?? "")].join("§");
  for (const l of leaves) { const k = groupKey(l); if (!G.has(k)) G.set(k, { media: l.media, sel: l.sel, bump: l.bump, pe: l.pe, pri: l.pri, selEv: l.selEv, mediaKey: l.mediaKey, leaves: [] }); G.get(k).leaves.push(l); }
  const decls = (ls) => {
    const out = [...ls];
    for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) if (SH[out[j].prop]?.includes(out[i].prop)) { out.splice(i, 0, out.splice(j, 1)[0]); }
    const plain = out.filter((l) => !l.prop.startsWith("--")), vars = out.filter((l) => l.prop.startsWith("--"));
    const line = (l) => `${l.cs.length ? l.cs.join("\n") + "\n" : ""}${/^[a-zA-Z]+$/.test(l.prop) ? l.prop : lit(l.prop)}: ${l.value},`;
    const vline = (l) => `${l.cs.length ? l.cs.join("\n") + "\n" : ""}${lit(l.prop)}: ${l.numeric ? `"${l.value}"` : l.value},`;
    return [...plain.map(line), ...(vars.length ? [`vars: {\n${vars.map(vline).join("\n")}\n},`] : [])];
  };
  const selKey = (g) => tmpl([{ lit: "&".repeat(1 + g.bump) }, ...g.sel.map((c) => c.sel), ...(g.pe ? [{ lit: g.pe }] : [])]);
  const body = (groups) => {
    const out = [];
    const plain = groups.filter((g) => !g.sel.length && !g.pe && !g.bump);
    out.push(...decls(plain.flatMap((g) => g.leaves)));
    const sels = groups.filter((g) => g.sel.length || g.pe || g.bump).sort((x, y) => cmp([x.pri, x.selEv], [y.pri, y.selEv]));
    if (sels.length) { out.push(`selectors: {\n${sels.map((g) => { const k = selKey(g); return `${k.startsWith("`") ? `[${k}]` : k}: {\n${decls(g.leaves).join("\n")}\n},`; }).join("\n")}\n},`); }
    return out;
  };
  const queryPart = (c) => (c.media.expr ? "${" + c.media.expr + "}" : c.media.lit);
  const queryKey = (media) => {
    const parts = [];
    for (const c of media) {
      if (/,|^@media\s+not\b/.test(c.ev)) throw new Error(`cannot join ${c.ev} in ${m.f}`);
      const r = rangeOf(c);
      parts.push(r ? r.text : queryPart(c));
      for (const o of (c.neg ?? []).filter((o) => !r || !o.ev.match(MAX_PX))) { if (!o.ev.includes("(")) throw new Error(`cannot negate ${o.ev} in ${m.f}`); parts.push(`(not (${queryPart(o)}))`); }
    }
    if (parts.length === 1 && !rangeOf(media[0])) return media[0].media.expr ? `[${media[0].media.expr}]` : lit(media[0].media.lit);
    const text = parts.join(" and ");
    return text.includes("${") ? "[`" + text + "`]" : lit(text);
  };
  const nest = (groups) => {
    const out = body(groups.filter((g) => !g.media.length));
    const byQ = new Map();
    for (const g of groups.filter((g) => g.media.length)) { const k = queryKey(g.media); if (!byQ.has(k)) byQ.set(k, { k, ev: g.mediaKey, list: [] }); byQ.get(k).list.push(g); }
    const qs = [...byQ.values()].sort((a, b) => queryRank.get(a.ev) - queryRank.get(b.ev));
    if (qs.length) out.push(`"@media": {\n${qs.map(({ k, list }) => `${k}: {\n${body(list).join("\n")}\n},`).join("\n")}\n},`);
    return out;
  };
  let inner = nest([...G.values()]).join("\n");
  const r = rank.get(id) ?? 0;
  if (r > 0) { usedLayers.add(r); inner = `"@layer": {\n[under${r}]: {\n${inner}\n},\n},`; }
  const tail = comments.length ? comments.join("\n") + "\n" : "";
  return `style({\n${tail}${inner}\n})`;
}

function convertKeyframes(m, call) {
  const obj = unwrap(call.arguments[0]);
  const frames = obj.properties.map((f) => {
    const key = m.code.slice(f.key.start, f.key.end); const k = f.computed ? `[${key}]` : key;
    const v = unwrap(f.value);
    if (v.type !== "ObjectExpression") return `${k}: ${m.code.slice(f.value.start, f.value.end)},`;
    const plain = [], vars = [];
    for (const p of v.properties) { const name = p.key?.value ?? p.key?.name; const t = m.code.slice(p.start, p.end); if (name?.startsWith("--")) vars.push(t.replace(/:\s*(-?[\d.]+)$/, ': "$1"')); else plain.push(t); }
    const cmt = (f.leadingComments ?? []).map((c) => m.code.slice(c.start, c.end) + "\n").join("");
    return `${cmt}${k}: {${plain.join(", ")}${plain.length && vars.length ? ", " : ""}${vars.length ? `vars: {${vars.join(", ")}}` : ""}},`;
  });
  return `keyframes({\n${frames.join("\n")}\n})`;
}

// Edits to one statement: [start, end, text], absolute offsets.
function callSiteEdits(m, st) {
  const edits = []; const code = m.code;
  walk(st.node, (n, p) => {
    if (n.type === "TSTypeReference" && n.typeName?.type === "TSQualifiedName" && n.typeName.left.name === "stylex" && n.typeParameters) { edits.push([n.start, n.end, "ClassValue"]); return false; }
    if (n.type === "TSQualifiedName" && n.left.name === "stylex") { edits.push([n.start, n.end, n.right.name === "StyleXStyles" || n.right.name === "StyleXArray" || n.right.name === "CompiledStyles" ? "ClassValue" : `/*?${n.right.name}*/`]); return false; }
    if (isWhen(n)) { edits.push([n.callee.object.start, n.callee.object.end, "when"]); }
    if (isSx(n, "defaultMarker")) { edits.push([n.start, n.end, "marker"]); return false; }
  });
  const attrs = [];
  walk(st.node, (n) => { if (isSx(n, "attrs") || isSx(n, "props")) attrs.push(n); });
  for (const n of attrs) edits.push([n.callee.start, n.callee.end, "cx"]);
  walk(st.node, (n, p) => {
    if (n.type === "MemberExpression" && !n.computed && ["class", "className"].includes(n.property.name)) {
      let containsAttrs = false; const inner = unwrap(n.object);
      if (isSx(inner, "attrs") || isSx(inner, "props")) containsAttrs = true;
      if (inner.type === "ConditionalExpression" && (isSx(unwrap(inner.consequent), "attrs") || isSx(unwrap(inner.alternate), "attrs"))) containsAttrs = true;
      if (containsAttrs) { let dot = n.property.start - 1; while (m.code[dot] !== ".") dot--; edits.push([dot, n.property.end, ""]); }
    }
  });
  walk(st.node, (n) => { if (n.type === "LogicalExpression" && n.operator === "??" && n.right.type === "StringLiteral" && n.right.value === "" && n.left.type === "MemberExpression" && ["class", "className"].includes(n.left.property.name)) { const inner = unwrap(n.left.object); if (isSx(inner, "attrs") || isSx(inner, "props") || (inner.type === "ConditionalExpression" && (isSx(unwrap(inner.consequent), "attrs")))) edits.push([n.left.end, n.end, ""]); } });
  return edits;
}
const applyEdits = (code, start, end, edits) => { const within = edits.filter((e) => e[0] >= start && e[1] <= end).sort((a, b) => b[0] - a[0] || b[1] - a[1]); let s = code.slice(start, end); for (const [a, b, t] of within) s = s.slice(0, a - start) + t + s.slice(b - start); return s; };

const plan = {};
for (const f of stylexFiles) {
  const m = load(f);
  const body = m.stmts.filter((s) => s.kind !== "import");
  const defBy = new Map(); for (const s of body) for (const d of s.defs) defBy.set(d, s);
  const isMarker = (s) => { const d = s.node.type === "ExportNamedDeclaration" ? s.node.declaration : s.node; return d?.type === "VariableDeclaration" && d.declarations.length === 1 && isSx(d.declarations[0].init, "defaultMarker"); };
  const css = new Set();
  for (const s of body) { let root = false; walk(s.node, (n) => { if (rootsCall(n)) root = true; }); if (root) css.add(s); if (!root) { const d = s.node.type === "ExportNamedDeclaration" ? s.node.declaration : s.node; if (d?.type === "VariableDeclaration" && d.declarations.some((v) => isWhen(unwrap(v.init)))) css.add(s); } }
  const grow = () => { let c = false; for (const s of [...css]) for (const r of s.refs) { const t = defBy.get(r); if (t && !css.has(t) && !isMarker(t)) { css.add(t); c = true; } } return c; };
  while (grow());
  const plainStmts = body.filter((s) => !css.has(s) && !isMarker(s));
  // Types follow the code that needs them; alone they stay beside the view helpers.
  const hasCss = css.size > 0;
  const typeOnly = (list) => list.every((s) => s.kind === "type");
  const plainFile = (() => { if (!hasCss) return f; if (!plainStmts.length) return null; if (typeOnly(plainStmts)) return null; if (/\.(styles|stylex)\.ts$/.test(f)) return f.replace(/\.(styles|stylex)\.ts$/, ".view.ts"); return f; })();
  if (hasCss && plainFile === null) for (const s of plainStmts) css.add(s);
  const cssFile = hasCss ? f.replace(/\.(styles|stylex)\.ts$/, ".css.ts").replace(/\.client\.ts$/, ".client.css.ts").replace(/(?<!\.css)\.ts$/, ".css.ts") : null;
  plan[f] = { m, css, plainStmts: plainFile ? plainStmts : [], plainFile, cssFile, isMarker, body };
  const home = (moved[f] = {});
  for (const s of body) for (const d of s.defs) home[d] = isMarker(s) ? "src/when" : css.has(s) ? cssFile.replace(/\.ts$/, "") : plainFile.replace(/\.tsx?$/, "");
}
for (const [k, v] of Object.entries(HAND)) moved[k] = new Proxy({}, { get: () => v });
const ve = (out, names) => names.filter((n) => new RegExp(`\\b${n}\\(`).test(out));

const relSpec = (from, target) => { let r = path.relative(path.dirname(from), target); if (!r.startsWith(".")) r = `./${r}`; return r; };
const routeImports = (fromOld, outFile, m, out, extra = []) => {
  const lines = [];
  const take = {};
  const add = (file, local, imported, type) => ((take[file] ??= []).push({ local, imported, type }));
  for (const s of m.stmts.filter((s) => s.kind === "import")) {
    const st = s.node; const spec = st.source.value;
    if (spec === "@stylexjs/stylex") continue;
    const target = resolveSpec(fromOld, spec);
    const lead = (st.leadingComments ?? []).map((c) => m.code.slice(c.start, c.end)).join("\n");
    if (lead && !m.__ledHeader) { m.__ledHeader = true; lines.push(lead); }
    if (!st.specifiers.length) { if (!m.__sideDone?.has(spec)) { (m.__sideDone ??= new Set()).add(spec); lines.push(`import ${JSON.stringify(spec)};`); } continue; }
    for (const sp of st.specifiers) {
      if (!new RegExp(`(?<![\\w$.])${sp.local.name.replace(/\$/g, "\\$")}\\b`).test(out)) continue;
      if (sp.type !== "ImportSpecifier") { lines.push(`import ${sp.type === "ImportNamespaceSpecifier" ? `* as ${sp.local.name}` : sp.local.name} from ${JSON.stringify(spec)};`); continue; }
      const imported = sp.imported.name ?? sp.imported.value; const type = st.importKind === "type" || sp.importKind === "type";
      if (target && moved[target]) add(moved[target][imported] ?? target.replace(/\.tsx?$/, ""), sp.local.name, imported, type);
      else add(spec.startsWith(".") ? `@${spec}` : `@${spec}`, sp.local.name, imported, type);
    }
  }
  for (const [file, local, imported, type] of extra) add(file, local, imported ?? local, type);
  for (const [file, list] of Object.entries(take)) {
    if (`${file}.ts` === outFile || `${file}.tsx` === outFile) continue;
    const specText = file.startsWith("@") ? file.slice(1) : relSpec(outFile, file);
    const allType = list.every((x) => x.type);
    const names = [...new Map(list.map((x) => [x.local, x])).values()].map((x) => `${x.type && !allType ? "type " : ""}${x.imported === x.local ? x.local : `${x.imported} as ${x.local}`}`).join(", ");
    lines.push(`import ${allType ? "type " : ""}{ ${names} } from ${JSON.stringify(specText)};`);
  }
  return lines.join("\n");
};
const needsHelpers = (out, outFile) => {
  const extra = [];
  const veNames = ve(out, ["style", "keyframes"]);
  for (const n of veNames) extra.push(["@@vanilla-extract/css", n]);
  if (/(?<![\w.])when\./.test(out)) extra.push(["src/when", "when"]);
  if (/(?<![\w.$-])marker\b(?!-)/.test(out)) extra.push(["src/when", "marker"]);
  if (/(?<![\w.])cx\(/.test(out)) extra.push(["src/cx", "cx"]);
  if (/\bClassValue\b/.test(out)) extra.push(["src/cx", "ClassValue", "ClassValue", true]);
  const un = [...new Set([...out.matchAll(/\[(under\d)\]/g)].map((x) => x[1]))].sort();
  for (const u of un) extra.push(["src/layers.css", u]);
  return extra;
};
const fixConsts = (m, s) => {
  // A media constant loses its prefix: the query is a key under "@media".
  const edits = [];
  const d = s.node.type === "ExportNamedDeclaration" ? s.node.declaration : s.node;
  if (d?.type !== "VariableDeclaration") return edits;
  for (const v of d.declarations) {
    const i = unwrap(v.init);
    if (!i || !["StringLiteral", "TemplateLiteral"].includes(i.type)) continue;
    const first = i.type === "StringLiteral" ? m.code.slice(i.start, i.end) : m.code.slice(i.start, i.end);
    if (/^["'`]@media\s/.test(first)) edits.push([i.start + 1, i.start + 1 + first.slice(1).match(/^@media\s+/)[0].length, ""]);
  }
  return edits;
};

const renames = {};
for (const [f, p] of Object.entries(plan)) {
  const { m, css, plainStmts, plainFile, cssFile, isMarker, body } = p;
  const edits = [];
  for (const s of body) {
    edits.push(...fixConsts(m, s));
    const seen = [];
    walk(s.node, (n, par) => {
      if (isSx(n, "create")) {
        const varName = (() => { const d = s.node.type === "ExportNamedDeclaration" ? s.node.declaration : s.node; const v = d.declarations.find((x) => { let hit = false; walk(x.init, (q) => { if (q === n) hit = true; }); return hit; }); return v.id.name; })();
        const props = unwrap(n.arguments[0]).properties.map((pr) => { const name = pr.key.value ?? pr.key.name; const key = m.code.slice(pr.key.start, pr.key.end); const lead = (pr.leadingComments ?? []).map((c) => m.code.slice(c.start, c.end) + "\n").join(""); return `${lead}${key}: ${convertNamespace(m, `${f}#${varName}.${name}`, pr.value)},`; });
        const tailC = (n.arguments[0].innerComments ?? []).map((c) => m.code.slice(c.start, c.end) + "\n").join("");
        const last = unwrap(n.arguments[0]).properties.at(-1); const trail = (last?.trailingComments ?? []).map((c) => m.code.slice(c.start, c.end) + "\n").join("");
        edits.push([n.start, n.end, `{\n${props.join("\n")}\n${tailC}${trail}}`]);
        seen.push(n); return false;
      }
      if (isSx(n, "keyframes")) { edits.push([n.start, n.end, convertKeyframes(m, n)]); return false; }
    });
    edits.push(...callSiteEdits(m, s).filter(([a, b]) => !edits.some((e) => e[0] <= a && e[1] >= b && e[2].length > 40)));
  }
  const extraExports = new Set();
  const render = (stmts) => stmts.map((s) => applyEdits(m.code, s.start, s.end, edits)).join("");
  // Plain-side statements reach into the css side: export what they use.
  const cssDefs = new Set([...css].flatMap((s) => s.defs));
  const plainRefs = new Set(plainStmts.flatMap((s) => [...s.refs]));
  const extraFromCss = [...cssDefs].filter((d) => plainRefs.has(d));
  for (const s of css) if (s.defs.some((d) => plainRefs.has(d)) && !s.exported) extraExports.add(s);
  const orderCss = body.filter((s) => css.has(s));
  let cssBody = orderCss.map((s) => { let t = applyEdits(m.code, s.start, s.end, edits); if (extraExports.has(s)) t = t.replace(/^(\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*\s*)(const|function)\b/, "$1export $2"); return t; }).join("");
  let plainBody = render(plainStmts);
  if (cssFile) {
    const extra = needsHelpers(cssBody, cssFile);
    const head = routeImports(f, cssFile, m, cssBody, extra);
    for (const s of css) if (s.exported || extraExports.has(s)) { const d = s.node.type === "ExportNamedDeclaration" ? s.node.declaration : s.node; if (d?.type === "FunctionDeclaration" || (d?.declarations?.some((v) => /Function/.test(v.init?.type)))) report.fnOnCss.push(`${f}: ${s.defs.join(",")}`); }
    writeFileSync(cssFile, head.replace(/@@vanilla/g, "@vanilla") + "\n" + cssBody.trimStart() + "\n");
    renames[f] = cssFile;
  }
  if (plainFile) {
    const extra = [...needsHelpers(plainBody, plainFile), ...extraFromCss.map((d) => [cssFile.replace(/\.ts$/, ""), d, d, [...css].find((s) => s.defs.includes(d))?.kind === "type"])];
    const head = routeImports(f, plainFile, { ...m, __ledHeader: !!cssFile, __sideDone: m.__sideDone }, plainBody, extra);
    writeFileSync(plainFile, head + "\n" + plainBody.trimStart() + "\n");
  }
  if (plainFile !== f && cssFile !== f) unlinkSync(f);
}
writeFileSync(renameF, JSON.stringify(renames, null, 1));

// Everything else: imports in .ts/.tsx/.astro/.mdx, and call sites in .astro.
const importRe = /^([ \t]*)import\s+(type\s+)?(\{[^}]*\}|\*\s+as\s+\w+|[\w$]+)\s+from\s+["'](\.[^"']+)["'];?/gm;
const reroute = (from, text, outFile = from) => text.replace(importRe, (all, ind, type, what, spec) => {
  const target = resolveSpec(from, spec);
  if (!target || !moved[target]) return all;
  if (!what.startsWith("{")) { report.usedNonKey.push(`ns import ${from}: ${all}`); return all; }
  const byFile = {};
  for (const raw of what.slice(1, -1).split(",").map((x) => x.trim()).filter(Boolean)) { const t = /^type\s/.test(raw); const name = raw.replace(/^type\s+/, ""); const [imp] = name.split(/\s+as\s+/); (byFile[moved[target][imp] ?? target.replace(/\.tsx?$/, "")] ??= []).push((t ? "type " : "") + name); }
  return Object.entries(byFile).filter(([file]) => !(`${file}.ts` === outFile)).map(([file, names]) => `${ind}import ${type ?? ""}{ ${names.join(", ")} } from ${JSON.stringify(relSpec(outFile, file))};`).join("\n");
});
const balanced = (s, open) => { let d = 1, i = open, q = null; for (; i < s.length && d; i++) { const c = s[i]; if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === "`") q = c; else if (c === "(" || c === "[" || c === "{") d++; else if (c === ")" || c === "]" || c === "}") d--; } return i; };
const splitArgs = (s) => { const out = []; let d = 0, q = null, st = 0; for (let i = 0; i < s.length; i++) { const c = s[i]; if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === "`") q = c; else if ("([{".includes(c)) d++; else if (")]}".includes(c)) d--; else if (c === "," && !d) { out.push(s.slice(st, i)); st = i + 1; } } out.push(s.slice(st)); return out.map((x) => x.trim()).filter(Boolean); };
const styleVarsOf = (text) => new Set([...text.matchAll(/import\s+\{([^}]*)\}\s+from\s+["'][^"']*\.css["']/g)].flatMap((m) => m[1].split(",").map((x) => x.trim().split(/\s+as\s+/).pop().replace(/^type\s+/, "")).filter(Boolean)));
const isClassRef = (a, vars) => { const m = a.match(/^([A-Za-z_$][\w$]*)(?:\.[A-Za-z_$][\w$]*|\[[^\]]*\])$/); return m && vars.has(m[1]); };
const convertAttrSpread = (text) => {
  const vars = styleVarsOf(text);
  let out = "", i = 0; const re = /\{\.\.\.stylex\s*\.\s*(?:attrs|props)\(/g; let m;
  while ((m = re.exec(text))) {
    const end = balanced(text, m.index + m[0].length); const inner = text.slice(m.index + m[0].length, end - 1); let close = end; while (text[close] !== "}") close++;
    const args = splitArgs(inner);
    out += text.slice(i, m.index) + (args.length === 1 && isClassRef(args[0], vars) ? `class={${args[0]}}` : `class:list={[${inner.trim().replace(/,\s*$/, "")}]}`);
    i = close + 1; re.lastIndex = i;
  }
  return out + text.slice(i);
};
const astroFiles = tracked.filter((f) => f.endsWith(".astro"));
const texty = [...tsFiles.filter((f) => !stylexFiles.includes(f) && !SKIP.has(f)), ...astroFiles, ...tracked.filter((f) => f.endsWith(".mdx"))];
const hand = Object.keys(HAND);
for (const f of texty) {
  let text = readFileSync(f, "utf8"); const before = text;
  text = reroute(f, text);
  if (f.endsWith(".astro")) {
    text = convertAttrSpread(text);
    {
      const helperImports = new Set([...text.matchAll(/import\s+\{([^}]*)\}\s+from\s+["'][^"']*\.(?:css|view)["']/g)].flatMap((x) => x[1].split(",").map((y) => y.trim().split(/\s+as\s+/).pop()).filter(Boolean)));
      text = text.replace(/\{\.\.\.([A-Za-z_$][\w$]*)((?:\.[\w$]+|\[[^\]]*\])*(?:\((?:[^()]|\([^()]*\))*\))?)\}/g, (all, id, rest) => (helperImports.has(id) ? `class={${id}${rest}}` : all));
    }
    const attrConsts = [...text.matchAll(/const (\w+) = stylex\s*\.\s*attrs\(/g)].map((x) => x[1]);
    text = text.replace(/stylex\s*\.\s*(?:attrs|props)\(/g, "cx(");
    // `.class ?? ""` and `.class` after a closed cx() call.
    let res = "", i = 0, m2; const re = /(?<![\w.])cx\(/g;
    while ((m2 = re.exec(text))) { const end = balanced(text, m2.index + m2[0].length); const after = text.slice(end).match(/^\s*\.\s*class(Name)?(\s*\?\?\s*""|\s*\?\?\s*'')?/); if (after) { res += text.slice(i, end); i = end + after[0].length; } re.lastIndex = end; }
    text = res + text.slice(i);
    for (const n of attrConsts) { text = text.replaceAll(`{...${n}}`, `class={${n}}`).replace(new RegExp(`\\b${n}\\.class\\b(\\s*\\?\\?\\s*"")?`, "g"), n); }
    text = text.replace(/stylex\.StyleXStyles/g, "ClassValue").replace(/stylex\.when/g, "when");
    const hadSx = /import \* as stylex from "@stylexjs\/stylex";\n/.test(text);
    if (hadSx) {
      const need = [/(?<![\w.])cx\(/.test(text) ? "cx" : null, /\bClassValue\b/.test(text) ? "type ClassValue" : null].filter(Boolean);
      text = text.replace(/import \* as stylex from "@stylexjs\/stylex";\n/, need.length ? `import { ${need.join(", ")} } from ${JSON.stringify(relSpec(f, "src/cx"))};\n` : "");
    }
  }
  if (text !== before) writeFileSync(f, text);
}
console.log(JSON.stringify({ moved: Object.keys(renames).length, ...report, treeCalls: report.treeCalls.length, negated: [...new Set(report.negated)] }));
