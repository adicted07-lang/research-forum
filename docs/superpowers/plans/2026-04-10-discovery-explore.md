# Discovery & Explore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Help users discover researchers to follow via a weighted suggestion algorithm, a filterable `/explore` page, and a sidebar widget.

**Architecture:** Read-only query function in `src/lib/discover.ts` computes scored suggestions. Explore page is a server component with a client-side filter bar. Sidebar widget is a server component added to `ForumSidebar`.

**Tech Stack:** Prisma (Neon PostgreSQL), Next.js server components, React client components, Vitest

**Spec:** `docs/superpowers/specs/2026-04-10-discovery-explore-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/discover.ts` | Create | Suggestion algorithm — getSuggestedResearchers, getTopExpertiseTags |
| `src/app/(main)/explore/page.tsx` | Create | Explore page with researcher grid |
| `src/components/explore/explore-filters.tsx` | Create | Filter bar client component |
| `src/components/home/suggested-researchers.tsx` | Create | Sidebar widget (3 cards + "See all") |
| `src/components/forum/forum-sidebar.tsx` | Modify | Add SuggestedResearchers to sidebar |
| `tests/lib/discover.test.ts` | Create | Tests for suggestion algorithm |

---

### Task 1: Suggestion Algorithm

**Files:**
- Create: `src/lib/discover.ts`
- Create: `tests/lib/discover.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/lib/discover.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findMany: vi.fn(), findUnique: vi.fn() },
    follow: { findMany: vi.fn() },
    question: { findMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { db } from "@/lib/db";
import { auth } from "@/auth";

describe("getSuggestedResearchers", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns researchers sorted by points when not logged in", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "r1", name: "A", username: "a", image: null, expertise: ["x"], points: 100, availability: null, _count: { followers: 5 } },
      { id: "r2", name: "B", username: "b", image: null, expertise: ["y"], points: 200, availability: null, _count: { followers: 3 } },
    ] as any);

    const { getSuggestedResearchers } = await import("@/lib/discover");
    const result = await getSuggestedResearchers(10);
    expect(result[0].id).toBe("r2"); // higher points first
    expect(result[0].isFollowing).toBe(false);
  });

  it("excludes already-followed users for logged in users", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "me" } } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ expertise: ["x"], id: "me" } as any);
    vi.mocked(db.follow.findMany).mockResolvedValue([{ followingId: "r1" }] as any);
    vi.mocked(db.question.findMany).mockResolvedValue([]);
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "r2", name: "B", username: "b", image: null, expertise: ["x"], points: 50, availability: null, _count: { followers: 2 } },
    ] as any);

    const { getSuggestedResearchers } = await import("@/lib/discover");
    const result = await getSuggestedResearchers(10);
    expect(result.every(r => r.id !== "r1")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/discover.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create the algorithm**

Create `src/lib/discover.ts`:

```typescript
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

  // Build where clause for researcher query
  const where: any = {
    role: "RESEARCHER",
    deletedAt: null,
  };

  if (filters?.availability) {
    where.availability = filters.availability;
  }
  if (filters?.expertise) {
    where.expertise = { has: filters.expertise };
  }

  // Logged-out or no user: return top researchers by points
  if (!userId) {
    const researchers = await db.user.findMany({
      where,
      orderBy: { points: "desc" },
      take: limit,
      select: {
        id: true, name: true, username: true, image: true,
        expertise: true, points: true, availability: true,
        _count: { select: { followers: true } },
      },
    });
    return researchers.map((r) => ({
      ...r,
      mutualFollowers: 0,
      isFollowing: false,
    }));
  }

  // Get current user's data
  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { expertise: true },
  });
  const userExpertise = currentUser?.expertise || [];

  // Get who the user follows
  const followingRecords = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = followingRecords.map((f) => f.followingId);

  // Get user's active industries (from their questions)
  const userQuestions = await db.question.findMany({
    where: { authorId: userId, deletedAt: null, industry: { not: null } },
    select: { industry: true },
    distinct: ["industry"],
  });
  const userIndustries = userQuestions.map((q) => q.industry).filter(Boolean) as string[];

  // Exclude self and already-followed users
  where.id = { notIn: [userId, ...followingIds] };

  // Industry filter: find users who have questions in the specified industry
  let industryUserIds: string[] | undefined;
  if (filters?.industry) {
    const industryQuestions = await db.question.findMany({
      where: { industry: { equals: filters.industry, mode: "insensitive" }, deletedAt: null },
      select: { authorId: true },
      distinct: ["authorId"],
    });
    industryUserIds = industryQuestions.map((q) => q.authorId);
    where.id = { ...where.id, in: industryUserIds };
  }

  // Fetch candidates
  const candidates = await db.user.findMany({
    where,
    select: {
      id: true, name: true, username: true, image: true,
      expertise: true, points: true, availability: true,
      _count: { select: { followers: true } },
    },
    take: 200, // cap for performance
    orderBy: { points: "desc" },
  });

  // If no user data for scoring, return by points
  if (userExpertise.length === 0 && userIndustries.length === 0 && followingIds.length === 0) {
    return candidates.slice(0, limit).map((r) => ({
      ...r,
      mutualFollowers: 0,
      isFollowing: false,
    }));
  }

  // Get candidates' industry activity (for scoring)
  const candidateIds = candidates.map((c) => c.id);
  const candidateQuestions = await db.question.findMany({
    where: { authorId: { in: candidateIds }, deletedAt: null, industry: { not: null } },
    select: { authorId: true, industry: true },
    distinct: ["authorId", "industry"],
  });
  const candidateIndustryMap = new Map<string, string[]>();
  for (const q of candidateQuestions) {
    const industries = candidateIndustryMap.get(q.authorId) || [];
    if (q.industry) industries.push(q.industry);
    candidateIndustryMap.set(q.authorId, industries);
  }

  // Get social proximity: who do the candidates follow that the user also follows
  const candidateFollows = await db.follow.findMany({
    where: { followerId: { in: candidateIds }, followingId: { in: followingIds } },
    select: { followerId: true },
  });
  const mutualMap = new Map<string, number>();
  for (const f of candidateFollows) {
    mutualMap.set(f.followerId, (mutualMap.get(f.followerId) || 0) + 1);
  }

  // Score candidates
  const scored = candidates.map((candidate) => {
    // Expertise overlap (50%)
    const matchingTags = candidate.expertise.filter((t) =>
      userExpertise.some((ut) => ut.toLowerCase() === t.toLowerCase())
    ).length;
    const maxTags = Math.max(candidate.expertise.length, userExpertise.length, 1);
    const expertiseScore = matchingTags / maxTags;

    // Industry match (30%)
    const candidateIndustries = candidateIndustryMap.get(candidate.id) || [];
    const industryMatch = candidateIndustries.some((ci) =>
      userIndustries.some((ui) => ui.toLowerCase() === ci.toLowerCase())
    );
    const industryScore = industryMatch ? 1 : 0;

    // Social proximity (20%)
    const mutual = mutualMap.get(candidate.id) || 0;
    const socialScore = followingIds.length > 0 ? mutual / followingIds.length : 0;

    const finalScore = expertiseScore * 0.5 + industryScore * 0.3 + socialScore * 0.2;

    return {
      ...candidate,
      mutualFollowers: mutual,
      isFollowing: false, // they're excluded from followingIds, so always false
      score: finalScore,
    };
  });

  // Sort by score desc, break ties by points desc
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
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/lib/discover.test.ts`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/discover.ts tests/lib/discover.test.ts
git commit -m "feat: add researcher suggestion algorithm"
```

