"use server";

import { db } from "@/lib/db";

interface RelatedContent {
  type: "question" | "article";
  title: string;
  url: string;
  relevanceScore: number;
}

export async function getRelatedContent(
  contentType: string,
  contentId: string,
  tags: string[],
  limit = 5
): Promise<RelatedContent[]> {
  if (tags.length === 0) return [];

  try {
    const results: RelatedContent[] = [];

    // Find related questions with overlapping tags
    const relatedQuestions = await db.question.findMany({
      where: {
        id: { not: contentType === "question" ? contentId : undefined },
        tags: { hasSome: tags },
        deletedAt: null,
      },
      select: { title: true, slug: true, tags: true, upvoteCount: true },
      orderBy: { upvoteCount: "desc" },
      take: limit,
    });

    for (const q of relatedQuestions) {
      const overlap = q.tags.filter(t => tags.includes(t)).length;
      results.push({
        type: "question",
        title: q.title,
        url: `/forum/${q.slug}`,
        relevanceScore: overlap + (q.upvoteCount * 0.1),
      });
    }

    // Find related articles
    const relatedArticles = await db.article.findMany({
      where: {
        id: { not: contentType === "article" ? contentId : undefined },
        tags: { hasSome: tags },
        status: "PUBLISHED",
        deletedAt: null,
      },
      select: { title: true, slug: true, tags: true, upvoteCount: true },
      orderBy: { upvoteCount: "desc" },
      take: limit,
    });

    for (const a of relatedArticles) {
      const overlap = a.tags.filter(t => tags.includes(t)).length;
      results.push({
        type: "article",
        title: a.title,
        url: `/news/${a.slug}`,
        relevanceScore: overlap + (a.upvoteCount * 0.1),
      });
    }

    // Sort by relevance and take top N
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results.slice(0, limit);
  } catch {
    return [];
  }
}
