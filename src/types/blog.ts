import type { ComponentType } from "react";

export interface BlogFrontmatter {
  title: string;
  summary?: string;
  publishedAt: string;
}

export interface BlogModule {
  default: ComponentType;
  frontmatter: BlogFrontmatter;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
}
