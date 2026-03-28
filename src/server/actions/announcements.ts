"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getActiveAnnouncement() {
  try {
    const now = new Date();
    const announcement = await db.announcement.findFirst({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
    });
    return announcement;
  } catch {
    return null;
  }
}

export async function getAllAnnouncements() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { announcements: [] };
  try {
    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { announcements };
  } catch {
    return { announcements: [] };
  }
}

export async function createAnnouncement(
  message: string,
  type: string,
  expiresAt?: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { error: "Forbidden" };
  try {
    const announcement = await db.announcement.create({
      data: {
        message,
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return { announcement };
  } catch {
    return { error: "Failed to create announcement" };
  }
}

export async function dismissAnnouncement(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { error: "Forbidden" };
  try {
    await db.announcement.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true };
  } catch {
    return { error: "Failed to dismiss announcement" };
  }
}

export async function toggleAnnouncementActive(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { error: "Forbidden" };
  try {
    const current = await db.announcement.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!current) return { error: "Not found" };
    await db.announcement.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    return { success: true };
  } catch {
    return { error: "Failed to update announcement" };
  }
}
