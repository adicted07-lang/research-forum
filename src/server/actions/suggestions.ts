"use server";

import { db } from "@/lib/db";

interface SuggestedAnswer {
  questionTitle: string;
  questionSlug: string;
  answerExcerpt: string;
  authorName: string;
  authorUsername: string | null;
  upvoteCount: number;
}

export async function getSuggestedAnswers(questionId: string, tags: string[], limit = 3): Promise<SuggestedAnswer[]> {
  if (tags.length === 0) return [];

  try {
    // Find questions with overlapping tags that have accepted or highly-upvoted answers
    const relatedQuestions = await db.question.findMany({
      where: {
        id: { not: questionId },
        tags: { hasSome: tags },
        deletedAt: null,
        answerCount: { gt: 0 },
      },
      select: {
        title: true,
        slug: true,
        answers: {
          where: { deletedAt: null },
          orderBy: [{ isAccepted: "desc" }, { upvoteCount: "desc" }],
          take: 1,
          select: {
            body: true,
            upvoteCount: true,
            author: { select: { name: true, username: true } },
          },
        },
      },
      orderBy: { upvoteCount: "desc" },
      take: limit,
    });

    return relatedQuestions
      .filter(q => q.answers.length > 0)
      .map(q => {
        const answer = q.answers[0];
        const excerpt = answer.body.replace(/<[^>]*>/g, "").slice(0, 200);
        return {
          questionTitle: q.title,
          questionSlug: q.slug,
          answerExcerpt: excerpt,
          authorName: answer.author.name ?? answer.author.username ?? "Anonymous",
          authorUsername: answer.author.username ?? null,
          upvoteCount: answer.upvoteCount,
        };
      });
  } catch {
    return [];
  }
}
