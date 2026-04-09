import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getLevel } from "@/lib/reputation";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [trendingQuestions, recentArticles, newJobs, topContributors, weeklyStats, subscribers] = await Promise.all([
      db.question.findMany({
        where: { deletedAt: null, createdAt: { gte: oneWeekAgo } },
        orderBy: { upvoteCount: "desc" },
        take: 5,
        select: { title: true, slug: true, upvoteCount: true, answerCount: true, industry: true },
      }),
      db.article.findMany({
        where: { status: "PUBLISHED", deletedAt: null, publishedAt: { gte: oneWeekAgo } },
        orderBy: { upvoteCount: "desc" },
        take: 3,
        select: { title: true, slug: true, readTime: true },
      }),
      db.job.findMany({
        where: { deletedAt: null, createdAt: { gte: oneWeekAgo } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { title: true, slug: true, locationPreference: true, company: { select: { companyName: true } } },
      }),
      db.user.findMany({
        where: { deletedAt: null, role: "RESEARCHER" },
        orderBy: { points: "desc" },
        take: 3,
        select: { name: true, username: true, points: true },
      }),
      Promise.all([
        db.question.count({ where: { deletedAt: null, createdAt: { gte: oneWeekAgo } } }),
        db.answer.count({ where: { deletedAt: null, createdAt: { gte: oneWeekAgo } } }),
        db.user.count({ where: { deletedAt: null, createdAt: { gte: oneWeekAgo } } }),
      ]),
      db.newsletterSubscription.findMany({
        where: { type: "weekly_digest", isActive: true },
        include: { user: { select: { email: true, name: true, industry: true } } },
      }),
    ]);

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, reason: "No subscribers" });
    }

    const [questionsCount, answersCount, newMembersCount] = weeklyStats;

    function buildDigestHtml(subscriberName: string | null, subscriberIndustry: string | null) {
      // Prioritize questions from subscriber's industry
      const sortedQuestions = [...trendingQuestions].sort((a, b) => {
        if (subscriberIndustry) {
          if (a.industry === subscriberIndustry && b.industry !== subscriberIndustry) return -1;
          if (b.industry === subscriberIndustry && a.industry !== subscriberIndustry) return 1;
        }
        return 0;
      });

      const questionsHtml = sortedQuestions.length > 0
        ? sortedQuestions.map(q =>
            `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><a href="${BASE_URL}/forum/${q.slug}" style="color: #1a1f36; text-decoration: none; font-weight: 600; font-size: 14px;">${q.title}</a>${q.industry ? `<span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: #fff7ed; color: #c2410c; border-radius: 12px; font-size: 11px;">${q.industry}</span>` : ""}<br><span style="color: #9ca3af; font-size: 12px;">${q.upvoteCount} upvotes · ${q.answerCount} answers</span></td></tr>`
          ).join("")
        : '<tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">No new exchanges this week — be the first to ask!</td></tr>';

      const articlesHtml = recentArticles.length > 0
        ? recentArticles.map(a =>
            `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><a href="${BASE_URL}/news/${a.slug}" style="color: #1a1f36; text-decoration: none; font-weight: 600; font-size: 14px;">${a.title}</a><br><span style="color: #9ca3af; font-size: 12px;">${a.readTime || 5} min read</span></td></tr>`
          ).join("")
        : "";

      const jobsHtml = newJobs.length > 0
        ? newJobs.map(j =>
            `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><a href="${BASE_URL}/talent-board/${j.slug}" style="color: #1a1f36; text-decoration: none; font-weight: 600; font-size: 14px;">${j.title}</a><br><span style="color: #9ca3af; font-size: 12px;">${j.company?.companyName || "Company"} · ${j.locationPreference}</span></td></tr>`
          ).join("")
        : "";

      const contributorsHtml = topContributors.map((u, i) => {
        const level = getLevel(u.points);
        return `<tr><td style="padding: 6px 0;"><span style="color: #9ca3af; font-size: 12px;">#${i + 1}</span> <a href="${BASE_URL}/profile/${u.username}" style="color: #1a1f36; text-decoration: none; font-weight: 600; font-size: 14px;">${u.name || u.username}</a> <span style="display: inline-block; padding: 1px 6px; background: #f0f9ff; color: #1e40af; border-radius: 10px; font-size: 11px;">${level.name}</span> <span style="color: #9ca3af; font-size: 12px;">${u.points} IC</span></td></tr>`;
      }).join("");

      const greeting = subscriberName ? `Hi ${subscriberName.split(" ")[0]},` : "Hi there,";

      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1a1a1a;">
          <!-- Header -->
          <div style="padding: 32px 24px 0;">
            <h1 style="margin: 0 0 4px; font-size: 24px; font-weight: 800; color: #1a1f36;">The Intellectual Exchange</h1>
            <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">Weekly Digest · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>

          <div style="padding: 0 24px;">
            <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.5;">${greeting} here's what happened on the Forum this week.</p>

            <!-- Weekly Stats Bar -->
            <div style="display: flex; background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <div style="flex: 1;"><span style="display: block; font-size: 20px; font-weight: 700; color: #1a1f36;">${questionsCount}</span><span style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Questions</span></div>
              <div style="flex: 1; border-left: 1px solid #e5e7eb;"><span style="display: block; font-size: 20px; font-weight: 700; color: #1a1f36;">${answersCount}</span><span style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Answers</span></div>
              <div style="flex: 1; border-left: 1px solid #e5e7eb;"><span style="display: block; font-size: 20px; font-weight: 700; color: #1a1f36;">${newMembersCount}</span><span style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">New Members</span></div>
            </div>

            <!-- Trending on the Forum -->
            <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1a1f36;">🔥 Trending on the Forum</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">${questionsHtml}</table>

            ${articlesHtml ? `
            <!-- From News -->
            <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1a1f36;">📰 Latest News</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">${articlesHtml}</table>
            ` : ""}

            ${jobsHtml ? `
            <!-- Talent Board -->
            <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1a1f36;">💼 New on the Talent Board</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">${jobsHtml}</table>
            ` : ""}

            <!-- Top Contributors -->
            <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1a1f36;">🏆 The Index — Top Contributors</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">${contributorsHtml}</table>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${BASE_URL}" style="display: inline-block; padding: 12px 28px; background: #DA552F; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px;">Visit The Exchange</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0 0 4px;">You're receiving this because you subscribed to the weekly digest on The Intellectual Exchange.</p>
            <p style="margin: 0;"><a href="${BASE_URL}/settings" style="color: #DA552F;">Manage preferences</a> · <a href="${BASE_URL}/settings" style="color: #DA552F;">Unsubscribe</a></p>
          </div>
        </div>
      `;
    }

    let sent = 0;
    for (const sub of subscribers) {
      if (sub.user.email) {
        sendEmail({
          to: sub.user.email,
          subject: `The Exchange Rate — Weekly Digest · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          html: buildDigestHtml(sub.user.name, sub.user.industry),
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
