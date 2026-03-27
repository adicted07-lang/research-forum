"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TargetType, VoteValue } from "@prisma/client";
import { awardPoints, deductPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";

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
    let capturedExisting: { value: VoteValue } | null = null;
    let contentAuthorId: string | null = null;

    await db.$transaction(async (tx) => {
      const existing = await tx.vote.findUnique({
        where: { userId_targetType_targetId: { userId, targetType: targetTypeEnum, targetId } },
      });
      capturedExisting = existing;

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
        const q = await tx.question.update({
          where: { id: targetId },
          data: { upvoteCount: upvotes, downvoteCount: downvotes },
          select: { authorId: true },
        });
        contentAuthorId = q.authorId;
      } else if (targetTypeEnum === TargetType.ANSWER) {
        const a = await tx.answer.update({
          where: { id: targetId },
          data: { upvoteCount: upvotes },
          select: { authorId: true },
        });
        contentAuthorId = a.authorId;
      }
    });

    // Award/deduct points to content author based on vote action
    if (contentAuthorId && contentAuthorId !== userId) {
      const prevValue = capturedExisting ? (capturedExisting as { value: VoteValue }).value : null;
      const isUpvote = voteValueEnum === VoteValue.UPVOTE;

      if (prevValue === null) {
        // New vote
        if (isUpvote) {
          awardPoints(contentAuthorId, POINTS.RECEIVE_UPVOTE); // +2
        } else {
          awardPoints(contentAuthorId, POINTS.RECEIVE_DOWNVOTE); // -1 (negative award)
        }
      } else if (prevValue === voteValueEnum) {
        // Un-vote (same value clicked again)
        if (isUpvote) {
          deductPoints(contentAuthorId, POINTS.RECEIVE_UPVOTE); // -2
        } else {
          awardPoints(contentAuthorId, -POINTS.RECEIVE_DOWNVOTE); // +1
        }
      } else {
        // Switch vote direction
        if (isUpvote) {
          // downvote → upvote: +3
          awardPoints(contentAuthorId, POINTS.RECEIVE_UPVOTE - POINTS.RECEIVE_DOWNVOTE);
        } else {
          // upvote → downvote: -3
          awardPoints(contentAuthorId, POINTS.RECEIVE_DOWNVOTE - POINTS.RECEIVE_UPVOTE);
        }
      }
    }

    return { success: true };
  } catch {
    return { error: "Failed to toggle vote" };
  }
}
