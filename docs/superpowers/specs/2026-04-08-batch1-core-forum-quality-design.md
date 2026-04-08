# Batch 1: Core Forum Quality — Design Spec

**Date:** 2026-04-08
**Goal:** Elevate forum quality with downvote UI, reputation levels, industry tagging, full-text search, and editor polish.

---

## Current State Assessment

Already built (no work needed):
- Rich text editor (TipTap) with bold, italic, headings, lists, code, blockquotes, LaTeX
- Upvote/downvote backend (Vote model, VoteValue enum, points logic)
- Accepted answer system (isAccepted, sorting, 25-point reward)
- Points config (POST_QUESTION: 5, POST_ANSWER: 10, RECEIVE_UPVOTE: 2, etc.)
- Badge system (streaks, Thought Leader, Contributor, Top Answerer)

**What's actually missing:**

1. **Downvote button in UI** — Backend supports it, but vote-button.tsx only renders upvote
2. **Reputation levels with privileges** — Points exist but no tiers/levels or privilege gating
3. **Industry selection on questions** — 13 industries from Claritas Intelligence
4. **Full-text search** — Current search is basic `contains` matching, not ranked
5. **Search filters** — No date range, category, tag, or industry filters
6. **Downvote count on answers** — Answer model lacks `downvoteCount` field

---

## Feature 1: Downvote Button in UI

**Current:** `src/components/forum/vote-button.tsx` only shows upvote arrow.

**Change:** Add downvote arrow below the vote count. Stack layout: ▲ count ▼

```
  ▲        (upvote — primary color when active)
  24       (net score = upvoteCount - downvoteCount)
  ▼        (downvote — red/error color when active)
```

- Use `ChevronUp` / `ChevronDown` from lucide-react
- Show net score (upvotes - downvotes) instead of just upvoteCount
- Apply to both questions and answers
- Add `downvoteCount Int @default(0)` to Answer model in schema

**Privilege gate:** Only users with Level 2+ (50+ points) can downvote (see Feature 2).

---

## Feature 2: Reputation Levels with Privileges

**Levels (6 tiers):**

| Level | Name | Points | Privileges Unlocked |
|-------|------|--------|-------------------|
| 1 | Newcomer | 0-49 | Ask questions, post answers, upvote |
| 2 | Contributor | 50-199 | Downvote, comment on any post |
| 3 | Established | 200-499 | Edit others' posts (suggested edits), set bounties |
| 4 | Trusted | 500-999 | Close/reopen votes, review edit queue |
| 5 | Expert | 1000-2499 | Edit without approval, access moderation tools |
| 6 | Authority | 2500+ | Full moderation, pin posts, feature content |

**Implementation:**
- Add `src/lib/reputation.ts` with `getLevel(points)`, `hasPrivilege(points, action)`, `LEVELS` config
- NO schema change — level is derived from points at runtime
- Display level badge next to username everywhere (question cards, answer cards, profile)
- Level badge: colored pill with level name (Newcomer=gray, Contributor=blue, Established=green, Trusted=purple, Expert=orange, Authority=red)
- Gate downvote action in `src/server/actions/votes.ts` — return error if level < 2
- Gate on server side (not just UI hide) for security

**Profile display:**
- Show level badge, points count, and progress bar to next level on profile page
- Show in a compact format on hover/tooltip elsewhere

---

## Feature 3: Industry Selection on Questions

**13 Industries (from Claritas Intelligence):**
1. Transport and Logistics
2. Aerospace and Defence
3. Packaging
4. Automotive
5. Agriculture
6. Machinery and Equipment
7. Energy and Power
8. Consumer Goods
9. Chemical and Material
10. Healthcare
11. Food and Beverages
12. Semiconductor and Electronic
13. ICT

**Implementation:**
- Add `industry String?` field to Question model in schema
- Add industry dropdown to question form (after researchDomain, before tags)
- Label: "Industry" with "(optional)" hint
- Add industry filter to forum page alongside existing domain filter
- Show industry badge on question cards (distinct from researchDomain — use a different badge color)
- Add industry to search filters
- Store industries in `src/lib/constants/industries.ts` as a shared constant

**Also add to User model:**
- Add `industry String?` to User model
- Show industry dropdown in signup and settings forms
- Use user's industry as default selection when asking a question

---

## Feature 4: Full-Text Search with Filters

**Current:** `search.ts` uses Prisma `contains` (LIKE %query%) — no ranking, no relevance scoring.

**Upgrade approach:** PostgreSQL full-text search via Prisma raw queries.

**Search improvements:**
1. Use `to_tsvector` / `to_tsquery` for ranked full-text search
2. Search across: question title + body, answer body, article title + body, user name + bio
3. Return results ranked by `ts_rank` relevance score
4. Add highlighted snippets showing match context

**Filter panel (on /search page):**
- Type: Questions, Articles, Jobs, Listings, Users (checkbox multi-select)
- Industry: Dropdown from 13 industries
- Research Domain: Dropdown from existing 15 domains
- Date range: Last 24h, Last week, Last month, Last year, All time
- Sort by: Relevance (default), Newest, Most upvoted
- Tags: Tag input for filtering

**Search page redesign:**
- Create `src/app/(main)/search/page.tsx` as a full search results page
- Left sidebar: filter panel (collapsible on mobile)
- Main area: search results grouped by type with tabs
- URL-driven filters: `/search?q=genomics&type=questions&industry=Healthcare`

**Quick search (navbar)** stays as-is — lightweight instant results. "View all results" links to full search page.

---

## Feature 5: Answer Downvote Count

**Schema change:** Add `downvoteCount Int @default(0)` to Answer model.

**Update `votes.ts`:** When voting on an answer, also update `downvoteCount` (currently only updates `upvoteCount`).

---

## Migration Summary

**Prisma schema changes:**
1. Add `industry String?` to Question model
2. Add `industry String?` to User model  
3. Add `downvoteCount Int @default(0)` to Answer model

**New files:**
- `src/lib/reputation.ts` — Level config, privilege checks
- `src/lib/constants/industries.ts` — Industry list constant
- `src/components/shared/level-badge.tsx` — Reputation level badge
- `src/app/(main)/search/page.tsx` — Full search results page
- `src/components/search/search-filters.tsx` — Filter sidebar component

**Modified files:**
- `prisma/schema.prisma` — 3 field additions
- `src/components/forum/vote-button.tsx` — Add downvote UI
- `src/components/forum/question-form.tsx` — Add industry dropdown
- `src/components/forum/question-card.tsx` — Show industry badge
- `src/components/forum/question-list.tsx` — Industry filter
- `src/components/forum/answer-card.tsx` — Downvote button, level badge
- `src/server/actions/votes.ts` — Privilege gate, answer downvoteCount
- `src/server/actions/search.ts` — Full-text search rewrite
- `src/server/actions/questions.ts` — Industry field in create/filter
- `src/components/profile/researcher-profile.tsx` — Level badge + progress
- `src/components/profile/company-profile.tsx` — Level badge
- `src/components/auth/company-signup-form.tsx` — Industry dropdown
- `src/app/(main)/settings/page.tsx` — Industry in settings
- `prisma/seed.ts` — Add industries to seed data
