import { db } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export async function GET() {
  const [articles, questions] = await Promise.all([
    db.article.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        title: true,
        slug: true,
        body: true,
        category: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    }),
    db.question.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        title: true,
        slug: true,
        body: true,
        category: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  const items = [
    ...articles.map((a) => ({
      title: a.title,
      link: `${BASE_URL}/news/${a.slug}`,
      description: stripHtml(a.body).slice(0, 300) + "...",
      pubDate: a.publishedAt?.toUTCString() || new Date().toUTCString(),
      category: a.category || "news",
      author: a.author?.name || "The Intellectual Exchange",
    })),
    ...questions.map((q) => ({
      title: q.title,
      link: `${BASE_URL}/forum/${q.slug}`,
      description: stripHtml(q.body).slice(0, 300) + "...",
      pubDate: q.createdAt.toUTCString(),
      category: q.category || "forum",
      author: q.author?.name || "Anonymous",
    })),
  ]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 30);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Intellectual Exchange</title>
    <link>${BASE_URL}</link>
    <description>Market research community — questions, articles, and insights from researchers worldwide</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <category>${item.category}</category>
      <author>${item.author}</author>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
