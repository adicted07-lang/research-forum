import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

function parseRSSItems(xml: string): Array<{ title: string; link: string; description: string }> {
  const items: Array<{ title: string; link: string; description: string }> = [];

  // Match RSS <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1] ?? "";
    const link = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i)?.[1] ?? "";
    const desc = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1] ?? "";
    if (title) items.push({ title: title.trim(), link: link.trim(), description: desc.trim() });
  }

  // Fallback: match Atom <entry> blocks
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1] ?? "";
      const link = block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i)?.[1] ?? "";
      const desc = block.match(/<(?:summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:summary|content)>/i)?.[1] ?? "";
      if (title) items.push({ title: title.trim(), link: link.trim(), description: desc.trim() });
    }
  }

  return items;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sources = await db.rSSFeedSource.findMany({
      where: { isActive: true },
    });

    let totalCreated = 0;

    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          headers: { "User-Agent": "ResearchHub RSS Poller/1.0" },
        });
        if (!response.ok) continue;

        const xml = await response.text();
        const items = parseRSSItems(xml);

        const admin = await db.user.findFirst({
          where: { role: "ADMIN", deletedAt: null },
          select: { id: true },
        });
        if (!admin) continue;

        for (const item of items.slice(0, 10)) {
          const exists = await db.article.findFirst({
            where: { sourceUrl: item.link },
          });
          if (exists) continue;

          const wordCount = item.description.trim().split(/\s+/).length;
          const slug = generateSlug(item.title);

          await db.article.create({
            data: {
              title: item.title,
              body: item.description || `<p>Read the full article at <a href="${item.link}">${item.link}</a></p>`,
              slug,
              authorId: admin.id,
              category: "news",
              sourceUrl: item.link,
              sourceTitle: source.name,
              readTime: Math.max(1, Math.ceil(wordCount / 200)),
              status: "PUBLISHED",
              publishedAt: new Date(),
            },
          });
          totalCreated++;
        }

        await db.rSSFeedSource.update({
          where: { id: source.id },
          data: { lastPolledAt: new Date() },
        });
      } catch {
        console.error(`Failed to poll RSS source: ${source.name}`);
      }
    }

    return NextResponse.json({ success: true, articlesCreated: totalCreated });
  } catch (error) {
    console.error("RSS poll error:", error);
    return NextResponse.json({ error: "RSS poll failed" }, { status: 500 });
  }
}
