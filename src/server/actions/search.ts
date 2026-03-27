"use server";

import { db } from "@/lib/db";

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
