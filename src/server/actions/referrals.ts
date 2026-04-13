"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

function generateReferralCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function getOrCreateReferralCode() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });

  if (user?.referralCode) return { code: user.referralCode };

  // Generate unique code
  let code = generateReferralCode();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await db.user.findUnique({ where: { referralCode: code } });
    if (!exists) break;
    code = generateReferralCode();
    attempts++;
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { referralCode: code },
  });

  return { code };
}

export async function getReferralStats() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const referrals = await db.referral.findMany({
    where: { referrerId: session.user.id },
    include: { referred: { select: { name: true, username: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalPoints = referrals.reduce((sum, r) => sum + r.pointsAwarded, 0);

  return {
    count: referrals.length,
    totalPoints,
    referrals: referrals.map(r => ({
      name: r.referred.name || r.referred.username,
      joinedAt: r.createdAt,
      points: r.pointsAwarded,
    })),
  };
}

export async function processReferral(referralCode: string, newUserId: string) {
  // Find the referrer
  const referrer = await db.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });

  if (!referrer || referrer.id === newUserId) return;

  // Check if already referred
  const existing = await db.referral.findUnique({
    where: { referredId: newUserId },
  });
  if (existing) return;

  const REFERRAL_POINTS = 50;

  await db.$transaction([
    db.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: newUserId,
        pointsAwarded: REFERRAL_POINTS,
      },
    }),
    db.user.update({
      where: { id: referrer.id },
      data: { points: { increment: REFERRAL_POINTS } },
    }),
  ]);
}
