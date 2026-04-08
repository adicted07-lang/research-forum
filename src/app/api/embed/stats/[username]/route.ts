import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLevel } from "@/lib/reputation";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`embed-stats:${ip}`, 30, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { username } = await params;

  const user = await db.user.findFirst({
    where: { username, deletedAt: null },
    select: {
      name: true, username: true, points: true,
      currentStreak: true, longestStreak: true,
      _count: { select: { answers: true, questions: true, followers: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tier = getLevel(user.points);

  return NextResponse.json({
    name: user.name,
    username: user.username,
    points: user.points,
    tier: tier.name,
    answers: user._count.answers,
    questions: user._count.questions,
    followers: user._count.followers,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  }, {
    headers: { "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" },
  });
}
