import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [trendingQuestions, recentArticles, subscribers] = await Promise.all([
      db.question.findMany({
        where: { deletedAt: null, createdAt: { gte: oneWeekAgo } },
        orderBy: { upvoteCount: "desc" },
        take: 5,
        select: { title: true, slug: true, upvoteCount: true, answerCount: true },
      }),
      db.article.findMany({
        where: { status: "PUBLISHED", deletedAt: null, publishedAt: { gte: oneWeekAgo } },
        orderBy: { upvoteCount: "desc" },
        take: 3,
        select: { title: true, slug: true },
      }),
      db.newsletterSubscription.findMany({
        where: { type: "weekly_digest", isActive: true },
        include: { user: { select: { email: true, name: true } } },
      }),
    ]);

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, reason: "No subscribers" });
    }

    // Build digest HTML
    const questionsHtml = trendingQuestions.length > 0
      ? trendingQuestions.map(q =>
          `<li style="margin-bottom: 8px;"><a href="https://researchhub.com/forum/${q.slug}" style="color: #DA552F; text-decoration: none; font-weight: 600;">${q.title}</a> <span style="color: #9ca3af; font-size: 12px;">(${q.upvoteCount} upvotes, ${q.answerCount} answers)</span></li>`
        ).join("")
      : '<li style="color: #6b7280;">No new questions this week</li>';

    const articlesHtml = recentArticles.length > 0
      ? recentArticles.map(a =>
          `<li style="margin-bottom: 8px;"><a href="https://researchhub.com/news/${a.slug}" style="color: #DA552F; text-decoration: none; font-weight: 600;">${a.title}</a></li>`
        ).join("")
      : '<li style="color: #6b7280;">No new articles this week</li>';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; color: #1a1a1a;">
        <h2 style="margin: 0 0 4px; font-size: 22px; font-weight: 700;">Your Weekly Research Digest</h2>
        <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">The best of ResearchHub this week</p>

        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #374151;">Trending Questions</h3>
        <ul style="margin: 0 0 24px; padding-left: 20px; line-height: 1.6;">${questionsHtml}</ul>

        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #374151;">Latest Articles</h3>
        <ul style="margin: 0 0 24px; padding-left: 20px; line-height: 1.6;">${articlesHtml}</ul>

        <a href="https://researchhub.com" style="display: inline-block; padding: 10px 20px; background: #DA552F; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Visit ResearchHub</a>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          <p>You're receiving this because you subscribed to the weekly digest.</p>
          <p><a href="https://researchhub.com/settings" style="color: #DA552F;">Manage preferences</a></p>
        </div>
      </div>
    `;

    let sent = 0;
    for (const sub of subscribers) {
      if (sub.user.email) {
        sendEmail({
          to: sub.user.email,
          subject: "Your Weekly Research Digest — ResearchHub",
          html,
        });
        sent++;
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
