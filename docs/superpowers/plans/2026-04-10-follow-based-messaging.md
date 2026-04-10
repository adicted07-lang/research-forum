# Follow-Based Messaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable researchers to DM each other based on follow relationships, with message requests for non-mutual followers and a 5/day rate limit.

**Architecture:** Extend the existing `MessageThread`/`Message` models with `type`, `status`, and `creatorId` fields. Modify existing server actions to handle direct threads alongside job threads. Add a "Message" button to researcher profiles and "Message request" labels to the inbox.

**Tech Stack:** Prisma (Neon PostgreSQL), Next.js server actions, React client components, Vitest

**Spec:** `docs/superpowers/specs/2026-04-10-follow-based-messaging-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `prisma/schema.prisma` | Modify | Add `type`, `status`, `creatorId` fields + index to `MessageThread`, update unique constraint |
| `src/server/actions/follows.ts` | Modify | Add `isMutualFollow` helper |
| `src/server/actions/messages.ts` | Modify | Add `startDirectMessage`, `getDirectMessageLimit`, modify `sendMessage`, `getOrCreateThread`, `getThreads` |
| `src/components/profile/direct-message-button.tsx` | Create | Client component — "Message" button on profiles |
| `src/components/profile/researcher-profile.tsx` | Modify | Add DirectMessageButton to profile |
| `src/app/(main)/messages/page.tsx` | Modify | Add "Message request" label + thread type icons |
| `tests/server/actions/messages.test.ts` | Create | Tests for DM logic |

---

### Task 1: Schema — Add DM Fields to MessageThread

**Files:**
- Modify: `prisma/schema.prisma:593-610`

- [ ] **Step 1: Add new fields and update constraints**

In the `MessageThread` model, add three new fields and update the unique constraint:

```prisma
model MessageThread {
  id           String   @id @default(cuid())
  participant1 String
  participant2 String
  jobId        String?
  type         String   @default("JOB")
  status       String   @default("ACTIVE")
  creatorId    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user1    User      @relation("ThreadParticipant1", fields: [participant1], references: [id])
  user2    User      @relation("ThreadParticipant2", fields: [participant2], references: [id])
  job      Job?      @relation(fields: [jobId], references: [id])
  messages Message[]

  @@unique([participant1, participant2, type])
  @@index([participant1])
  @@index([participant2])
  @@index([creatorId, type, status, createdAt])
  @@map("message_threads")
}
```

Changes from existing:
- Added `type String @default("JOB")` — "JOB" or "DIRECT"
- Added `status String @default("ACTIVE")` — "ACTIVE" or "REQUEST"
- Added `creatorId String?` — who initiated the thread (null for legacy)
- Changed `@@unique([participant1, participant2])` → `@@unique([participant1, participant2, type])`
- Added `@@index([creatorId, type, status, createdAt])` for rate limit queries

- [ ] **Step 2: Generate Prisma client and create migration**

Run:
```bash
npx prisma generate
npx prisma migrate dev --name add-dm-fields-to-message-thread
```

If migrate fails on local DB, use fallback:
```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/$(date +%Y%m%d%H%M%S)_add_dm_fields/migration.sql
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add type, status, creatorId fields to MessageThread for DMs"
```

---

### Task 2: Add `isMutualFollow` Helper

**Files:**
- Modify: `src/server/actions/follows.ts`

- [ ] **Step 1: Add isMutualFollow function**

Add this function after the existing `isFollowing` function (around line 70):

```typescript
export async function isMutualFollow(userAId: string, userBId: string): Promise<boolean> {
  const count = await db.follow.count({
    where: {
      OR: [
        { followerId: userAId, followingId: userBId },
        { followerId: userBId, followingId: userAId },
      ],
    },
  });
  return count === 2;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/server/actions/follows.ts
git commit -m "feat: add isMutualFollow helper"
```

---

### Task 3: Server Actions — Direct Messaging Logic

**Files:**
- Modify: `src/server/actions/messages.ts`
- Create: `tests/server/actions/messages.test.ts`

- [ ] **Step 1: Write tests for DM logic**

Create `tests/server/actions/messages.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    follow: { findUnique: vi.fn(), count: vi.fn() },
    messageThread: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    message: { create: vi.fn() },
    user: { findUnique: vi.fn() },
    notification: { create: vi.fn(), findFirst: vi.fn() },
  },
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/server/actions/follows", () => ({
  isFollowing: vi.fn(),
  isMutualFollow: vi.fn(),
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { isFollowing, isMutualFollow } from "@/server/actions/follows";

