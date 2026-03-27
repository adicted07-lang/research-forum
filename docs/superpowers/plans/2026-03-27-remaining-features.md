# Remaining Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up points integration, file upload integration, newsletter, collections/bookmarks, RSS feed polling, and account deletion grace period.

**Architecture:** Each feature is independent — server actions + UI wiring following existing fire-and-forget patterns. No new infrastructure (Bull/Redis queues) needed; RSS and account cleanup use API cron routes. All features build on existing Prisma models and component patterns.

**Tech Stack:** Next.js 16, Prisma, Resend, Vitest, existing FileUpload component, existing points/badges system.

---

## File Structure

### New Files
- `src/server/actions/bookmarks.ts` — toggle bookmark, get user bookmarks
- `src/server/actions/newsletter.ts` — subscribe/unsubscribe, send newsletter
- `src/server/actions/rss.ts` — poll RSS feeds, create articles from entries
- `src/components/newsletter/newsletter-subscribe.tsx` — footer subscribe form
- `src/components/settings/newsletter-settings.tsx` — manage subscriptions in settings
- `src/components/bookmarks/bookmarks-list.tsx` — display bookmarked items on dashboard
- `src/app/api/cron/rss-poll/route.ts` — RSS polling cron endpoint
- `src/app/api/cron/cleanup-accounts/route.ts` — permanent deletion cron endpoint
- `src/lib/validations/newsletter.ts` — newsletter validation schema
- `src/app/(main)/reactivate/page.tsx` — account reactivation page

### Modified Files
- `src/server/actions/questions.ts` — add awardPoints call to createQuestion
- `src/server/actions/answers.ts` — add awardPoints call to createAnswer and acceptAnswer
- `src/server/actions/votes.ts` — add awardPoints/deductPoints calls to toggleVote
- `src/server/actions/comments.ts` — add awardPoints call to createComment
- `src/server/actions/articles.ts` — add awardPoints call to createArticle
- `src/server/actions/profiles.ts` — add reactivateAccount action, update deleteAccount
- `src/components/social/bookmark-button.tsx` — wire to server action
- `src/components/marketplace/listing-form.tsx` — add FileUpload + RichTextEditor
- `src/components/settings/profile-settings-form.tsx` — add avatar FileUpload
- `src/app/(main)/settings/page.tsx` — add newsletter settings section
- `src/app/(main)/dashboard/page.tsx` — wire saved items to real bookmarks
- `src/lib/email-templates.ts` — add newsletter email template

---

## Task 1: Points Integration

**Files:**
- Modify: `src/server/actions/questions.ts`
- Modify: `src/server/actions/answers.ts`
- Modify: `src/server/actions/votes.ts`
- Modify: `src/server/actions/comments.ts`
- Modify: `src/server/actions/articles.ts`

- [ ] **Step 1: Wire points into createQuestion**

In `src/server/actions/questions.ts`, add import and call after question creation:

```typescript
// Add to imports:
import { awardPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";

// Add after the db.question.create() call, before return:
awardPoints(session.user.id, POINTS.POST_QUESTION);
```

- [ ] **Step 2: Wire points into createAnswer**

In `src/server/actions/answers.ts`, add import and call after answer creation:

```typescript
// Add to imports:
import { awardPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";

// Add after the transaction block, before the email section:
awardPoints(session.user.id, POINTS.POST_ANSWER);
```

- [ ] **Step 3: Wire points into acceptAnswer**

In `src/server/actions/answers.ts`, add points award to the answerer after acceptance:

```typescript
// Add after the transaction block in acceptAnswer, before return { success: true }:
awardPoints(answer.authorId, POINTS.ANSWER_ACCEPTED);
```

- [ ] **Step 4: Wire points into toggleVote**

In `src/server/actions/votes.ts`, add import and determine content author to award/deduct points:

