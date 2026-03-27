# Batch 2: Community & Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add LaTeX math support to the editor, user activity feeds on profiles, tag following with personalized feeds, and a reputation tier system.

**Architecture:** LaTeX extends the existing Tiptap editor with a custom extension + KaTeX rendering. Activity feed queries existing models (questions, answers, articles) by user. Tag following adds a new Prisma model and filters the homepage/forum feeds. Reputation maps existing points to named tiers displayed on profiles and leaderboard.

**Tech Stack:** Tiptap, KaTeX, Prisma, Next.js 16

---

## File Structure

### New Files
- `src/lib/tiptap-math.ts` — custom Tiptap node extension for inline/block math
- `src/components/profile/activity-feed.tsx` — user activity timeline component
- `src/server/actions/activity.ts` — fetch user's recent activity
- `src/server/actions/tag-follows.ts` — follow/unfollow tags, get followed tags
- `src/components/forum/tag-follow-button.tsx` — follow/unfollow tag button
- `src/lib/reputation.ts` — points-to-tier mapping utility

### Modified Files
- `src/components/shared/rich-text-editor.tsx` — add math extension + toolbar button
- `src/components/profile/researcher-profile.tsx` — replace activity placeholder with real feed
- `src/app/(main)/user/[username]/page.tsx` — pass activity data to profile
- `src/server/actions/profiles.ts` — extend getResearcherProfile to include activity
- `src/app/(main)/page.tsx` — show followed tags for logged-in users
- `src/app/(main)/forum/page.tsx` — add "For You" tab filtering by followed tags
- `src/components/forum/forum-sidebar.tsx` — show followed tags section
- `src/components/profile/researcher-profile.tsx` — show reputation tier badge
- `src/app/(main)/leaderboard/page.tsx` — show reputation tier next to each user
- `prisma/schema.prisma` — add TagFollow model

---

## Task 1: LaTeX Math Support in Editor

**Files:**
- Create: `src/lib/tiptap-math.ts`
- Modify: `src/components/shared/rich-text-editor.tsx`

- [ ] **Step 1: Install KaTeX**

```bash
source "$HOME/.nvm/nvm.sh" && npm install katex @types/katex
```

- [ ] **Step 2: Create custom Tiptap math extension**

Create `src/lib/tiptap-math.ts` — a Tiptap Node extension that:
- Adds an inline `math` node that wraps LaTeX in `<span class="math-inline">` rendered by KaTeX
- Input rule: typing `$...$` triggers inline math rendering
- On node view create: renders KaTeX HTML
- Stores raw LaTeX as node attribute, renders via `katex.renderToString()`

```typescript
import { Node, mergeAttributes } from "@tiptap/core";
import katex from "katex";

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-math-inline]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const latex = HTMLAttributes.latex || "";
    let rendered = "";
    try {
      rendered = katex.renderToString(latex, { throwOnError: false });
    } catch {
      rendered = latex;
    }
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-math-inline": "",
        class: "math-inline",
        contenteditable: "false",
      }),
      ["span", { innerHTML: rendered }],
    ];
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const dom = document.createElement("span");
      dom.classList.add("math-inline");
      dom.contentEditable = "false";
      dom.setAttribute("data-math-inline", "");
      try {
        dom.innerHTML = katex.renderToString(node.attrs.latex, {
          throwOnError: false,
        });
      } catch {
        dom.textContent = node.attrs.latex;
      }
      return { dom };
    };
  },

  addCommands() {
    return {
      insertMath:
        (latex: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    };
  },
});
```

- [ ] **Step 3: Add math extension and toolbar button to RichTextEditor**

In `src/components/shared/rich-text-editor.tsx`:

Add imports:
```tsx
import { MathInline } from "@/lib/tiptap-math";
import "katex/dist/katex.min.css";
import { Sigma } from "lucide-react"; // math icon
```

Add `MathInline` to the extensions array:
```tsx
extensions: [StarterKit, Placeholder.configure({ placeholder }), MathInline],
```

