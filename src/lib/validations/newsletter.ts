import { z } from "zod";

export const newsletterTypes = ["weekly_digest", "product_updates", "research_highlights"] as const;

export const newsletterSubscribeSchema = z.object({
  type: z.enum(newsletterTypes),
});
