import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Element, ElementContent, Root } from "hast";
import { optimize } from "svgo";
import { preloadFile } from "@pierre/diffs/ssr";
import { defineConfig, runnerImport, type Plugin, lazyPlugins } from "vite-plus";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import { devtools } from "@tanstack/devtools-vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import babel from "@rolldown/plugin-babel";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin";
import { CODE_OPTIONS, codeFile } from "./src/components/code-file.ts";
import { PUBLISHED_GUIDELINES } from "./src/data/guidelines.ts";
import { OG_DIR, SITE_ORIGIN } from "./src/seo.ts";

const isCloudflareBuild =
  process.env.NITRO_PRESET?.includes("cloudflare") || process.env.CF_PAGES === "1";

const REST_AFTER_MS = 3500;
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

function rehypeHighlightCode() {
  return async (tree: Root) => {
    await Promise.all(
      codeBlocks(tree).map(async ([pre, code]) => {
        const language = [code.properties.className ?? []]
          .flat()
          .map(String)
          .find((name) => name.startsWith("language-"))
          ?.slice("language-".length);
        const { prerenderedHTML } = await preloadFile({
          file: codeFile(textOf(code).replace(/\r?\n$/, ""), language ?? "text"),
          options: CODE_OPTIONS,
        });
        pre.properties.dataPrerendered = prerenderedHTML;
      }),
    );
  };
}

async function inlineAssetsBeforeApp(css: string, outDir: string) {
  for (const [url, asset] of css.matchAll(
    /url\((\/(?:fonts\/[^)]+-inline\.woff2|cursors\/[^)#]+\.svg))\)/g,
  )) {
    const data = (await readFile(path.join(outDir, asset!))).toString("base64");
    const mime = asset!.endsWith(".svg") ? "image/svg+xml" : "font/woff2";
    css = css.replace(url, `url(data:${mime};base64,${data})`);
  }
  return css;
}

function prerenderedPagesFirst(): Plugin {
  return {
    name: "prerendered-pages-first",
    apply: "build",
    enforce: "post",
    buildApp: {
      order: "post",
      async handler(builder) {
        const outDir = builder.environments.client!.config.build.outDir;
        const pages = (await readdir(outDir, { recursive: true })).filter((file) =>
          file.endsWith(".html"),
        );
        if (!pages.length) throw new Error(`No prerendered pages in ${outDir} to rewrite`);
        const sheets = new Map<string, string>(
          await Promise.all(
            (await readdir(path.join(outDir, "assets")))
              .filter((file) => file.endsWith(".css"))
              .map(
                async (file) =>
                  [
                    `/assets/${file}`,
                    (await readFile(path.join(outDir, "assets", file), "utf8")).trim(),
                  ] as const,
              ),
          ),
        );
        for (const page of pages) {
          const file = path.join(outDir, page);
          let html = await readFile(file, "utf8");
          const stylesheets = [
            ...html.matchAll(/<link rel="stylesheet" href="(\/assets\/[^"]+\.css)"[^>]*\/>/g),
          ];
          const inlined = html.match(/<style data-tsr-inline-css="">([\s\S]*?)<\/style>/)?.[1];
          // React and Vite's preload helper both adopt a matching <link> instead of fetching
          // the sheet again on hydration, and a disabled one is never fetched.
          const adopted = [
            ...stylesheets.map(([tag]) => tag.replace(/\/>$/, ' disabled=""/>')),
            ...[...sheets]
              .filter(([, css]) => inlined && css && inlined.includes(css))
              .map(([href]) => `<link rel="stylesheet" href="${href}" disabled=""/>`),
          ].join("");
          for (const [index, [tag, href]] of stylesheets.entries()) {
            const css = await inlineAssetsBeforeApp(sheets.get(href!)!, outDir);
            html = html.replace(tag, () => `${index === 0 ? adopted : ""}<style>${css}</style>`);
          }
          const preloads = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)"[^>]*\/>/g)];
          const entry = html.match(/<script type="module" async="" src="([^"]+)"><\/script>/);
          if (!entry) throw new Error(`${page} has no async entry script to defer`);
          for (const [tag] of preloads) html = html.replace(tag, "");
          const loader = `(function () {
  var rest = setTimeout(function () {
    document.querySelectorAll("[data-cut]").forEach(function (piece) {
      piece.setAttribute("data-rest", "");
    });
    document.documentElement.classList.add("no-intro");
  }, Math.max(0, ${REST_AFTER_MS} - performance.now()));
  addEventListener("load", function () {
    ${JSON.stringify(preloads.map(([, href]) => href))}.forEach(function (href) {
      var link = document.createElement("link");
      link.rel = "modulepreload";
      link.href = href;
      document.head.append(link);
    });
    var app = document.createElement("script");
    app.type = "module";
    app.src = ${JSON.stringify(entry[1])};
    app.onload = function () {
      clearTimeout(rest);
    };
    document.body.append(app);
  });
})();`;
          html = html.replace(entry[0], () => `<script>${loader}</script>`);
          await writeFile(file, html);
        }
      },
    },
  };
}

