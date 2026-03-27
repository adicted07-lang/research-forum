"use server";

import { db } from "@/lib/db";

const STREAK_BADGES = [
  { name: "Gone Streaking 2", days: 2 },
  { name: "Gone Streaking 5", days: 5 },
  { name: "Gone Streaking 10", days: 10 },
  { name: "Gone Streaking 25", days: 25 },
  { name: "Gone Streaking 100", days: 100 },
  { name: "Gone Streaking 365", days: 365 },
];

export async function checkAndAwardBadges(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    });

    if (!user) return;

    // Streak badges
    for (const badge of STREAK_BADGES) {
      if (user.currentStreak >= badge.days) {
        await db.badge.upsert({
          where: { userId_name: { userId, name: badge.name } },
          update: {},
          create: {
            userId,
            name: badge.name,
            category: "streak",
          },
        });
      }
    }

    // Thought Leader: 50+ answers with 10+ upvotes
    const highQualityAnswers = await db.answer.count({
      where: {
        authorId: userId,
        upvoteCount: { gte: 10 },
        deletedAt: null,
      },
    });

    if (highQualityAnswers >= 50) {
      await db.badge.upsert({
        where: { userId_name: { userId, name: "Thought Leader" } },
        update: {},
        create: {
          userId,
          name: "Thought Leader",
          category: "community",
        },
      });
    }

    // Contributor: 100+ comments
    const commentCount = await db.comment.count({
      where: { authorId: userId, deletedAt: null },
    });

    if (commentCount >= 100) {
      await db.badge.upsert({
        where: { userId_name: { userId, name: "Contributor" } },
        update: {},
        create: {
          userId,
          name: "Contributor",
          category: "community",
        },
      });
    }

    // Top Answerer: most accepted answers (simplified: 10+ accepted answers)
    const acceptedAnswers = await db.answer.count({
      where: { authorId: userId, isAccepted: true, deletedAt: null },
    });

    if (acceptedAnswers >= 10) {
      await db.badge.upsert({
        where: { userId_name: { userId, name: "Top Answerer" } },
        update: {},
        create: {
          userId,
          name: "Top Answerer",
          category: "expertise",
        },
      });
    }
  } catch (error) {
    console.error("Failed to check and award badges:", error);
  }
}

export async function getUserBadges(userId: string) {
  try {
    const badges = await db.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    });
    return badges;
  } catch {
    return [];
  }
}
