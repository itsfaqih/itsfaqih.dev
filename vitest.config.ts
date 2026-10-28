import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
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
