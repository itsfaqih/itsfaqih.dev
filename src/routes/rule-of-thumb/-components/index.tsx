import { useLocation } from "@tanstack/react-router";
import { GUIDELINES } from "../../../data/guidelines";

export async function readMarkdown(markdownUrl: string) {
  const response = await fetch(markdownUrl);
  if (!response.ok) return null;
  return response.text();
}

export function useCurrentRule() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return GUIDELINES.find((guideline) => guideline.href === path);
}
