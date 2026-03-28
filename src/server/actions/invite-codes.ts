"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };
  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") return { error: "Forbidden" as const };
    return { userId: session.user.id };
  } catch {
    return { error: "Forbidden" as const };
  }
}

function randomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateInviteCode(expiresInDays?: number) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const code = randomCode();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const invite = await db.inviteCode.create({
    data: {
      code,
      createdBy: auth.userId,
      expiresAt,
    },
  });

  return { success: true, code: invite.code };
}

export async function getInviteCodes() {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const codes = await db.inviteCode.findMany({
    include: {
      creator: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    codes: codes.map((c) => ({
      id: c.id,
      code: c.code,
      createdBy: c.creator.name ?? c.creator.email,
      usedBy: c.usedBy,
      usedAt: c.usedAt,
      expiresAt: c.expiresAt,
      isActive: c.isActive,
      createdAt: c.createdAt,
    })),
  };
}

export async function validateInviteCode(code: string) {
  const invite = await db.inviteCode.findUnique({ where: { code } });
  if (!invite) return { valid: false, reason: "Code not found" };
  if (!invite.isActive) return { valid: false, reason: "Code is inactive" };
  if (invite.usedBy) return { valid: false, reason: "Code already used" };
  if (invite.expiresAt && invite.expiresAt < new Date())
    return { valid: false, reason: "Code expired" };
  return { valid: true };
}

export async function useInviteCode(code: string, userId: string) {
  const validation = await validateInviteCode(code);
  if (!validation.valid) return { error: validation.reason };

  await db.inviteCode.update({
    where: { code },
    data: { usedBy: userId, usedAt: new Date(), isActive: false },
  });

  return { success: true };
}
