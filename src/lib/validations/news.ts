import { z } from "zod";

export const ARTICLE_CATEGORIES = [
  "news", "opinion", "how_to", "interview", "announcement", "makers",
] as const;

export const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  body: z.string().min(1, "Article body is required"),
  category: z.enum(ARTICLE_CATEGORIES).default("news"),
  tags: z.array(z.string()).max(10).default([]),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export type ArticleInput = z.infer<typeof articleSchema>;
