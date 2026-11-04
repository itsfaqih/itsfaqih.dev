import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        plugins: [vanillaExtractPlugin()],
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.ts"],
          setupFiles: ["tests/unit/setup.ts"],
        },
      },
      {
        test: {
          name: "visual",
          environment: "node",
          include: ["tests/visual/**/*.test.ts"],
          exclude: ["tests/visual/behavior.test.ts"],
          globalSetup: ["tests/visual/serve-build.ts"],
          testTimeout: 60_000,
          hookTimeout: 60_000,
        },
      },
      {
        test: {
          name: "behavior",
          environment: "node",
          include: ["tests/visual/behavior.test.ts"],
          globalSetup: ["tests/visual/serve-build.ts"],
          // Every route starts at once; a shared pool in the test caps how many pages are open.
          maxConcurrency: 20,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