---

### Task 2: Explore Filters Component

**Files:**
- Create: `src/components/explore/explore-filters.tsx`

- [ ] **Step 1: Create the filter component**

Create `src/components/explore/explore-filters.tsx`:

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const INDUSTRIES = [
  "Transport and Logistics", "Aerospace and Defence", "Packaging",
  "Automotive", "Agriculture", "Machinery and Equipment",
  "Energy and Power", "Consumer Goods", "Chemical and Material",
  "Healthcare", "Food and Beverages", "Semiconductor and Electronic", "ICT",
];

const AVAILABILITY = [
  { value: "AVAILABLE", label: "Available" },
  { value: "BUSY", label: "Busy" },
  { value: "NOT_AVAILABLE", label: "Not Available" },
];

type ExploreFiltersProps = {
  expertiseTags: string[];
};

export function ExploreFilters({ expertiseTags }: ExploreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIndustry = searchParams.get("industry") || "";
  const currentExpertise = searchParams.get("expertise") || "";
  const currentAvailability = searchParams.get("availability") || "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/explore?${params.toString()}`);
  }

  const hasFilters = currentIndustry || currentExpertise || currentAvailability;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        value={currentIndustry}
        onChange={(e) => updateFilter("industry", e.target.value)}
        className="px-3 py-2 text-sm border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark text-text-primary dark:text-text-dark-primary"
      >
        <option value="">All Industries</option>
        {INDUSTRIES.map((ind) => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>

      <select
        value={currentExpertise}
        onChange={(e) => updateFilter("expertise", e.target.value)}
        className="px-3 py-2 text-sm border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark text-text-primary dark:text-text-dark-primary"
      >
        <option value="">All Expertise</option>
        {expertiseTags.map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>

      <select
        value={currentAvailability}
        onChange={(e) => updateFilter("availability", e.target.value)}
        className="px-3 py-2 text-sm border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark text-text-primary dark:text-text-dark-primary"
      >
        <option value="">Any Availability</option>
        {AVAILABILITY.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push("/explore")}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/explore/explore-filters.tsx
git commit -m "feat: add explore page filter bar"
```

---

### Task 3: Explore Page

**Files:**
- Create: `src/app/(main)/explore/page.tsx`

- [ ] **Step 1: Create the explore page**

Create `src/app/(main)/explore/page.tsx`:

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { LevelBadge } from "@/components/shared/level-badge";
import { FollowButton } from "@/components/social/follow-button";
import { ExploreFilters } from "@/components/explore/explore-filters";
import { getSuggestedResearchers, getTopExpertiseTags } from "@/lib/discover";
import { getLevel } from "@/lib/reputation";
import { auth } from "@/auth";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover Researchers — The Intellectual Exchange",
  description: "Find and connect with market researchers by expertise, industry, and shared interests.",
};

interface ExplorePageProps {
  searchParams: Promise<{ industry?: string; expertise?: string; availability?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const session = await auth();

  const filters = {
    industry: params.industry || undefined,
    expertise: params.expertise || undefined,
    availability: params.availability || undefined,
  };

  const [researchers, expertiseTags] = await Promise.all([
    getSuggestedResearchers(20, filters),
    getTopExpertiseTags(20),
  ]);

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
            Discover Researchers
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
            Find researchers to follow based on shared expertise and interests.
          </p>
        </div>

        <ExploreFilters expertiseTags={expertiseTags} />

        {researchers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-text-tertiary dark:text-text-dark-tertiary mx-auto mb-3" />
            <p className="text-text-secondary dark:text-text-dark-secondary">
              {session?.user
                ? "No researchers found matching your filters."
                : "No researchers found."}
            </p>
            {(params.industry || params.expertise || params.availability) && (
              <Link href="/explore" className="text-sm text-primary hover:underline mt-2 inline-block">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchers.map((researcher) => {
              const level = getLevel(researcher.points);
              return (
                <div
                  key={researcher.id}
                  className="border border-border dark:border-border-dark rounded-xl p-5 bg-surface dark:bg-surface-dark hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/profile/${researcher.username}`} className="flex items-center gap-3">
                      <UserAvatar
                        name={researcher.name}
                        image={researcher.image}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-dark-primary text-sm">
                          {researcher.name || researcher.username}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                          @{researcher.username}
                        </p>
                      </div>
                    </Link>
                    <LevelBadge level={level} size="sm" />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {researcher.expertise.slice(0, 3).map((tag) => (
                      <BadgePill key={tag} label={tag} variant="primary" />
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                      {researcher.mutualFollowers > 0 && (
                        <span>{researcher.mutualFollowers} people you follow</span>
                      )}
                      {researcher.mutualFollowers === 0 && (
                        <span>{researcher._count.followers} followers</span>
                      )}
                    </div>
                    {session?.user && session.user.id !== researcher.id && (
                      <FollowButton
                        targetUserId={researcher.id}
                        initialFollowing={researcher.isFollowing}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(main)/explore/page.tsx"
git commit -m "feat: add /explore page with researcher discovery grid"
```

---

### Task 4: Suggested Researchers Widget + Forum Sidebar Integration

**Files:**
- Create: `src/components/home/suggested-researchers.tsx`
- Modify: `src/components/forum/forum-sidebar.tsx`

- [ ] **Step 1: Create the widget**

Create `src/components/home/suggested-researchers.tsx`:

```typescript
import Link from "next/link";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { FollowButton } from "@/components/social/follow-button";
import { getSuggestedResearchers } from "@/lib/discover";
import { auth } from "@/auth";

export async function SuggestedResearchers() {
  const session = await auth();
  if (!session?.user) return null;

  const researchers = await getSuggestedResearchers(3);

  if (researchers.length === 0) return null;

  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-surface dark:bg-surface-dark">
      <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
        Researchers you might know
      </h3>
      <div className="space-y-3">
        {researchers.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2">
            <Link href={`/profile/${r.username}`} className="flex items-center gap-2 min-w-0">
              <UserAvatar name={r.name} image={r.image} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                  {r.name || r.username}
                </p>
                {r.expertise[0] && (
                  <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary truncate">
                    {r.expertise[0]}
                  </p>
                )}
              </div>
            </Link>
            <FollowButton
              targetUserId={r.id}
              initialFollowing={r.isFollowing}
            />
          </div>
        ))}
      </div>
      <Link
        href="/explore"
        className="block text-center text-xs text-primary hover:underline mt-3 pt-3 border-t border-border dark:border-border-dark"
      >
        See all &rarr;
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Add widget to ForumSidebar**

In `src/components/forum/forum-sidebar.tsx`, read the file first, then:

1. Add import:
```typescript
import { SuggestedResearchers } from "@/components/home/suggested-researchers";
```

2. Add `<SuggestedResearchers />` at the bottom of the sidebar content, after the existing categories section. The ForumSidebar wraps content in a div — add the widget as the last child.

3. Since `SuggestedResearchers` is an async server component, make sure `ForumSidebar` is also async (or wrap the import in a `Suspense` boundary if it's a sync component).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/suggested-researchers.tsx src/components/forum/forum-sidebar.tsx
git commit -m "feat: add suggested researchers widget to forum sidebar"
```

---

### Task 5: Full Test Suite and Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Push**

```bash
git push origin main
```
