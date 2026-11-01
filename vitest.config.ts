import path from "node:path";
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
        resolve: {
          alias: {
            "astro:prefetch": path.join(import.meta.dirname, "tests/unit/astro-prefetch.ts"),
          },
        },
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["tests/unit/setup.ts"],
        },
      },
      {
        test: {
          name: "visual",
          environment: "node",
          include: ["tests/visual/**/*.test.ts"],
          globalSetup: ["tests/visual/serve-build.ts"],
          testTimeout: 60_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
