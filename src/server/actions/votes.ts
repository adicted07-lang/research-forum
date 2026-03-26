"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TargetType, VoteValue } from "@prisma/client";

export async function toggleVote(
  targetType: string,
  targetId: string,
  value: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const targetTypeEnum = targetType.toUpperCase() as TargetType;
  const voteValueEnum = value.toUpperCase() as VoteValue;

  if (!Object.values(TargetType).includes(targetTypeEnum)) {
    return { error: "Invalid target type" };
  }
  if (!Object.values(VoteValue).includes(voteValueEnum)) {
    return { error: "Invalid vote value" };
  }

  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.vote.findUnique({
        where: { userId_targetType_targetId: { userId, targetType: targetTypeEnum, targetId } },
      });

      if (existing) {
        if (existing.value === voteValueEnum) {
          // Same vote — un-vote
          await tx.vote.delete({
            where: { userId_targetType_targetId: { userId, targetType: targetTypeEnum, targetId } },
          });
        } else {
          // Different vote — update
          await tx.vote.update({
            where: { userId_targetType_targetId: { userId, targetType: targetTypeEnum, targetId } },
            data: { value: voteValueEnum },
          });
        }
      } else {
        // No vote yet — create
        await tx.vote.create({
          data: { userId, targetType: targetTypeEnum, targetId, value: voteValueEnum },
        });
      }

      // Recalculate counts
      const [upvotes, downvotes] = await Promise.all([
        tx.vote.count({ where: { targetType: targetTypeEnum, targetId, value: VoteValue.UPVOTE } }),
        tx.vote.count({ where: { targetType: targetTypeEnum, targetId, value: VoteValue.DOWNVOTE } }),
      ]);

      if (targetTypeEnum === TargetType.QUESTION) {
        await tx.question.update({
          where: { id: targetId },
          data: { upvoteCount: upvotes, downvoteCount: downvotes },
        });
      } else if (targetTypeEnum === TargetType.ANSWER) {
        await tx.answer.update({
          where: { id: targetId },
          data: { upvoteCount: upvotes },
        });
      }
    });

    return { success: true };
  } catch {
    return { error: "Failed to toggle vote" };
  }
}
