"use server";

import { db } from "@/lib/db";

interface ActivityItem {
  type: "question" | "answer" | "article";
  title: string;
  url: string;
  createdAt: Date;
}

export async function getUserActivity(userId: string, limit = 20): Promise<ActivityItem[]> {
  try {
    const [questions, answers, articles] = await Promise.all([
      db.question.findMany({
        where: { authorId: userId, deletedAt: null },
        select: { title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.answer.findMany({
        where: { authorId: userId, deletedAt: null },
        select: { createdAt: true, question: { select: { title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.article.findMany({
        where: { authorId: userId, deletedAt: null, status: "PUBLISHED" },
        select: { title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    const items: ActivityItem[] = [
      ...questions.map((q: any) => ({ type: "question" as const, title: `Asked: ${q.title}`, url: `/forum/${q.slug}`, createdAt: q.createdAt })),
      ...answers.map((a: any) => ({ type: "answer" as const, title: `Answered: ${a.question.title}`, url: `/forum/${a.question.slug}`, createdAt: a.createdAt })),
      ...articles.map((a: any) => ({ type: "article" as const, title: `Published: ${a.title}`, url: `/news/${a.slug}`, createdAt: a.createdAt })),
    ];

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.slice(0, limit);
  } catch { return []; }
}
