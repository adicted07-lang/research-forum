import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard", "/settings", "/messages"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Claude-Web", "PerplexityBot", "Applebot-Extended"],
        allow: ["/llms.txt", "/llms-full.txt", "/api/md/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
