import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const { runnerImport } = await import(path.join(root, "node_modules/vite-plus/dist/index.js")).catch(async () => await import("vite-plus"));
const shim = process.argv[2];
const out = process.argv[3];
const files = execSync("git ls-files src scripts", { encoding: "utf8" }).trim().split("\n").filter((f) => /\.ts$/.test(f) && !/\.test\.ts$/.test(f) && readFileSync(f, "utf8").includes("stylex.create"));
const plugin = {
  name: "sx-shim", enforce: "pre",
  resolveId(id) { if (id === "@stylexjs/stylex") return shim; },
  transform(code, id) {
    const rel = path.relative(root, id.split("?")[0]);
    if (!rel.startsWith("src/")) return;
    return code.replaceAll('"@stylexjs/stylex"', JSON.stringify(shim)).replace(/(?:export\s+)?const\s+(\w+)\s*(?::[^=]+)?=\s*stylex\.create(?:<[^(]*>)?\(/g, (m, name) => m.replace(/stylex\.create(?:<[^(]*>)?\(/, `stylex.__create(${JSON.stringify(rel)}, ${JSON.stringify(name)}, `));
  },
};
const failed = [];
for (const f of files) {
  try { await runnerImport(path.join(root, f), { configFile: false, plugins: [plugin], logLevel: "silent", resolve: { tsconfigPaths: true } }); }
  catch (e) { failed.push([f, String(e.message).slice(0, 200)]); }
}
const reg = globalThis.__sx ?? {};
const ser = (v) => JSON.stringify(v, (k, x) => (typeof x === "function" ? "<fn>" : x));
writeFileSync(out, ser(reg));
console.log({ files: files.length, failed, namespaces: Object.keys(reg?.namespaces ?? {}).length, keyframes: reg?.keyframes?.length });