// Nitro writes _routes.json before TanStack Start prerenders, so the pages would reach the Worker.
// Pages redirects /blog to /blog/ when it serves blog/index.html, and serves blog.html at /blog.
function servePrerenderedPagesStatically(): Plugin {
  return {
    name: "serve-prerendered-pages-statically",
    apply: () => isCloudflareBuild,
    enforce: "post",
    buildApp: {
      order: "post",
      async handler(builder) {
        const outDir = builder.environments.client!.config.build.outDir;
        const routesFile = path.join(outDir, "_routes.json");
        const routes: { include: string[]; exclude: string[] } = JSON.parse(
          await readFile(routesFile, "utf8"),
        );
        const pages = (await readdir(outDir, { recursive: true })).filter(
          (file) => file.endsWith(".html") && !file.startsWith("_worker.js"),
        );
        for (const page of pages.filter((file) => file.endsWith("/index.html"))) {
          await rename(
            path.join(outDir, page),
            path.join(outDir, page.replace(/\/index\.html$/, ".html")),
          );
        }
        routes.exclude = [
          ...new Set([
            ...routes.exclude,
            ...pages.map((file) => `/${file.replace(/(?:^|\/)index\.html$/, "")}`),
          ]),
        ];
        if (routes.include.length + routes.exclude.length > 100) {
          throw new Error(`${routesFile} exceeds Cloudflare's 100 rules`);
        }
        await writeFile(routesFile, JSON.stringify(routes, undefined, 2));
      },
    },
  };
}

function shareAssets(): Plugin {
  return {
    name: "share-assets",
    apply: "build",
    enforce: "post",
    buildApp: {
      order: "post",
      async handler(builder) {
        // A module runner rather than import(): the config bundler would hoist Satori into the
        // config that `vite dev` loads, and it leaves import.meta.url undefined in card.tsx.
        const { module } = await runnerImport<typeof import("./scripts/og/share-assets.ts")>(
          path.join(import.meta.dirname, "scripts/og/share-assets.ts"),
        );
        await module.writeShareAssets(builder.environments.client!.config.build.outDir);
      },
    },
  };
}

const markdownTwinCanonicals = Object.fromEntries(
  PUBLISHED_GUIDELINES.map((rule) => [
    `${rule.href}.md`,
    { headers: { Link: `<${SITE_ORIGIN}${rule.href}>; rel="canonical"` } },
  ]),
);

const remarkPlugins = [remarkFrontmatter, remarkMdxFrontmatter];

const config = defineConfig({
  fmt: {
    ignorePatterns: ["tools/oxlint/anti-slop/**"],
  },
  lint: {
    ignorePatterns: [
      ".agent/**",
      ".agents/**",
      ".claude/**",
      ".codex/**",
      ".continue/**",
      ".cursor/**",
      ".gemini/**",
      ".hermes/**",
      ".opencode/**",
      ".pi/**",
      ".roo/**",
      ".windsurf/**",
      "tools/oxlint/anti-slop/**",
      "src/routeTree.gen.ts",
    ],
    jsPlugins: [
      {
        name: "anti-slop",
        specifier: "./tools/oxlint/anti-slop/index.ts",
      },
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    rules: {
      "anti-slop/no-chained-type-assertions": "error",
      "anti-slop/no-conditional-empty-object-spread": "error",
      "anti-slop/no-known-value-widening": "error",
      "anti-slop/no-module-mocking": "error",
      "anti-slop/no-object-parameters": "error",
      "anti-slop/no-reflect-apply": "error",
      "anti-slop/no-reflect-get": "error",
      "anti-slop/no-runtime-typeof": "error",
      "anti-slop/no-shape-in-symbol-names": "error",
      "anti-slop/no-unknown-parameters": "error",
      "anti-slop/no-unknown-returns": "error",
      "anti-slop/no-unknown-type-aliases": "error",
      "anti-slop/no-unsafe-dictionary-type": "error",
      "anti-slop/no-widen-then-assert": "error",
      "anti-slop/require-safety-comment-for-type-assertion": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: lazyPlugins(() => [
    roundIconPaths(),
    // The server renders highlighted code into the page; the client adopts it, so only the
    // server bundle carries the highlighted HTML.
    {
      ...mdx({ remarkPlugins, rehypePlugins: [rehypeSlug] }),
      applyToEnvironment: (environment) => environment.config.consumer === "client",
    },
    {
      ...mdx({ remarkPlugins, rehypePlugins: [rehypeSlug, rehypeHighlightCode] }),
      applyToEnvironment: (environment) => environment.config.consumer === "server",
    },
    devtools(),
    nitro({
      routeRules: markdownTwinCanonicals,
      ...(isCloudflareBuild && {
        commands: { preview: "node scripts/cloudflare-pages-preview.mjs" },
        // shareAssets() writes these after Nitro lists its static files, so the worker would 404 them.
        cloudflare: {
          pages: { routes: { exclude: ["/assets/*", `${OG_DIR}/*`, "/sitemap.xml"] } },
        },
      }),
    }),
    stylex.vite({
      devMode: "css-only",
      // The sheet built from src/styles.css, which every page links. Without a match StyleX appends
      // to whichever CSS asset comes first, which may load on one route only.
      cssInjectionTarget: (filepath) => /(?:^|\/)styles-[\w-]+\.css$/.test(filepath),
    }),
    tanstackStart({
      server: {
        build: {
          inlineCss: true,
        },
      },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        autoSubfolderIndex: true,
        crawlLinks: true,
        // The Markdown twins are public files, and the crawler requests them with a trailing slash.
        filter: ({ path }) => !path.endsWith(".md"),
        failOnError: true,
        retryCount: 2,
        retryDelay: 1000,
      },
    }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
    prerenderedPagesFirst(),
    shareAssets(),
    servePrerenderedPagesStatically(),
  ]),
});

export default config;
