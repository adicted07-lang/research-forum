"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

function generateSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export async function createGrant(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return { error: "Forbidden" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const funder = formData.get("funder") as string;
  const fundingRange = formData.get("fundingRange") as string | null;
  const deadline = formData.get("deadline") as string | null;
  const eligibility = formData.get("eligibility") as string | null;
  const applicationUrl = formData.get("applicationUrl") as string | null;
  const tagsRaw = formData.get("tags") as string | null;

  if (!title || !description || !funder) {
    return { error: "Title, description, and funder are required" };
  }

  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  try {
    const grant = await db.grant.create({
      data: {
        title,
        description,
        slug: generateSlug(title),
        funder,
        fundingRange: fundingRange || null,
        deadline: deadline ? new Date(deadline) : null,
        eligibility: eligibility || null,
        applicationUrl: applicationUrl || null,
        tags,
      },
    });
    return { slug: grant.slug };
  } catch {
    return { error: "Failed to create grant" };
  }
}

export async function getGrants(opts: { tag?: string; page?: number; limit?: number } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  if (opts.tag) where.tags = { has: opts.tag };

  try {
    const [grants, total] = await Promise.all([
      db.grant.findMany({
        where,
        orderBy: { deadline: "asc" },
        skip,
        take: limit,
      }),
      db.grant.count({ where }),
    ]);
    return { grants, totalPages: Math.ceil(total / limit), currentPage: page };
  } catch {
    return { grants: [], totalPages: 1, currentPage: page };
  }
}

export async function getGrantBySlug(slug: string) {
  try {
    return await db.grant.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}