Add a toolbar button after the blockquote button that prompts for LaTeX:
```tsx
<ToolbarButton
  onClick={() => {
    const latex = window.prompt("Enter LaTeX expression:");
    if (latex) {
      editor.chain().focus().insertMath(latex).run();
    }
  }}
  title="Insert Math (LaTeX)"
>
  <Sigma className="w-4 h-4" />
</ToolbarButton>
```

- [ ] **Step 4: Verify build**

```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/tiptap-math.ts src/components/shared/rich-text-editor.tsx package.json package-lock.json
git commit -m "feat: add LaTeX math support to rich text editor via KaTeX"
```

---

## Task 2: User Activity Feed

**Files:**
- Create: `src/server/actions/activity.ts`
- Create: `src/components/profile/activity-feed.tsx`
- Modify: `src/components/profile/researcher-profile.tsx`
- Modify: `src/app/(main)/user/[username]/page.tsx`

- [ ] **Step 1: Create activity server action**

Create `src/server/actions/activity.ts`:

```typescript
"use server";

import { db } from "@/lib/db";

interface ActivityItem {
  type: "question" | "answer" | "article";
  title: string;
  url: string;
  createdAt: Date;
}

export async function getUserActivity(userId: string, limit = 20): Promise<ActivityItem[]> {
  try {
    const [questions, answers, articles] = await Promise.all([
      db.question.findMany({
        where: { authorId: userId, deletedAt: null },
        select: { title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.answer.findMany({
        where: { authorId: userId, deletedAt: null },
        select: { createdAt: true, question: { select: { title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.article.findMany({
        where: { authorId: userId, deletedAt: null, status: "PUBLISHED" },
        select: { title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    const items: ActivityItem[] = [
      ...questions.map((q) => ({
        type: "question" as const,
        title: `Asked: ${q.title}`,
        url: `/forum/${q.slug}`,
        createdAt: q.createdAt,
      })),
      ...answers.map((a) => ({
        type: "answer" as const,
        title: `Answered: ${a.question.title}`,
        url: `/forum/${a.question.slug}`,
        createdAt: a.createdAt,
      })),
      ...articles.map((a) => ({
        type: "article" as const,
        title: `Published: ${a.title}`,
        url: `/news/${a.slug}`,
        createdAt: a.createdAt,
      })),
    ];

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.slice(0, limit);
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Create ActivityFeed component**

Create `src/components/profile/activity-feed.tsx`:

```tsx
import Link from "next/link";
import { MessageSquare, FileText, HelpCircle } from "lucide-react";

interface ActivityItem {
  type: "question" | "answer" | "article";
  title: string;
  url: string;
  createdAt: Date;
}

