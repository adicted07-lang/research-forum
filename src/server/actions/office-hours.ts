"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

function generateSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export async function createOfficeHour(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const topic = formData.get("topic") as string;
  const startTime = formData.get("startTime") as string;
  const duration = parseInt(formData.get("duration") as string || "60", 10);
  const meetingUrl = formData.get("meetingUrl") as string | null;
  const maxAttendees = formData.get("maxAttendees") as string | null;

  if (!title || !description || !topic || !startTime) {
    return { error: "Title, description, topic, and start time are required" };
  }

  try {
    const officeHour = await db.officeHour.create({
      data: {
        hostId: session.user.id,
        title,
        description,
        slug: generateSlug(title),
        topic,
        startTime: new Date(startTime),
        duration,
        meetingUrl: meetingUrl || null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
      },
    });
    return { slug: officeHour.slug };
  } catch {
    return { error: "Failed to create office hour" };
  }
}

export async function getUpcomingOfficeHours(opts: { topic?: string; page?: number; limit?: number } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    startTime: { gte: new Date() },
    status: "scheduled",
  };
  if (opts.topic) where.topic = opts.topic;

  try {
    const [sessions, total] = await Promise.all([
      db.officeHour.findMany({
        where,
        orderBy: { startTime: "asc" },
        skip,
        take: limit,
        include: {
          host: { select: { id: true, name: true, username: true, image: true, expertise: true } },
        },
      }),
      db.officeHour.count({ where }),
    ]);
    return { sessions, totalPages: Math.ceil(total / limit), currentPage: page };
  } catch {
    return { sessions: [], totalPages: 1, currentPage: page };
  }
}

export async function getOfficeHourBySlug(slug: string) {
  try {
    return await db.officeHour.findUnique({
      where: { slug },
      include: {
        host: { select: { id: true, name: true, username: true, image: true, bio: true, expertise: true } },
      },
    });
  } catch {
    return null;
  }
}
