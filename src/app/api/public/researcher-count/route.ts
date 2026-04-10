import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { corsHeaders } from "../cors";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`public-researchers:${ip}`, 60, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: corsHeaders() });
  }

  const researchers = await db.user.findMany({
    where: { role: "RESEARCHER", deletedAt: null },
    select: { expertise: true },
  });

  const total = researchers.length;
  const expertiseCounts = new Map<string, number>();
  for (const r of researchers) {
    for (const skill of r.expertise) {
      expertiseCounts.set(skill, (expertiseCounts.get(skill) || 0) + 1);
    }
  }

  const byExpertise = Array.from(expertiseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([expertise, count]) => ({ expertise, researchers: count }));

  return NextResponse.json({
    total_researchers: total,
    by_expertise: byExpertise,
    generated_at: new Date().toISOString(),
    attribution: "The Intellectual Exchange — https://theintellectualexchange.com",
  }, {
    headers: corsHeaders(),
  });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}
