import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import type { Tldr } from "./lesson";
import { PUBLISHED_GUIDELINES } from "../data/guidelines";
import * as buttonDesign from "./button-design";
import * as dataLoading from "./data-loading";
import * as dialogDesign from "./dialog-design";
import * as handlingTimestamps from "./handling-timestamps";
import * as nullVsUndefined from "./null-vs-undefined";
import * as proximityPrinciple from "./proximity-principle";
import * as tableDesign from "./table-design";
import * as typescriptCodeWriting from "./typescript-code-writing";

// "Copy SKILL.md" and "View .md" serve public/rule-of-thumb/<id>.md, which readers save as an agent
// skill. It is written by hand, so it carries code the page shows as demos; this keeps its rule in
// step with the page.
const PAGES = {
  "button-design": buttonDesign,
  "data-loading": dataLoading,
  "dialog-design": dialogDesign,
  "handling-timestamps": handlingTimestamps,
  "null-vs-undefined": nullVsUndefined,
  "proximity-principle": proximityPrinciple,
  "table-design": tableDesign,
  "typescript-code-writing": typescriptCodeWriting,
} satisfies Record<string, { LESSONS: { title: string }[]; TLDR: Tldr }>;

// Table rows as trimmed cells, so a formatter padding the columns cannot break the match.
const rows = (markdown: string) =>
  markdown
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .map((line) =>
      line
        .slice(1, -1)
        .split(/(?<!\\)\|/)
        .map((cell) => cell.trim().replaceAll("\\|", "|"))
        .join(" | "),
    );

it("has a page for every published rule", () => {
  expect(Object.keys(PAGES).sort()).toEqual(PUBLISHED_GUIDELINES.map((rule) => rule.id).sort());
});

describe.each(Object.entries(PAGES))("%s.md", (id, page) => {
  const rule = PUBLISHED_GUIDELINES.find((guideline) => guideline.id === id);
  const file = readFileSync(`public/rule-of-thumb/${id}.md`, "utf8");
  const [, name, description, markdown = ""] =
    /^---\nname: (.+)\ndescription: (.+)\n---\n\n([\s\S]*)$/.exec(file) ?? [];

  it("is an agent skill named after the rule", () => {
    expect(name).toBe(id);
    expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(description?.startsWith(`${rule?.claim} Use when `)).toBe(true);
    expect(description?.length).toBeLessThanOrEqual(1024);
    expect(description).not.toMatch(/: | #|[<>]/);
  });

  it("opens with the page's title and claim", () => {
    expect(markdown.startsWith(`# ${rule?.title}\n\n${rule?.claim}\n`)).toBe(true);
  });

  it("has a section for every lesson", () => {
    const headings = markdown.match(/^## .+$/gm) ?? [];
    for (const lesson of page.LESSONS) expect(headings).toContain(`## ${lesson.title}`);
  });

  it("has every TL;DR row", () => {
    const table = rows(markdown);
    for (const [situation, answer] of page.TLDR)
      expect(table).toContain(`${situation} | ${answer}`);
  });
});
