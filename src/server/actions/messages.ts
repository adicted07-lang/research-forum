"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { messageSchema } from "@/lib/validations/hire";
import { sendEmail } from "@/lib/email";
import { newMessageEmail } from "@/lib/email-templates";

export async function getOrCreateThread(otherUserId: string, jobId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  try {
    // Check both orderings
    const existing = await db.messageThread.findFirst({
      where: {
        OR: [
          { participant1: userId, participant2: otherUserId },
          { participant1: otherUserId, participant2: userId },
        ],
      },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (existing) return existing;

    const thread = await db.messageThread.create({
      data: {
        participant1: userId,
        participant2: otherUserId,
        jobId: jobId ?? null,
      },
      include: { messages: true },
    });

    return thread;
  } catch {
    return { error: "Failed to get or create thread" };
  }
}

export async function sendMessage(threadId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = { body: formData.get("body") };
  const parsed = messageSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const thread = await db.messageThread.findUnique({
      where: { id: threadId },
      select: { participant1: true, participant2: true },
    });

    if (!thread) return { error: "Thread not found" };

    const userId = session.user.id;
    if (thread.participant1 !== userId && thread.participant2 !== userId) {
      return { error: "Unauthorized" };
    }

    const message = await db.message.create({
      data: {
        threadId,
        senderId: userId,
        body: parsed.data.body,
      },
    });

    await db.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    // Fire-and-forget email to recipient
    const recipientId =
      thread.participant1 === userId ? thread.participant2 : thread.participant1;
    try {
      const [sender, recipient] = await Promise.all([
        db.user.findUnique({ where: { id: userId }, select: { name: true, username: true } }),
        db.user.findUnique({ where: { id: recipientId }, select: { email: true } }),
      ]);
      if (recipient?.email) {
        const senderName = sender?.name || sender?.username || "Someone";
        sendEmail({
          to: recipient.email,
          subject: `New message from ${senderName} on T.I.E`,
          html: newMessageEmail(senderName),
        });
      }
    } catch {
      // Email lookup failed — continue
    }

    return message;
  } catch {
    return { error: "Failed to send message" };
  }
}

export async function getThreads() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  try {
    const threads = await db.messageThread.findMany({
      where: {
        OR: [{ participant1: userId }, { participant2: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        user1: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            companyName: true,
            role: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            companyName: true,
            role: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return threads;
  } catch {
    return [];
  }
}

export async function getMessages(threadId: string, limit = 50) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  try {
    const thread = await db.messageThread.findUnique({
      where: { id: threadId },
      select: { participant1: true, participant2: true },
    });

    if (!thread) return [];
    if (thread.participant1 !== userId && thread.participant2 !== userId) return [];

    const messages = await db.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    // Mark unread messages from the other user as read
    await db.message.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages;
  } catch {
    return [];
  }
}

export async function getUnreadMessageCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const userId = session.user.id;

  try {
    // Get all threads the user participates in
    const threads = await db.messageThread.findMany({
      where: {
        OR: [{ participant1: userId }, { participant2: userId }],
      },
      select: { id: true },
    });

    const threadIds = threads.map((t: any) => t.id);

    const count = await db.message.count({
      where: {
        threadId: { in: threadIds },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return count;
  } catch {
    return 0;
  }
}
