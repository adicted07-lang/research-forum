import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

async function main() {
  console.log("Fetching trending questions...");

  const trending = await sql`
    SELECT q.title, q.slug, q.industry, q."upvoteCount", q."answerCount",
           u.name as author_name
    FROM questions q
    JOIN users u ON u.id = q."authorId"
    WHERE q."deletedAt" IS NULL
    AND q."createdAt" >= NOW() - INTERVAL '24 hours'
    ORDER BY q."upvoteCount" DESC, q."answerCount" ASC
    LIMIT 3
  `;

  if (trending.length === 0) {
    console.log("No trending questions in last 24h, skipping.");
    return;
  }

  // Get subscribers (reuse weekly_digest subscribers)
  const subscribers = await sql`
    SELECT ns.id, u.email, u.name, u.industry
    FROM newsletter_subscriptions ns
    JOIN users u ON u.id = ns."userId"
    WHERE ns.type = 'weekly_digest'
    AND ns."isActive" = true
    AND u.email IS NOT NULL
  `;

  if (subscribers.length === 0) {
    console.log("No subscribers, skipping.");
    return;
  }

  const questionsHtml = trending.map(q => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
        <a href="${BASE_URL}/forum/${q.slug}" style="color: #1a1f36; text-decoration: none; font-weight: 600; font-size: 15px;">${q.title}</a>
        ${q.industry ? `<span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: #fff7ed; color: #c2410c; border-radius: 12px; font-size: 11px;">${q.industry}</span>` : ""}
        <br>
        <span style="color: #9ca3af; font-size: 12px;">${q.upvoteCount} upvotes · ${q.answerCount} answers · by ${q.author_name}</span>
        <br>
        <a href="${BASE_URL}/forum/${q.slug}#answer" style="display: inline-block; margin-top: 6px; padding: 4px 12px; background: #b8461f; color: white; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 600;">Share your answer</a>
      </td>
    </tr>
  `).join("");

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  for (const sub of subscribers) {
    const greeting = sub.name ? `Hi ${sub.name.split(" ")[0]},` : "Hi there,";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1a1a1a;">
        <div style="padding: 32px 24px 0;">
          <h1 style="margin: 0 0 4px; font-size: 20px; font-weight: 800; color: #1a1f36;">Trending Today</h1>
          <p style="margin: 0 0 20px; color: #6b7280; font-size: 13px;">The Intellectual Exchange · ${today}</p>
        </div>
        <div style="padding: 0 24px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #374151; line-height: 1.5;">${greeting} These questions are getting attention — can you help?</p>
          <table style="width: 100%; border-collapse: collapse;">${questionsHtml}</table>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${BASE_URL}/forum" style="display: inline-block; padding: 10px 24px; background: #b8461f; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px;">Browse All Questions</a>
          </div>
        </div>
        <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
          <p style="margin: 0;">You're receiving this because you subscribed on The Intellectual Exchange.</p>
          <p style="margin: 4px 0 0;"><a href="${BASE_URL}/settings" style="color: #b8461f;">Unsubscribe</a></p>
        </div>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Intellectual Exchange <noreply@theintellectualexchange.com>",
        to: sub.email,
        subject: `Trending: ${trending[0].title.slice(0, 50)}${trending[0].title.length > 50 ? "..." : ""}`,
        html,
      }),
    });
  }

  console.log(`Done! Sent trending digest to ${subscribers.length} subscribers.`);
}

main().catch((err) => {
  console.error("Daily trending failed:", err);
  process.exit(1);
});
