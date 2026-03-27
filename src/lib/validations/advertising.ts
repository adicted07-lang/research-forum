import { z } from "zod";

export const campaignSchema = z.object({
  campaignName: z.string().min(1, "Campaign name is required").max(200),
  adType: z.enum(["FEED", "BANNER", "FEATURED_LISTING"]),
  creativeHeadline: z.string().min(1, "Headline is required").max(100),
  creativeDescription: z.string().min(1, "Description is required").max(300),
  creativeCtaUrl: z.string().url("Must be a valid URL"),
  creativeImage: z.string().url().optional().or(z.literal("")),
  budgetType: z.enum(["DAILY", "TOTAL"]),
  budgetAmount: z.number().min(10, "Minimum budget is $10"),
  bidType: z.enum(["CPM", "CPC"]),
  bidAmount: z.number().min(0.01, "Minimum bid is $0.01"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  targetingCategories: z.array(z.string()).default([]),
  targetingUserType: z.array(z.string()).default([]),
  targetingGeography: z.array(z.string()).default([]),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
