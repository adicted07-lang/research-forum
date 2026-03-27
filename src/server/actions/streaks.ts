"use server";

import { db } from "@/lib/db";

export async function updateStreak(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { lastVisitDate: true, currentStreak: true, longestStreak: true },
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.lastVisitDate) {
      // First visit
      await db.user.update({
        where: { id: userId },
        data: {
          lastVisitDate: today,
          currentStreak: 1,
          longestStreak: 1,
        },
      });
      return;
    }

    const lastVisit = new Date(user.lastVisitDate);
    lastVisit.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - lastVisit.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already visited today — no change
      return;
    }

    if (diffDays === 1) {
      // Yesterday — increment streak
      const newStreak = user.currentStreak + 1;
      const newLongest = Math.max(newStreak, user.longestStreak);
      await db.user.update({
        where: { id: userId },
        data: {
          lastVisitDate: today,
          currentStreak: newStreak,
          longestStreak: newLongest,
        },
      });
    } else {
      // Missed a day — reset streak
      await db.user.update({
        where: { id: userId },
        data: {
          lastVisitDate: today,
          currentStreak: 1,
        },
      });
    }
  } catch (error) {
    console.error("Failed to update streak:", error);
  }
}