const typeIcons = {
  question: HelpCircle,
  answer: MessageSquare,
  article: FileText,
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary dark:text-text-dark-secondary text-sm">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item, i) => {
        const Icon = typeIcons[item.type];
        return (
          <li key={`${item.type}-${i}`}>
            <Link
              href={item.url}
              className="flex items-start gap-3 py-2.5 px-2 rounded-md hover:bg-surface dark:hover:bg-surface-dark transition-colors"
            >
              <Icon className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary dark:text-text-dark-primary truncate">
                  {item.title}
                </p>
                <p className="text-xs text-text-tertiary">{timeAgo(item.createdAt)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 3: Replace activity placeholder in researcher profile**

In `src/components/profile/researcher-profile.tsx`:

Add imports:
```tsx
import { ActivityFeed } from "@/components/profile/activity-feed";
```

Update the component props to accept activity data:
```tsx
// Add to ResearcherProfileData type (or pass separately):
// The page will pass activity as a separate prop

// Update ResearcherProfileProps:
interface ResearcherProfileProps {
  profile: ResearcherProfileData;
  activity: Array<{ type: "question" | "answer" | "article"; title: string; url: string; createdAt: Date }>;
}
```

Replace the activity tabs placeholder (lines 240-268) with:
```tsx
<div className="mt-4 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6">
  <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
    Recent Activity
  </h2>
  <ActivityFeed items={activity} />
</div>
```

- [ ] **Step 4: Pass activity data from the page**

In `src/app/(main)/user/[username]/page.tsx`:

Add import:
```tsx
import { getUserActivity } from "@/server/actions/activity";
```

In the page component, after fetching the profile, fetch activity:
```tsx
const activity = await getUserActivity(profile.id);
```

Pass to component:
```tsx
<ResearcherProfile profile={profile} activity={activity} />
```

- [ ] **Step 5: Verify build**

```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/server/actions/activity.ts src/components/profile/activity-feed.tsx src/components/profile/researcher-profile.tsx src/app/(main)/user/[username]/page.tsx
git commit -m "feat: add user activity feed to researcher profiles"
```

---

## Task 3: Tag Following + Personalized Feed

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/server/actions/tag-follows.ts`
- Create: `src/components/forum/tag-follow-button.tsx`
- Modify: `src/app/(main)/page.tsx`
- Modify: `src/app/(main)/forum/page.tsx`

- [ ] **Step 1: Add TagFollow model to Prisma schema**

Add to `prisma/schema.prisma`:

```prisma
model TagFollow {
  id        String   @id @default(cuid())
  userId    String
  tag       String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, tag])
  @@index([userId])
  @@map("tag_follows")
}
```

Add `tagFollows TagFollow[]` to the User model relations.

Run migration:
```bash
source "$HOME/.nvm/nvm.sh" && npx prisma db push
```

- [ ] **Step 2: Create tag follow server actions**

Create `src/server/actions/tag-follows.ts`:

```typescript
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleTagFollow(tag: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const existing = await db.tagFollow.findUnique({
      where: { userId_tag: { userId: session.user.id, tag } },
    });

    if (existing) {
      await db.tagFollow.delete({ where: { id: existing.id } });
      return { following: false };
    }

    await db.tagFollow.create({
      data: { userId: session.user.id, tag },
    });
    return { following: true };
  } catch {
    return { error: "Failed to toggle tag follow" };
  }
}

export async function getFollowedTags(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const follows = await db.tagFollow.findMany({
      where: { userId: session.user.id },
      select: { tag: true },
      orderBy: { createdAt: "desc" },
    });
    return follows.map((f) => f.tag);
  } catch {
    return [];
  }
}

