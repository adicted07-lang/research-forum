import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  researchDomain: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  projectType: z.enum(["ONE_TIME", "ONGOING", "CONTRACT"]),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  budgetNegotiable: z.boolean().default(false),
  timeline: z.string().optional(),
  locationPreference: z.enum(["REMOTE", "ON_SITE", "HYBRID"]).default("REMOTE"),
});

export const applicationSchema = z.object({
  coverLetter: z.string().min(1, "Cover letter is required"),
  proposedRate: z.number().optional(),
  estimatedTimeline: z.string().optional(),
  portfolioLinks: z.array(z.string()).default([]),
});

export const messageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty"),
});