describe("startDirectMessage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when messaging yourself", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user1", "hello");
    expect(result).toEqual({ error: "Cannot message yourself" });
  });

  it("returns error when not following recipient", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(false);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toEqual({ error: "You must follow this user to message them" });
  });

  it("returns error when daily limit reached for non-mutual follow", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(true);
    vi.mocked(isMutualFollow).mockResolvedValue(false);
    vi.mocked(db.messageThread.count).mockResolvedValue(5);
    vi.mocked(db.messageThread.findFirst).mockResolvedValue(null);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toEqual({ error: "Daily message request limit reached (5/day)" });
  });

  it("creates thread with REQUEST status for non-mutual follow", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(true);
    vi.mocked(isMutualFollow).mockResolvedValue(false);
    vi.mocked(db.messageThread.count).mockResolvedValue(0);
    vi.mocked(db.messageThread.findFirst).mockResolvedValue(null);
    vi.mocked(db.messageThread.create).mockResolvedValue({ id: "thread1" } as any);
    vi.mocked(db.message.create).mockResolvedValue({ id: "msg1" } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ name: "User One", email: "u@test.com" } as any);
    vi.mocked(db.notification.findFirst).mockResolvedValue(null);

    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toHaveProperty("success", true);
    expect(db.messageThread.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "DIRECT", status: "REQUEST" }),
      })
    );
  });

  it("creates thread with ACTIVE status for mutual follow", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(true);
    vi.mocked(isMutualFollow).mockResolvedValue(true);
    vi.mocked(db.messageThread.findFirst).mockResolvedValue(null);
    vi.mocked(db.messageThread.create).mockResolvedValue({ id: "thread1" } as any);
    vi.mocked(db.message.create).mockResolvedValue({ id: "msg1" } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ name: "User One", email: "u@test.com" } as any);
    vi.mocked(db.notification.findFirst).mockResolvedValue(null);

    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(db.messageThread.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "DIRECT", status: "ACTIVE" }),
      })
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/server/actions/messages.test.ts`
Expected: FAIL — `startDirectMessage` not found

- [ ] **Step 3: Add `startDirectMessage` to messages.ts**

Add to `src/server/actions/messages.ts`:

```typescript
import { isFollowing, isMutualFollow } from "@/server/actions/follows";
import { sendEmail } from "@/lib/email";