export async function isTagFollowed(tag: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    const follow = await db.tagFollow.findUnique({
      where: { userId_tag: { userId: session.user.id, tag } },
    });
    return !!follow;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Create TagFollowButton component**

Create `src/components/forum/tag-follow-button.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { toggleTagFollow } from "@/server/actions/tag-follows";

interface TagFollowButtonProps {
  tag: string;
  initialFollowing?: boolean;
}

export function TagFollowButton({ tag, initialFollowing = false }: TagFollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleTagFollow(tag);
      if ("following" in result) {
        setFollowing(result.following);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        following
          ? "bg-primary/10 text-primary"
          : "bg-surface text-text-secondary hover:bg-surface-hover dark:bg-surface-dark dark:text-text-dark-secondary"
      } ${isPending ? "opacity-50" : ""}`}
    >
      {following ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
      {tag}
    </button>
  );
}
```

- [ ] **Step 4: Add followed tags to homepage sidebar**

In `src/app/(main)/page.tsx`:

Add imports:
```tsx
import { getFollowedTags } from "@/server/actions/tag-follows";
import { TagFollowButton } from "@/components/forum/tag-follow-button";
```

In the `HomePage` function, fetch followed tags:
```tsx
const followedTags = session?.user?.id ? await getFollowedTags() : [];
```

In the sidebar, add a "Your Tags" section before "Trending Topics" (only shown when logged in and has followed tags):
```tsx
{followedTags.length > 0 && (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
      Your Tags
    </h3>
    <div className="flex flex-wrap gap-1.5">
      {followedTags.map((tag) => (
        <TagFollowButton key={tag} tag={tag} initialFollowing={true} />
      ))}
    </div>
  </div>
)}
```

In the Trending Topics section, show follow buttons alongside each tag for logged-in users:
```tsx
// Replace the existing BadgePill tags with TagFollowButton when user is logged in
{POPULAR_TAGS.map((tag) => (
  session?.user?.id ? (
    <TagFollowButton
      key={tag}
      tag={tag}
      initialFollowing={followedTags.includes(tag)}
    />
  ) : (
    <BadgePill key={tag} label={tag} variant="primary" />
  )
))}
```

- [ ] **Step 5: Add "For You" filtering to forum page**

In `src/app/(main)/forum/page.tsx`:

Add imports and fetch followed tags. When `sort=for-you`, pass followed tags to QuestionList (which passes them to getQuestions).

This requires modifying `getQuestions` in `src/server/actions/questions.ts` to accept an optional `tags` filter:
```typescript
// In the where clause, if opts.tags array is provided:
if (opts.tags && opts.tags.length > 0) {
  where.tags = { hasSome: opts.tags };
}
```

- [ ] **Step 6: Verify build**

```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma src/server/actions/tag-follows.ts src/components/forum/tag-follow-button.tsx src/app/(main)/page.tsx src/app/(main)/forum/page.tsx src/server/actions/questions.ts
git commit -m "feat: add tag following with personalized feeds"
```

---

## Task 4: Reputation Tier System

**Files:**
- Create: `src/lib/reputation.ts`
- Modify: `src/components/profile/researcher-profile.tsx`
- Modify: `src/app/(main)/leaderboard/page.tsx`

- [ ] **Step 1: Create reputation tier utility**

Create `src/lib/reputation.ts`:

```typescript
export interface ReputationTier {
  name: string;
  minPoints: number;
  color: string;
  bgColor: string;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { name: "Newcomer", minPoints: 0, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
  { name: "Contributor", minPoints: 50, color: "text-green-700", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { name: "Active Researcher", minPoints: 200, color: "text-blue-700", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { name: "Expert", minPoints: 500, color: "text-purple-700", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  { name: "Authority", minPoints: 1000, color: "text-orange-700", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  { name: "Legend", minPoints: 5000, color: "text-yellow-700", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
];

export function getReputationTier(points: number): ReputationTier {
  for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
    if (points >= REPUTATION_TIERS[i].minPoints) {
      return REPUTATION_TIERS[i];
    }
  }
  return REPUTATION_TIERS[0];
}
```

- [ ] **Step 2: Show tier badge on researcher profile**

In `src/components/profile/researcher-profile.tsx`:

Add import:
```tsx
import { getReputationTier } from "@/lib/reputation";
```

In the stats row (after points display), add the tier badge:
```tsx
const tier = getReputationTier(profile.points);

// Add after the points stat div:
<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tier.color} ${tier.bgColor}`}>
  {tier.name}
</span>
```

- [ ] **Step 3: Show tier on leaderboard**

In `src/app/(main)/leaderboard/page.tsx`:

Add import:
```tsx
import { getReputationTier } from "@/lib/reputation";
```

For each user row, compute and display the tier:
```tsx
const tier = getReputationTier(user.points);
// Add tier badge next to points display
<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tier.color} ${tier.bgColor}`}>
  {tier.name}
</span>
```

- [ ] **Step 4: Verify build**

```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/reputation.ts src/components/profile/researcher-profile.tsx src/app/(main)/leaderboard/page.tsx
git commit -m "feat: add reputation tier system to profiles and leaderboard"
```

---

## Task 5: Verify Build

- [ ] **Step 1: TypeScript check**
```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 2: Run tests**
```bash
npm test
```

- [ ] **Step 3: Production build**
```bash
npm run build
```

- [ ] **Step 4: Commit if needed**
```bash
git add -A && git commit -m "fix: resolve build issues from batch 2"
```
