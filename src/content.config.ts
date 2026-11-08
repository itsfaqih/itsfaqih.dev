import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = { blog };
