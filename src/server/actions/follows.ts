"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createNotification } from "./notifications";
import { sendEmail } from "@/lib/email";
import { newFollowerEmail } from "@/lib/email-templates";

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
      const [follower, targetUser] = await Promise.all([
        db.user.findUnique({
          where: { id: followerId },
          select: { name: true, username: true },
        }),
        db.user.findUnique({
          where: { id: targetUserId },
          select: { email: true },
        }),
      ]);
      const followerName = follower?.name || follower?.username || "Someone";
      await createNotification(
        targetUserId,
        "follow",
        `${followerName} started following you`,
        undefined,
        `/profile/${follower?.username || followerId}`
      );

      // Fire-and-forget email
      if (targetUser?.email) {
        sendEmail({
          to: targetUser.email,
          subject: `${followerName} started following you on The Intellectual Exchange`,
          html: newFollowerEmail(followerName),
        });
      }

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

export async function isMutualFollow(userAId: string, userBId: string): Promise<boolean> {
  const count = await db.follow.count({
    where: {
      OR: [
        { followerId: userAId, followingId: userBId },
        { followerId: userBId, followingId: userAId },
      ],
    },
  });
  return count === 2;
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
