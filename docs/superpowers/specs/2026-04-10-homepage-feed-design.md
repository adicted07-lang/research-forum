# Homepage Feed — Design Spec

## Overview

Replace the homepage with a personalized content feed when logged in, and an unpersonalized feed with sign-up CTA when logged out. Surfaces existing content (questions, articles, notable answers, jobs) in a unified stream with chronological ordering and follow-based boosts.

## Decisions

- Homepage becomes the feed for both logged-in and logged-out users
- Chronological with boosts: newest first, followed users' content gets a small boost upward
- Content ratio: 70% questions + articles, 20% notable answers (3+ upvotes), 10% jobs
- "Load more" pagination — 20 items per page
- No new post type — surfaces existing content
- Logged-out: same feed, no personalization, "Sign up to personalize" banner at top
- Feed items link to their existing pages (/forum/[slug], /news/[slug], /talent-board/[slug])

## Feed Data

File: `src/lib/feed.ts` (plain async function, not a server action)

### `getFeedItems(page: number, userId?: string)`

**Logic:**

1. Query recent content across 4 types in parallel:
   - **Questions:** last 7 days, not deleted, ordered by createdAt desc
   - **Articles:** published, last 7 days, not deleted
   - **Answers:** upvoteCount >= 3 (notable only), last 7 days, not deleted — includes parent question title/slug
   - **Jobs:** last 14 days, not deleted (longer window since fewer are posted)

2. For logged-in users, fetch:
   - Followed user IDs (from Follow table)
   - Current user's expertise tags

3. Merge into unified `FeedItem` format:

```typescript
type FeedItem = {
  id: string;
  type: "question" | "article" | "answer" | "job";
  title: string;
  body: string; // plain text preview, first 200 chars, HTML stripped
  slug: string;
  url: string;
  author: { name: string | null; username: string | null; image: string | null };
  tags: string[]; // For answers, sourced from parent question's tags
  industry?: string | null;
  stats: {
    upvotes?: number;
    answers?: number;
    readTime?: number;
  };
  createdAt: string; // ISO string — Date objects are not serializable across server action boundary
  boostScore: number;
};
```

4. Apply boosts for logged-in users:
   - Author is followed: +50
   - Matching expertise tags: +20 per matching tag (capped at +60)
   - Logged-out users: boostScore = 0 for all items
   - Note: industry boost removed — `User` model has no researcher industry field. Expertise tag matching covers the same intent.

5. Apply content ratio on the full merged pool before sorting:
   - Take up to 70% from questions + articles (combined)
   - Take up to 20% from notable answers
   - Take up to 10% from jobs
   - If a category has fewer items than its allocation, redistribute slots to questions + articles
   - Ratio is applied once on the full pool (not per-page). The sorted, ratio-filtered list is then paginated.

6. Sort by effective time: `createdAt + (boostScore * 6 minutes)` — a +50 boost floats an item up by ~5 hours, but won't jump more than that. This keeps the feed feeling chronological while giving followed users a nudge.

7. Paginate: slice `(page - 1) * 20` to `page * 20`, return items + `hasMore: boolean`. Since we query 7 days of content (capped at ~200 items total), computing the full list before slicing is acceptable.

**Return type:**
```typescript
type FeedResponse = {
  items: FeedItem[];
  hasMore: boolean;
  page: number;
};
```

### `loadMoreFeedItems(page: number)` — server action

A thin `"use server"` wrapper around `getFeedItems` that gets the userId from auth. This is the action called by the client "Load more" button.

File: `src/server/actions/feed.ts`

## Feed UI

### Homepage Modification

File: `src/app/(main)/page.tsx` (or equivalent homepage file)

- Replace current homepage content with the feed
- Check auth: pass userId to `getFeedItems` if logged in
- Render sign-up banner for logged-out users
- Render `FeedList` with initial items
- Keep existing `HomepageSidebar` (tags, recent activity, ads, newsletter) and add `SuggestedResearchers` widget into it

### Feed List

File: `src/components/feed/feed-list.tsx` — client component

- Receives initial `FeedItem[]` and `hasMore` from server
- "Load more" button at bottom calls `loadMoreFeedItems(nextPage)`
- Appends new items to state
- Hides button when `hasMore` is false
- Shows loading state while fetching

### Feed Card

File: `src/components/feed/feed-card.tsx` — server or client component

Shared card layout with type-specific variations:

**Common elements (all cards):**
- Author row: avatar + name + "@username" + time ago
- Bottom stats row

**Question card:**
- HelpCircle icon (green) + "Question" label
- Title (linked to /forum/[slug])
- Body preview (2 lines)
- Tags as BadgePill
- Stats: upvotes, answer count

**Article card:**
- FileText icon (purple) + "Article" label
- Title (linked to /news/[slug])
- Body preview (2 lines)
- Tags as BadgePill
- Stats: read time

**Answer card:**
- MessageSquare icon (blue) + "Answer" label
- "Answered: [parent question title]" (linked to /forum/[questionSlug])
- Answer body preview (2 lines)
- Stats: upvotes

**Job card:**
- Briefcase icon (amber) + "Job" label
- Job title (linked to /talent-board/[slug])
- Company name (from `company.companyName`) + location (`locationPreference`)
- Author row shows company name + logo (from `company.companyLogo`), not user name/image
- No body preview

### Sign-Up Banner

File: `src/components/feed/signup-banner.tsx` — simple component

- Shows above the feed for logged-out users only
- "The Intellectual Exchange" heading
- "Join our community of market researchers. Sign up to personalize your feed."
- Two buttons: "Sign up free" → /signup, "Log in" → /login
- Brand styled (#b8461f accent)

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/feed.ts` | Create — feed query + boost logic |
| `src/server/actions/feed.ts` | Create — loadMoreFeedItems server action |
| `src/components/feed/feed-list.tsx` | Create — client component with load more |
| `src/components/feed/feed-card.tsx` | Create — unified feed card |
| `src/components/feed/signup-banner.tsx` | Create — logged-out CTA banner |
| `src/app/(main)/page.tsx` | Modify — replace homepage with feed |
| `src/components/home/homepage-sidebar.tsx` (or equivalent) | Modify — add SuggestedResearchers widget |
| `prisma/schema.prisma` | Modify — add index on Answer for notable answer query |

## Edge Cases

- **No content in last 7 days:** If total items across all types is 0, re-query with 30-day window for all types. If still empty, show "No activity yet" with links to browse forum/news.
- **New user with no follows:** Feed is unpersonalized (boostScore = 0 for all). Same as logged-out but without the sign-up banner.
- **All items from one type:** Ratio soft-capped — if only questions exist, show them. Don't leave the feed empty just because there are no jobs.
- **Duplicate answers:** If multiple notable answers are for the same question, only show the highest-upvoted one.

## Out of Scope

- Infinite scroll
- "Hide this" / feed customization
- Content type filter tabs
- Real-time updates / websocket push
- Saving feed position across sessions
