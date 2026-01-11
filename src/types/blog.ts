import type { ComponentType } from "react";

export type BlogFrontmatter = {
  title: string;
  summary?: string;
  publishedAt: string;
}

export type BlogModule = {
  default: ComponentType;
  frontmatter: BlogFrontmatter;
}

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
}
