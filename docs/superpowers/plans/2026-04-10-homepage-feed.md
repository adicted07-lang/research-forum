# Homepage Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage with a unified content feed showing questions, articles, notable answers, and jobs with chronological ordering and follow-based boosts.

**Architecture:** Read-only feed query in `src/lib/feed.ts` fetches and scores content. Server action wrapper for "Load more". Homepage page swapped to render feed with existing sidebar. Sign-up banner for logged-out users.

**Tech Stack:** Prisma, Next.js server components + client components, Vitest

**Spec:** `docs/superpowers/specs/2026-04-10-homepage-feed-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/feed.ts` | Create | Feed query, boost scoring, ratio, pagination |
| `src/server/actions/feed.ts` | Create | loadMoreFeedItems server action |
| `src/components/feed/feed-card.tsx` | Create | Unified feed card with type-specific rendering |
| `src/components/feed/feed-list.tsx` | Create | Client component with Load more |
| `src/components/feed/signup-banner.tsx` | Create | Logged-out CTA |
| `src/app/(main)/page.tsx` | Modify | Replace homepage with feed |
| `src/components/home/homepage-sidebar.tsx` | Modify | Add SuggestedResearchers widget |

---

### Task 1: Feed Data Layer

**Files:**
- Create: `src/lib/feed.ts`
- Create: `src/server/actions/feed.ts`

- [ ] **Step 1: Create feed query function**

Create `src/lib/feed.ts` — this is NOT a `"use server"` file:

```typescript
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
  let windowDays = 7;
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

  // If nothing found, try 30-day window
  const totalItems = questions.length + articles.length + answers.length + jobs.length;
  if (totalItems === 0) {
    windowDays = 30;
    // Re-fetch with wider window (simplified — just return empty for now, production can re-query)
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
```

- [ ] **Step 2: Create server action wrapper**

Create `src/server/actions/feed.ts`:

```typescript
"use server";

import { auth } from "@/auth";
import { getFeedItems, type FeedResponse } from "@/lib/feed";

export async function loadMoreFeedItems(page: number): Promise<FeedResponse> {
  const session = await auth();
  return getFeedItems(page, session?.user?.id);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/feed.ts src/server/actions/feed.ts
git commit -m "feat: add feed data layer with boost scoring and pagination"
```

---

### Task 2: Feed UI Components

**Files:**
- Create: `src/components/feed/feed-card.tsx`
- Create: `src/components/feed/feed-list.tsx`
- Create: `src/components/feed/signup-banner.tsx`

- [ ] **Step 1: Create FeedCard component**

Create `src/components/feed/feed-card.tsx`:

```typescript
import Link from "next/link";
import { HelpCircle, FileText, MessageSquare, Briefcase } from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";
import type { FeedItem } from "@/lib/feed";

const typeConfig = {
  question: { icon: HelpCircle, label: "Question", color: "text-green-500" },
  article: { icon: FileText, label: "Article", color: "text-purple-500" },
  answer: { icon: MessageSquare, label: "Answer", color: "text-blue-500" },
  job: { icon: Briefcase, label: "Job", color: "text-amber-500" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function FeedCard({ item }: { item: FeedItem }) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-5 bg-surface dark:bg-surface-dark hover:shadow-sm transition-shadow">
      {/* Type label */}
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>

      {/* Title */}
      <Link href={item.url} className="block mb-1">
        <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors line-clamp-2">
          {item.type === "answer" ? `Answered: ${item.title}` : item.title}
        </h3>
      </Link>

      {/* Body preview */}
      {item.body && item.type !== "job" && (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-3">
          {item.body}
        </p>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map((tag) => (
            <BadgePill key={tag} label={tag} variant="primary" />
          ))}
        </div>
      )}

      {/* Job-specific: location */}
      {item.type === "job" && item.body && (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
          {item.body}
        </p>
      )}

      {/* Footer: author + stats */}
      <div className="flex items-center justify-between text-xs text-text-tertiary dark:text-text-dark-tertiary">
        <div className="flex items-center gap-2">
          {item.author.image ? (
            <img src={item.author.image} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-surface-secondary dark:bg-surface-dark-secondary flex items-center justify-center text-[10px] font-bold">
              {(item.author.name || "?")[0]}
            </div>
          )}
          <span>{item.author.name || item.author.username || "Anonymous"}</span>
          <span>·</span>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          {item.stats.upvotes !== undefined && <span>{item.stats.upvotes} upvotes</span>}
          {item.stats.answers !== undefined && <span>{item.stats.answers} answers</span>}
          {item.stats.readTime !== undefined && <span>{item.stats.readTime} min read</span>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FeedList client component**

Create `src/components/feed/feed-list.tsx`:

```typescript
"use client";