```typescript
// Add to imports:
import { awardPoints, deductPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";

// After the transaction block (after recalculating counts), add logic to find content author and award points.
// Inside the transaction, after creating/updating/deleting the vote, determine the net effect:

// Add after the transaction resolves (after the closing });):
// Look up the content author to award/deduct points
let contentAuthorId: string | null = null;
if (targetTypeEnum === TargetType.QUESTION) {
  const q = await db.question.findUnique({ where: { id: targetId }, select: { authorId: true } });
  contentAuthorId = q?.authorId ?? null;
} else if (targetTypeEnum === TargetType.ANSWER) {
  const a = await db.answer.findUnique({ where: { id: targetId }, select: { authorId: true } });
  contentAuthorId = a?.authorId ?? null;
}

if (contentAuthorId && contentAuthorId !== userId) {
  if (!existing && voteValueEnum === VoteValue.UPVOTE) {
    awardPoints(contentAuthorId, POINTS.RECEIVE_UPVOTE);
  } else if (!existing && voteValueEnum === VoteValue.DOWNVOTE) {
    deductPoints(contentAuthorId, Math.abs(POINTS.RECEIVE_DOWNVOTE));
  } else if (existing && existing.value === voteValueEnum) {
    // Un-voting: reverse the points
    if (voteValueEnum === VoteValue.UPVOTE) {
      deductPoints(contentAuthorId, POINTS.RECEIVE_UPVOTE);
    } else {
      awardPoints(contentAuthorId, Math.abs(POINTS.RECEIVE_DOWNVOTE));
    }
  } else if (existing && existing.value !== voteValueEnum) {
    // Switching vote: reverse old + apply new
    if (voteValueEnum === VoteValue.UPVOTE) {
      awardPoints(contentAuthorId, POINTS.RECEIVE_UPVOTE + Math.abs(POINTS.RECEIVE_DOWNVOTE));
    } else {
      deductPoints(contentAuthorId, POINTS.RECEIVE_UPVOTE + Math.abs(POINTS.RECEIVE_DOWNVOTE));
    }
  }
}
```

**Important:** The `existing` variable is inside the transaction scope. To use it outside, capture it:
```typescript
// Before the transaction, declare:
let existing: { value: VoteValue } | null = null;

// Inside the transaction, after the findUnique:
existing = existingInTx; // assign to outer variable
```

- [ ] **Step 5: Wire points into createComment**

In `src/server/actions/comments.ts`, add:

```typescript
// Add to imports:
import { awardPoints } from "@/server/actions/points";

// Add after db.comment.create(), before return:
awardPoints(session.user.id, 2); // 2 points for commenting
```

- [ ] **Step 6: Wire points into createArticle**

In `src/server/actions/articles.ts`, add:

```typescript
// Add to imports:
import { awardPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";

// Add after db.article.create(), before return:
awardPoints(session.user.id, POINTS.PUBLISH_ARTICLE);
```

- [ ] **Step 7: Commit**

```bash
git add src/server/actions/questions.ts src/server/actions/answers.ts src/server/actions/votes.ts src/server/actions/comments.ts src/server/actions/articles.ts
git commit -m "feat: wire points integration into forum actions"
```

---

## Task 2: File Upload Integration

**Files:**
- Modify: `src/components/settings/profile-settings-form.tsx`
- Modify: `src/server/actions/profiles.ts`
- Modify: `src/components/marketplace/listing-form.tsx`

- [ ] **Step 1: Add avatar upload to profile settings form**

In `src/components/settings/profile-settings-form.tsx`:

```typescript
// Add import:
import { FileUpload } from "@/components/shared/file-upload";

// Add state for avatar URL:
const [avatarUrl, setAvatarUrl] = useState<string>(initialData.image ?? "");

// Add hidden input + FileUpload before the name/username grid (inside the researcher branch and also company branch):
<div>
  <label className={labelClass}>Profile photo</label>
  <input type="hidden" name="image" value={avatarUrl} />
  <FileUpload
    accept="image/jpeg,image/png,image/gif,image/webp"
    maxSize={5 * 1024 * 1024}
    onChange={setAvatarUrl}
  />
</div>
```

Update `ProfileSettingsFormProps.initialData` to include `image?: string | null`.

- [ ] **Step 2: Handle image field in updateProfile server action**

In `src/server/actions/profiles.ts`, inside the `updateProfile` function, add `image` to both the RESEARCHER and COMPANY update calls:

```typescript
// In the researcher branch db.user.update data:
image: (formData.get("image") as string) || undefined,

// In the company branch db.user.update data:
companyLogo: (formData.get("image") as string) || undefined,
```

- [ ] **Step 3: Pass image to profile settings in settings page**

In `src/app/(main)/settings/page.tsx`, add `image` to the initialData object:

```typescript
const initialData = {
  // ... existing fields
  image: user.image,
};
```

- [ ] **Step 4: Add FileUpload and RichTextEditor to listing form**

In `src/components/marketplace/listing-form.tsx`:

