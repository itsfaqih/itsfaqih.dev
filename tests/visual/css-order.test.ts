import { globSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vite-plus/test";
import { SITE_ROOT } from "./serve-build";

type Rule = { scope: string; className: string; state: string; declarations: Map<string, string> };

const GROUPING = /^@(layer|media|supports|container)\b/;
const SINGLE_CLASS = /^\.([\w-]+)((?::[\w-]+(?:\([^()]*\))?|\[[^\]]*\])*)$/;

function blockEnd(css: string, open: number) {
  let depth = 0;
  let quote = "";
  for (let at = open; at < css.length; at += 1) {
    const char = css[at]!;
    if (quote) {
      if (char === "\\") at += 1;
      else if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) return at + 1;
  }
  return css.length;
}

function parseRules(css: string, scope = ""): Rule[] {
  const found: Rule[] = [];
  let at = 0;
  while (at < css.length) {
    const open = css.indexOf("{", at);
    if (open < 0) break;
    const statement = css.slice(at, open);
    const head = statement.slice(statement.lastIndexOf(";") + 1).trim();
    const end = blockEnd(css, open);
    const body = css.slice(open + 1, end - 1);
    if (GROUPING.test(head)) found.push(...parseRules(body, `${scope}${head}|`));
    else if (!head.startsWith("@")) {
      const declarations = new Map(
        body.split(/;(?![^()]*\))/).map((text) => {
          const colon = text.indexOf(":");
          return [text.slice(0, colon).trim(), text.slice(colon + 1).trim()] as const;
        }),
      );
      for (const selector of head.split(/,(?![^()]*\))/)) {
        const match = SINGLE_CLASS.exec(selector.trim());
        if (match) found.push({ scope, className: match[1]!, state: match[2]!, declarations });
      }
    }
    at = end;
  }
  return found;
}

function orderDependentPairs(html: string) {
  const css = [...html.matchAll(/<style[^>]*>(.*?)<\/style>/gs)].map((m) => m[1]).join("");
  const byClass = new Map<string, Rule[]>();
  for (const rule of parseRules(css)) {
    byClass.set(rule.className, [...(byClass.get(rule.className) ?? []), rule]);
  }
  const pairs = new Set<string>();
  for (const [, attribute] of html.matchAll(/class="([^"]*)"/g)) {
    const classes = attribute!.split(/\s+/).filter((name) => byClass.has(name));
    for (const [index, a] of classes.entries()) {
      for (const b of classes.slice(index + 1)) {
        for (const ruleA of byClass.get(a)!) {
          for (const ruleB of byClass.get(b)!) {
            if (ruleA.scope !== ruleB.scope || ruleA.state !== ruleB.state) continue;
            for (const [property, value] of ruleA.declarations) {
              const other = ruleB.declarations.get(property);
              if (other !== undefined && other !== value) pairs.add(`${a} ${b} ${property}`);
            }
          }
        }
      }
    }
  }
  return [...pairs];
}

describe("no two classes on an element depend on stylesheet order", () => {
  test("a same-layer conflict is reported", () => {
    const html = `<style>@layer under1{.a{color:red}.b{color:#00f;margin:0}@media (width<=9px){.c:hover{top:0}.d:hover{top:1px}}}.e{left:0}</style>
      <div class="a b"></div><div class="c d"></div><div class="a e"></div>`;
    expect(orderDependentPairs(html)).toEqual(["a b color", "c d top"]);
  });

  for (const page of globSync("**/*.html", { cwd: SITE_ROOT })) {
    test(page, () => {
      expect(orderDependentPairs(readFileSync(`${SITE_ROOT}/${page}`, "utf8"))).toEqual([]);
    });
  }
});
