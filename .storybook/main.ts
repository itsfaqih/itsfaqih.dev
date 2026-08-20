import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/tanstack-react";
import stylex from "@stylexjs/unplugin";
import { mergeConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/tanstack-react",
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@": path.resolve(projectRoot, "../src"),
        },
      },
      plugins: [stylex.vite({ devMode: "full" })],
    }),
};

export default config;