```typescript
// Add imports:
import { FileUpload } from "@/components/shared/file-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

// Add state:
const [imageUrl, setImageUrl] = useState("");
const [descriptionHtml, setDescriptionHtml] = useState("");

// Replace the <textarea> for description with:
<div>
  <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
    Description <span className="text-red-500">*</span>
  </label>
  <input type="hidden" name="description" value={descriptionHtml} />
  <RichTextEditor
    placeholder="Describe what you offer, your experience, and what makes you stand out..."
    onChange={setDescriptionHtml}
  />
</div>

// Add image upload section before the pricing field:
<div>
  <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
    Cover Image <span className="text-text-tertiary font-normal ml-1">(optional)</span>
  </label>
  <input type="hidden" name="coverImage" value={imageUrl} />
  <FileUpload
    accept="image/jpeg,image/png,image/gif,image/webp"
    maxSize={10 * 1024 * 1024}
    onChange={setImageUrl}
  />
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/settings/profile-settings-form.tsx src/server/actions/profiles.ts src/app/(main)/settings/page.tsx src/components/marketplace/listing-form.tsx
git commit -m "feat: integrate file upload into profile settings and listing form"
```

---

## Task 3: Bookmarks/Collections CRUD

**Files:**
- Create: `src/server/actions/bookmarks.ts`
- Modify: `src/components/social/bookmark-button.tsx`
- Create: `src/components/bookmarks/bookmarks-list.tsx`
- Modify: `src/app/(main)/dashboard/page.tsx`

- [ ] **Step 1: Create bookmarks server actions**

Create `src/server/actions/bookmarks.ts`:

```typescript
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TargetType } from "@prisma/client";

export async function toggleBookmark(targetType: string, targetId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const targetTypeEnum = targetType.toUpperCase() as TargetType;
  if (!Object.values(TargetType).includes(targetTypeEnum)) {
    return { error: "Invalid target type" };
  }

  try {
    const existing = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: session.user.id,
          targetType: targetTypeEnum,
          targetId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    }

    await db.bookmark.create({
      data: {
        userId: session.user.id,
        targetType: targetTypeEnum,
        targetId,
      },
    });
    return { bookmarked: true };
  } catch {
    return { error: "Failed to toggle bookmark" };
  }
}

export async function isBookmarked(targetType: string, targetId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const targetTypeEnum = targetType.toUpperCase() as TargetType;

  try {
    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: session.user.id,
          targetType: targetTypeEnum,
          targetId,
        },
      },
    });
    return !!bookmark;
  } catch {
    return false;
  }
}

export async function getUserBookmarks() {
  const session = await auth();
  if (!session?.user?.id) return { bookmarks: [] };

  try {
    const bookmarks = await db.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Resolve bookmark targets
    const results = await Promise.all(
      bookmarks.map(async (bm) => {
        let title = "";
        let url = "";

        if (bm.targetType === "QUESTION") {
          const q = await db.question.findUnique({
            where: { id: bm.targetId },
            select: { title: true, slug: true },
          });
          title = q?.title ?? "Deleted question";
          url = q ? `/forum/${q.slug}` : "#";
        } else if (bm.targetType === "LISTING") {
          const l = await db.listing.findUnique({
            where: { id: bm.targetId },
            select: { title: true, slug: true },
          });
          title = l?.title ?? "Deleted listing";
          url = l ? `/marketplace/${l.slug}` : "#";
        } else if (bm.targetType === "ARTICLE") {
          const a = await db.article.findUnique({
            where: { id: bm.targetId },
            select: { title: true, slug: true },
          });
          title = a?.title ?? "Deleted article";
          url = a ? `/news/${a.slug}` : "#";
        }

        return {
          id: bm.id,
          targetType: bm.targetType,
          title,
          url,
          createdAt: bm.createdAt,
        };
      })
    );

    return { bookmarks: results };
  } catch {
    return { bookmarks: [] };
  }
}
```

- [ ] **Step 2: Wire BookmarkButton to server action**

Replace `src/components/social/bookmark-button.tsx`:

```typescript
"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleBookmark } from "@/server/actions/bookmarks";

interface BookmarkButtonProps {
  targetType: string;
  targetId: string;
  initialBookmarked?: boolean;
}

export function BookmarkButton({ targetType, targetId, initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleBookmark(targetType, targetId);
      if ("bookmarked" in result) {
        setBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        bookmarked
          ? "text-primary hover:text-primary/80"
          : "text-text-tertiary hover:text-text-secondary",
        isPending && "opacity-50"
      )}
    >
      <Bookmark
        className={cn("w-4 h-4", bookmarked && "fill-primary")}
      />
    </button>
  );
}
```

