import type { MDXContent } from "mdx/types";

export type BlogFrontmatter = {
  title: string;
  summary?: string;
  publishedAt: string;
};

export type BlogModule = {
  default: MDXContent;
  frontmatter: BlogFrontmatter;
};

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
};
