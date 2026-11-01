import { getCollection } from "astro:content";

export const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export const BLOG_DESCRIPTION =
  "Notes and tutorials on web development by Faqih Muntashir, a full-stack engineer in Indonesia.";

/** Every post, newest first. */
export async function getAllPosts() {
  const posts = await getCollection("blog");
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export type Post = Awaited<ReturnType<typeof getAllPosts>>[number];