- [ ] **Step 3: Update BookmarkButton usages to pass targetType and targetId**

Search the codebase for `<BookmarkButton` and update all usages to pass `targetType` and `targetId` props. The component previously only took `initialBookmarked`.

Run: `grep -rn "BookmarkButton" src/`

For each usage, add the appropriate `targetType` (e.g., "QUESTION", "LISTING", "ARTICLE") and `targetId` props.

- [ ] **Step 4: Create bookmarks list component**

Create `src/components/bookmarks/bookmarks-list.tsx`:

```typescript
import Link from "next/link";
import { Bookmark, FileText, MessageSquare, ShoppingBag } from "lucide-react";

interface BookmarkItem {
  id: string;
  targetType: string;
  title: string;
  url: string;
  createdAt: Date;
}

const typeIcons: Record<string, React.ElementType> = {
  QUESTION: MessageSquare,
  LISTING: ShoppingBag,
  ARTICLE: FileText,
};

const typeLabels: Record<string, string> = {
  QUESTION: "Question",
  LISTING: "Listing",
  ARTICLE: "Article",
};

export function BookmarksList({ bookmarks }: { bookmarks: BookmarkItem[] }) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
        <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
          No saved items yet
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          Bookmark questions, listings, and articles to find them here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border dark:divide-border-dark">
      {bookmarks.map((bm) => {
        const Icon = typeIcons[bm.targetType] ?? Bookmark;
        return (
          <li key={bm.id}>
            <Link
              href={bm.url}
              className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-surface dark:hover:bg-surface-dark transition-colors"
            >
              <Icon className="w-4 h-4 text-text-tertiary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                  {bm.title}
                </p>
                <p className="text-xs text-text-tertiary">
                  {typeLabels[bm.targetType] ?? bm.targetType}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 5: Wire bookmarks into dashboard**

In `src/app/(main)/dashboard/page.tsx`, replace the "Saved Jobs" empty state section with real bookmarks:

```typescript
// Add import:
import { getUserBookmarks } from "@/server/actions/bookmarks";
import { BookmarksList } from "@/components/bookmarks/bookmarks-list";

// In the ResearcherDashboard function, fetch bookmarks:
const { bookmarks } = await getUserBookmarks();

// Replace the Saved Jobs EmptyState with:
<BookmarksList bookmarks={bookmarks} />
```

- [ ] **Step 6: Commit**

```bash
git add src/server/actions/bookmarks.ts src/components/social/bookmark-button.tsx src/components/bookmarks/bookmarks-list.tsx src/app/(main)/dashboard/page.tsx
git commit -m "feat: implement bookmarks CRUD with server actions and dashboard"
```

---

## Task 4: Newsletter

**Files:**
- Create: `src/server/actions/newsletter.ts`
- Create: `src/lib/validations/newsletter.ts`
- Create: `src/components/newsletter/newsletter-subscribe.tsx`
- Create: `src/components/settings/newsletter-settings.tsx`
- Modify: `src/lib/email-templates.ts`
- Modify: `src/app/(main)/settings/page.tsx`
- Modify: `src/app/(main)/page.tsx` (add subscribe section to homepage)

- [ ] **Step 1: Create newsletter validation schema**

Create `src/lib/validations/newsletter.ts`:

```typescript
import { z } from "zod";

export const newsletterTypes = ["weekly_digest", "product_updates", "research_highlights"] as const;

export const newsletterSubscribeSchema = z.object({
  type: z.enum(newsletterTypes),
});
```

- [ ] **Step 2: Create newsletter server actions**

Create `src/server/actions/newsletter.ts`:

```typescript
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { newsletterEmail } from "@/lib/email-templates";

export async function toggleNewsletterSubscription(type: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const existing = await db.newsletterSubscription.findUnique({
      where: {
        userId_type: { userId: session.user.id, type },
      },
    });

    if (existing) {
      if (existing.isActive) {
        await db.newsletterSubscription.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
        return { subscribed: false };
      } else {
        await db.newsletterSubscription.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
        return { subscribed: true };
      }
    }

    await db.newsletterSubscription.create({
      data: {
        userId: session.user.id,
        type,
        isActive: true,
      },
    });
    return { subscribed: true };
  } catch {
    return { error: "Failed to update subscription" };
  }
}

