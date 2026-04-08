import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLevel } from "@/lib/reputation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await db.user.findFirst({
    where: { username, deletedAt: null },
    select: { name: true, username: true, points: true, currentStreak: true, _count: { select: { answers: true } } },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const tier = getLevel(user.points);
  const displayName = user.name || user.username || "Researcher";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
      <rect width="320" height="80" rx="8" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"/>
      <rect width="320" height="4" fill="#DA552F" rx="0"/>
      <text x="16" y="30" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#21293C">${displayName}</text>
      <text x="16" y="48" font-family="system-ui, sans-serif" font-size="11" fill="#6F7287">@${user.username} · ${tier.name}</text>
      <text x="16" y="66" font-family="system-ui, sans-serif" font-size="11" fill="#9CA3AF">${user.points} pts · ${user._count.answers} answers · ${user.currentStreak}d streak</text>
      <text x="260" y="66" font-family="system-ui, sans-serif" font-size="9" fill="#DA552F">T.I.E</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
