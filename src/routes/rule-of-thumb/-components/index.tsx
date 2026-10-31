import { PUBLISHED_GUIDELINES } from "../../../data/guidelines";
import { pageHead } from "../../../seo";

export function ruleHead(id: string) {
  const rule = PUBLISHED_GUIDELINES.find((guideline) => guideline.id === id);
  if (!rule) throw new Error(`No published rule "${id}"`);
  return pageHead({
    path: rule.href,
    title: rule.headTitle,
    description: `${rule.claim} ${rule.description}, with live demos.`,
    type: "article",
    headline: rule.title,
    schema: "Article",
    section: rule.label,
    indexable: !rule.hidden,
  });
}
