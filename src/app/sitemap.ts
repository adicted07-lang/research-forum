import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/forum`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/marketplace`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/talent-board`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/news`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${baseUrl}/researchers`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/grants`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/leaderboard`, changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const [questions, articles, jobs, users, listings, grants, datasets] = await Promise.all([
    db.question.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true }
    }),
    db.article.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true }
    }),
    db.job.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true }
    }),
    db.user.findMany({
      where: { deletedAt: null },
      select: { username: true, updatedAt: true }
    }),
    db.listing.findMany({
      where: { deletedAt: null, isActive: true },
      select: { slug: true, updatedAt: true }
    }),
    db.grant.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true }
    }),
    db.dataset.findMany({
      where: { deletedAt: null, isActive: true },
      select: { slug: true, updatedAt: true }
    }),
  ]);

  const dynamicPages: MetadataRoute.Sitemap = [
    ...questions.map((q) => ({
      url: `${baseUrl}/forum/${q.slug}`,
      lastModified: q.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6
    })),
    ...articles.map((a) => ({
      url: `${baseUrl}/news/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...jobs.map((j) => ({
      url: `${baseUrl}/talent-board/${j.slug}`,
      lastModified: j.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5
    })),
    ...users.map((u) => ({
      url: `${baseUrl}/profile/${u.username}`,
      lastModified: u.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4
    })),
    ...listings.map((l) => ({
      url: `${baseUrl}/marketplace/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5
    })),
    ...grants.map((g) => ({
      url: `${baseUrl}/grants/${g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5
    })),
    ...datasets.map((d) => ({
      url: `${baseUrl}/datasets/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
