"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { listingSchema } from "@/lib/validations/marketplace";

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
  companyLogo: true,
  role: true,
};

export async function createListing(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    title: formData.get("title"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    type: formData.get("type"),
    categoryTags: formData.getAll("categoryTags"),
    pricingInfo: formData.get("pricingInfo") ?? undefined,
    websiteUrl: formData.get("websiteUrl") ?? undefined,
    demoUrl: formData.get("demoUrl") ?? undefined,
  };

  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const slug = generateSlug(parsed.data.title);
    const listing = await db.listing.create({
      data: {
        title: parsed.data.title,
        tagline: parsed.data.tagline,
        description: parsed.data.description,
        slug,
        type: parsed.data.type,
        categoryTags: parsed.data.categoryTags,
        pricingInfo: parsed.data.pricingInfo ?? null,
        websiteUrl: parsed.data.websiteUrl || null,
        demoUrl: parsed.data.demoUrl || null,
        authorId: session.user.id,
        isActive: false,
      },
    });
    return { slug: listing.slug, listingId: listing.id };
  } catch {
    return { error: "Failed to create listing" };
  }
}

export async function getListings({
  type,
  category,
  sort,
  page = 1,
  limit = 20,
}: {
  type?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    const where: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
    };

    if (type) where.type = type;
    if (category) where.categoryTags = { has: category };

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "trending" || sort === "top_rated") {
      orderBy = { upvoteCount: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "most_reviewed") {
      orderBy = { createdAt: "desc" };
    }

    const skip = (page - 1) * limit;

    const listings = await db.listing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: authorSelect },
      },
    });

    return listings;
  } catch {
    return [];
  }
}

export async function getListingBySlug(slug: string) {
  try {
    const listing = await db.listing.findUnique({
      where: { slug },
      include: {
        author: { select: authorSelect },
      },
    });
    return listing;
  } catch {
    return null;
  }
}
