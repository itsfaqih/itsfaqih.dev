/**
 * Compares the head tags crawlers and share cards read on every page of two builds: title,
 * description, canonical, og:*, twitter:*, theme-color, icons and JSON-LD. Each build may write a
 * page as x.html or x/index.html.
 *
 *   vp node scripts/head-parity.ts <other-build> [<build>=dist]
 *
 * Exits 1 when a page is missing from either build or any tag differs.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { builtRoutes } from "../tests/visual/serve-build.ts";
import { decodeHtml } from "./decode-html.ts";

const [other, site = "dist"] = process.argv.slice(2);
if (!other) {
  console.error("usage: vp node scripts/head-parity.ts <other-build> [<build>]");
  process.exit(2);
}

function pageFile(root: string, route: string) {
  const name = route === "/" ? "index" : route.slice(1);
  return [`${name}.html`, path.join(name, "index.html")]
    .map((file) => path.join(root, file))
    .find((file) => existsSync(file));
}

function attributes(tag: string) {
  return Object.fromEntries(
    Array.from(tag.matchAll(/([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
      .slice(1)
      .map(([, name, ...values]) => [name!.toLowerCase(), decodeHtml(values.find((v) => v) ?? "")]),
  );
}

/** Each compared tag as a "key = value" line, sorted so source order does not count. */
function headTags(html: string) {
  const head = html.slice(0, html.indexOf("</head>"));
  const lines: string[] = [];
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/);
  if (title) lines.push(`title = ${decodeHtml(title[1]!)}`);
  for (const [tag] of head.matchAll(/<meta\s[^>]*>/g)) {
    const meta = attributes(tag);
    const key = meta.property ?? meta.name;
    if (!key) continue;
    if (key === "description" || key === "theme-color" || /^(og|twitter):/.test(key)) {
      lines.push(`${key}${meta.media ? ` (${meta.media})` : ""} = ${meta.content}`);
    }
  }
  for (const [tag] of head.matchAll(/<link\s[^>]*>/g)) {
    const link = attributes(tag);
    const rel = link.rel ?? "";
    if (rel === "canonical" || /\bicon\b/.test(rel) || rel === "manifest") {
      const extra = ["type", "sizes", "media"].flatMap((name) =>
        link[name] ? [`${name}=${link[name]}`] : [],
      );
      lines.push(`link ${rel}${extra.length ? ` (${extra.join(" ")})` : ""} = ${link.href}`);
    }
  }
  for (const [, json] of head.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    lines.push(`json-ld = ${JSON.stringify(JSON.parse(json!))}`);
  }
  return lines.sort();
}

const routes = [...new Set([...builtRoutes(site), ...builtRoutes(other)])].sort();
let failures = 0;
for (const route of routes) {
  const ours = pageFile(site, route);
  const theirs = pageFile(other, route);
  if (!ours || !theirs) {
    failures++;
    console.log(`${route}: missing from ${ours ? other : site}`);
    continue;
  }
  const expected = headTags(readFileSync(theirs, "utf8"));
  const actual = headTags(readFileSync(ours, "utf8"));
  const removed = expected.filter((line) => !actual.includes(line));
  const added = actual.filter((line) => !expected.includes(line));
  if (!removed.length && !added.length) {
    console.log(`${route}: ${actual.length} tags match`);
    continue;
  }
  failures++;
  console.log(`${route}:`);
  for (const line of removed) console.log(`  - ${line}`);
  for (const line of added) console.log(`  + ${line}`);
}
console.log(`${routes.length - failures}/${routes.length} pages match`);
process.exit(failures ? 1 : 0);
