import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import babel from "@rolldown/plugin-babel";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin";
import { nitro } from "nitro/vite";

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
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: {
              dark: "github-dark",
              light: "github-light",
            },
            keepBackground: false, // We'll handle background in CSS for better control
          },
        ],
      ],
    }),
    devtools(),
    nitro(),
    stylex.vite({
      devMode: "css-only",
      cssInjectionTarget: (filepath) => /(?:^|\/)index(?:-[^/]+)?\.css$/.test(filepath),
    }),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

export default config;
