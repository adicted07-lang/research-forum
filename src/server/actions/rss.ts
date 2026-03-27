"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function addRSSSource(name: string, url: string, pollInterval: number = 3600) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Forbidden" };

  try {
    const source = await db.rSSFeedSource.create({
      data: { name, url, pollInterval },
    });
    return { source };
  } catch {
    return { error: "Failed to add RSS source. URL may already exist." };
  }
}

export async function removeRSSSource(sourceId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Forbidden" };

  try {
    await db.rSSFeedSource.delete({ where: { id: sourceId } });
    return { success: true };
  } catch {
    return { error: "Failed to remove RSS source" };
  }
}

export async function getRSSSources() {
  const session = await auth();
  if (!session?.user?.id) return { sources: [] };
  if (session.user.role !== "ADMIN") return { sources: [] };

  try {
    const sources = await db.rSSFeedSource.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { sources };
  } catch {
    return { sources: [] };
  }
}
