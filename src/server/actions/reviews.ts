"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validations/marketplace";
import { TargetType } from "@prisma/client";

const reviewerSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
};

export async function createReview(
  targetType: string,
  targetId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    rating: Number(formData.get("rating")),
    body: formData.get("body"),
    tags: formData.getAll("tags"),
  };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const review = await db.review.create({
      data: {
        reviewerId: session.user.id,
        targetType: targetType as TargetType,
        targetId,
        rating: parsed.data.rating,
        body: parsed.data.body,
        tags: parsed.data.tags,
      },
    });
    return { reviewId: review.id };
  } catch {
    return { error: "Failed to create review. You may have already reviewed this." };
  }
}

export async function getReviews(targetType: string, targetId: string) {
  try {
    const reviews = await db.review.findMany({
      where: {
        targetType: targetType as TargetType,
        targetId,
      },
      include: {
        reviewer: { select: reviewerSelect },
      },
      orderBy: { createdAt: "desc" },
    });
    return reviews;
  } catch {
    return [];
  }
}

export async function getAverageRating(targetType: string, targetId: string) {
  try {
    const result = await db.review.aggregate({
      where: {
        targetType: targetType as TargetType,
        targetId,
      },
      _avg: { rating: true },
    });
    return result._avg.rating;
  } catch {
    return null;
  }
}
