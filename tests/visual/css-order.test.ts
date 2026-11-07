import { globSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vite-plus/test";
import { SITE_ROOT } from "./serve-build";

// `layer` decides order between layers; the conditions do not, so two rules under different
// @media or @supports in one layer still fight by source order whenever both apply.
type Rule = { layer: string; className: string; state: string; declarations: Map<string, string> };

const GROUPING = /^@(layer|media|supports|container)\b/;

const SIDES = ["top", "right", "bottom", "left"];
const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"];
const BOX = new Map<string, string[]>([
  ["margin", SIDES.map((side) => `margin-${side}`)],
  ["padding", SIDES.map((side) => `padding-${side}`)],
  ["inset", SIDES],
  ["scroll-margin", SIDES.map((side) => `scroll-margin-${side}`)],
  ["scroll-padding", SIDES.map((side) => `scroll-padding-${side}`)],
  ["border-width", SIDES.map((side) => `border-${side}-width`)],
  ["border-style", SIDES.map((side) => `border-${side}-style`)],
  ["border-color", SIDES.map((side) => `border-${side}-color`)],
  ["border-radius", CORNERS.map((corner) => `border-${corner}-radius`)],
]);
const PAIRS = new Map<string, string[]>([
  ["gap", ["row-gap", "column-gap"]],
  ["overflow", ["overflow-x", "overflow-y"]],
  ["place-items", ["align-items", "justify-items"]],
  ["place-content", ["align-content", "justify-content"]],
  ["place-self", ["align-self", "justify-self"]],
  ...["margin", "padding", "inset", "scroll-margin", "scroll-padding"].flatMap((box) =>
    ["inline", "block"].map((axis): [string, string[]] => [
      `${box}-${axis}`,
      [`${box}-${axis}-start`, `${box}-${axis}-end`],
    ]),
  ),
]);
// Shorthands whose values are not split here: each longhand gets the whole shorthand, so it
// matches only the same shorthand with the same value.
const OPAQUE = new Map<string, string[]>([
  [
    "border",
    ["width", "style", "color"].flatMap((part) => SIDES.map((s) => `border-${s}-${part}`)),
  ],
  ...SIDES.map((side): [string, string[]] => [
    `border-${side}`,
    ["width", "style", "color"].map((p) => `border-${side}-${p}`),
  ]),
  ["outline", ["outline-width", "outline-style", "outline-color"]],
  ["flex", ["flex-grow", "flex-shrink", "flex-basis"]],
  ["flex-flow", ["flex-direction", "flex-wrap"]],
  [
    "text-decoration",
    [
      "text-decoration-line",
      "text-decoration-style",
      "text-decoration-color",
      "text-decoration-thickness",
    ],
  ],
  [
    "font",
    [
      "font-style",
      "font-variant",
      "font-weight",
      "font-stretch",
      "font-size",
      "line-height",
      "font-family",
    ],
  ],
  [
    "background",
    [
      "background-color",
      "background-image",
      "background-position",
      "background-size",
      "background-repeat",
      "background-origin",
      "background-clip",
      "background-attachment",
    ],
  ],
  [
    "transition",
    [
      "transition-property",
      "transition-duration",
      "transition-timing-function",
      "transition-delay",
      "transition-behavior",
    ],
  ],
  [
    "animation",
    [
      "animation-name",
      "animation-duration",
      "animation-timing-function",
      "animation-delay",
      "animation-iteration-count",
      "animation-direction",
      "animation-fill-mode",
      "animation-play-state",
    ],
  ],
  ["grid-area", ["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"]],
  ["grid-row", ["grid-row-start", "grid-row-end"]],
  ["grid-column", ["grid-column-start", "grid-column-end"]],
  ["list-style", ["list-style-type", "list-style-position", "list-style-image"]],
]);

/** Space-separated values at the top level, so `calc(1px + 2px)` stays one. */
function words(value: string) {
  return value.match(/(?:[^\s()]+|\([^()]*(?:\([^()]*\)[^()]*)*\))+/g) ?? [];
}

/** Each declaration as the longhands it sets, so `margin` and `margin-top` meet on one name. */
function longhands(declarations: Map<string, string>) {
  const set = new Map<string, string>();
  for (const [property, value] of declarations) {
    const box = BOX.get(property);
    const pair = PAIRS.get(property);
    const parts = words(value);
    if (box && parts.length >= 1 && parts.length <= 4 && !value.includes("/")) {
      const [a, b = a, c = a, d = b] = parts;
      box.forEach((name, i) => set.set(name, [a, b, c, d][i]!));
    } else if (pair && parts.length >= 1 && parts.length <= 2) {
      pair.forEach((name, i) => set.set(name, parts[i] ?? parts[0]!));
    } else {
      const names = box ?? pair ?? OPAQUE.get(property) ?? [property];
      for (const name of names) set.set(name, names.length > 1 ? `${property}: ${value}` : value);
    }
  }
  return set;
}
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

function parseRules(css: string, layer = ""): Rule[] {
  const found: Rule[] = [];
  let at = 0;
  while (at < css.length) {
    const open = css.indexOf("{", at);
    if (open < 0) break;
    const statement = css.slice(at, open);
    const head = statement.slice(statement.lastIndexOf(";") + 1).trim();
    const end = blockEnd(css, open);
    const body = css.slice(open + 1, end - 1);
    if (GROUPING.test(head))
      found.push(...parseRules(body, head.startsWith("@layer") ? `${layer}${head}|` : layer));
    else if (!head.startsWith("@")) {
      const declarations = longhands(
        new Map(
          body.split(/;(?![^()]*\))/).map((text) => {
            const colon = text.indexOf(":");
            return [text.slice(0, colon).trim(), text.slice(colon + 1).trim()] as const;
          }),
        ),
      );
      for (const selector of head.split(/,(?![^()]*\))/)) {
        const match = SINGLE_CLASS.exec(selector.trim());
        if (match) found.push({ layer, className: match[1]!, state: match[2]!, declarations });
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
            if (ruleA.layer !== ruleB.layer || ruleA.state !== ruleB.state) continue;
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

  test("a conflict across @media or @supports in one layer is reported", () => {
    const html = `<style>@layer x{.a{color:red}@media (width>=9px){.b{color:#00f}}@supports (display:grid){.c{color:green}}}</style>
      <div class="a b"></div><div class="b c"></div>`;
    expect(orderDependentPairs(html)).toEqual(["a b color", "b c color"]);
  });

  test("a shorthand against its own longhand is reported", () => {
    const html = `<style>.a{margin:0 4px}.b{margin-left:0;margin-top:0}.c{border:1px solid}.d{border-top-color:red}.e{padding:2px}.f{padding:2px}</style>
      <div class="a b"></div><div class="c d"></div><div class="e f"></div>`;
    expect(orderDependentPairs(html)).toEqual(["a b margin-left", "c d border-top-color"]);
  });

  for (const page of globSync("**/*.html", { cwd: SITE_ROOT })) {
    test(page, () => {
      expect(orderDependentPairs(readFileSync(`${SITE_ROOT}/${page}`, "utf8"))).toEqual([]);
    });
  }
});
