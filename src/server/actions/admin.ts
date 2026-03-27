"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

// ===== HELPER =====

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return { error: "Forbidden" as const };
    }
    return { userId: session.user.id, role: user.role };
  } catch {
    return { error: "Forbidden" as const };
  }
}

async function requireAdminOnly() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      return { error: "Forbidden" as const };
    }
    return { userId: session.user.id, role: user.role };
  } catch {
    return { error: "Forbidden" as const };
  }
}

// ===== USER MANAGEMENT =====

export async function getUsers(opts: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const { search, role, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
          role: true,
          isVerified: true,
          createdAt: true,
          deletedAt: true,
          points: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, role: string) {
  const auth = await requireAdminOnly();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.user.update({
      where: { id: userId },
      data: { role: role as "RESEARCHER" | "COMPANY" | "MODERATOR" | "ADMIN" },
    });
    return { success: true };
  } catch {
    return { error: "Failed to update user role" };
  }
}

export async function suspendUser(userId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  } catch {
    return { error: "Failed to suspend user" };
  }
}

export async function unsuspendUser(userId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });
    return { success: true };
  } catch {
    return { error: "Failed to unsuspend user" };
  }
}

export async function verifyUser(userId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    return { success: true };
  } catch {
    return { error: "Failed to verify user" };
  }
}

// ===== CONTENT MODERATION =====

export async function getPendingArticles(page = 1, limit = 20) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const skip = (page - 1) * limit;

  try {
    const [articles, total] = await Promise.all([
      db.article.findMany({
        where: { status: "PENDING_REVIEW" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.article.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

    return {
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { error: "Failed to fetch pending articles" };
  }
}

export async function deleteContent(type: string, id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const deletedAt = new Date();

  try {
    switch (type) {
      case "question":
        await db.question.update({ where: { id }, data: { deletedAt } });
        break;
      case "answer":
        await db.answer.update({ where: { id }, data: { deletedAt } });
        break;
      case "comment":
        await db.comment.update({ where: { id }, data: { deletedAt } });
        break;
      case "listing":
        await db.listing.update({ where: { id }, data: { deletedAt } });
        break;
      case "article":
        await db.article.update({ where: { id }, data: { deletedAt } });
        break;
      default:
        return { error: "Unknown content type" };
    }
    return { success: true };
  } catch {
    return { error: "Failed to delete content" };
  }
}

// ===== ADMIN LISTINGS / JOBS =====

export async function getAdminListings(opts: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const { search, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.listing.count({ where }),
    ]);

    return {
      listings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { error: "Failed to fetch listings" };
  }
}

export async function getAdminJobs(opts: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const { search, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              companyName: true,
              companyLogo: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.job.count({ where }),
    ]);

    return {
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { error: "Failed to fetch jobs" };
  }
}

// ===== ADVERTISING =====

export async function getPendingCampaigns(page = 1, limit = 20) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const skip = (page - 1) * limit;

  try {
    const [campaigns, total] = await Promise.all([
      db.campaign.findMany({
        where: { status: "PENDING_APPROVAL" },
        include: {
          advertiser: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.campaign.count({ where: { status: "PENDING_APPROVAL" } }),
    ]);

    return {
      campaigns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { error: "Failed to fetch pending campaigns" };
  }
}

export async function approveCampaign(campaignId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE" },
    });
    return { success: true };
  } catch {
    return { error: "Failed to approve campaign" };
  }
}

export async function rejectCampaign(campaignId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "DRAFT" },
    });
    return { success: true };
  } catch {
    return { error: "Failed to reject campaign" };
  }
}

// ===== ANALYTICS =====

export async function getAnalytics() {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalUsers = 0;
  let newUsersThisMonth = 0;
  let totalQuestions = 0;
  let totalAnswers = 0;
  let totalListings = 0;
  let activeListings = 0;
  let totalJobs = 0;
  let openJobs = 0;
  let totalArticles = 0;
  let publishedArticles = 0;
  let totalCampaigns = 0;
  let activeCampaigns = 0;
  let totalRevenue = 0;

  try {
    totalUsers = await db.user.count();
  } catch {}

  try {
    newUsersThisMonth = await db.user.count({
      where: { createdAt: { gte: startOfMonth } },
    });
  } catch {}

  try {
    totalQuestions = await db.question.count();
  } catch {}

  try {
    totalAnswers = await db.answer.count();
  } catch {}

  try {
    totalListings = await db.listing.count();
  } catch {}

  try {
    activeListings = await db.listing.count({ where: { isActive: true } });
  } catch {}

  try {
    totalJobs = await db.job.count();
  } catch {}

  try {
    openJobs = await db.job.count({ where: { status: "OPEN" } });
  } catch {}

  try {
    totalArticles = await db.article.count();
  } catch {}

  try {
    publishedArticles = await db.article.count({
      where: { status: "PUBLISHED" },
    });
  } catch {}

  try {
    totalCampaigns = await db.campaign.count();
  } catch {}

  try {
    activeCampaigns = await db.campaign.count({ where: { status: "ACTIVE" } });
  } catch {}

  try {
    const revenueResult = await db.campaign.aggregate({
      _sum: { budgetAmount: true },
      where: { stripePaymentId: { not: null } },
    });
    totalRevenue = revenueResult._sum.budgetAmount ?? 0;
  } catch {}

  return {
    totalUsers,
    newUsersThisMonth,
    totalQuestions,
    totalAnswers,
    totalListings,
    activeListings,
    totalJobs,
    openJobs,
    totalArticles,
    publishedArticles,
    totalCampaigns,
    activeCampaigns,
    totalRevenue,
  };
}

// ===== TAG MANAGEMENT =====

export async function getTags() {
  const auth = await requireAdmin();
  if ("error" in auth) return [];

  try {
    const tags = await db.tag.findMany({ orderBy: { name: "asc" } });
    return tags;
  } catch {
    return [];
  }
}

export async function createTag(name: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const tag = await db.tag.create({ data: { name, slug } });
    return { tag };
  } catch {
    return { error: "Failed to create tag" };
  }
}

export async function deleteTag(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.tag.delete({ where: { id } });
    return { success: true };
  } catch {
    return { error: "Failed to delete tag" };
  }
}
