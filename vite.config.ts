import { defineConfig } from "vite";
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


const config = defineConfig({
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [rehypeSlug],
    }),
    devtools(),
    nitro(),

    stylex.vite({
      devMode: "css-only",
      cssInjectionTarget: (filepath) => /(?:^|\/)index(?:-[^/]+)?\.css$/.test(filepath),
    }),
    tanstackStart({
      // Generate complete HTML for every discoverable route at build time.
      // The client still hydrates for fast in-app navigation, but the first
      // response is static HTML rather than a JavaScript-only SPA shell.
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
  ],
});

export default config;
