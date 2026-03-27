"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

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
  role: true,
};

export async function createDataset(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tagsRaw = formData.get("tagsInput") as string;
  const license = formData.get("license") as string | null;
  const format = formData.get("format") as string | null;
  const size = formData.get("size") as string | null;
  const downloadUrl = formData.get("downloadUrl") as string | null;
  const priceRaw = formData.get("price") as string | null;

  if (!title?.trim()) return { error: "Title is required" };
  if (!description?.trim()) return { error: "Description is required" };

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const price = priceRaw ? parseFloat(priceRaw) : 0;

  try {
    const slug = generateSlug(title.trim());
    const dataset = await db.dataset.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        slug,
        authorId: session.user.id,
        tags,
        license: license || null,
        format: format || null,
        size: size || null,
        downloadUrl: downloadUrl || null,
        price: isNaN(price) ? 0 : price,
        isActive: true,
      },
    });
    return { slug: dataset.slug, datasetId: dataset.id };
  } catch {
    return { error: "Failed to create dataset" };
  }
}

export async function getDatasets({
  tag,
  format,
  sort,
  page = 1,
  limit = 20,
}: {
  tag?: string;
  format?: string;
  sort?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    const where: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
    };

    if (tag) where.tags = { has: tag };
    if (format) where.format = format;

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = { downloadCount: "desc" };
    } else if (sort === "top") {
      orderBy = { upvoteCount: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const skip = (page - 1) * limit;

    const datasets = await db.dataset.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: authorSelect },
      },
    });

    return datasets;
  } catch {
    return [];
  }
}

export async function getDatasetBySlug(slug: string) {
  try {
    const dataset = await db.dataset.findUnique({
      where: { slug },
      include: {
        author: { select: authorSelect },
      },
    });
    return dataset;
  } catch {
    return null;
  }
}
