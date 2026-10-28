import type { MDXContent } from "mdx/types";

export const BLOG_DESCRIPTION =
  "Notes and tutorials on web development by Faqih Muntashir, a full-stack engineer in Yogyakarta.";

const modules = import.meta.glob<{
  default: MDXContent;
  frontmatter: { title: string; summary?: string; publishedAt: string };
}>("/src/content/blog/*.mdx", { eager: true });

const posts = new Map(
  Object.entries(modules).map(([path, mod]) => [
    path.slice("/src/content/blog/".length, -".mdx".length),
    mod,
  ]),
);

export function getPost(slug: string) {
  return posts.get(slug);
}

export function getAllPosts() {
  return [...posts]
    .map(([slug, mod]) => ({ slug, frontmatter: mod.frontmatter }))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt).getTime() -
        new Date(a.frontmatter.publishedAt).getTime(),
    );
}
