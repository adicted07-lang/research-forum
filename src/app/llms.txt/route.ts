import { db } from "@/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export async function GET() {
  const [questions, articles, jobs, researchers, listings, grants, datasets] =
    await Promise.all([
      db.question.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { title: true, slug: true, tags: true, category: true },
      }),
      db.article.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 50,
        select: { title: true, slug: true, tags: true, category: true },
      }),
      db.job.findMany({
        where: { deletedAt: null, status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { title: true, slug: true, researchDomain: true },
      }),
      db.user.findMany({
        where: { deletedAt: null, bio: { not: "" } },
        orderBy: { points: "desc" },
        take: 50,
        select: { name: true, username: true, expertise: true },
      }),
      db.listing.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { title: true, slug: true, type: true, categoryTags: true },
      }),
      db.grant.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { title: true, slug: true, funder: true },
      }),
      db.dataset.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { title: true, slug: true, tags: true },
      }),
    ]);

  const lines: string[] = [
    "# The Intellectual Exchange",
    "> A professional community where researchers, academics, and companies exchange knowledge, collaborate on projects, and advance science together.",
    "",
    `## About`,
    `The Intellectual Exchange connects ${researchers.length}+ researchers across industries. Members ask and answer research questions, publish articles, share datasets, list services, post jobs, and discover funding opportunities.`,
    "",
    "## Sections",
    `- [Forum](${BASE_URL}/forum) — Research Q&A with voting and accepted answers`,
    `- [News](${BASE_URL}/news) — Research articles, how-tos, interviews, and opinions`,
    `- [Marketplace](${BASE_URL}/marketplace) — Research tools and services`,
    `- [Talent Board](${BASE_URL}/talent-board) — Research job postings and freelance projects`,
    `- [Researchers](${BASE_URL}/researchers) — Researcher directory with expertise and credentials`,
    `- [Datasets](${BASE_URL}/datasets) — Shared research datasets`,
    `- [Grants](${BASE_URL}/grants) — Research funding opportunities`,
    `- [Explore](${BASE_URL}/explore) — Discover researchers by expertise and industry`,
    `- [Leaderboard](${BASE_URL}/leaderboard) — Community reputation rankings`,
    "",
  ];

  // Questions
  if (questions.length > 0) {
    lines.push("## Recent Questions");
    for (const q of questions) {
      const tags = q.tags?.length ? ` [${q.tags.join(", ")}]` : "";
      lines.push(`- [${q.title}](${BASE_URL}/forum/${q.slug})${tags}`);
    }
    lines.push("");
  }

  // Articles
  if (articles.length > 0) {
    lines.push("## Recent Articles");
    for (const a of articles) {
      const tags = a.tags?.length ? ` [${a.tags.join(", ")}]` : "";
      lines.push(`- [${a.title}](${BASE_URL}/news/${a.slug})${tags}`);
    }
    lines.push("");
  }

  // Jobs
  if (jobs.length > 0) {
    lines.push("## Open Positions");
    for (const j of jobs) {
      const domains = j.researchDomain?.length
        ? ` [${j.researchDomain.join(", ")}]`
        : "";
      lines.push(
        `- [${j.title}](${BASE_URL}/talent-board/${j.slug})${domains}`
      );
    }
    lines.push("");
  }

  // Marketplace
  if (listings.length > 0) {
    lines.push("## Marketplace Listings");
    for (const l of listings) {
      const tags = l.categoryTags?.length ? ` [${l.categoryTags.join(", ")}]` : "";
      lines.push(
        `- [${l.title}](${BASE_URL}/marketplace/${l.slug}) (${l.type})${tags}`
      );
    }
    lines.push("");
  }

  // Researchers
  if (researchers.length > 0) {
    lines.push("## Top Researchers");
    for (const r of researchers) {
      const expertise = r.expertise?.length
        ? ` — ${r.expertise.join(", ")}`
        : "";
      lines.push(
        `- [${r.name || r.username}](${BASE_URL}/profile/${r.username})${expertise}`
      );
    }
    lines.push("");
  }

  // Grants
  if (grants.length > 0) {
    lines.push("## Research Grants");
    for (const g of grants) {
      const funder = g.funder ? ` (${g.funder})` : "";
      lines.push(`- [${g.title}](${BASE_URL}/grants/${g.slug})${funder}`);
    }
    lines.push("");
  }

  // Datasets
  if (datasets.length > 0) {
    lines.push("## Datasets");
    for (const d of datasets) {
      const tags = d.tags?.length ? ` [${d.tags.join(", ")}]` : "";
      lines.push(`- [${d.title}](${BASE_URL}/datasets/${d.slug})${tags}`);
    }
    lines.push("");
  }

  lines.push("## Contact");
  lines.push("support@theintellectualexchange.com");
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
