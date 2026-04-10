import { db } from "@/lib/db";
import { auth } from "@/auth";

export type DiscoverFilters = {
  industry?: string;
  expertise?: string;
  availability?: string;
};

export type SuggestedResearcher = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  expertise: string[];
  points: number;
  availability: string | null;
  mutualFollowers: number;
  isFollowing: boolean;
  _count: { followers: number };
};

export async function getSuggestedResearchers(
  limit: number,
  filters?: DiscoverFilters
): Promise<SuggestedResearcher[]> {
  const session = await auth();
  const userId = session?.user?.id;

  const where: any = { role: "RESEARCHER", deletedAt: null };
  if (filters?.availability) where.availability = filters.availability;
  if (filters?.expertise) where.expertise = { has: filters.expertise };

  // Logged-out: return top researchers by points
  if (!userId) {
    const researchers = await db.user.findMany({
      where, orderBy: { points: "desc" }, take: limit,
      select: { id: true, name: true, username: true, image: true, expertise: true, points: true, availability: true, _count: { select: { followers: true } } },
    });
    return researchers
      .sort((a, b) => b.points - a.points)
      .map((r) => ({ ...r, mutualFollowers: 0, isFollowing: false }));
  }

  const currentUser = await db.user.findUnique({ where: { id: userId }, select: { expertise: true } });
  const userExpertise = currentUser?.expertise || [];

  const followingRecords = await db.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
  const followingIds = followingRecords.map((f) => f.followingId);

  const userQuestions = await db.question.findMany({
    where: { authorId: userId, deletedAt: null, industry: { not: null } },
    select: { industry: true }, distinct: ["industry"],
  });
  const userIndustries = userQuestions.map((q) => q.industry).filter(Boolean) as string[];

  where.id = { notIn: [userId, ...followingIds] };

  if (filters?.industry) {
    const industryQuestions = await db.question.findMany({
      where: { industry: { equals: filters.industry, mode: "insensitive" }, deletedAt: null },
      select: { authorId: true }, distinct: ["authorId"],
    });
    const industryUserIds = industryQuestions.map((q) => q.authorId);
    if (industryUserIds.length > 0) {
      where.id = { ...where.id, in: industryUserIds };
    } else {
      return []; // no researchers in this industry
    }
  }

  const candidates = await db.user.findMany({
    where, take: 200, orderBy: { points: "desc" },
    select: { id: true, name: true, username: true, image: true, expertise: true, points: true, availability: true, _count: { select: { followers: true } } },
  });

  if (userExpertise.length === 0 && userIndustries.length === 0 && followingIds.length === 0) {
    return candidates.slice(0, limit).map((r) => ({ ...r, mutualFollowers: 0, isFollowing: false }));
  }

  const candidateIds = candidates.map((c) => c.id);

  const candidateQuestions = await db.question.findMany({
    where: { authorId: { in: candidateIds }, deletedAt: null, industry: { not: null } },
    select: { authorId: true, industry: true }, distinct: ["authorId", "industry"],
  });
  const candidateIndustryMap = new Map<string, string[]>();
  for (const q of candidateQuestions) {
    const industries = candidateIndustryMap.get(q.authorId) || [];
    if (q.industry) industries.push(q.industry);
    candidateIndustryMap.set(q.authorId, industries);
  }

  const candidateFollows = followingIds.length > 0 ? await db.follow.findMany({
    where: { followerId: { in: candidateIds }, followingId: { in: followingIds } },
    select: { followerId: true },
  }) : [];
  const mutualMap = new Map<string, number>();
  for (const f of candidateFollows) {
    mutualMap.set(f.followerId, (mutualMap.get(f.followerId) || 0) + 1);
  }

  const scored = candidates.map((candidate) => {
    const matchingTags = candidate.expertise.filter((t) =>
      userExpertise.some((ut) => ut.toLowerCase() === t.toLowerCase())
    ).length;
    const maxTags = Math.max(candidate.expertise.length, userExpertise.length, 1);
    const expertiseScore = matchingTags / maxTags;

    const candidateIndustries = candidateIndustryMap.get(candidate.id) || [];
    const industryMatch = candidateIndustries.some((ci) =>
      userIndustries.some((ui) => ui.toLowerCase() === ci.toLowerCase())
    );
    const industryScore = industryMatch ? 1 : 0;

    const mutual = mutualMap.get(candidate.id) || 0;
    const socialScore = followingIds.length > 0 ? mutual / followingIds.length : 0;

    const finalScore = expertiseScore * 0.5 + industryScore * 0.3 + socialScore * 0.2;

    return { ...candidate, mutualFollowers: mutual, isFollowing: false, score: finalScore };
  });

  scored.sort((a, b) => b.score - a.score || b.points - a.points);
  return scored.slice(0, limit).map(({ score, ...rest }) => rest);
}

export async function getTopExpertiseTags(limit: number = 20): Promise<string[]> {
  const result = await db.$queryRaw<{ tag: string; count: bigint }[]>`
    SELECT unnest(expertise) as tag, COUNT(*) as count
    FROM users
    WHERE "deletedAt" IS NULL AND role = 'RESEARCHER'
    GROUP BY tag
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return result.map((r) => r.tag);
}
