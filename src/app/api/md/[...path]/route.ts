import { db } from "@/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function md(lines: string[]): Response {
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function notFound(path: string): Response {
  return new Response(`# 404\n\nNo content found at /${path}`, {
    status: 404,
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const section = path[0];
  const slug = path[1];

  // Section index pages
  if (!slug) {
    switch (section) {
      case "forum":
        return forumIndex();
      case "news":
        return newsIndex();
      case "marketplace":
        return marketplaceIndex();
      case "talent-board":
        return jobsIndex();
      case "researchers":
        return researchersIndex();
      case "datasets":
        return datasetsIndex();
      case "grants":
        return grantsIndex();
      default:
        return notFound(section);
    }
  }

  // Individual content pages
  switch (section) {
    case "forum":
      return forumPost(slug);
    case "news":
      return newsArticle(slug);
    case "marketplace":
      return marketplaceListing(slug);
    case "talent-board":
      return jobPost(slug);
    case "profile":
      return researcherProfile(slug);
    case "datasets":
      return datasetPage(slug);
    case "grants":
      return grantPage(slug);
    default:
      return notFound(path.join("/"));
  }
}

// --- Section index pages ---

async function forumIndex() {
  const questions = await db.question.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      tags: true,
      category: true,
      upvoteCount: true,
      answerCount: true,
      createdAt: true,
      author: { select: { name: true, username: true } },
    },
  });

  const lines = [
    "# Forum — Research Q&A",
    `> ${questions.length} recent questions from the research community`,
    "",
  ];
  for (const q of questions) {
    const author = q.author?.name || q.author?.username || "Anonymous";
    const tags = q.tags?.length ? ` | Tags: ${q.tags.join(", ")}` : "";
    lines.push(`## [${q.title}](${BASE_URL}/forum/${q.slug})`);
    lines.push(
      `By ${author} | ${q.upvoteCount} upvotes | ${q.answerCount} answers${tags}`
    );
    lines.push("");
  }
  return md(lines);
}

async function newsIndex() {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      tags: true,
      category: true,
      readTime: true,
      publishedAt: true,
      author: { select: { name: true, username: true } },
    },
  });

  const lines = [
    "# News — Research Articles",
    `> ${articles.length} recent articles`,
    "",
  ];
  for (const a of articles) {
    const author = a.author?.name || a.author?.username || "Staff";
    const date = a.publishedAt?.toISOString().slice(0, 10) || "";
    lines.push(`## [${a.title}](${BASE_URL}/news/${a.slug})`);
    lines.push(
      `By ${author} | ${date}${a.readTime ? ` | ${a.readTime} min read` : ""}`
    );
    lines.push("");
  }
  return md(lines);
}

async function marketplaceIndex() {
  const listings = await db.listing.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      type: true,
      categoryTags: true,
      tagline: true,
      author: { select: { name: true, username: true } },
    },
  });

  const lines = [
    "# Marketplace — Research Tools & Services",
    `> ${listings.length} active listings`,
    "",
  ];
  for (const l of listings) {
    const author = l.author?.name || l.author?.username || "";
    lines.push(`## [${l.title}](${BASE_URL}/marketplace/${l.slug})`);
    lines.push(
      `${l.type} by ${author}${l.tagline ? ` — ${l.tagline}` : ""}`
    );
    lines.push("");
  }
  return md(lines);
}

async function jobsIndex() {
  const jobs = await db.job.findMany({
    where: { deletedAt: null, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      researchDomain: true,
      locationPreference: true,
      company: { select: { name: true, companyName: true } },
    },
  });

  const lines = [
    "# Talent Board — Research Jobs",
    `> ${jobs.length} open positions`,
    "",
  ];
  for (const j of jobs) {
    const company =
      j.company?.companyName || j.company?.name || "Company";
    const domains = j.researchDomain?.length
      ? ` | ${j.researchDomain.join(", ")}`
      : "";
    lines.push(`## [${j.title}](${BASE_URL}/talent-board/${j.slug})`);
    lines.push(
      `${company}${j.locationPreference ? ` | ${j.locationPreference}` : ""}${domains}`
    );
    lines.push("");
  }
  return md(lines);
}

async function researchersIndex() {
  const researchers = await db.user.findMany({
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
  });

  const lines = [
    "# Researchers",
    `> ${researchers.length} top community members`,
    "",
  ];
  for (const r of researchers) {
    const expertise = r.expertise?.length
      ? ` | Expertise: ${r.expertise.join(", ")}`
      : "";
    lines.push(
      `## [${r.name || r.username}](${BASE_URL}/profile/${r.username})`
    );
    lines.push(`${r.points} reputation points${expertise}`);
    if (r.bio) lines.push(`> ${r.bio.slice(0, 200)}`);
    lines.push("");
  }
  return md(lines);
}

