"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { articleSchema } from "@/lib/validations/news";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

const authorSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  companyName: true,
  role: true,
};

export async function createArticle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    title: formData.get("title"),
    body: formData.get("body"),
    tags: formData.getAll("tags"),
    category: formData.get("category") ?? "news",
    coverImage: formData.get("coverImage") ?? undefined,
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const wordCount = parsed.data.body.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  const slug = generateSlug(parsed.data.title);

  const isPrivileged =
    session.user.role === "ADMIN" || session.user.role === "MODERATOR";

  try {
    const article = await db.article.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        slug,
        authorId: session.user.id,
        category: parsed.data.category,
        tags: parsed.data.tags,
        coverImage: parsed.data.coverImage || null,
        readTime,
        status: isPrivileged ? "PUBLISHED" : "PENDING_REVIEW",
        publishedAt: isPrivileged ? new Date() : null,
      },
    });
    return { slug: article.slug };
  } catch {
    return { error: "Failed to create article" };
  }
}

export async function getArticles(opts: {
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    deletedAt: null,
  };
  if (opts.category) where.category = opts.category;

  const orderBy =
    opts.sort === "trending"
      ? { upvoteCount: "desc" as const }
      : { publishedAt: "desc" as const };

  try {
    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { author: { select: authorSelect } },
      }),
      db.article.count({ where }),
    ]);

    return {
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { articles: [], totalPages: 1, currentPage: page };
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const article = await db.article.findFirst({
      where: { slug, deletedAt: null },
      include: { author: { select: authorSelect } },
    });
    return article;
  } catch {
    return null;
  }
}

export async function getFeaturedArticles(limit = 3) {
  try {
    const articles = await db.article.findMany({
      where: {
        isFeatured: true,
        status: "PUBLISHED",
        deletedAt: null,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { author: { select: authorSelect } },
    });
    return articles;
  } catch {
    return [];
  }
}

export async function approveArticle(articleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "MODERATOR"
  ) {
    return { error: "Forbidden" };
  }

  try {
    await db.article.update({
      where: { id: articleId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    return { success: true };
  } catch {
    return { error: "Failed to approve article" };
  }
}

export async function rejectArticle(articleId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "MODERATOR"
  ) {
    return { error: "Forbidden" };
  }

  try {
    await db.article.update({
      where: { id: articleId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    });
    return { success: true };
  } catch {
    return { error: "Failed to reject article" };
  }
}
