"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations/forum";
import { TargetType } from "@prisma/client";

const authorSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  companyName: true,
  companyLogo: true,
  role: true,
};

export async function createComment(
  targetType: string,
  targetId: string,
  formData: FormData,
  parentId?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = { body: formData.get("body") };
  const parsed = commentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const targetTypeEnum = targetType.toUpperCase() as TargetType;
  if (!Object.values(TargetType).includes(targetTypeEnum)) {
    return { error: "Invalid target type" };
  }

  try {
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId } });
      if (!parent) return { error: "Parent comment not found" };
      // Enforce max 2 levels: parent must be top-level (no parentId)
      if (parent.parentId !== null) {
        return { error: "Cannot reply more than 2 levels deep" };
      }
    }

    const comment = await db.comment.create({
      data: {
        body: parsed.data.body,
        authorId: session.user.id,
        targetType: targetTypeEnum,
        targetId,
        parentId: parentId ?? null,
      },
      include: { author: { select: authorSelect } },
    });

    return { comment };
  } catch {
    return { error: "Failed to create comment" };
  }
}

export async function getComments(targetType: string, targetId: string) {
  const targetTypeEnum = targetType.toUpperCase() as TargetType;
  if (!Object.values(TargetType).includes(targetTypeEnum)) {
    return { error: "Invalid target type" };
  }

  try {
    const comments = await db.comment.findMany({
      where: {
        targetType: targetTypeEnum,
        targetId,
        parentId: null,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: authorSelect },
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: { author: { select: authorSelect } },
        },
      },
    });

    return { comments };
  } catch {
    return { error: "Failed to fetch comments" };
  }
}
