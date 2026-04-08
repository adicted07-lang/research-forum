"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type SearchResults = {
  questions: Array<{
    id: string;
    title: string;
    slug: string;
    answerCount: number;
    createdAt: Date;
  }>;
  listings: Array<{
    id: string;
    title: string;
    tagline: string;
    slug: string;
    type: string;
  }>;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: Date;
  }>;
  users: Array<{
    id: string;
    name: string | null;
    username: string | null;
    role: string;
    image: string | null;
    companyName: string | null;
    companyLogo: string | null;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    slug: string;
    projectType: string;
    locationPreference: string;
    createdAt: Date;
  }>;
};

export async function globalSearch(
  query: string,
  type?: string
): Promise<SearchResults> {
  const empty: SearchResults = {
    questions: [],
    listings: [],
    articles: [],
    users: [],
    jobs: [],
  };

  if (!query || query.trim().length < 2) return empty;

  const q = query.trim();

  try {
    const [questions, listings, articles, users, jobs] = await Promise.all([
      !type || type === "questions"
        ? db.question.findMany({
            where: {
              title: { contains: q, mode: "insensitive" },
              deletedAt: null,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              answerCount: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),

      !type || type === "listings"
        ? db.listing.findMany({
            where: {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { tagline: { contains: q, mode: "insensitive" } },
              ],
              deletedAt: null,
            },
            select: {
              id: true,
              title: true,
              tagline: true,
              slug: true,
              type: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),

      !type || type === "articles"
        ? db.article.findMany({
            where: {
              title: { contains: q, mode: "insensitive" },
              status: "PUBLISHED",
              deletedAt: null,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),

      !type || type === "users"
        ? db.user.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
                { companyName: { contains: q, mode: "insensitive" } },
              ],
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              image: true,
              companyName: true,
              companyLogo: true,
            },
            take: 5,
          })
        : Promise.resolve([]),

      !type || type === "jobs"
        ? db.job.findMany({
            where: {
              title: { contains: q, mode: "insensitive" },
              status: "OPEN",
              deletedAt: null,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              projectType: true,
              locationPreference: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    return {
      questions: questions as SearchResults["questions"],
      listings: listings as SearchResults["listings"],
      articles: articles as SearchResults["articles"],
      users: users as SearchResults["users"],
      jobs: jobs as SearchResults["jobs"],
    };
  } catch {
    return empty;
  }
}

// ── Full-text search with filters ──────────────────────────────────

export interface SearchFilters {
  query: string;
  type?: string; // "questions" | "articles" | "jobs" | "users" | "listings"
  industry?: string;
  domain?: string;
  dateRange?: string; // "24h" | "week" | "month" | "year" | "all"
  sortBy?: string; // "relevance" | "newest" | "upvotes"
}

export type FTSQuestionResult = {
  id: string;
  title: string;
  slug: string;
  upvoteCount: number;
  answerCount: number;
  createdAt: Date;
  category: string;
  industry: string | null;
  researchDomain: string | null;
  rank: number;
};

export type FTSArticleResult = {
  id: string;
  title: string;
  slug: string;
  upvoteCount: number;
  createdAt: Date;
  category: string;
  rank: number;
};

export type FTSJobResult = {
  id: string;
  title: string;
  slug: string;
  projectType: string;
  locationPreference: string;
  createdAt: Date;
  rank: number;
};

export type FTSUserResult = {
  id: string;
  name: string | null;
  username: string | null;
  role: string;
  image: string | null;
  companyName: string | null;
  companyLogo: string | null;
  bio: string | null;
  rank: number;
};

export type FTSListingResult = {
  id: string;
  title: string;
  tagline: string;
  slug: string;
  type: string;
  upvoteCount: number;
  rank: number;
};

export type FullTextSearchResults = {
  questions: FTSQuestionResult[];
  articles: FTSArticleResult[];
  jobs: FTSJobResult[];
  users: FTSUserResult[];
  listings: FTSListingResult[];
};

function dateIntervalSql(range: string | undefined): Prisma.Sql | null {
  switch (range) {
    case "24h":
      return Prisma.sql`INTERVAL '24 hours'`;
    case "week":
      return Prisma.sql`INTERVAL '7 days'`;
    case "month":
      return Prisma.sql`INTERVAL '30 days'`;
    case "year":
      return Prisma.sql`INTERVAL '365 days'`;
    default:
      return null;
  }
}

export async function searchWithFilters(
  filters: SearchFilters
): Promise<FullTextSearchResults> {
  const empty: FullTextSearchResults = {
    questions: [],
    articles: [],
    jobs: [],
    users: [],
    listings: [],
  };

  const q = filters.query?.trim();
  if (!q || q.length < 2) return empty;

  const { type, industry, domain, dateRange, sortBy } = filters;
  const dateInterval = dateIntervalSql(dateRange);

  try {
    const [questions, articles, jobs, users, listings] = await Promise.all([
      // ── Questions ──
      !type || type === "questions"
        ? (async () => {
            const conditions: Prisma.Sql[] = [
              Prisma.sql`to_tsvector('english', title || ' ' || COALESCE(body, '')) @@ plainto_tsquery('english', ${q})`,
              Prisma.sql`"deletedAt" IS NULL`,
            ];
            if (industry) conditions.push(Prisma.sql`industry = ${industry}`);
            if (domain) conditions.push(Prisma.sql`"researchDomain" = ${domain}`);
            if (dateInterval) conditions.push(Prisma.sql`"createdAt" > NOW() - ${dateInterval}`);

            const where = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

            const orderBy =
              sortBy === "newest"
                ? Prisma.sql`ORDER BY "createdAt" DESC`
                : sortBy === "upvotes"
                  ? Prisma.sql`ORDER BY "upvoteCount" DESC`
                  : Prisma.sql`ORDER BY rank DESC`;

            return db.$queryRaw<FTSQuestionResult[]>(Prisma.sql`
              SELECT id, title, slug, "upvoteCount", "answerCount", "createdAt", category, industry, "researchDomain",
                ts_rank(to_tsvector('english', title || ' ' || COALESCE(body, '')), plainto_tsquery('english', ${q})) AS rank
              FROM questions
              ${where}
              ${orderBy}
              LIMIT 20
            `);
          })()
        : Promise.resolve([]),

      // ── Articles ──
      !type || type === "articles"
        ? (async () => {
            const conditions: Prisma.Sql[] = [
              Prisma.sql`to_tsvector('english', title || ' ' || COALESCE(body, '')) @@ plainto_tsquery('english', ${q})`,
              Prisma.sql`status = 'PUBLISHED'`,
              Prisma.sql`"deletedAt" IS NULL`,
            ];
            if (dateInterval) conditions.push(Prisma.sql`"createdAt" > NOW() - ${dateInterval}`);

            const where = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

            const orderBy =
              sortBy === "newest"
                ? Prisma.sql`ORDER BY "createdAt" DESC`
                : sortBy === "upvotes"
                  ? Prisma.sql`ORDER BY "upvoteCount" DESC`
                  : Prisma.sql`ORDER BY rank DESC`;

            return db.$queryRaw<FTSArticleResult[]>(Prisma.sql`
              SELECT id, title, slug, "upvoteCount", "createdAt", category,
                ts_rank(to_tsvector('english', title || ' ' || COALESCE(body, '')), plainto_tsquery('english', ${q})) AS rank
              FROM articles
              ${where}
              ${orderBy}
              LIMIT 20
            `);
          })()
        : Promise.resolve([]),

      // ── Jobs ──
      !type || type === "jobs"
        ? (async () => {
            const conditions: Prisma.Sql[] = [
              Prisma.sql`to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', ${q})`,
              Prisma.sql`"deletedAt" IS NULL`,
            ];
            if (dateInterval) conditions.push(Prisma.sql`"createdAt" > NOW() - ${dateInterval}`);

            const where = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

            const orderBy =
              sortBy === "newest"
                ? Prisma.sql`ORDER BY "createdAt" DESC`
                : Prisma.sql`ORDER BY rank DESC`;

            return db.$queryRaw<FTSJobResult[]>(Prisma.sql`
              SELECT id, title, slug, "projectType", "locationPreference", "createdAt",
                ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), plainto_tsquery('english', ${q})) AS rank
              FROM jobs
              ${where}
              ${orderBy}
              LIMIT 20
            `);
          })()
        : Promise.resolve([]),

      // ── Users ──
      !type || type === "users"
        ? (async () => {
            const conditions: Prisma.Sql[] = [
              Prisma.sql`to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(username, '') || ' ' || COALESCE(bio, '') || ' ' || COALESCE("companyName", '')) @@ plainto_tsquery('english', ${q})`,
              Prisma.sql`"deletedAt" IS NULL`,
            ];

            const where = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

            return db.$queryRaw<FTSUserResult[]>(Prisma.sql`
              SELECT id, name, username, role, image, "companyName", "companyLogo", bio,
                ts_rank(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(username, '') || ' ' || COALESCE(bio, '') || ' ' || COALESCE("companyName", '')), plainto_tsquery('english', ${q})) AS rank
              FROM users
              ${where}
              ORDER BY rank DESC
              LIMIT 20
            `);
          })()
        : Promise.resolve([]),

      // ── Listings ──
      !type || type === "listings"
        ? (async () => {
            const conditions: Prisma.Sql[] = [
              Prisma.sql`to_tsvector('english', title || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('english', ${q})`,
              Prisma.sql`"deletedAt" IS NULL`,
            ];
            if (dateInterval) conditions.push(Prisma.sql`"createdAt" > NOW() - ${dateInterval}`);

            const where = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

            const orderBy =
              sortBy === "newest"
                ? Prisma.sql`ORDER BY "createdAt" DESC`
                : sortBy === "upvotes"
                  ? Prisma.sql`ORDER BY "upvoteCount" DESC`
                  : Prisma.sql`ORDER BY rank DESC`;

            return db.$queryRaw<FTSListingResult[]>(Prisma.sql`
              SELECT id, title, tagline, slug, type::text, "upvoteCount",
                ts_rank(to_tsvector('english', title || ' ' || COALESCE(tagline, '')), plainto_tsquery('english', ${q})) AS rank
              FROM listings
              ${where}
              ${orderBy}
              LIMIT 20
            `);
          })()
        : Promise.resolve([]),
    ]);

    return { questions, articles, jobs, users, listings };
  } catch (error) {
    console.error("Full-text search error:", error);
    return empty;
  }
}
