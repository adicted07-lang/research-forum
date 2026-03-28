"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return { error: "Forbidden" as const };
    }
    return { userId: session.user.id, role: user.role };
  } catch {
    return { error: "Forbidden" as const };
  }
}

// Detect a URL-like pattern in a string
const URL_PATTERN = /https?:\/\/[^\s]+/gi;

export async function getSuspiciousAccounts() {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // New accounts (created within the last 7 days)
    const newUsers = await db.user.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        createdAt: true,
        questions: { select: { id: true, body: true } },
        answers: { select: { id: true, body: true } },
        articles: { select: { id: true, body: true } },
        reports: { select: { id: true } },
      },
    });

    const suspicious = newUsers
      .map((user) => {
        const allContent = [
          ...user.questions.map((q) => q.body),
          ...user.answers.map((a) => a.body),
          ...user.articles.map((a) => a.body),
        ];

        const postCount =
          user.questions.length + user.answers.length + user.articles.length;

        const linkCount = allContent.reduce((acc, body) => {
          const matches = body.match(URL_PATTERN);
          return acc + (matches ? matches.length : 0);
        }, 0);

        const reportCount = user.reports.length;

        const isSuspicious =
          postCount > 10 || linkCount > 5 || reportCount >= 2;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          createdAt: user.createdAt,
          postCount,
          linkCount,
          reportCount,
          isSuspicious,
        };
      })
      .filter((u) => u.isSuspicious);

    return { accounts: suspicious };
  } catch {
    return { error: "Failed to fetch suspicious accounts" };
  }
}
