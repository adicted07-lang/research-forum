"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export interface UserAnalytics {
  totalQuestions: number;
  totalAnswers: number;
  totalArticles: number;
  totalUpvotesReceived: number;
  totalPoints: number;
  acceptanceRate: number;
  currentStreak: number;
  longestStreak: number;
}

export async function getUserAnalytics(): Promise<UserAnalytics | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const userId = session.user.id;

    const [user, questionCount, answerCount, articleCount, acceptedCount, questionUpvotes, answerUpvotes] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { points: true, currentStreak: true, longestStreak: true },
      }),
      db.question.count({ where: { authorId: userId, deletedAt: null } }),
      db.answer.count({ where: { authorId: userId, deletedAt: null } }),
      db.article.count({ where: { authorId: userId, deletedAt: null, status: "PUBLISHED" } }),
      db.answer.count({ where: { authorId: userId, deletedAt: null, isAccepted: true } }),
      db.question.aggregate({ where: { authorId: userId, deletedAt: null }, _sum: { upvoteCount: true } }),
      db.answer.aggregate({ where: { authorId: userId, deletedAt: null }, _sum: { upvoteCount: true } }),
    ]);

    const totalUpvotes = (questionUpvotes._sum.upvoteCount ?? 0) + (answerUpvotes._sum.upvoteCount ?? 0);
    const acceptanceRate = answerCount > 0 ? Math.round((acceptedCount / answerCount) * 100) : 0;

    return {
      totalQuestions: questionCount,
      totalAnswers: answerCount,
      totalArticles: articleCount,
      totalUpvotesReceived: totalUpvotes,
      totalPoints: user?.points ?? 0,
      acceptanceRate,
      currentStreak: user?.currentStreak ?? 0,
      longestStreak: user?.longestStreak ?? 0,
    };
  } catch {
    return null;
  }
}
