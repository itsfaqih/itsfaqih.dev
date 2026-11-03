import { globSync, readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { SITE_ROOT } from "./serve-build";

test.each([
  "-webkit-box-decoration-break",
  "-webkit-mask-image",
  "-webkit-text-decoration-color",
  "-webkit-user-select",
])("the built pages carry %s for Safari", (prefixed) => {
  const pages = globSync("**/*.html", { cwd: SITE_ROOT });
  const carried = pages.some((page) =>
    readFileSync(`${SITE_ROOT}/${page}`, "utf8").includes(`${prefixed}:`),
  );
  expect(carried).toBe(true);
});
