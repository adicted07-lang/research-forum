"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleTagFollow(tag: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const existing = await db.tagFollow.findUnique({
      where: { userId_tag: { userId: session.user.id, tag } },
    });

    if (existing) {
      await db.tagFollow.delete({ where: { id: existing.id } });
      return { following: false };
    }

    await db.tagFollow.create({ data: { userId: session.user.id, tag } });
    return { following: true };
  } catch {
    return { error: "Failed to toggle tag follow" };
  }
}

export async function getFollowedTags(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const follows = await db.tagFollow.findMany({
      where: { userId: session.user.id },
      select: { tag: true },
      orderBy: { createdAt: "desc" },
    });
    return follows.map((f) => f.tag);
  } catch {
    return [];
  }
}
