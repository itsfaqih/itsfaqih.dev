import type { BlogModule, BlogPost } from "../../../types/blog";
import { Counter } from "../../../content/blog/counter";

void Counter;

const posts = import.meta.glob<BlogModule>("/src/content/blog/*.mdx", { eager: true });

export function getPost(slug: string): BlogModule | undefined {
  const path = `/src/content/blog/${slug}.mdx`;
  return posts[path];
}

export function getAllPosts(): BlogPost[] {
  return Object.entries(posts)
    .map(([path, mod]) => {
      const slug = path.split("/").pop()?.replace(".mdx", "") ?? "";
      return {
        slug,
        frontmatter: mod.frontmatter,
      };
    })
    .sort((a, b) => {
      // Sort by date (publishedAt) descending
      return (
        new Date(b.frontmatter.publishedAt).getTime() -
        new Date(a.frontmatter.publishedAt).getTime()
      );
    });
}
