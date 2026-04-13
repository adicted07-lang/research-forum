import { db } from "@/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncate(text: string, max: number): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s\S*$/, "") + "...";
}

export async function GET() {
  const [questions, articles, jobs, researchers, listings, grants, datasets] =
    await Promise.all([
      db.question.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          title: true,
          slug: true,
          body: true,
          tags: true,
          category: true,
          researchDomain: true,
          upvoteCount: true,
          answerCount: true,
          createdAt: true,
          author: { select: { name: true, username: true } },
          answers: {
            where: { deletedAt: null, isAccepted: true },
            take: 1,
            select: {
              body: true,
              author: { select: { name: true, username: true } },
            },
          },
        },
      }),
      db.article.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 50,
        select: {
          title: true,
          slug: true,
          body: true,
          tags: true,
          category: true,
          readTime: true,
          publishedAt: true,
          author: { select: { name: true, username: true } },
        },
      }),
      db.job.findMany({
        where: { deletedAt: null, status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          title: true,
          slug: true,
          description: true,
          researchDomain: true,
          requiredSkills: true,
          locationPreference: true,
          company: { select: { name: true, companyName: true } },
        },
      }),
      db.user.findMany({
        where: { deletedAt: null, bio: { not: "" } },
        orderBy: { points: "desc" },
        take: 50,
        select: {
          name: true,
          username: true,
          bio: true,
          expertise: true,
          points: true,
        },
      }),
      db.listing.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          title: true,
          slug: true,
          description: true,
          type: true,
          categoryTags: true,
          tagline: true,
          author: { select: { name: true, username: true } },
        },
      }),
      db.grant.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          title: true,
          slug: true,
          description: true,
          funder: true,
          fundingRange: true,
          deadline: true,
          tags: true,
        },
      }),
      db.dataset.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          title: true,
          slug: true,
          description: true,
          tags: true,
          format: true,
          license: true,
          author: { select: { name: true, username: true } },
        },
      }),
    ]);

  const lines: string[] = [
    "# The Intellectual Exchange — Full Content Index",
    "> A professional community where researchers, academics, and companies exchange knowledge, collaborate on projects, and advance science together.",
    "",
    `This document contains content summaries for ${questions.length} questions, ${articles.length} articles, ${jobs.length} open jobs, ${listings.length} marketplace listings, ${researchers.length} researchers, ${grants.length} grants, and ${datasets.length} datasets.`,
    "",
    `Website: ${BASE_URL}`,
    `Contact: support@theintellectualexchange.com`,
    "",
  ];

  // Questions with snippets + accepted answers
  if (questions.length > 0) {
    lines.push("---", "## Research Questions & Answers", "");
    for (const q of questions) {
      const author = q.author?.name || q.author?.username || "Anonymous";
      const tags = q.tags?.length ? `Tags: ${q.tags.join(", ")}` : "";
      lines.push(`### ${q.title}`);
      lines.push(`URL: ${BASE_URL}/forum/${q.slug}`);
      lines.push(
        `By ${author} | ${q.upvoteCount} upvotes | ${q.answerCount} answers`
      );
      if (tags) lines.push(tags);
      if (q.researchDomain) lines.push(`Domain: ${q.researchDomain}`);
      lines.push("");
      lines.push(truncate(q.body, 500));
      if (q.answers[0]) {
        const aAuthor =
          q.answers[0].author?.name ||
          q.answers[0].author?.username ||
          "Anonymous";
        lines.push("");
        lines.push(`**Accepted answer by ${aAuthor}:**`);
        lines.push(truncate(q.answers[0].body, 400));
      }
      lines.push("");
    }
  }

  // Articles with content previews
  if (articles.length > 0) {
    lines.push("---", "## Articles & News", "");
    for (const a of articles) {
      const author = a.author?.name || a.author?.username || "Staff";
      const date = a.publishedAt?.toISOString().slice(0, 10) || "";
      lines.push(`### ${a.title}`);
      lines.push(`URL: ${BASE_URL}/news/${a.slug}`);
      lines.push(
        `By ${author} | ${date}${a.readTime ? ` | ${a.readTime} min read` : ""}`
      );
      if (a.tags?.length) lines.push(`Tags: ${a.tags.join(", ")}`);
      lines.push("");
      lines.push(truncate(a.body, 600));
      lines.push("");
    }
  }

  // Jobs with descriptions
  if (jobs.length > 0) {
    lines.push("---", "## Open Research Positions", "");
    for (const j of jobs) {
      const company =
        j.company?.companyName || j.company?.name || "Company";
      lines.push(`### ${j.title}`);
      lines.push(`URL: ${BASE_URL}/talent-board/${j.slug}`);
      lines.push(`Company: ${company}`);
      if (j.locationPreference)
        lines.push(`Location: ${j.locationPreference}`);
      if (j.researchDomain?.length)
        lines.push(`Domains: ${j.researchDomain.join(", ")}`);
      if (j.requiredSkills?.length)
        lines.push(`Skills: ${j.requiredSkills.join(", ")}`);
      lines.push("");
      lines.push(truncate(j.description || "", 400));
      lines.push("");
    }
  }

  // Marketplace with descriptions
  if (listings.length > 0) {
    lines.push("---", "## Marketplace — Tools & Services", "");
    for (const l of listings) {
      const author = l.author?.name || l.author?.username || "";
      lines.push(`### ${l.title}`);
      lines.push(`URL: ${BASE_URL}/marketplace/${l.slug}`);
      lines.push(`Type: ${l.type} | By: ${author}`);
      if (l.tagline) lines.push(`> ${l.tagline}`);
      if (l.categoryTags?.length)
        lines.push(`Tags: ${l.categoryTags.join(", ")}`);
      lines.push("");
      lines.push(truncate(l.description || "", 400));
      lines.push("");
    }
  }

  // Researchers with bios
  if (researchers.length > 0) {
    lines.push("---", "## Researchers", "");
    for (const r of researchers) {
      lines.push(`### ${r.name || r.username}`);
      lines.push(`Profile: ${BASE_URL}/profile/${r.username}`);
      lines.push(`Reputation: ${r.points} points`);
      if (r.expertise?.length)
        lines.push(`Expertise: ${r.expertise.join(", ")}`);
      if (r.bio) lines.push(truncate(r.bio, 300));
      lines.push("");
    }
  }

  // Grants with details
  if (grants.length > 0) {
    lines.push("---", "## Research Grants & Funding", "");
    for (const g of grants) {
      lines.push(`### ${g.title}`);
      lines.push(`URL: ${BASE_URL}/grants/${g.slug}`);
      if (g.funder) lines.push(`Funder: ${g.funder}`);
      if (g.fundingRange) lines.push(`Funding: ${g.fundingRange}`);
      if (g.deadline)
        lines.push(`Deadline: ${g.deadline.toISOString().slice(0, 10)}`);
      if (g.tags?.length) lines.push(`Tags: ${g.tags.join(", ")}`);
      lines.push("");
      lines.push(truncate(g.description || "", 400));
      lines.push("");
    }
  }

  // Datasets with details
  if (datasets.length > 0) {
    lines.push("---", "## Research Datasets", "");
    for (const d of datasets) {
      const author = d.author?.name || d.author?.username || "";
      lines.push(`### ${d.title}`);
      lines.push(`URL: ${BASE_URL}/datasets/${d.slug}`);
      lines.push(`By: ${author}`);
      if (d.format) lines.push(`Format: ${d.format}`);
      if (d.license) lines.push(`License: ${d.license}`);
      if (d.tags?.length) lines.push(`Tags: ${d.tags.join(", ")}`);
      lines.push("");
      lines.push(truncate(d.description || "", 400));
      lines.push("");
    }
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