export async function getUserSubscriptions() {
  const session = await auth();
  if (!session?.user?.id) return { subscriptions: [] };

  try {
    const subs = await db.newsletterSubscription.findMany({
      where: { userId: session.user.id },
    });
    return { subscriptions: subs };
  } catch {
    return { subscriptions: [] };
  }
}

export async function sendNewsletter(type: string, subject: string, body: string) {
  // Admin-only action
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Forbidden" };

  try {
    const subscribers = await db.newsletterSubscription.findMany({
      where: { type, isActive: true },
      include: { user: { select: { email: true } } },
    });

    const emails = subscribers
      .map((s) => s.user.email)
      .filter((e): e is string => !!e);

    // Send in batches (fire-and-forget)
    for (const email of emails) {
      sendEmail({
        to: email,
        subject,
        html: newsletterEmail(subject, body),
      });
    }

    return { sent: emails.length };
  } catch {
    return { error: "Failed to send newsletter" };
  }
}
```

- [ ] **Step 3: Add newsletter email template**

In `src/lib/email-templates.ts`, add:

```typescript
export function newsletterEmail(subject: string, body: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700;">
        ${subject}
      </h2>
      <div style="margin: 0 0 16px; color: #374151; font-size: 14px; line-height: 1.6;">
        ${body}
      </div>
      <div style="${footerStyles}">
        <p>You're receiving this because you subscribed to ResearchHub newsletters.</p>
        <p><a href="https://researchhub.com/settings" style="color: #DA552F;">Manage preferences</a></p>
      </div>
    </div>
  `;
}
```

- [ ] **Step 4: Create newsletter subscribe component**

Create `src/components/newsletter/newsletter-subscribe.tsx`:

```typescript
"use client";

import { useState, useTransition } from "react";
import { toggleNewsletterSubscription } from "@/server/actions/newsletter";
import { Mail } from "lucide-react";

export function NewsletterSubscribe() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubscribe() {
    startTransition(async () => {
      const result = await toggleNewsletterSubscription("weekly_digest");
      if ("subscribed" in result && result.subscribed) {
        setMessage("Subscribed to weekly digest!");
      } else if ("error" in result) {
        setMessage(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 text-center">
      <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
      <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-1">
        Stay in the loop
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
        Get a weekly digest of trending research questions, new tools, and community highlights.
      </p>
      {message ? (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">{message}</p>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={isPending}
          className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Subscribing..." : "Subscribe to Weekly Digest"}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create newsletter settings component**

Create `src/components/settings/newsletter-settings.tsx`:

```typescript
"use client";

import { useState, useTransition } from "react";
import { toggleNewsletterSubscription } from "@/server/actions/newsletter";

const NEWSLETTER_TYPES = [
  { type: "weekly_digest", label: "Weekly Digest", description: "Top questions, tools, and community highlights" },
  { type: "product_updates", label: "Product Updates", description: "New features and platform announcements" },
  { type: "research_highlights", label: "Research Highlights", description: "Curated research findings and insights" },
];

interface Subscription {
  type: string;
  isActive: boolean;
}

export function NewsletterSettings({ initialSubscriptions }: { initialSubscriptions: Subscription[] }) {
  const [subs, setSubs] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const s of initialSubscriptions) {
      map[s.type] = s.isActive;
    }
    return map;
  });
  const [isPending, startTransition] = useTransition();

  function handleToggle(type: string) {
    startTransition(async () => {
      const result = await toggleNewsletterSubscription(type);
      if ("subscribed" in result) {
        setSubs((prev) => ({ ...prev, [type]: result.subscribed }));
      }
    });
  }

  return (
    <div className="space-y-3">
      {NEWSLETTER_TYPES.map((nl) => (
        <label
          key={nl.type}
          className="flex items-start gap-3 p-3 rounded-lg border border-border dark:border-border-dark hover:bg-surface dark:hover:bg-surface-dark transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            checked={subs[nl.type] ?? false}
            onChange={() => handleToggle(nl.type)}
            disabled={isPending}
            className="mt-0.5 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
              {nl.label}
            </p>
            <p className="text-xs text-text-tertiary">{nl.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Add newsletter section to settings page**

In `src/app/(main)/settings/page.tsx`:

```typescript
// Add imports:
import { NewsletterSettings } from "@/components/settings/newsletter-settings";
import { getUserSubscriptions } from "@/server/actions/newsletter";

// In SettingsPage function, fetch subscriptions:
const { subscriptions } = await getUserSubscriptions();

// Add newsletter section between Password and Danger Zone:
<section className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-6">
  <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-1">
    Newsletter Preferences
  </h2>
  <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
    Choose which newsletters you'd like to receive.
  </p>
  <NewsletterSettings initialSubscriptions={subscriptions} />
</section>
```

- [ ] **Step 7: Add newsletter subscribe to homepage**

In `src/app/(main)/page.tsx`, add the subscribe component to the sidebar or after the main content:

```typescript
// Add import:
import { NewsletterSubscribe } from "@/components/newsletter/newsletter-subscribe";

// Add in the sidebar area (after Trending Topics):
<NewsletterSubscribe />
```

- [ ] **Step 8: Commit**

```bash
git add src/server/actions/newsletter.ts src/lib/validations/newsletter.ts src/components/newsletter/newsletter-subscribe.tsx src/components/settings/newsletter-settings.tsx src/lib/email-templates.ts src/app/(main)/settings/page.tsx src/app/(main)/page.tsx
git commit -m "feat: add newsletter subscription system with settings and homepage widget"
```

---

## Task 5: RSS Feed Polling

**Files:**
- Create: `src/server/actions/rss.ts`
- Create: `src/app/api/cron/rss-poll/route.ts`

- [ ] **Step 1: Create RSS server actions**

Create `src/server/actions/rss.ts`:

```typescript
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function addRSSSource(name: string, url: string, pollInterval: number = 3600) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Forbidden" };

  try {
    const source = await db.rSSFeedSource.create({
      data: { name, url, pollInterval },
    });
    return { source };
  } catch {
    return { error: "Failed to add RSS source. URL may already exist." };
  }
}

export async function removeRSSSource(sourceId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Forbidden" };

  try {
    await db.rSSFeedSource.delete({ where: { id: sourceId } });
    return { success: true };
  } catch {
    return { error: "Failed to remove RSS source" };
  }
}

export async function getRSSSources() {
  const session = await auth();
  if (!session?.user?.id) return { sources: [] };
  if (session.user.role !== "ADMIN") return { sources: [] };

  try {
    const sources = await db.rSSFeedSource.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { sources };
  } catch {
    return { sources: [] };
  }
}
```

- [ ] **Step 2: Create RSS cron API route**

Create `src/app/api/cron/rss-poll/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

// Simple RSS XML parser — extracts items from RSS/Atom feeds
function parseRSSItems(xml: string): Array<{ title: string; link: string; description: string }> {
  const items: Array<{ title: string; link: string; description: string }> = [];

  // Match RSS <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1] ?? "";
    const link = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i)?.[1] ?? "";
    const desc = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1] ?? "";
    if (title) items.push({ title: title.trim(), link: link.trim(), description: desc.trim() });
  }

  // Fallback: match Atom <entry> blocks
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1] ?? "";
      const link = block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i)?.[1] ?? "";
      const desc = block.match(/<(?:summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:summary|content)>/i)?.[1] ?? "";
      if (title) items.push({ title: title.trim(), link: link.trim(), description: desc.trim() });
    }
  }

  return items;
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sources = await db.rSSFeedSource.findMany({
      where: { isActive: true },
    });

    let totalCreated = 0;

    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          headers: { "User-Agent": "ResearchHub RSS Poller/1.0" },
        });
        if (!response.ok) continue;

        const xml = await response.text();
        const items = parseRSSItems(xml);

        // Get first admin user as article author
        const admin = await db.user.findFirst({
          where: { role: "ADMIN", deletedAt: null },
          select: { id: true },
        });
        if (!admin) continue;

        for (const item of items.slice(0, 10)) {
          // Skip if already imported (by sourceUrl)
          const exists = await db.article.findFirst({
            where: { sourceUrl: item.link },
          });
          if (exists) continue;

          const wordCount = item.description.trim().split(/\s+/).length;
          const slug = generateSlug(item.title);

          await db.article.create({
            data: {
              title: item.title,
              body: item.description || `<p>Read the full article at <a href="${item.link}">${item.link}</a></p>`,
              slug,
              authorId: admin.id,
              category: "news",
              sourceUrl: item.link,
              sourceTitle: source.name,
              readTime: Math.max(1, Math.ceil(wordCount / 200)),
              status: "PUBLISHED",
              publishedAt: new Date(),
            },
          });
          totalCreated++;
        }

        // Update lastPolledAt
        await db.rSSFeedSource.update({
          where: { id: source.id },
          data: { lastPolledAt: new Date() },
        });
      } catch {
        // Individual feed failure — continue to next
        console.error(`Failed to poll RSS source: ${source.name}`);
      }
    }

    return NextResponse.json({ success: true, articlesCreated: totalCreated });
  } catch (error) {
    console.error("RSS poll error:", error);
    return NextResponse.json({ error: "RSS poll failed" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/server/actions/rss.ts src/app/api/cron/rss-poll/route.ts
git commit -m "feat: add RSS feed polling with cron API route"
```

---

## Task 6: Account Deletion Grace Period

**Files:**
- Modify: `src/server/actions/profiles.ts`
- Create: `src/app/api/cron/cleanup-accounts/route.ts`
- Create: `src/app/(main)/reactivate/page.tsx`
- Modify: `src/components/settings/danger-zone.tsx`

- [ ] **Step 1: Add reactivateAccount server action**

In `src/server/actions/profiles.ts`, add:

```typescript
export async function reactivateAccount(email: string) {
  try {
    const user = await db.user.findFirst({
      where: { email, deletedAt: { not: null } },
    });

    if (!user) return { error: "No deactivated account found with this email" };

    // Check if within 30-day grace period
    const daysSinceDeletion = Math.floor(
      (Date.now() - user.deletedAt!.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDeletion > 30) {
      return { error: "Grace period expired. Account has been permanently deleted." };
    }

    await db.user.update({
      where: { id: user.id },
      data: { deletedAt: null },
    });

    return { success: true };
  } catch {
    return { error: "Failed to reactivate account" };
  }
}
```

- [ ] **Step 2: Create cleanup cron API route**

Create `src/app/api/cron/cleanup-accounts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find users soft-deleted more than 30 days ago
    const expiredUsers = await db.user.findMany({
      where: {
        deletedAt: { not: null, lt: thirtyDaysAgo },
      },
      select: { id: true },
    });

    // Permanently delete each user and their related data
    let deleted = 0;
    for (const user of expiredUsers) {
      await db.user.delete({
        where: { id: user.id },
      });
      deleted++;
    }

    return NextResponse.json({ success: true, deletedCount: deleted });
  } catch (error) {
    console.error("Account cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create reactivation page**

Create `src/app/(main)/reactivate/page.tsx`:

```typescript
"use client";

import { useState, useTransition } from "react";
import { reactivateAccount } from "@/server/actions/profiles";
import { PageLayout } from "@/components/layout/page-layout";

export default function ReactivatePage() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await reactivateAccount(email);
      if ("success" in result) {
        setMessage({ type: "success", text: "Account reactivated! You can now log in." });
      } else {
        setMessage({ type: "error", text: result.error ?? "Something went wrong" });
      }
    });
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto mt-16">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          Reactivate Your Account
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          If you deleted your account within the last 30 days, you can reactivate it here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {message && (
            <div
              className={`px-4 py-3 rounded-md text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Reactivating..." : "Reactivate Account"}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 4: Update DangerZone to mention reactivation**

In `src/components/settings/danger-zone.tsx`, update the description text:

```typescript
// Change the description paragraph to:
<p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
  Your account will be deactivated immediately and permanently deleted after 30 days.
  During the grace period, you can reactivate at{" "}
  <a href="/reactivate" className="text-primary hover:underline">/reactivate</a>.
</p>
```

- [ ] **Step 5: Commit**

```bash
git add src/server/actions/profiles.ts src/app/api/cron/cleanup-accounts/route.ts src/app/(main)/reactivate/page.tsx src/components/settings/danger-zone.tsx
git commit -m "feat: add 30-day account deletion grace period with reactivation"
```

---

## Task 7: Verify and Fix Build

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run the dev server and verify no runtime errors**

```bash
npm run dev
```

Navigate to key pages: homepage, settings, dashboard, marketplace/new.

- [ ] **Step 3: Run existing tests**

```bash
npm test
```

Ensure no regressions.

- [ ] **Step 4: Commit the streak files that were pending**

```bash
git add src/server/actions/streaks.ts src/app/(main)/page.tsx
git commit -m "feat: add streak tracking on homepage visit"
```

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from feature integration"
```
