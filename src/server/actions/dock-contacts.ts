"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export interface DockContact {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  threadId: string;
}

export async function getRecentContacts(limit = 4): Promise<DockContact[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  try {
    const threads = await db.messageThread.findMany({
      where: {
        OR: [{ participant1: userId }, { participant2: userId }],
      },
      include: {
        user1: { select: { id: true, name: true, username: true, image: true, companyName: true } },
        user2: { select: { id: true, name: true, username: true, image: true, companyName: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return threads.map((t) => {
      const other = t.participant1 === userId ? t.user2 : t.user1;
      return {
        id: other.id,
        name: other.name || other.companyName || other.username || "User",
        username: other.username,
        image: other.image,
        threadId: t.id,
      };
    });
  } catch {
    return [];
  }
}

export async function quickSendMessage(threadId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (!body.trim()) return { error: "Message cannot be empty" };

  try {
    const thread = await db.messageThread.findUnique({
      where: { id: threadId },
      select: { participant1: true, participant2: true },
    });

    if (!thread) return { error: "Thread not found" };
    if (thread.participant1 !== session.user.id && thread.participant2 !== session.user.id) {
      return { error: "Unauthorized" };
    }

    await db.message.create({
      data: { threadId, senderId: session.user.id, body },
    });

    await db.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return { success: true };
  } catch {
    return { error: "Failed to send message" };
  }
}
