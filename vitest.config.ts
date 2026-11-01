import stylex from "@stylexjs/unplugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        // Components style themselves with StyleX, whose calls fail at runtime unless compiled. The
        // plugin's dev-server hook starts an interval that only an HTTP server's close clears, and
        // the test server has none, so it is dropped to let the run exit.
        plugins: [{ ...stylex.vite({ devMode: "css-only" }), configureServer: undefined }],
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
