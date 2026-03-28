"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getSiteAnalytics() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersWeek,
    newUsersMonth,
    totalQuestions,
    questionsWeek,
    totalAnswers,
    answersWeek,
    totalArticles,
    totalListings,
    totalJobs,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
    db.question.count({ where: { deletedAt: null } }),
    db.question.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    db.answer.count({ where: { deletedAt: null } }),
    db.answer.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    db.article.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    db.listing.count({ where: { deletedAt: null, isActive: true } }),
    db.job.count({ where: { deletedAt: null, status: "OPEN" } }),
  ]);

  const answerRate =
    totalQuestions > 0 ? Math.round((totalAnswers / totalQuestions) * 100) : 0;

  return {
    totalUsers,
    newUsersWeek,
    newUsersMonth,
    totalQuestions,
    questionsWeek,
    totalAnswers,
    answersWeek,
    answerRate,
    totalArticles,
    totalListings,
    totalJobs,
  };
}
