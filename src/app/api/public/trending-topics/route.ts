import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { corsHeaders } from "../cors";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`public-trending:${ip}`, 60, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: corsHeaders() });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const questions = await db.question.findMany({
    where: { deletedAt: null, createdAt: { gte: oneWeekAgo } },
    select: { tags: true, upvoteCount: true },
  });

  // Count tag frequency weighted by upvotes
  const tagCounts = new Map<string, { count: number; upvotes: number }>();
  for (const q of questions) {
    for (const tag of q.tags) {
      const entry = tagCounts.get(tag) || { count: 0, upvotes: 0 };
      entry.count++;
      entry.upvotes += q.upvoteCount;
      tagCounts.set(tag, entry);
    }
  }

  const trending = Array.from(tagCounts.entries())
    .map(([topic, data]) => ({ topic, questions: data.count, upvotes: data.upvotes }))
    .sort((a, b) => b.upvotes - a.upvotes || b.questions - a.questions)
    .slice(0, 10);

  return NextResponse.json({
    data: trending,
    period: "7d",
    generated_at: new Date().toISOString(),
    attribution: "The Intellectual Exchange — https://theintellectualexchange.com",
  }, {
    headers: corsHeaders(),
  });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}
