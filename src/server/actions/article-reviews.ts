"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createNotification } from "./notifications";

export async function assignReviewer(articleId: string, reviewerId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return { error: "Forbidden" };
  }

  try {
    await db.article.update({
      where: { id: articleId },
      data: { status: "PENDING_REVIEW" },
    });

    // Notify the reviewer
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { title: true, slug: true },
    });

    if (article) {
      await createNotification(
        reviewerId,
        "review_assigned",
        `You've been assigned to review: ${article.title}`,
        undefined,
        `/news/${article.slug}`
      );
    }

    return { success: true };
  } catch {
    return { error: "Failed to assign reviewer" };
  }
}

export async function submitReview(
  articleId: string,
  decision: "approve" | "revise" | "reject",
  feedback: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { authorId: true, title: true },
    });
    if (!article) return { error: "Article not found" };

    if (decision === "approve") {
      await db.article.update({
        where: { id: articleId },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      await createNotification(
        article.authorId,
        "article_approved",
        `Your article "${article.title}" has been approved and published!`,
        feedback || undefined,
        `/news/${articleId}`
      );
    } else if (decision === "reject") {
      await db.article.update({
        where: { id: articleId },
        data: { status: "REJECTED", rejectionReason: feedback },
      });
      await createNotification(
        article.authorId,
        "article_rejected",
        `Your article "${article.title}" was not accepted`,
        feedback || undefined
      );
    } else {
      // revise — set back to DRAFT with feedback
      await db.article.update({
        where: { id: articleId },
        data: { status: "DRAFT", rejectionReason: feedback },
      });
      await createNotification(
        article.authorId,
        "article_revision",
        `Revisions requested for "${article.title}"`,
        feedback || undefined
      );
    }

    return { success: true };
  } catch {
    return { error: "Failed to submit review" };
  }
}

export async function getArticlesForReview() {
  const session = await auth();
  if (!session?.user?.id) return { articles: [] };

  try {
    const articles = await db.article.findMany({
      where: { status: "PENDING_REVIEW", deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    });
    return { articles };
  } catch {
    return { articles: [] };
  }
}
