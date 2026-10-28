import { useLocation } from "@tanstack/react-router";
import { PUBLISHED_GUIDELINES } from "../../../data/guidelines";
import { pageHead } from "../../../seo";

export async function readMarkdown(markdownUrl: string) {
  const response = await fetch(markdownUrl);
  if (!response.ok) return null;
  return response.text();
}

export function useCurrentRule() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return PUBLISHED_GUIDELINES.find((guideline) => guideline.href === path);
}

export function ruleHead(id: string) {
  const rule = PUBLISHED_GUIDELINES.find((guideline) => guideline.id === id);
  if (!rule) throw new Error(`No published rule "${id}"`);
  return pageHead({
    path: rule.href,
    title: rule.pageTitle,
    description: `${rule.claim} ${rule.description}${rule.interactive ? ", with live demos" : ""}.`,
    type: "article",
    headline: rule.title,
    schema: "Article",
    section: rule.label,
    indexable: !rule.hidden,
  });
}
