"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { jobSchema } from "@/lib/validations/hire";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

const companySelect = {
  id: true,
  companyName: true,
  username: true,
  companyLogo: true,
  image: true,
  role: true,
};

export async function createJob(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "COMPANY") return { error: "Only companies can post jobs" };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    researchDomain: formData.getAll("researchDomain"),
    requiredSkills: formData.getAll("requiredSkills"),
    projectType: formData.get("projectType"),
    budgetMin: formData.get("budgetMin") ? Number(formData.get("budgetMin")) : undefined,
    budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : undefined,
    budgetNegotiable: formData.get("budgetNegotiable") === "true",
    timeline: formData.get("timeline") ?? undefined,
    locationPreference: formData.get("locationPreference") ?? "REMOTE",
  };

  const parsed = jobSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const slug = generateSlug(parsed.data.title);
    const job = await db.job.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        slug,
        researchDomain: parsed.data.researchDomain,
        requiredSkills: parsed.data.requiredSkills,
        projectType: parsed.data.projectType,
        budgetMin: parsed.data.budgetMin,
        budgetMax: parsed.data.budgetMax,
        budgetNegotiable: parsed.data.budgetNegotiable,
        timeline: parsed.data.timeline,
        locationPreference: parsed.data.locationPreference,
        companyId: session.user.id,
      },
    });
    return { slug: job.slug };
  } catch {
    return { error: "Failed to create job" };
  }
}

export async function getJobs({
  domain,
  skill,
  location,
  sort,
  page = 1,
  limit = 20,
}: {
  domain?: string;
  skill?: string;
  location?: string;
  sort?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    const where: Record<string, unknown> = {
      status: "OPEN",
      deletedAt: null,
    };

    if (domain) {
      where.researchDomain = { has: domain };
    }
    if (skill) {
      where.requiredSkills = { has: skill };
    }
    if (location) {
      where.locationPreference = location;
    }

    const orderBy =
      sort === "budget_high"
        ? { budgetMax: "desc" as const }
        : { createdAt: "desc" as const };

    const jobs = await db.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: {
          select: companySelect,
        },
      },
    });

    return jobs;
  } catch {
    return [];
  }
}

export async function getJobBySlug(slug: string) {
  try {
    const job = await db.job.findUnique({
      where: { slug },
      include: {
        company: {
          select: companySelect,
        },
      },
    });
    return job;
  } catch {
    return null;
  }
}

export async function incrementJobViews(jobId: string) {
  try {
    await db.job.update({
      where: { id: jobId },
      data: { viewsCount: { increment: 1 } },
    });
  } catch {
    // silently fail
  }
}
