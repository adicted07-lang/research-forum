"use server";

import { db } from "@/lib/db";

export async function getLeaderboard(limit = 10) {
  try {
    const users = await db.user.findMany({
      orderBy: { points: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        companyName: true,
        companyLogo: true,
        role: true,
        points: true,
        currentStreak: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

export async function getTopAnswerers(limit = 10) {
  try {
    const users = await db.user.findMany({
      orderBy: { points: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        companyName: true,
        companyLogo: true,
        role: true,
        points: true,
        currentStreak: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch top answerers:", error);
    return [];
  }
}
