import { defineConfig } from "vite-plus";

// Vite+ reads its lint and format settings from here. Astro builds the site from astro.config.ts,
// and vitest.config.ts holds the test projects.
const config = defineConfig({
  fmt: {
    ignorePatterns: [
      "tools/oxlint/anti-slop/**",
      "src/fonts.css",
      "scripts/og/video/vendor/**",
      "dist/**",
      ".astro/**",
    ],
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
      "scripts/og/video/vendor/**",
      "dist/**",
      ".astro/**",
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
      // The site is Astro markup plus custom elements; React and its UI kits left with the migration.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/*",
                "react-dom",
                "react-dom/*",
                "@astrojs/react",
                "@base-ui/*",
                "vaul",
                "@phosphor-icons/react",
                "@phosphor-icons/react/*",
              ],
              message:
                "Write an .astro component with a custom element (see docs/astro-migration.md); icons go through src/components/icon.astro.",
            },
          ],
        },
      ],
    },
  },
});

export default config;
