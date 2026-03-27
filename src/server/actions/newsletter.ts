"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { newsletterEmail } from "@/lib/email-templates";

export async function toggleNewsletterSubscription(type: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const existing = await db.newsletterSubscription.findUnique({
      where: { userId_type: { userId: session.user.id, type } },
    });

    if (existing) {
      if (existing.isActive) {
        await db.newsletterSubscription.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
        return { subscribed: false };
      } else {
        await db.newsletterSubscription.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
        return { subscribed: true };
      }
    }

    await db.newsletterSubscription.create({
      data: { userId: session.user.id, type, isActive: true },
    });
    return { subscribed: true };
  } catch {
    return { error: "Failed to update subscription" };
  }
}

export async function getUserSubscriptions() {
  const session = await auth();
  if (!session?.user?.id) return { subscriptions: [] };

  try {
    const subs = await db.newsletterSubscription.findMany({
      where: { userId: session.user.id },
    });
    return { subscriptions: subs };
  } catch {
    return { subscriptions: [] };
  }
}

export async function sendNewsletter(type: string, subject: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Forbidden" };

  try {
    const subscribers = await db.newsletterSubscription.findMany({
      where: { type, isActive: true },
      include: { user: { select: { email: true } } },
    });

    const emails = subscribers
      .map((s) => s.user.email)
      .filter((e): e is string => !!e);

    for (const email of emails) {
      sendEmail({ to: email, subject, html: newsletterEmail(subject, body) });
    }

    return { sent: emails.length };
  } catch {
    return { error: "Failed to send newsletter" };
  }
}
