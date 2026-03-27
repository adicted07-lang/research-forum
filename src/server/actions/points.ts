"use server";

import { db } from "@/lib/db";
import { checkAndAwardBadges } from "@/server/actions/badges";

export async function awardPoints(userId: string, amount: number) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: amount,
        },
      },
    });
    // Fire-and-forget badge check
    checkAndAwardBadges(userId);
  } catch (error) {
    console.error("Failed to award points:", error);
  }
}

export async function deductPoints(userId: string, amount: number) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    const currentPoints = user?.points ?? 0;
    const newPoints = Math.max(0, currentPoints - amount);

    await db.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
      },
    });
  } catch (error) {
    console.error("Failed to deduct points:", error);
  }
}