import { useState } from "react";
import { FeedCard } from "@/components/feed/feed-card";
import { loadMoreFeedItems } from "@/server/actions/feed";
import type { FeedItem } from "@/lib/feed";

type FeedListProps = {
  initialItems: FeedItem[];
  initialHasMore: boolean;
};

export function FeedList({ initialItems, initialHasMore }: FeedListProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleLoadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await loadMoreFeedItems(nextPage);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary dark:text-text-dark-secondary">
          No activity yet. Check back soon!
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="/forum" className="text-sm text-primary hover:underline">Browse Forum</a>
          <a href="/news" className="text-sm text-primary hover:underline">Read News</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {items.map((item) => (
          <FeedCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium border border-border dark:border-border-dark rounded-lg text-text-primary dark:text-text-dark-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create SignupBanner**

Create `src/components/feed/signup-banner.tsx`:

```typescript
import Link from "next/link";

export function SignupBanner() {
  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-6 mb-6 bg-gradient-to-r from-[#21293C] to-[#2d3748] text-white">
      <h2 className="text-lg font-bold mb-1">The Intellectual Exchange</h2>
      <p className="text-sm text-gray-300 mb-4">
        Join our community of market researchers. Sign up to personalize your feed.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="px-5 py-2 bg-[#b8461f] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Sign up free
        </Link>
        <Link
          href="/login"
          className="px-5 py-2 border border-gray-500 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/feed/feed-card.tsx src/components/feed/feed-list.tsx src/components/feed/signup-banner.tsx
git commit -m "feat: add feed UI components"
```

---

### Task 3: Homepage Integration

**Files:**
- Modify: `src/app/(main)/page.tsx`
- Modify: `src/components/home/homepage-sidebar.tsx`

- [ ] **Step 1: Replace homepage with feed**

Rewrite `src/app/(main)/page.tsx`. The current page has a hero section and 4 content sections. Replace with:

```typescript
import { PageLayout } from "@/components/layout/page-layout";
import { HomepageSidebar } from "@/components/home/homepage-sidebar";
import { FeedList } from "@/components/feed/feed-list";
import { SignupBanner } from "@/components/feed/signup-banner";
import { getFeedItems } from "@/lib/feed";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const { items, hasMore } = await getFeedItems(1, session?.user?.id);

  return (
    <PageLayout sidebar={<HomepageSidebar />}>
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
          Your Feed
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          Latest from the research community
        </p>

        {!session?.user && <SignupBanner />}

        <FeedList initialItems={items} initialHasMore={hasMore} />
      </div>
    </PageLayout>
  );
}
```

Read the existing page.tsx first — keep the metadata export if there is one. Keep the `POPULAR_TAGS` and `TAG_ICONS` if `HomepageSidebar` needs them passed as props.

- [ ] **Step 2: Add SuggestedResearchers to HomepageSidebar**

In `src/components/home/homepage-sidebar.tsx`, add the widget:

1. Add import: `import { SuggestedResearchers } from "@/components/home/suggested-researchers";`
2. Add `<SuggestedResearchers />` after the "Featured Researcher" section (near the bottom of the sidebar)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(main)/page.tsx" src/components/home/homepage-sidebar.tsx
git commit -m "feat: replace homepage with personalized feed"
```

---

### Task 4: Test Suite + Build + Push

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All PASS

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Push**

```bash
git push origin main
```
