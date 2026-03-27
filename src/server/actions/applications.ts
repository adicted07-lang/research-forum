"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { applicationSchema } from "@/lib/validations/hire";
import { ApplicationStatus } from "@prisma/client";

export async function createApplication(jobId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "RESEARCHER") return { error: "Only researchers can apply to jobs" };

  const raw = {
    coverLetter: formData.get("coverLetter"),
    proposedRate: formData.get("proposedRate") ? Number(formData.get("proposedRate")) : undefined,
    estimatedTimeline: formData.get("estimatedTimeline") ?? undefined,
    portfolioLinks: formData.getAll("portfolioLinks"),
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const application = await db.application.create({
      data: {
        jobId,
        researcherId: session.user.id,
        coverLetter: parsed.data.coverLetter,
        proposedRate: parsed.data.proposedRate,
        estimatedTimeline: parsed.data.estimatedTimeline,
        portfolioLinks: parsed.data.portfolioLinks,
      },
    });

    await db.job.update({
      where: { id: jobId },
      data: { applicationsCount: { increment: 1 } },
    });

    return { id: application.id };
  } catch (err: unknown) {
    // Unique constraint violation — already applied
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint")
    ) {
      return { error: "You have already applied to this job" };
    }
    return { error: "Failed to submit application" };
  }
}

export async function getApplicationsForJob(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { companyId: true },
    });

    if (!job || job.companyId !== session.user.id) return [];

    const applications = await db.application.findMany({
      where: { jobId },
      include: {
        researcher: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            expertise: true,
            hourlyRate: true,
            availability: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
  } catch {
    return [];
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { companyId: true } } },
    });

    if (!application) return { error: "Application not found" };
    if (application.job.companyId !== session.user.id) return { error: "Unauthorized" };

    await db.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return { success: true };
  } catch {
    return { error: "Failed to update application status" };
  }
}

export async function getMyApplications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const applications = await db.application.findMany({
      where: { researcherId: session.user.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                username: true,
                companyLogo: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
  } catch {
    return [];
  }
}