async function datasetsIndex() {
  const datasets = await db.dataset.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      tags: true,
      format: true,
      license: true,
      author: { select: { name: true, username: true } },
    },
  });

  const lines = [
    "# Datasets",
    `> ${datasets.length} shared research datasets`,
    "",
  ];
  for (const d of datasets) {
    const author = d.author?.name || d.author?.username || "";
    const meta = [d.format, d.license].filter(Boolean).join(" | ");
    lines.push(`## [${d.title}](${BASE_URL}/datasets/${d.slug})`);
    lines.push(`By ${author}${meta ? ` | ${meta}` : ""}`);
    lines.push("");
  }
  return md(lines);
}

async function grantsIndex() {
  const grants = await db.grant.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      funder: true,
      fundingRange: true,
      deadline: true,
    },
  });

  const lines = [
    "# Research Grants",
    `> ${grants.length} funding opportunities`,
    "",
  ];
  for (const g of grants) {
    const deadline = g.deadline
      ? ` | Deadline: ${g.deadline.toISOString().slice(0, 10)}`
      : "";
    lines.push(`## [${g.title}](${BASE_URL}/grants/${g.slug})`);
    lines.push(
      `${g.funder || "Various"}${g.fundingRange ? ` | ${g.fundingRange}` : ""}${deadline}`
    );
    lines.push("");
  }
  return md(lines);
}

// --- Individual content pages ---

async function forumPost(slug: string) {
  const question = await db.question.findFirst({
    where: { slug, deletedAt: null },
    select: {
      title: true,
      body: true,
      tags: true,
      category: true,
      researchDomain: true,
      upvoteCount: true,
      answerCount: true,
      createdAt: true,
      author: { select: { name: true, username: true } },
      answers: {
        where: { deletedAt: null },
        orderBy: { upvoteCount: "desc" },
        take: 10,
        select: {
          body: true,
          isAccepted: true,
          upvoteCount: true,
          createdAt: true,
          author: { select: { name: true, username: true } },
        },
      },
    },
  });
  if (!question) return notFound(`forum/${slug}`);

  const author =
    question.author?.name || question.author?.username || "Anonymous";
  const tags = question.tags?.length
    ? `Tags: ${question.tags.join(", ")}`
    : "";
  const lines = [
    `# ${question.title}`,
    "",
    `**Asked by ${author}** on ${question.createdAt.toISOString().slice(0, 10)} | ${question.upvoteCount} upvotes | ${question.answerCount} answers`,
    tags,
    question.researchDomain ? `Research domain: ${question.researchDomain}` : "",
    "",
    stripHtml(question.body),
    "",
  ];

  if (question.answers.length > 0) {
    lines.push("---", "## Answers", "");
    for (const a of question.answers) {
      const aAuthor = a.author?.name || a.author?.username || "Anonymous";
      const accepted = a.isAccepted ? " **[Accepted]**" : "";
      lines.push(
        `### ${aAuthor}${accepted} (${a.upvoteCount} upvotes)`
      );
      lines.push(stripHtml(a.body));
      lines.push("");
    }
  }

  return md(lines.filter(Boolean));
}

async function newsArticle(slug: string) {
  const article = await db.article.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    select: {
      title: true,
      body: true,
      tags: true,
      category: true,
      readTime: true,
      publishedAt: true,
      author: { select: { name: true, username: true } },
    },
  });
  if (!article) return notFound(`news/${slug}`);

  const author = article.author?.name || article.author?.username || "Staff";
  const date = article.publishedAt?.toISOString().slice(0, 10) || "";
  const lines = [
    `# ${article.title}`,
    "",
    `**By ${author}** | ${date}${article.readTime ? ` | ${article.readTime} min read` : ""}`,
    article.category ? `Category: ${article.category}` : "",
    article.tags?.length ? `Tags: ${article.tags.join(", ")}` : "",
    "",
    stripHtml(article.body),
    "",
  ];

  return md(lines.filter(Boolean));
}

