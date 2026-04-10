"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { awardPoints, deductPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";
import { revalidatePath } from "next/cache";

export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function toggleEndorsement(endorseeId: string, skill: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const endorserId = session.user.id;

  if (endorserId === endorseeId) {
    return { error: "Cannot endorse yourself" };
  }

  const endorsee = await db.user.findUnique({
    where: { id: endorseeId },
    select: { expertise: true, username: true },
  });

  if (!endorsee) {
    return { error: "User not found" };
  }

  const normalizedSkill = normalizeSkill(skill);
  const skillExists = endorsee.expertise.some(
    (e) => normalizeSkill(e) === normalizedSkill
  );

  if (!skillExists) {
    return { error: "Skill not found on this profile" };
  }

  const existing = await db.skillEndorsement.findUnique({
    where: {
      endorserId_endorseeId_skill: {
        endorserId,
        endorseeId,
        skill: normalizedSkill,
      },
    },
  });

  if (existing) {
    await db.skillEndorsement.delete({ where: { id: existing.id } });
    await deductPoints(endorseeId, POINTS.RECEIVE_ENDORSEMENT);
    await deductPoints(endorserId, POINTS.ENDORSE_SKILL);
    revalidatePath(`/profile/${endorsee.username}`);
    return { success: true, endorsed: false };
  }

  await db.skillEndorsement.create({
    data: { endorserId, endorseeId, skill: normalizedSkill },
  });

  await awardPoints(endorseeId, POINTS.RECEIVE_ENDORSEMENT);
  await awardPoints(endorserId, POINTS.ENDORSE_SKILL);

  // Notification — uses existing Notification model fields: userId, type, title, link
  const endorserUser = await db.user.findUnique({
    where: { id: endorserId },
    select: { name: true },
  });
  const endorserName = endorserUser?.name || "Someone";
  const notifTitle = `${endorserName} endorsed your ${skill} skill`;

  const existingNotification = await db.notification.findFirst({
    where: { userId: endorseeId, type: "ENDORSEMENT", title: notifTitle },
  });

  if (!existingNotification) {
    await db.notification.create({
      data: {
        userId: endorseeId,
        type: "ENDORSEMENT",
        title: notifTitle,
        link: `/profile/${endorsee.username}`,
      },
    });
  }

  // Badge check — "Endorsed Expert" at 10+ endorsements on any skill
  const endorsementCounts = await db.skillEndorsement.groupBy({
    by: ["skill"],
    where: { endorseeId },
    _count: { skill: true },
    having: { skill: { _count: { gte: 10 } } },
  });

  if (endorsementCounts.length > 0) {
    await db.badge.upsert({
      where: { userId_name: { userId: endorseeId, name: "Endorsed Expert" } },
      update: {},
      create: { userId: endorseeId, name: "Endorsed Expert", category: "expertise" },
    });
  }

  revalidatePath(`/profile/${endorsee.username}`);
  return { success: true, endorsed: true };
}

export type EndorsementSummary = {
  skill: string;
  count: number;
  endorsers: { id: string; name: string; username: string | null; image: string | null }[];
};

export async function getEndorsements(userId: string): Promise<EndorsementSummary[]> {
  const endorsements = await db.skillEndorsement.findMany({
    where: { endorseeId: userId },
    select: {
      skill: true,
      endorser: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<string, { count: number; endorsers: { id: string; name: string; username: string | null; image: string | null }[] }>();

  for (const e of endorsements) {
    const entry = grouped.get(e.skill) || { count: 0, endorsers: [] };
    entry.count++;
    if (entry.endorsers.length < 10) {
      entry.endorsers.push({
        id: e.endorser.id,
        name: e.endorser.name || "Anonymous",
        username: e.endorser.username,
        image: e.endorser.image,
      });
    }
    grouped.set(e.skill, entry);
  }

  return Array.from(grouped.entries())
    .map(([skill, data]) => ({ skill, ...data }))
    .sort((a, b) => b.count - a.count);
}

export async function getMyEndorsementsForUser(endorseeId: string): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const endorsements = await db.skillEndorsement.findMany({
    where: { endorserId: session.user.id, endorseeId },
    select: { skill: true },
  });

  return endorsements.map((e) => e.skill);
}
