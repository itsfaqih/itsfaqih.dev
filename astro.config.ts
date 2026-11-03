import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Element, ElementContent, Root } from "hast";
import { optimize } from "svgo";
import { preloadFile } from "@pierre/diffs/ssr";
import { defineConfig } from "astro/config";
import type { AstroIntegration } from "astro";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { runnerImport, type Plugin } from "vite-plus";
import { CODE_OPTIONS, codeFile } from "./src/components/code-file.ts";
import { PUBLISHED_GUIDELINES } from "./src/data/guidelines.ts";
import { SITE_ORIGIN } from "./src/seo.ts";

const DECIMALS_VISIBLE_AT_17PX = 1;

function roundIconPaths(): Plugin {
  return {
    name: "round-icon-paths",
    apply: "build",
    enforce: "pre",
    transform: {
      filter: { id: /simple-icons\/index\.mjs$|tech-marks\.ts$/ },
      handler(code) {
        return code.replace(/\bpath:\s*"([^"]+)"/g, (_, d: string) => {
          const svg = optimize(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`, {
            plugins: [
              { name: "convertPathData", params: { floatPrecision: DECIMALS_VISIBLE_AT_17PX } },
            ],
          }).data;
          return `path: "${svg.match(/ d="([^"]+)"/)![1]}"`;
        });
      },
    },
  };
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  return node.type === "element" ? node.children.map(textOf).join("") : "";
}

function codeBlocks(node: Root | Element): [pre: Element, code: Element][] {
  return node.children.flatMap((child) => {
    if (child.type !== "element") return [];
    const code =
      child.tagName === "pre"
        ? child.children.find(
            (inner): inner is Element => inner.type === "element" && inner.tagName === "code",
          )
        : undefined;
    return code ? [[child, code]] : codeBlocks(child);
  });
}

// Prerenders each fence with @pierre/diffs and hands the code block its source and language,
// so the page ships highlighted HTML and no highlighter.
function rehypeHighlightCode() {
  return async (tree: Root) => {
    await Promise.all(
      codeBlocks(tree).map(async ([pre, code]) => {
        const language =
          [code.properties.className ?? []]
            .flat()
            .map(String)
            .find((name) => name.startsWith("language-"))
            ?.slice("language-".length) ?? "text";
        const source = textOf(code).replace(/\r?\n$/, "");
        const { prerenderedHTML } = await preloadFile({
          file: codeFile(source, language),
          options: CODE_OPTIONS,
        });
        pre.properties.dataCode = source;
        pre.properties.dataLanguage = language;
        pre.properties.dataPrerendered = prerenderedHTML;
      }),
    );
  };
}

// A client script reads class names from a .css.ts module, and its component's frontmatter imports
// the same module. Left alone, every page would carry that module's rules a second time.
const serverOwnsCss = (): Plugin => ({
  name: "server-owns-css",
  enforce: "pre",
  apply: "build",
  applyToEnvironment: (environment) => environment.name === "client",
  load: (id) => (id.includes(".vanilla.css") ? "" : undefined),
});

async function inlineCoreAssets(css: string, outDir: string) {
  for (const [url, , asset] of css.matchAll(
    /url\((["']?)(\/(?:fonts\/[^)"']+-core\.woff2|cursors\/[^)#"']+\.svg))\1\)/g,
  )) {
    const data = (await readFile(path.join(outDir, asset!))).toString("base64");
    const mime = asset!.endsWith(".svg") ? "image/svg+xml" : "font/woff2";
    css = css.replace(url, `url(data:${mime};base64,${data})`);
  }
  return css;
}

function pageFiles(outDir: string) {
  return readdir(outDir, { recursive: true }).then((files) =>
    files.filter((file) => file.endsWith(".html")),
  );
}

// Static imports only: a dynamic import() is fetched when the code asks for it.
const STATIC_IMPORT = /(?:import|export)\s*(?:[^"';()]*?from\s*)?["']\.\/([^"']+?\.js)["']/g;

// A component's module script imports chunks that import chunks: one round trip per level.
// Listing the whole closure in the head fetches it in one.
async function eagerModules(html: string, outDir: string) {
  const roots = [...html.matchAll(/<script type="module" src="\/_astro\/([^"]+)"/g)].map(
    ([, file]) => file!,
  );
  const seen = new Set<string>();
  const visit = async (file: string): Promise<void> => {
    if (seen.has(file)) return;
    seen.add(file);
    const code = await readFile(path.join(outDir, "_astro", file), "utf8");
    await Promise.all([...code.matchAll(STATIC_IMPORT)].map(([, dep]) => visit(dep!)));
  };
  await Promise.all(roots.map(visit));
  return [...seen].map((file) => `<link rel="modulepreload" href="/_astro/${file}">`).join("");
}

function finishPages(): AstroIntegration {
  return {
    name: "finish-pages",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const pages = await pageFiles(outDir);
        if (!pages.length) throw new Error(`No pages in ${outDir} to finish`);
        for (const page of pages) {
          const file = path.join(outDir, page);
          let html = await readFile(file, "utf8");
          const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)];
          for (const [tag, css] of styles) {
            html = html.replace(tag, `<style>${await inlineCoreAssets(css!, outDir)}</style>`);
          }
          const preloads = await eagerModules(html, outDir);
          html = html.replace('<meta charset="utf-8">', (charset) => `${charset}${preloads}`);
          await writeFile(file, html);
        }
        const { module } = await runnerImport<typeof import("./scripts/og/share-assets.ts")>(
          path.join(import.meta.dirname, "scripts/og/share-assets.ts"),
        );
        await module.writeShareAssets(outDir);
        const cv = await runnerImport<typeof import("./scripts/cv/export-pdf.ts")>(
          path.join(import.meta.dirname, "scripts/cv/export-pdf.ts"),
        );
        await cv.module.writeCvPdfs(outDir);
        // Cloudflare Pages reads response headers from _headers. A Markdown twin names its page.
        await writeFile(
          path.join(outDir, "_headers"),
          PUBLISHED_GUIDELINES.map(
            (rule) => `${rule.href}.md\n  Link: <${SITE_ORIGIN}${rule.href}>; rel="canonical"\n`,
          ).join("\n"),
        );
        logger.info(`finished ${pages.length} pages`);
      },
    },
  };
}

export default defineConfig({
  site: SITE_ORIGIN,
  output: "static",
  trailingSlash: "never",
  // blog.html rather than blog/index.html: a static host answers /blog without a redirect.
  build: { format: "file", inlineStylesheets: "always" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  devToolbar: { enabled: false },
  server: { port: 5173, host: "127.0.0.1" },
  markdown: {
    syntaxHighlight: false,
    // The posts' fences are prerendered by rehypeHighlightCode; text stays as written, without
    // GFM or SmartyPants, as the MDX compiler printed it before.
    processor: unified({
      gfm: false,
      smartypants: false,
      rehypePlugins: [rehypeSlug, rehypeHighlightCode],
    }),
  },
  integrations: [mdx(), finishPages()],
  vite: {
    // simple-icons is bundled rather than loaded from node_modules, so roundIconPaths rounds the
    // marks the prerender renders too.
    resolve: { tsconfigPaths: true, noExternal: ["simple-icons"] },
    plugins: [roundIconPaths(), vanillaExtractPlugin(), serverOwnsCss()],
  },
});
