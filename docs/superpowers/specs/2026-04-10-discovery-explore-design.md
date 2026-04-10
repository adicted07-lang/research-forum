# Discovery & Explore — Design Spec

## Overview

Help users discover researchers to follow through personalized suggestions on a dedicated explore page and a homepage widget. Uses a weighted algorithm combining expertise overlap, industry match, and social proximity.

## Decisions

- Both: dedicated `/explore` page (20 results) + homepage widget (3 cards + "See all")
- Weighted algorithm: expertise overlap (50%) + industry match (30%) + social proximity (20%)
- Explore page has filters: industry, expertise, availability — applied as WHERE clauses before scoring
- Fixed list of 20 on explore page, 3 on homepage widget
- Compact cards: avatar, name, expertise tags, points/level, mutual followers count, Follow button
- Logged-out fallback: show all researchers sorted by points
- New user fallback: show top researchers by points (no personalization data)
- Widget added to forum page sidebar for immediate visibility

## Suggestion Algorithm

File: `src/lib/discover.ts` (plain async function, not a server action — this is read-only query logic, importable only by server components)

### `getSuggestedResearchers(limit: number, filters?)`

**Input:**
```typescript
type DiscoverFilters = {
  industry?: string;
  expertise?: string;
  availability?: string;
};
```

**Logic:**

1. Get current user's data: expertise tags, followed user IDs
2. Get industries the user has been active in (from their questions/articles)
3. Query all researchers — exclude self, already-followed users, and soft-deleted users
4. Apply optional filters as WHERE clauses (industry on questions, expertise array `has`, availability field)
5. Score each candidate:
   - **Expertise overlap (50% weight):** `matchingTags / max(candidateTags.length, userTags.length)` — normalized 0-1
   - **Industry match (30% weight):** candidate has questions in user's active industries (articles excluded — `Article` has no `industry` field) — binary 0 or 1
   - **Social proximity (20% weight):** `totalUserFollowings > 0 ? mutualConnections / totalUserFollowings : 0` — guarded against division by zero for new users
6. Final score = `(expertiseScore * 0.5) + (industryScore * 0.3) + (socialScore * 0.2)`
7. Sort by score descending, break ties by points descending
8. Return top `limit` results

**Fallback for logged-out or new users:**
- Skip scoring entirely
- Return researchers sorted by points descending (most active first)
- Still apply filters if provided

**Return type:**
```typescript
type SuggestedResearcher = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  expertise: string[];
  points: number;
  availability: string | null;
  mutualFollowers: number;
  isFollowing: boolean; // needed for FollowButton's initialFollowing prop
  _count: { followers: number };
};
```

The `isFollowing` field is computed in bulk after scoring: query `Follow` where `followerId = currentUserId AND followingId IN (candidateIds)` — single query, not N queries.

## Explore Page

File: `src/app/(main)/explore/page.tsx`

Server component with:
- Page title: "Discover Researchers"
- Filter bar at top (client component)
- Grid of researcher cards: 3 columns desktop, 2 tablet, 1 mobile
- Each card shows: avatar, name, username, top 3 expertise tags as BadgePill, level badge, mutual followers ("3 people you follow"), Follow button
- Empty state: "No researchers found matching your filters"
- Uses existing components: `BadgePill`, `LevelBadge`, `FollowButton`, `UserAvatar`

### Filter Bar

File: `src/components/explore/explore-filters.tsx`

Client component:
- Three `<select>` dropdowns: Industry, Expertise, Availability
- Uses `useRouter` + `useSearchParams` to update URL query params on change
- URL pattern: `/explore?industry=Healthcare&expertise=conjoint-analysis`
- "Clear filters" link shown when any filter is active
- Industries: same 13 used across the platform (Transport and Logistics, Aerospace and Defence, Packaging, Automotive, Agriculture, Machinery and Equipment, Energy and Power, Consumer Goods, Chemical and Material, Healthcare, Food and Beverages, Semiconductor and Electronic, ICT)
- Expertise options: top 20 most common expertise tags from the DB (requires raw query with `unnest(expertise)` + `GROUP BY` + `ORDER BY count DESC` since Prisma has no built-in array element aggregation)
- Availability options: Available, Busy, Not Available

## Homepage Widget

File: `src/components/home/suggested-researchers.tsx`

Server component:
- Calls `getSuggestedResearchers(3)` with no filters
- Title: "Researchers you might know"
- 3 horizontal cards: avatar, name, top expertise tag, mutual followers count, Follow button
- "See all →" link to `/explore`
- Not rendered if: not logged in, or no suggestions available

### Integration

Import `SuggestedResearchers` into `ForumSidebar` component (which already owns sidebar composition in the forum page). The component is also ready to drop into the homepage feed when Section 1 (Feed) is built.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/discover.ts` | Create — suggestion algorithm (read-only query, not a server action) |
| `src/app/(main)/explore/page.tsx` | Create — explore page with grid |
| `src/components/explore/explore-filters.tsx` | Create — filter bar client component |
| `src/components/home/suggested-researchers.tsx` | Create — homepage/sidebar widget |
| `src/components/forum/forum-sidebar.tsx` (or equivalent) | Modify — import SuggestedResearchers widget |

## Edge Cases

- **Logged-out users:** Explore page shows all researchers sorted by points. No personalized scoring. Widget hidden.
- **New users (no activity/follows):** All algorithm scores are 0. Fallback to points-based ranking.
- **Users who follow everyone:** All candidates filtered out → "You're connected with everyone!" message.
- **No researchers match filters:** "No researchers found matching your filters" with "Clear filters" link.
- **Performance:** Algorithm runs per request. Acceptable for <1000 researchers. If needed later, cache results per user for 1 hour.

## Out of Scope

- Precomputed suggestion scores (cron-based)
- "Similar to researcher X" recommendations
- Activity-based suggestions (users who answered similar questions)
- Suggestion dismissal ("Don't show me this person")
