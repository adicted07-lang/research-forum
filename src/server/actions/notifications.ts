"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  link?: string
) {
  try {
    await db.notification.create({
      data: { userId, type, title, body, link },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function getNotifications(limit = 20) {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        isRead: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    return await db.notification.count({
      where: { userId: session.user.id, isRead: false },
    });
  } catch {
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.notification.updateMany({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true },
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
}
