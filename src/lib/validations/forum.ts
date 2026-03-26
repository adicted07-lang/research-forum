import { z } from "zod";

export const FORUM_CATEGORIES = [
  "General Discussion",
  "Research Methodologies",
  "Services and Tools",
  "Hiring",
  "AMA",
  "Introduce Yourself",
  "Self-Promotion",
] as const;

export const questionSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  body: z.string().min(1, "Question body is required"),
  tags: z.array(z.string()).max(5, "Maximum 5 tags").default([]),
  category: z.string().default("General Discussion"),
  bounty: z.number().int().min(0).default(0),
});

export const answerSchema = z.object({
  body: z.string().min(1, "Answer body is required"),
});

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
