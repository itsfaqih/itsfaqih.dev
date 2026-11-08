import { PUBLISHED_GUIDELINES, type PublishedGuideline } from "../data/guidelines";
import type { SharedPage } from "../seo";

export function publishedRule(id: string) {
  const rule = PUBLISHED_GUIDELINES.find((guideline) => guideline.id === id);
  if (!rule) throw new Error(`No published rule "${id}"`);
  return rule;
}

/** A rule page's sharing metadata. */
export function ruleHead(rule: PublishedGuideline): SharedPage {
  return {
    path: rule.href,
    title: rule.headTitle,
    description: `${rule.claim} ${rule.description}, with live demos.`,
    type: "article",
    headline: rule.title,
    schema: "Article",
    section: rule.label,
    indexable: !rule.hidden,
  };
}