export async function startDirectMessage(recipientId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const senderId = session.user.id;
  if (senderId === recipientId) return { error: "Cannot message yourself" };

  // Check sender follows recipient
  const follows = await isFollowing(recipientId);
  if (!follows) return { error: "You must follow this user to message them" };

  // Check mutual follow status
  const mutual = await isMutualFollow(senderId, recipientId);

  // Normalize participant ordering (lower ID = participant1)
  const [p1, p2] = senderId < recipientId ? [senderId, recipientId] : [recipientId, senderId];

  // Check for existing direct thread
  const existingThread = await db.messageThread.findFirst({
    where: {
      participant1: p1,
      participant2: p2,
      type: "DIRECT",
    },
  });

  if (existingThread) {
    // Add message to existing thread
    await db.message.create({
      data: { threadId: existingThread.id, senderId, body },
    });
    await db.messageThread.update({
      where: { id: existingThread.id },
      data: { updatedAt: new Date() },
    });
    revalidatePath("/messages");
    return { success: true, threadId: existingThread.id };
  }

  // Rate limit for non-mutual follows: 5 new request threads per 24h
  if (!mutual) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const requestCount = await db.messageThread.count({
      where: {
        creatorId: senderId,
        type: "DIRECT",
        status: "REQUEST",
        createdAt: { gte: oneDayAgo },
      },
    });
    if (requestCount >= 5) {
      return { error: "Daily message request limit reached (5/day)" };
    }
  }

  // Create new thread
  const thread = await db.messageThread.create({
    data: {
      participant1: p1,
      participant2: p2,
      type: "DIRECT",
      status: mutual ? "ACTIVE" : "REQUEST",
      creatorId: senderId,
    },
  });

  // Create first message
  await db.message.create({
    data: { threadId: thread.id, senderId, body },
  });

  // Notification
  const sender = await db.user.findUnique({
    where: { id: senderId },
    select: { name: true },
  });
  const senderName = sender?.name || "Someone";

  await db.notification.create({
    data: {
      userId: recipientId,
      type: "MESSAGE",
      title: `${senderName} sent you a message`,
      link: `/messages/${thread.id}`,
    },
  });

  // Email for new thread
  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: { email: true, name: true },
  });
  if (recipient?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
    const requestNote = !mutual
      ? "<p style='color:#b8461f;font-size:13px;'>This is a message request — reply to accept.</p>"
      : "";
    sendEmail({
      to: recipient.email,
      subject: `New message from ${senderName} on The Intellectual Exchange`,
      html: `
        <h2>New message from ${senderName}</h2>
        ${requestNote}
        <p style="background:#f9fafb;padding:16px;border-radius:8px;color:#374151;">${body.slice(0, 200)}${body.length > 200 ? "..." : ""}</p>
        <p><a href="${baseUrl}/messages/${thread.id}" style="display:inline-block;padding:10px 20px;background:#b8461f;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Reply on TIE</a></p>
      `,
    });
  }

  revalidatePath("/messages");
  return { success: true, threadId: thread.id };
}

export async function getDirectMessageLimit() {
  const session = await auth();
  if (!session?.user?.id) return { used: 0, limit: 5, remaining: 5 };

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const used = await db.messageThread.count({
    where: {
      creatorId: session.user.id,
      type: "DIRECT",
      status: "REQUEST",
      createdAt: { gte: oneDayAgo },
    },
  });

  return { used, limit: 5, remaining: Math.max(0, 5 - used) };
}
```

- [ ] **Step 4: Modify `sendMessage` to handle auto-accept**

In the existing `sendMessage` function (around line 44), after creating the message, add the auto-accept logic:

```typescript
// Auto-accept: if this is a DIRECT REQUEST thread and the replier is the recipient (not creator)
const thread = await db.messageThread.findUnique({
  where: { id: threadId },
  select: { type: true, status: true, creatorId: true, participant1: true, participant2: true },
});

if (thread && thread.type === "DIRECT") {
  // Check sender still follows the other participant
  const otherParticipant = thread.participant1 === session.user.id ? thread.participant2 : thread.participant1;
  const stillFollows = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: otherParticipant } },
  });
  if (!stillFollows && session.user.id === thread.creatorId) {
    return { error: "You must follow this user to message them" };
  }

  // Auto-accept if recipient replies
  if (thread.status === "REQUEST" && session.user.id !== thread.creatorId) {
    await db.messageThread.update({
      where: { id: threadId },
      data: { status: "ACTIVE" },
    });
  }
}
```

- [ ] **Step 5: Modify `getThreads` to include new fields**

In the existing `getThreads` function (around line 104), add `type`, `status`, and `creatorId` to the select:

Find the `select` block inside the thread query and add:
```typescript
type: true,
status: true,
creatorId: true,
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/server/actions/messages.test.ts`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add src/server/actions/messages.ts tests/server/actions/messages.test.ts
git commit -m "feat: add startDirectMessage with rate limiting and auto-accept"
```

---

### Task 4: Direct Message Button Component

**Files:**
- Create: `src/components/profile/direct-message-button.tsx`
- Modify: `src/components/profile/researcher-profile.tsx`

