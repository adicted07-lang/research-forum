"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleQuestionFeatured(questionId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { error: "Forbidden" };
  const q = await db.question.findUnique({
    where: { id: questionId },
    select: { isFeatured: true },
  });
  if (!q) return { error: "Not found" };
  await db.question.update({
    where: { id: questionId },
    data: { isFeatured: !q.isFeatured },
  });
  return { success: true };
}

export async function toggleQuestionPinned(questionId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { error: "Forbidden" };
  const q = await db.question.findUnique({
    where: { id: questionId },
    select: { isPinned: true },
  });
  if (!q) return { error: "Not found" };
  await db.question.update({
    where: { id: questionId },
    data: { isPinned: !q.isPinned },
  });
  return { success: true };
}

export async function toggleArticleFeatured(articleId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { error: "Forbidden" };
  const a = await db.article.findUnique({
    where: { id: articleId },
    select: { isFeatured: true },
  });
  if (!a) return { error: "Not found" };
  await db.article.update({
    where: { id: articleId },
    data: { isFeatured: !a.isFeatured },
  });
  return { success: true };
}

export async function getFeaturedContent() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { questions: [], articles: [] };
  const [questions, articles] = await Promise.all([
    db.question.findMany({
      where: {
        OR: [{ isFeatured: true }, { isPinned: true }],
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        isFeatured: true,
        isPinned: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.article.findMany({
      where: { isFeatured: true, deletedAt: null },
      select: { id: true, title: true, isFeatured: true, slug: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { questions, articles };
}

export async function searchQuestionsForFeature(query: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { questions: [] };
  if (!query.trim()) return { questions: [] };
  const questions = await db.question.findMany({
    where: {
      deletedAt: null,
      title: { contains: query, mode: "insensitive" },
    },
    select: {
      id: true,
      title: true,
      isFeatured: true,
      isPinned: true,
      slug: true,
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  return { questions };
}

export async function searchArticlesForFeature(query: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { articles: [] };
  if (!query.trim()) return { articles: [] };
  const articles = await db.article.findMany({
    where: {
      deletedAt: null,
      title: { contains: query, mode: "insensitive" },
    },
    select: { id: true, title: true, isFeatured: true, slug: true },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  return { articles };
}
