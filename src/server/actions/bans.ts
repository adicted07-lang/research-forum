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

export async function banUser(userId: string, reason: string) {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason,
      },
    });

    await logAdminAction("ban_user", "user", userId, `Reason: ${reason}`);

    return { success: true };
  } catch {
    return { error: "Failed to ban user" };
  }
}

export async function suspendUser(userId: string, reason: string, days: number) {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  const suspendedUntil = new Date();
  suspendedUntil.setDate(suspendedUntil.getDate() + days);

  try {
    await db.user.update({
      where: { id: userId },
      data: { suspendedUntil },
    });

    await logAdminAction(
      "suspend_user",
      "user",
      userId,
      `Reason: ${reason} — ${days} day(s), until ${suspendedUntil.toISOString()}`
    );

    return { success: true };
  } catch {
    return { error: "Failed to suspend user" };
  }
}

export async function unbanUser(userId: string) {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        banReason: null,
        suspendedUntil: null,
      },
    });

    await logAdminAction("unban_user", "user", userId);

    return { success: true };
  } catch {
    return { error: "Failed to unban user" };
  }
}

export async function getBannedUsers() {
  const admin = await requireAdmin();
  if ("error" in admin) return { error: admin.error };

  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { isBanned: true },
          { suspendedUntil: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        suspendedUntil: true,
      },
      orderBy: { bannedAt: "desc" },
    });
    return { users };
  } catch {
    return { error: "Failed to fetch banned users" };
  }
}
