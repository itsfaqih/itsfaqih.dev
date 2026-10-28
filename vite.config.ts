import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { optimize } from "svgo";
import { defineConfig, type Plugin } from "vite";
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
        for (const page of pages) {
          const file = path.join(outDir, page);
          let html = await readFile(file, "utf8");
          for (const [tag, href] of html.matchAll(
            /<link rel="stylesheet" href="(\/assets\/[^"]+\.css)"[^>]*\/>/g,
          )) {
            const css = await inlineAssetsBeforeApp(
              await readFile(path.join(outDir, href!), "utf8"),
              outDir,
            );
            html = html.replace(tag, () => `<style>${css}</style>`);
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

const config = defineConfig({
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    roundIconPaths(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [rehypeSlug],
    }),
    devtools(),
    nitro(
      isCloudflareBuild
        ? { commands: { preview: "node scripts/cloudflare-pages-preview.mjs" } }
        : undefined,
    ),
    stylex.vite({
      devMode: "css-only",
      cssInjectionTarget: (filepath) => /(?:^|\/)index(?:-[^/]+)?\.css$/.test(filepath),
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
        failOnError: true,
        retryCount: 2,
        retryDelay: 1000,
      },
    }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
    prerenderedPagesFirst(),
  ],
});

export default config;
