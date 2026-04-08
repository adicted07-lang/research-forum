# Batch 1: Core Forum Quality — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add downvote UI, reputation levels, industry tagging, and full-text search to the ResearchHub forum.

**Architecture:** All changes build on the existing Next.js 16 App Router codebase. Reputation levels are derived at runtime from the existing `points` field — no new DB column needed. Industry is a new optional field on Question and User. Full-text search uses PostgreSQL `to_tsvector`/`to_tsquery` via Prisma raw queries. IMPORTANT: Next.js 16 breaking change — `params` and `searchParams` are Promises and must be awaited.

**Tech Stack:** Next.js 16.2.1, React 19, Prisma 7.5, PostgreSQL (Neon), TypeScript 5, Tailwind CSS 4, Lucide React

---

## File Structure

**New files:**
| File | Responsibility |
|------|---------------|
| `src/lib/reputation.ts` | Level config, `getLevel()`, `hasPrivilege()` helpers |
| `src/lib/constants/industries.ts` | 13 industries constant array |
| `src/components/shared/level-badge.tsx` | Colored reputation level pill |
| `src/components/shared/vote-controls.tsx` | Full up/down vote UI (replaces vote-button usage) |
| `src/app/(main)/search/page.tsx` | Full search results page with filters |
| `src/components/search/search-filters.tsx` | Filter sidebar for search page |

**Modified files:**
| File | What changes |
|------|-------------|
| `prisma/schema.prisma` | Add `industry` to Question + User, `downvoteCount` to Answer |
| `src/server/actions/votes.ts` | Update Answer downvoteCount, privilege gate for downvotes |
| `src/server/actions/questions.ts` | Industry field in create + filter |
| `src/server/actions/search.ts` | Full-text search rewrite with filters |
| `src/components/forum/question-form.tsx` | Add industry dropdown |
| `src/components/forum/question-card.tsx` | Show industry badge, use new vote controls |
| `src/components/forum/question-list.tsx` | Industry filter dropdown |
| `src/components/forum/answer-card.tsx` | Use new vote controls with downvote |
| `src/components/profile/researcher-profile.tsx` | Level badge + progress bar |
| `prisma/seed.ts` | Add industries to seed data |

---

### Task 1: Schema changes + industries constant

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/constants/industries.ts`

- [ ] **Step 1: Add industry field to Question model**

In `prisma/schema.prisma`, in the Question model (after `researchDomain` field around line 296), add:
```prisma
  industry       String?
```

- [ ] **Step 2: Add industry field to User model**

In the User model (after `about` field around line 136), add:
```prisma
  industry       String?
```

- [ ] **Step 3: Add downvoteCount to Answer model**

In the Answer model (after `upvoteCount` on line 315), add:
```prisma
  downvoteCount  Int       @default(0)
