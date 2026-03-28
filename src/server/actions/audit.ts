"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

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

export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: string
) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action,
        targetType,
        targetId,
        details,
      },
    });
  } catch {
    // Best-effort — do not throw
  }
}

export async function getAuditLogs(limit = 50) {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  try {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        admin: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });
    return { logs };
  } catch {
    return { error: "Failed to fetch audit logs" };
  }
}
