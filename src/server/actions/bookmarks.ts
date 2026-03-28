"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TargetType } from "@prisma/client";

export async function toggleBookmark(targetType: string, targetId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const targetTypeEnum = targetType.toUpperCase() as TargetType;
  if (!Object.values(TargetType).includes(targetTypeEnum)) {
    return { error: "Invalid target type" };
  }

  try {
    const existing = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: session.user.id,
          targetType: targetTypeEnum,
          targetId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await db.bookmark.create({
      data: {
        userId: session.user.id,
        targetType: targetTypeEnum,
        targetId,
      },
    });
    return { bookmarked: true };
  } catch {
    return { error: "Failed to toggle bookmark" };
  }
}

export async function isBookmarked(targetType: string, targetId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const targetTypeEnum = targetType.toUpperCase() as TargetType;

  try {
    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: session.user.id,
          targetType: targetTypeEnum,
          targetId,
        },
      },
    });
    return !!bookmark;
  } catch {
    return false;
  }
}

export async function getUserBookmarks() {
  const session = await auth();
  if (!session?.user?.id) return { bookmarks: [] };

  try {
    const bookmarks = await db.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const results = await Promise.all(
      bookmarks.map(async (bm: any) => {
        let title = "";
        let url = "";

        if (bm.targetType === "QUESTION") {
          const q = await db.question.findUnique({
            where: { id: bm.targetId },
            select: { title: true, slug: true },
          });
          title = q?.title ?? "Deleted question";
          url = q ? `/forum/${q.slug}` : "#";
        } else if (bm.targetType === "LISTING") {
          const l = await db.listing.findUnique({
            where: { id: bm.targetId },
            select: { title: true, slug: true },
          });
          title = l?.title ?? "Deleted listing";
          url = l ? `/marketplace/${l.slug}` : "#";
        } else if (bm.targetType === "ARTICLE") {
          const a = await db.article.findUnique({
            where: { id: bm.targetId },
            select: { title: true, slug: true },
          });
          title = a?.title ?? "Deleted article";
          url = a ? `/news/${a.slug}` : "#";
        }

        return {
          id: bm.id,
          targetType: bm.targetType,
          title,
          url,
          createdAt: bm.createdAt,
        };
      })
    );

    return { bookmarks: results };
  } catch {
    return { bookmarks: [] };
  }
}