```

- [ ] **Step 4: Create industries constant**

Create `src/lib/constants/industries.ts`:
```typescript
export const INDUSTRIES = [
  "Transport and Logistics",
  "Aerospace and Defence",
  "Packaging",
  "Automotive",
  "Agriculture",
  "Machinery and Equipment",
  "Energy and Power",
  "Consumer Goods",
  "Chemical and Material",
  "Healthcare",
  "Food and Beverages",
  "Semiconductor and Electronic",
  "ICT",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
```

- [ ] **Step 5: Generate migration**

```bash
npx prisma migrate dev --create-only --name add-industry-and-answer-downvotes
```

If it fails due to no local DB, that's OK. Then regenerate client:
```bash
npx prisma generate
```

- [ ] **Step 6: Push schema to production**

```bash
DATABASE_URL="<production-url>" npx prisma db push
```

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma src/lib/constants/industries.ts
git commit -m "feat: add industry field to Question/User, downvoteCount to Answer"
```

---

### Task 2: Reputation levels system

**Files:**
- Create: `src/lib/reputation.ts`
- Create: `src/components/shared/level-badge.tsx`

- [ ] **Step 1: Create reputation config**

Create `src/lib/reputation.ts`:
```typescript
export const LEVELS = [
  { level: 1, name: "Newcomer", minPoints: 0, color: "gray" },
  { level: 2, name: "Contributor", minPoints: 50, color: "blue" },
  { level: 3, name: "Established", minPoints: 200, color: "green" },
  { level: 4, name: "Trusted", minPoints: 500, color: "purple" },
  { level: 5, name: "Expert", minPoints: 1000, color: "orange" },
  { level: 6, name: "Authority", minPoints: 2500, color: "red" },
] as const;

export type LevelInfo = (typeof LEVELS)[number];

export function getLevel(points: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(points: number): LevelInfo | null {
  const current = getLevel(points);
  const nextIdx = LEVELS.findIndex((l) => l.level === current.level) + 1;
  return nextIdx < LEVELS.length ? LEVELS[nextIdx] : null;
}

export function getLevelProgress(points: number): number {
  const current = getLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.round((progress / range) * 100);
}

export type Privilege = "downvote" | "edit_suggest" | "set_bounty" | "close_vote" | "edit_direct" | "moderate";

const PRIVILEGE_LEVELS: Record<Privilege, number> = {
  downvote: 2,
  edit_suggest: 3,
  set_bounty: 3,
  close_vote: 4,
  edit_direct: 5,
  moderate: 6,
};

export function hasPrivilege(points: number, privilege: Privilege): boolean {
  const userLevel = getLevel(points);
  return userLevel.level >= PRIVILEGE_LEVELS[privilege];
}
```

- [ ] **Step 2: Create level badge component**

Create `src/components/shared/level-badge.tsx`:
```typescript
import { getLevel, getLevelProgress, getNextLevel } from "@/lib/reputation";

const COLOR_MAP: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface LevelBadgeProps {
  points: number;
  showProgress?: boolean;
  size?: "sm" | "md";
}

export function LevelBadge({ points, showProgress = false, size = "sm" }: LevelBadgeProps) {
  const level = getLevel(points);
  const colors = COLOR_MAP[level.color] || COLOR_MAP.gray;

  return (
    <div className="inline-flex flex-col">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors} ${size === "md" ? "px-2.5 py-1 text-xs" : ""}`}>
        {level.name}
      </span>
      {showProgress && (() => {
        const next = getNextLevel(points);
        const progress = getLevelProgress(points);
        if (!next) return null;
        return (
          <div className="mt-1.5 w-full">
            <div className="flex justify-between text-[10px] text-text-tertiary mb-0.5">
              <span>{points} pts</span>
              <span>{next.minPoints} pts</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/reputation.ts src/components/shared/level-badge.tsx
git commit -m "feat: add reputation levels system with 6 tiers and level badge component"
```

---

### Task 3: Vote controls with downvote UI

**Files:**
- Create: `src/components/shared/vote-controls.tsx`
- Modify: `src/server/actions/votes.ts`

- [ ] **Step 1: Create vote controls component**

Create `src/components/shared/vote-controls.tsx`:
```typescript
"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toggleVote } from "@/server/actions/votes";

interface VoteControlsProps {
  targetType: string;
  targetId: string;
  upvoteCount: number;
  downvoteCount: number;
  initialVote: null | "UPVOTE" | "DOWNVOTE";
  userPoints?: number;
}

export function VoteControls({
  targetType,
  targetId,
  upvoteCount: initialUp,
  downvoteCount: initialDown,
  initialVote,
  userPoints = 0,
}: VoteControlsProps) {
  const [upCount, setUpCount] = useState(initialUp);
  const [downCount, setDownCount] = useState(initialDown);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const [isPending, startTransition] = useTransition();

  const netScore = upCount - downCount;
  const canDownvote = userPoints >= 50; // Level 2+

  function handleVote(value: "UPVOTE" | "DOWNVOTE") {
    if (value === "DOWNVOTE" && !canDownvote) return;

    // Optimistic update
    if (currentVote === value) {
      // Un-vote
      if (value === "UPVOTE") setUpCount((p) => p - 1);
      else setDownCount((p) => p - 1);
      setCurrentVote(null);
    } else {
      if (currentVote === "UPVOTE") setUpCount((p) => p - 1);
      if (currentVote === "DOWNVOTE") setDownCount((p) => p - 1);
      if (value === "UPVOTE") setUpCount((p) => p + 1);
      else setDownCount((p) => p + 1);
      setCurrentVote(value);
    }

    startTransition(async () => {
      const result = await toggleVote(targetType, targetId, value);
      if (result?.error) {
        setUpCount(initialUp);
        setDownCount(initialDown);
        setCurrentVote(initialVote);
      }
    });
  }

  return (
    <div className={`flex flex-col items-center gap-0.5 ${isPending ? "opacity-70" : ""}`}>
      <button
        onClick={() => handleVote("UPVOTE")}
        className={`p-1 rounded transition-colors ${
          currentVote === "UPVOTE"
            ? "text-primary bg-primary-lighter"
            : "text-text-tertiary hover:text-primary hover:bg-primary-lighter"
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <span className={`text-sm font-semibold tabular-nums ${
        netScore > 0 ? "text-primary" : netScore < 0 ? "text-error" : "text-text-tertiary"
      }`}>
        {netScore}
      </span>
      <button
        onClick={() => handleVote("DOWNVOTE")}
        disabled={!canDownvote}
        title={!canDownvote ? "Reach Contributor level (50 points) to downvote" : "Downvote"}
        className={`p-1 rounded transition-colors ${
          currentVote === "DOWNVOTE"
            ? "text-error bg-error/10"
            : canDownvote
              ? "text-text-tertiary hover:text-error hover:bg-error/10"
              : "text-text-tertiary/30 cursor-not-allowed"
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Update votes server action — answer downvoteCount + privilege gate**

In `src/server/actions/votes.ts`, add import at top:
```typescript
import { hasPrivilege } from "@/lib/reputation";
```

After the `voteValueEnum` validation (after line 27), add privilege check:
```typescript
  // Privilege gate: downvoting requires Level 2+
  if (voteValueEnum === VoteValue.DOWNVOTE) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { points: true } });
    if (!user || !hasPrivilege(user.points, "downvote")) {
      return { error: "You need at least 50 points to downvote" };
    }
  }
```

In the transaction, update the Answer branch (around line 72-78) to also set `downvoteCount`:
```typescript
      } else if (targetTypeEnum === TargetType.ANSWER) {
        const a = await tx.answer.update({
          where: { id: targetId },
          data: { upvoteCount: upvotes, downvoteCount: downvotes },
          select: { authorId: true },
        });
        contentAuthorId = a.authorId;
      }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/vote-controls.tsx src/server/actions/votes.ts
git commit -m "feat: add vote controls with downvote UI and privilege gating"
```

---

### Task 4: Industry dropdown on question form + cards + filters

**Files:**
- Modify: `src/components/forum/question-form.tsx`
- Modify: `src/components/forum/question-card.tsx`
- Modify: `src/components/forum/question-list.tsx`
- Modify: `src/server/actions/questions.ts`

- [ ] **Step 1: Add industry dropdown to question form**

In `src/components/forum/question-form.tsx`, add import at top:
```typescript
import { INDUSTRIES } from "@/lib/constants/industries";
```

After the Research Domain dropdown (after line 120, before Tags), add:
```typescript
        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
            Industry <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
          <select name="industry" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors">
            <option value="">Select industry...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
```

- [ ] **Step 2: Update createQuestion action**

In `src/server/actions/questions.ts`, add `industry` to form data extraction (next to `researchDomain`):
```typescript
    industry: formData.get("industry") as string | null,
```

And include it in `db.question.create` data:
```typescript
        industry: raw.industry || null,
```

- [ ] **Step 3: Add industry to getQuestions filter**

In the `getQuestions` function, add:
```typescript
  if (opts.industry) where.industry = opts.industry;
```

Add `industry?: string` to the opts type.

- [ ] **Step 4: Show industry badge on question cards**

In `src/components/forum/question-card.tsx`, add `industry` to the QuestionCardProps interface:
```typescript
    industry?: string | null;
```

In the render, after the researchDomain badge, add:
```typescript
                {question.industry && (
                  <span className="text-xs font-medium text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full">
                    {question.industry}
                  </span>
                )}
```

- [ ] **Step 5: Add industry filter to question-list.tsx**

In `src/components/forum/question-list.tsx`, add import:
```typescript
import { INDUSTRIES } from "@/lib/constants/industries";
```

Add an `industry` prop alongside the existing `researchDomain` prop. Add an industry filter dropdown in the filter row. Pass the industry parameter to `getQuestions()` and `buildUrl()`.

- [ ] **Step 6: Update forum page to pass industry param**

In `src/app/(main)/forum/page.tsx`, read `industry` from searchParams (await it — Next.js 16!) and pass to `QuestionList`.

- [ ] **Step 7: Commit**

```bash
git add src/components/forum/ src/server/actions/questions.ts src/app/\(main\)/forum/page.tsx src/lib/constants/industries.ts
git commit -m "feat: add industry selection to questions with form, cards, and filters"
```

---

### Task 5: Integrate vote controls + level badges into forum

**Files:**
- Modify: `src/components/forum/question-card.tsx`
- Modify: `src/components/forum/answer-card.tsx`
- Modify: `src/components/profile/researcher-profile.tsx`

- [ ] **Step 1: Replace VoteButton with VoteControls on question cards**

In `src/components/forum/question-card.tsx`:
- Replace `import { VoteButton }` with `import { VoteControls } from "@/components/shared/vote-controls"`
- Add `downvoteCount` and `userVote` to the QuestionCardProps interface
- Replace the `<VoteButton>` usage with `<VoteControls>` passing `upvoteCount`, `downvoteCount`, `initialVote`

Note: The parent component that renders QuestionCard will need to pass the current user's vote and points. Check how the question data is fetched and include vote lookup.

- [ ] **Step 2: Add VoteControls to answer cards**

In `src/components/forum/answer-card.tsx`:
- Import `VoteControls`
- Add `downvoteCount` to the answer interface
- Replace any upvote button with `<VoteControls>`

- [ ] **Step 3: Add level badge to profiles**

In `src/components/profile/researcher-profile.tsx`:
- Import `LevelBadge` from `@/components/shared/level-badge`
- After the username display, add: `<LevelBadge points={profile.points} showProgress />`

- [ ] **Step 4: Commit**

```bash
git add src/components/forum/ src/components/profile/ src/components/shared/
git commit -m "feat: integrate vote controls and level badges into forum and profiles"
```

---

### Task 6: Full-text search with filters

**Files:**
- Modify: `src/server/actions/search.ts`
- Create: `src/app/(main)/search/page.tsx`
- Create: `src/components/search/search-filters.tsx`

- [ ] **Step 1: Rewrite search action with full-text search**

Rewrite `src/server/actions/search.ts` to support:
- Full-text search using `db.$queryRaw` with `to_tsvector('english', title || ' ' || body)` and `to_tsquery`
- Accept filter params: `{ query, type?, industry?, domain?, dateRange?, sortBy? }`
- Return ranked results with `ts_rank` score
- Keep the existing `searchAll` function for the quick-search navbar (backwards compatible)
- Add a new `searchWithFilters` function for the full search page

Use raw SQL for the full-text query:
```sql
SELECT id, title, slug, ts_rank(to_tsvector('english', title || ' ' || COALESCE(body, '')), plainto_tsquery('english', $1)) AS rank
FROM questions
WHERE to_tsvector('english', title || ' ' || COALESCE(body, '')) @@ plainto_tsquery('english', $1)
  AND "deletedAt" IS NULL
ORDER BY rank DESC
LIMIT 20
```

Add similar queries for articles, jobs, and users. Apply filters (industry, domain, date range) as additional WHERE clauses.

- [ ] **Step 2: Create search filters component**

Create `src/components/search/search-filters.tsx`:
- Type checkboxes (Questions, Articles, Jobs, Listings, Users)
- Industry dropdown (from INDUSTRIES constant)
- Research Domain dropdown (from RESEARCH_DOMAINS)
- Date range buttons (24h, Week, Month, Year, All)
- Sort dropdown (Relevance, Newest, Most upvoted)
- All filters update URL search params

- [ ] **Step 3: Create full search results page**

Create `src/app/(main)/search/page.tsx`:
- Read `searchParams` (await — Next.js 16!) for q, type, industry, domain, date, sort
- Two-column layout: filter sidebar (left, collapsible on mobile) + results (right)
- Results show tabs for each type with count badges
- Each result card shows title, snippet, metadata, and relevance indicator
- Empty state when no results

- [ ] **Step 4: Commit**

```bash
git add src/server/actions/search.ts src/app/\(main\)/search/ src/components/search/
git commit -m "feat: full-text search with filters, rankings, and dedicated search page"
```

---

### Task 7: Seed data updates + final verification

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Add industries to seed questions**

In `prisma/seed.ts`, add `industry` to existing question creates. Distribute across industries:
- q1 (missing data): `industry: "Healthcare"`
- q2 (reproducibility): `industry: "ICT"`
- q3 (UX research): `industry: "Consumer Goods"`
- q4 (p-values): `industry: "Healthcare"`

- [ ] **Step 2: Add industries to seed users**

Add `industry` to researcher users:
- alice: `industry: "Healthcare"`
- bob: `industry: "Healthcare"`
- carol: `industry: "Consumer Goods"`

- [ ] **Step 3: Seed production database**

```bash
DATABASE_URL="<production-url>" npx prisma db push
DATABASE_URL="<production-url>" npx prisma db seed
```

- [ ] **Step 4: Build verification**

```bash
npx next build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit and push**

```bash
git add prisma/seed.ts
git commit -m "feat: add industries to seed data"
git push origin main
```
