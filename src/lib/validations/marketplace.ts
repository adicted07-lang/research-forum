import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  tagline: z.string().min(1, "Tagline is required").max(300),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["SERVICE", "TOOL"]),
  categoryTags: z.array(z.string()).max(5).default([]),
  pricingInfo: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1, "Review body is required"),
  tags: z.array(z.string()).default([]),
});

export type ListingInput = z.infer<typeof listingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
