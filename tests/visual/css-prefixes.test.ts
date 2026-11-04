import { globSync, readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { SITE_ROOT } from "./serve-build";

const STYLE = /<style[^>]*>(.*?)<\/style>/gs;
const RULE = /([^{}]*)\{([^{}]*)\}/g;

// Third-party and global CSS skips the lowering step on the base build too, so only rules that
// select a class come from the styles this test guards.
function classRulesSetting(property: string) {
  const sets = new RegExp(`(?:^|;)\\s*${property}\\s*:`);
  return globSync("**/*.html", { cwd: SITE_ROOT }).flatMap((page) => {
    const html = readFileSync(`${SITE_ROOT}/${page}`, "utf8");
    const css = [...html.matchAll(STYLE)].map(([, sheet]) => sheet).join("");
    return [...css.matchAll(RULE)]
      .filter(([, selector, body]) => selector!.includes(".") && sets.test(body!))
      .map(([, selector, body]) => ({ page, selector: selector!.trim(), body: body! }));
  });
}

test.each([
  "box-decoration-break",
  "mask-image",
  "mask-composite",
  "text-decoration-color",
  "user-select",
])("every class rule that sets %s also carries the Safari prefix", (property) => {
  const rules = classRulesSetting(property);
  expect(rules.length).toBeGreaterThan(0);
  const unprefixed = rules.filter(({ body }) => !body.includes(`-webkit-${property}:`));
  expect(unprefixed.map(({ page, selector }) => `${page} ${selector}`)).toEqual([]);
});
