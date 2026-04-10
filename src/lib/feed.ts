import { db } from "@/lib/db";

export type FeedItem = {
  id: string;
  type: "question" | "article" | "answer" | "job";
  title: string;
  body: string;
  slug: string;
  url: string;
  author: { name: string | null; username: string | null; image: string | null };
  tags: string[];
  industry?: string | null;
  stats: { upvotes?: number; answers?: number; readTime?: number };
  createdAt: string;
  boostScore: number;
};

export type FeedResponse = {
  items: FeedItem[];
  hasMore: boolean;
  page: number;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function getFeedItems(
  page: number,
  userId?: string | null
): Promise<FeedResponse> {
  const pageSize = 20;
  const windowDays = 7;
  const jobWindowDays = 14;

  // Fetch user context for boosts
  let followingIds: string[] = [];
  let userExpertise: string[] = [];

  if (userId) {
    const [followings, user] = await Promise.all([
      db.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
      db.user.findUnique({ where: { id: userId }, select: { expertise: true } }),
    ]);
    followingIds = followings.map((f) => f.followingId);
    userExpertise = user?.expertise || [];
  }

  // Fetch content
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const jobSince = new Date(Date.now() - jobWindowDays * 24 * 60 * 60 * 1000);

  const [questions, articles, answers, jobs] = await Promise.all([
    db.question.findMany({
      where: { deletedAt: null, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, title: true, body: true, slug: true, tags: true, industry: true,
        upvoteCount: true, answerCount: true, createdAt: true,
        author: { select: { name: true, username: true, image: true, id: true } },
      },
    }),
    db.article.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { gte: since } },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        id: true, title: true, body: true, slug: true, tags: true, readTime: true,
        publishedAt: true,
        author: { select: { name: true, username: true, image: true, id: true } },
      },
    }),
    db.answer.findMany({
      where: { deletedAt: null, upvoteCount: { gte: 3 }, createdAt: { gte: since } },
      orderBy: { upvoteCount: "desc" },
      take: 50,
      select: {
        id: true, body: true, upvoteCount: true, createdAt: true,
        author: { select: { name: true, username: true, image: true, id: true } },
        question: { select: { title: true, slug: true, tags: true } },
      },
    }),
    db.job.findMany({
      where: { deletedAt: null, createdAt: { gte: jobSince } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true, title: true, slug: true, locationPreference: true, createdAt: true,
        company: { select: { companyName: true, companyLogo: true, username: true } },
      },
    }),
  ]);

  // If nothing found, return empty
  const totalItems = questions.length + articles.length + answers.length + jobs.length;
  if (totalItems === 0) {
    return { items: [], hasMore: false, page };
  }

  // Deduplicate answers: one per question (highest upvoted)
  const seenQuestions = new Set<string>();
  const dedupedAnswers = answers.filter((a) => {
    if (seenQuestions.has(a.question.slug)) return false;
    seenQuestions.add(a.question.slug);
    return true;
  });

  // Build feed items
  const questionItems: FeedItem[] = questions.map((q) => ({
    id: q.id, type: "question", title: q.title,
    body: stripHtml(q.body).slice(0, 200),
    slug: q.slug, url: `/forum/${q.slug}`,
    author: { name: q.author.name, username: q.author.username, image: q.author.image },
    tags: q.tags, industry: q.industry,
    stats: { upvotes: q.upvoteCount, answers: q.answerCount },
    createdAt: q.createdAt.toISOString(),
    boostScore: computeBoost(q.author.id, q.tags, followingIds, userExpertise),
  }));

  const articleItems: FeedItem[] = articles.map((a) => ({
    id: a.id, type: "article", title: a.title,
    body: stripHtml(a.body).slice(0, 200),
    slug: a.slug, url: `/news/${a.slug}`,
    author: { name: a.author.name, username: a.author.username, image: a.author.image },
    tags: a.tags, industry: null,
    stats: { readTime: a.readTime || undefined },
    createdAt: (a.publishedAt || new Date()).toISOString(),
    boostScore: computeBoost(a.author.id, a.tags, followingIds, userExpertise),
  }));

  const answerItems: FeedItem[] = dedupedAnswers.map((a) => ({
    id: a.id, type: "answer", title: a.question.title,
    body: stripHtml(a.body).slice(0, 200),
    slug: a.question.slug, url: `/forum/${a.question.slug}`,
    author: { name: a.author.name, username: a.author.username, image: a.author.image },
    tags: a.question.tags, industry: null,
    stats: { upvotes: a.upvoteCount },
    createdAt: a.createdAt.toISOString(),
    boostScore: computeBoost(a.author.id, a.question.tags, followingIds, userExpertise),
  }));

  const jobItems: FeedItem[] = jobs.map((j) => ({
    id: j.id, type: "job", title: j.title,
    body: j.locationPreference || "",
    slug: j.slug, url: `/talent-board/${j.slug}`,
    author: { name: j.company.companyName || null, username: j.company.username, image: j.company.companyLogo || null },
    tags: [], industry: null,
    stats: {},
    createdAt: j.createdAt.toISOString(),
    boostScore: 0,
  }));

  // Apply ratio
  const researchPool = [...questionItems, ...articleItems];
  const targetResearch = Math.ceil(pageSize * 0.7 * 5); // enough for ~5 pages
  const targetAnswers = Math.ceil(pageSize * 0.2 * 5);
  const targetJobs = Math.ceil(pageSize * 0.1 * 5);

  const selectedResearch = researchPool.slice(0, targetResearch);
  const selectedAnswers = answerItems.slice(0, targetAnswers);
  const selectedJobs = jobItems.slice(0, targetJobs);

  // If answers or jobs are short, give their slots to research
  const remaining = (targetAnswers - selectedAnswers.length) + (targetJobs - selectedJobs.length);
  const extraResearch = researchPool.slice(targetResearch, targetResearch + remaining);

  const allItems = [...selectedResearch, ...extraResearch, ...selectedAnswers, ...selectedJobs];

  // Sort by effective time (createdAt + boost)
  allItems.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime() + a.boostScore * 6 * 60 * 1000;
    const bTime = new Date(b.createdAt).getTime() + b.boostScore * 6 * 60 * 1000;
    return bTime - aTime;
  });

  // Paginate
  const start = (page - 1) * pageSize;
  const items = allItems.slice(start, start + pageSize);
  const hasMore = start + pageSize < allItems.length;

  return { items, hasMore, page };
}

function computeBoost(
  authorId: string,
  tags: string[],
  followingIds: string[],
  userExpertise: string[]
): number {
  let boost = 0;
  if (followingIds.includes(authorId)) boost += 50;
  const matchingTags = tags.filter((t) =>
    userExpertise.some((e) => e.toLowerCase() === t.toLowerCase())
  ).length;
  boost += Math.min(matchingTags * 20, 60);
  return boost;
}