- [ ] **Step 1: Create DirectMessageButton component**

Create `src/components/profile/direct-message-button.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { startDirectMessage } from "@/server/actions/messages";

type DirectMessageButtonProps = {
  recipientId: string;
  isFollowing: boolean;
  existingThreadId?: string | null;
};

export function DirectMessageButton({ recipientId, isFollowing, existingThreadId }: DirectMessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isFollowing) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border dark:border-border-dark text-text-tertiary dark:text-text-dark-tertiary cursor-not-allowed opacity-60"
      >
        <MessageSquare className="w-4 h-4" />
        Follow to message
      </button>
    );
  }

  async function handleClick() {
    if (existingThreadId) {
      router.push(`/messages/${existingThreadId}`);
      return;
    }

    setLoading(true);
    try {
      const result = await startDirectMessage(recipientId, "");
      if ("threadId" in result) {
        router.push(`/messages/${result.threadId}`);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border dark:border-border-dark text-text-primary dark:text-text-dark-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors cursor-pointer disabled:opacity-50"
    >
      <MessageSquare className="w-4 h-4" />
      {loading ? "Opening..." : "Message"}
    </button>
  );
}
```

- [ ] **Step 2: Add DirectMessageButton to researcher profile**

In `src/components/profile/researcher-profile.tsx`, after the FollowButton (around line 159-160), add:

```typescript
import { DirectMessageButton } from "@/components/profile/direct-message-button";
```

And in the component body, after the auth check, fetch the existing thread:

```typescript
// After: const following = session?.user?.id ? await isFollowing(profile.id) : false;
const existingThread = session?.user?.id ? await db.messageThread.findFirst({
  where: {
    OR: [
      { participant1: session.user.id, participant2: profile.id, type: "DIRECT" },
      { participant1: profile.id, participant2: session.user.id, type: "DIRECT" },
    ],
  },
  select: { id: true },
}) : null;
```

Then add the button after the FollowButton:

```typescript
{!isOwnProfile && session?.user && (
  <DirectMessageButton
    recipientId={profile.id}
    isFollowing={following}
    existingThreadId={existingThread?.id}
  />
)}
```

Add `import { db } from "@/lib/db";` at the top if not already present.

- [ ] **Step 3: Commit**

```bash
git add src/components/profile/direct-message-button.tsx src/components/profile/researcher-profile.tsx
git commit -m "feat: add Message button to researcher profiles"
```

---

### Task 5: Inbox UI — Message Request Labels and Thread Type Icons

**Files:**
- Modify: `src/app/(main)/messages/page.tsx`

- [ ] **Step 1: Add thread type and status indicators**

In `src/app/(main)/messages/page.tsx`, the thread list renders each thread in a link. Modify the thread rendering to:

1. Show a "Message request" badge for threads with `status === "REQUEST"` where the current user is NOT the creator
2. Show an icon: person icon (`User` from lucide) for DIRECT threads, briefcase icon (`Briefcase` from lucide) for JOB threads

Add imports:
```typescript
import { User, Briefcase } from "lucide-react";
```

In the thread list item, after the participant name, add:

```typescript
{/* Thread type icon */}
{thread.type === "DIRECT" ? (
  <User className="w-3.5 h-3.5 text-text-tertiary dark:text-text-dark-tertiary" />
) : (
  <Briefcase className="w-3.5 h-3.5 text-text-tertiary dark:text-text-dark-tertiary" />
)}

{/* Message request badge */}
{thread.status === "REQUEST" && thread.creatorId !== session?.user?.id && (
  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-full">
    Message request
  </span>
)}
```

The exact insertion point depends on the current JSX structure — read the file first, find where the participant name is rendered, and add these elements inline.

- [ ] **Step 2: Commit**

```bash
git add "src/app/(main)/messages/page.tsx"
git commit -m "feat: add message request labels and thread type icons to inbox"
```

---

### Task 6: Full Test Suite and Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no type errors

- [ ] **Step 3: Commit and push**

```bash
git push origin main
```
