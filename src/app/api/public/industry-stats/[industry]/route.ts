import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { corsHeaders } from "../../cors";

export async function GET(request: NextRequest, { params }: { params: Promise<{ industry: string }> }) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`public-industry:${ip}`, 60, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: corsHeaders() });
  }

  const { industry } = await params;
  const decodedIndustry = decodeURIComponent(industry);

  const [questionCount, researcherCount, recentQuestions] = await Promise.all([
    db.question.count({
      where: { industry: { equals: decodedIndustry, mode: "insensitive" }, deletedAt: null },
    }),
    db.user.count({
      where: {
        role: "RESEARCHER",
        deletedAt: null,
        expertise: { hasSome: [decodedIndustry.toLowerCase()] },
      },
    }),
    db.question.findMany({
      where: { industry: { equals: decodedIndustry, mode: "insensitive" }, deletedAt: null },
      select: { tags: true },
      take: 100,
    }),
  ]);

  // Get top tags for this industry
  const tagCounts = new Map<string, number>();
  for (const q of recentQuestions) {
    for (const tag of q.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  return NextResponse.json({
    industry: decodedIndustry,
    questions: questionCount,
    active_researchers: researcherCount,
    top_tags: topTags,
    generated_at: new Date().toISOString(),
    attribution: "The Intellectual Exchange — https://theintellectualexchange.com",
  }, {
    headers: corsHeaders(),
  });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}
