"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logAdminAction } from "./audit";

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

export async function createReport(
  targetType: "QUESTION" | "ANSWER" | "LISTING" | "ARTICLE" | "COMMENT",
  targetId: string,
  reason: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const report = await db.report.create({
      data: {
        reporterId: session.user.id,
        targetType,
        targetId,
        reason,
      },
    });
    return { report };
  } catch {
    return { error: "Failed to create report" };
  }
}

export async function getPendingReports() {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  try {
    const reports = await db.report.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });
    return { reports };
  } catch {
    return { error: "Failed to fetch reports" };
  }
}

export async function resolveReport(reportId: string, resolution: string) {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  try {
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status: "resolved",
        resolvedBy: admin.userId,
        resolvedAt: new Date(),
        resolution,
      },
    });

    await logAdminAction(
      "resolve_report",
      "report",
      reportId,
      `Resolution: ${resolution}`
    );

    return { report };
  } catch {
    return { error: "Failed to resolve report" };
  }
}
