"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createNotification } from "./notifications";

export async function toggleFollow(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const followerId = session.user.id;

  if (followerId === targetUserId) {
    return { error: "Cannot follow yourself" };
  }

  try {
    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetUserId } },
    });

    if (existing) {
      await db.follow.delete({
        where: { followerId_followingId: { followerId, followingId: targetUserId } },
      });
      return { following: false };
    } else {
      await db.follow.create({
        data: { followerId, followingId: targetUserId },
      });

      // Notify the target user
      const follower = await db.user.findUnique({
        where: { id: followerId },
        select: { name: true, username: true },
      });
      const followerName = follower?.name || follower?.username || "Someone";
      await createNotification(
        targetUserId,
        "follow",
        `${followerName} started following you`,
        undefined,
        `/profile/${follower?.username || followerId}`
      );

      return { following: true };
    }
  } catch (error) {
    console.error("Failed to toggle follow:", error);
    return { error: "Failed to toggle follow" };
  }
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });
    return !!follow;
  } catch {
    return false;
  }
}

export async function getFollowerCount(userId: string): Promise<number> {
  try {
    return await db.follow.count({ where: { followingId: userId } });
  } catch {
    return 0;
  }
}

export async function getFollowingCount(userId: string): Promise<number> {
  try {
    return await db.follow.count({ where: { followerId: userId } });
  } catch {
    return 0;
  }
}
