// Stands in for @stylexjs/stylex at evaluation time: keeps every style object raw, so the analysis
// sees what the source declares rather than what the compiler printed.
export const registry = (globalThis.__sx ??= { namespaces: {}, keyframes: [], vars: [], themes: [] });
const VAR = /^--/;
export const __create = (file, name, obj) => {
  const out = {};
  for (const [ns, raw] of Object.entries(obj)) {
    const id = `${file}#${name}.${ns}`;
    registry.namespaces[id] = raw;
    out[ns] = typeof raw === "function" ? (...a) => ({ __ns: id, raw: raw(...a) }) : { __ns: id, raw };
  }
  return out;
};
export const create = (obj) => __create("?", "?", obj);
export const keyframes = (o) => { const n = `kf${registry.keyframes.length}`; registry.keyframes.push({ n, o }); return n; };
export const defineVars = (o) => { registry.vars.push(o); return Object.fromEntries(Object.keys(o).map((k) => [k, VAR.test(k) ? `var(${k})` : `var(--${k})`])); };
export const defineConsts = (o) => o;
export const createTheme = (v, o) => { registry.themes.push(o); return { __theme: true, o }; };
export const defaultMarker = () => ({ __marker: "default" });
let m = 0;
export const defineMarker = () => ({ __marker: `m${m++}` });
const mk = (x) => x?.__marker ?? "default";
export const when = {
  ancestor: (p, marker) => `@when:ancestor:${p}:${mk(marker)}`,
  descendant: (p, marker) => `@when:descendant:${p}:${mk(marker)}`,
  siblingBefore: (p, marker) => `@when:siblingBefore:${p}:${mk(marker)}`,
  siblingAfter: (p, marker) => `@when:siblingAfter:${p}:${mk(marker)}`,
  anySibling: (p, marker) => `@when:anySibling:${p}:${mk(marker)}`,
};
export const firstThatWorks = (...v) => ({ __ftw: v });
const flat = (a) => a.flat(Infinity).filter(Boolean);
const rec = (a) => { const ids = flat(a).map((x) => x.__ns ?? (x.__marker ? null : (x.__theme ? null : "?unknown"))).filter(Boolean); if (ids.length > 1) (registry.merges ??= {})[ids.join(" | ")] = 1; };
export const attrs = (...a) => { rec(a); return { class: "" }; };
export const props = (...a) => { rec(a); return { className: "" }; };
