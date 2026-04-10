"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { messageSchema } from "@/lib/validations/hire";
import { sendEmail } from "@/lib/email";
import { newMessageEmail } from "@/lib/email-templates";
import { revalidatePath } from "next/cache";
import { isFollowing, isMutualFollow } from "@/server/actions/follows";

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

    // Auto-accept: if DIRECT REQUEST thread and replier is the recipient
    const threadData = await db.messageThread.findUnique({
      where: { id: threadId },
      select: { type: true, status: true, creatorId: true, participant1: true, participant2: true },
    });

    if (threadData?.type === "DIRECT") {
      const otherParticipant = threadData.participant1 === userId ? threadData.participant2 : threadData.participant1;

      // Check sender still follows for DIRECT threads (only block creator, not recipient)
      if (userId === threadData.creatorId) {
        const stillFollows = await db.follow.findUnique({
          where: { followerId_followingId: { followerId: userId, followingId: otherParticipant } },
        });
        if (!stillFollows) return { error: "You must follow this user to message them" };
      }

      // Auto-accept if recipient replies
      if (threadData.status === "REQUEST" && userId !== threadData.creatorId) {
        await db.messageThread.update({ where: { id: threadId }, data: { status: "ACTIVE" } });
      }
    }

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
          subject: `New message from ${senderName} on The Intellectual Exchange`,
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

export async function startDirectMessage(recipientId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const senderId = session.user.id;
  if (senderId === recipientId) return { error: "Cannot message yourself" };

  const follows = await isFollowing(recipientId);
  if (!follows) return { error: "You must follow this user to message them" };

  const mutual = await isMutualFollow(senderId, recipientId);

  // Normalize participant ordering
  const [p1, p2] = senderId < recipientId ? [senderId, recipientId] : [recipientId, senderId];

  // Check existing direct thread
  const existingThread = await db.messageThread.findFirst({
    where: { participant1: p1, participant2: p2, type: "DIRECT" },
  });

  if (existingThread) {
    if (body) {
      await db.message.create({ data: { threadId: existingThread.id, senderId, body } });
      await db.messageThread.update({ where: { id: existingThread.id }, data: { updatedAt: new Date() } });
    }
    revalidatePath("/messages");
    return { success: true, threadId: existingThread.id };
  }

  // Rate limit for non-mutual
  if (!mutual) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const requestCount = await db.messageThread.count({
      where: { creatorId: senderId, type: "DIRECT", status: "REQUEST", createdAt: { gte: oneDayAgo } },
    });
    if (requestCount >= 5) return { error: "Daily message request limit reached (5/day)" };
  }

  const thread = await db.messageThread.create({
    data: { participant1: p1, participant2: p2, type: "DIRECT", status: mutual ? "ACTIVE" : "REQUEST", creatorId: senderId },
  });

  if (body) {
    await db.message.create({ data: { threadId: thread.id, senderId, body } });
  }

  // Notification
  const sender = await db.user.findUnique({ where: { id: senderId }, select: { name: true } });
  const senderName = sender?.name || "Someone";

  await db.notification.create({
    data: { userId: recipientId, type: "MESSAGE", title: `${senderName} sent you a message`, link: `/messages/${thread.id}` },
  });

  // Email
  const recipient = await db.user.findUnique({ where: { id: recipientId }, select: { email: true, name: true } });
  if (recipient?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
    const requestNote = !mutual ? "<p style='color:#b8461f;font-size:13px;'>This is a message request — reply to accept.</p>" : "";
    sendEmail({
      to: recipient.email,
      subject: `New message from ${senderName} on The Intellectual Exchange`,
      html: `<h2>New message from ${senderName}</h2>${requestNote}${body ? `<p style="background:#f9fafb;padding:16px;border-radius:8px;color:#374151;">${body.slice(0, 200)}${body.length > 200 ? "..." : ""}</p>` : ""}<p><a href="${baseUrl}/messages/${thread.id}" style="display:inline-block;padding:10px 20px;background:#b8461f;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Reply on TIE</a></p>`,
    });
  }

  revalidatePath("/messages");
  return { success: true, threadId: thread.id };
}

export async function getDirectMessageLimit() {
  const session = await auth();
  if (!session?.user?.id) return { used: 0, limit: 5, remaining: 5 };

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const used = await db.messageThread.count({
    where: { creatorId: session.user.id, type: "DIRECT", status: "REQUEST", createdAt: { gte: oneDayAgo } },
  });

  return { used, limit: 5, remaining: Math.max(0, 5 - used) };
}