async function marketplaceListing(slug: string) {
  const listing = await db.listing.findFirst({
    where: { slug, deletedAt: null, isActive: true },
    select: {
      title: true,
      tagline: true,
      description: true,
      type: true,
      categoryTags: true,
      pricingInfo: true,
      author: { select: { name: true, username: true } },
    },
  });
  if (!listing) return notFound(`marketplace/${slug}`);

  const author = listing.author?.name || listing.author?.username || "";
  const lines = [
    `# ${listing.title}`,
    listing.tagline ? `> ${listing.tagline}` : "",
    "",
    `**Type:** ${listing.type} | **By:** ${author}`,
    listing.categoryTags?.length ? `Tags: ${listing.categoryTags.join(", ")}` : "",
    listing.pricingInfo ? `Pricing: ${listing.pricingInfo}` : "",
    "",
    stripHtml(listing.description || ""),
    "",
  ];

  return md(lines.filter(Boolean));
}

async function jobPost(slug: string) {
  const job = await db.job.findFirst({
    where: { slug, deletedAt: null },
    select: {
      title: true,
      description: true,
      researchDomain: true,
      requiredSkills: true,
      budgetMin: true,
      budgetMax: true,
      timeline: true,
      locationPreference: true,
      status: true,
      createdAt: true,
      company: { select: { name: true, companyName: true } },
    },
  });
  if (!job) return notFound(`talent-board/${slug}`);

  const company =
    job.company?.companyName || job.company?.name || "Company";
  const budget =
    job.budgetMin && job.budgetMax
      ? `$${job.budgetMin}–$${job.budgetMax}`
      : "";
  const lines = [
    `# ${job.title}`,
    "",
    `**${company}** | Status: ${job.status}`,
    job.locationPreference ? `Location: ${job.locationPreference}` : "",
    budget ? `Budget: ${budget}` : "",
    job.timeline ? `Timeline: ${job.timeline}` : "",
    job.researchDomain?.length
      ? `Research domains: ${job.researchDomain.join(", ")}`
      : "",
    job.requiredSkills?.length
      ? `Required skills: ${job.requiredSkills.join(", ")}`
      : "",
    "",
    stripHtml(job.description || ""),
    "",
  ];

  return md(lines.filter(Boolean));
}

async function researcherProfile(username: string) {
  const user = await db.user.findFirst({
    where: { username, deletedAt: null },
    select: {
      name: true,
      username: true,
      bio: true,
      expertise: true,
      companyName: true,
      role: true,
      points: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user) return notFound(`profile/${username}`);

  const lines = [
    `# ${user.name || user.username}`,
    "",
    user.bio || "",
    "",
    `**Username:** @${user.username}`,
    user.companyName ? `**Organization:** ${user.companyName}` : "",
    `**Reputation:** ${user.points} points`,
    user.expertise?.length
      ? `**Expertise:** ${user.expertise.join(", ")}`
      : "",
    `**Member since:** ${user.createdAt.toISOString().slice(0, 10)}`,
    "",
  ];

  return md(lines.filter(Boolean));
}

async function datasetPage(slug: string) {
  const dataset = await db.dataset.findFirst({
    where: { slug, deletedAt: null, isActive: true },
    select: {
      title: true,
      description: true,
      tags: true,
      license: true,
      format: true,
      size: true,
      author: { select: { name: true, username: true } },
    },
  });
  if (!dataset) return notFound(`datasets/${slug}`);

  const author = dataset.author?.name || dataset.author?.username || "";
  const lines = [
    `# ${dataset.title}`,
    "",
    `**By:** ${author}`,
    dataset.format ? `**Format:** ${dataset.format}` : "",
    dataset.size ? `**Size:** ${dataset.size}` : "",
    dataset.license ? `**License:** ${dataset.license}` : "",
    dataset.tags?.length ? `**Tags:** ${dataset.tags.join(", ")}` : "",
    "",
    stripHtml(dataset.description || ""),
    "",
  ];

  return md(lines.filter(Boolean));
}

async function grantPage(slug: string) {
  const grant = await db.grant.findFirst({
    where: { slug, isActive: true },
    select: {
      title: true,
      description: true,
      funder: true,
      fundingRange: true,
      deadline: true,
      eligibility: true,
      tags: true,
    },
  });
  if (!grant) return notFound(`grants/${slug}`);

  const lines = [
    `# ${grant.title}`,
    "",
    grant.funder ? `**Funder:** ${grant.funder}` : "",
    grant.fundingRange ? `**Funding:** ${grant.fundingRange}` : "",
    grant.deadline
      ? `**Deadline:** ${grant.deadline.toISOString().slice(0, 10)}`
      : "",
    grant.eligibility ? `**Eligibility:** ${grant.eligibility}` : "",
    grant.tags?.length ? `**Tags:** ${grant.tags.join(", ")}` : "",
    "",
    stripHtml(grant.description || ""),
    "",
  ];

  return md(lines.filter(Boolean));
}
