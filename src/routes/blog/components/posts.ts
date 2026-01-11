export const posts = import.meta.glob("/src/content/blog/*.mdx", { eager: true });

export function getPost(slug: string) {
  const path = `/src/content/blog/${slug}.mdx`;
  return posts[path] as any;
}

export function getAllPosts() {
  return Object.entries(posts)
    .map(([path, mod]: any) => {
      const slug = path.split("/").pop()?.replace(".mdx", "");
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
