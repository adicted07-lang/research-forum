# Follow-Based Messaging — Design Spec

## Overview

Expand the existing job-linked messaging system to support direct messages between researchers. Users who follow someone can DM them directly. Non-mutual follow messages appear as "message requests" with a label that disappears once the recipient replies.

## Decisions

- One-way follow required to send a DM (sender must follow recipient)
- Reuse existing `MessageThread` / `Message` models — add `type` and `status` fields
- Auto-accept with "Message request" label — replying removes the label, no explicit accept/decline
- 5 new conversations per day to non-mutual followers, unlimited to mutual followers
- In-app notification for all messages, email only for first message in a new thread
- Email for request threads includes "This is a message request — reply to accept"

## Data Model Changes

Add three fields to the existing `MessageThread` model in `schema.prisma`:

```prisma
model MessageThread {
  // ... existing fields ...
  type      String  @default("JOB")    // "JOB" | "DIRECT"
  status    String  @default("ACTIVE") // "ACTIVE" | "REQUEST"
  creatorId String?                    // Who initiated the thread (null for legacy JOB threads)

  @@index([creatorId, type, status, createdAt])
}
```

- `type: "DIRECT"` for follow-based DMs, `"JOB"` for existing job-linked threads
- `status: "REQUEST"` when sender is a one-way follower (not mutual). Changes to `"ACTIVE"` when recipient replies.
- `creatorId` tracks who initiated the thread — needed for rate limiting and auto-accept logic (identifying who is the recipient vs sender)
- Existing threads are unaffected — defaults match current behavior (`JOB`, `ACTIVE`, `null` creatorId)

**Unique constraint change:** The existing `@@unique([participant1, participant2])` must be replaced with `@@unique([participant1, participant2, type])` so that a JOB thread and a DIRECT thread can coexist between the same two users. Migration must use `CREATE UNIQUE INDEX ... WHERE type = 'DIRECT'` or the compound unique with type.

**Participant ordering:** When checking for existing threads, always query both orderings: `(senderId, recipientId)` AND `(recipientId, senderId)`. The `startDirectMessage` action must normalize ordering (e.g., always place the lower ID in `participant1`) to prevent duplicates.

**Rate limiting:** Query-based — count threads where `creatorId = currentUserId`, `type = "DIRECT"`, `status = "REQUEST"`, `createdAt >= NOW() - 24 hours`. If >= 5, block new requests to non-mutual followers.

## Server Actions

File: `src/server/actions/messages.ts` (modify existing or create if not present)

### `startDirectMessage(recipientId: string, body: string)`

1. Auth check — must be logged in
2. Reject messaging yourself
3. Verify sender follows the recipient — if not, return error "You must follow this user to message them"
4. Check mutual follow status (does recipient also follow sender?)
5. If not mutual: check daily request limit — count `MessageThread` where sender is creator, `type = "DIRECT"`, `status = "REQUEST"`, `createdAt >= 24 hours ago`. If >= 5, return error "Daily message request limit reached"
6. Check for existing direct thread between these two users — if found, add message to that thread instead of creating new one
7. Create `MessageThread` with `type: "DIRECT"`, `status` = mutual ? `"ACTIVE"` : `"REQUEST"`, link both participants
8. Create the `Message` with the body
9. Send in-app notification to recipient
10. Send email to recipient (first message in new thread only)
11. Revalidate messages page

Returns: `{ success: true, threadId: string }` or `{ error: string }`

### `replyToThread(threadId: string, body: string)` — modify existing

Add this logic before the existing reply flow:
- If thread `type === "DIRECT"`, verify the replier still follows the other participant. If not and replier is the `creatorId` (original sender), return error "You must follow this user to message them"
- After reply: if thread `status === "REQUEST"` and the replier is NOT `creatorId` (i.e., they are the recipient), update thread `status` to `"ACTIVE"`
- This is the auto-accept behavior — no UI action needed, just replying accepts

### `getThreads()` — modify existing

- Include `type` and `status` in the returned thread data
- Used by the inbox UI to show the "Message request" label

### `getDirectMessageLimit()`

Returns current user's daily request usage:

```typescript
type MessageLimit = {
  used: number;
  limit: 5;
  remaining: number;
};
```

Query: count `MessageThread` where `creatorId = currentUserId`, `type = "DIRECT"`, `status = "REQUEST"`, `createdAt >= NOW() - 24 hours`. Uses the `@@index([creatorId, type, status, createdAt])` index.

## UI Changes

### Profile page — "Message" button

In `src/components/profile/researcher-profile.tsx`:

- Show "Message" button when the current user follows the profile user
- If not following: show "Follow to message" (disabled/greyed out)
- If daily limit reached for non-mutual follows: show "Daily limit reached" (disabled)
- Clicking redirects to `/messages/{threadId}` if thread exists, or creates new thread and redirects
- Hidden on own profile
- Placed near the Follow button

### Inbox / Messages page

Modify existing messages list component:

- Threads with `status: "REQUEST"` show a small "Message request" label/badge next to the sender's name
- Label disappears once the recipient replies (status flips to `"ACTIVE"`)
- Direct threads show a person icon, job threads show a briefcase icon
- No tabs, no separate sections — all threads in one list, sorted by last message date

## Notifications

### In-app

- New thread: in-app notification `"{sender.name} sent you a message"`
- Replies in existing threads: in-app notification `"{sender.name} replied in your conversation"` — but only if the last notification for this thread was > 5 minutes ago (avoid spam for rapid back-and-forth)
- Links to `/messages/{threadId}`
- Uses existing `Notification` model

### Email

- **Only on new thread creation** (not replies)
- Subject: `"New message from {sender.name} on The Intellectual Exchange"`
- Body: message preview (first 200 chars) + "Reply on TIE" CTA button
- For `status: "REQUEST"` threads: add note "This is a message request — reply to accept"
- Uses existing `sendEmail` from `src/lib/email.ts`

### No email for:

- Replies within existing threads
- Job-linked thread messages (have their own notification flow)

## Edge Cases

- **User unfollows after sending DM:** Thread remains, messages stay. They can't send NEW messages in the thread until they re-follow. Existing thread is read-only for the unfollower.
- **Recipient blocks/deletes account:** Standard soft-delete handling — threads with deleted users are excluded from inbox queries.
- **Rate limit reset:** Rolling 24-hour window, not calendar day. Prevents gaming by waiting for midnight.
- **Existing job thread between same users:** Direct thread is separate from job thread. Users can have both.

## Files to Create/Modify

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add `type`, `status`, `creatorId` fields + index to `MessageThread`, update unique constraint |
| `src/server/actions/messages.ts` | Add `startDirectMessage`, `getDirectMessageLimit`, modify `replyToThread` and `getThreads` |
| `src/components/profile/researcher-profile.tsx` | Add "Message" button |
| `src/components/messages/thread-list.tsx` (or equivalent) | Add "Message request" label + thread type icons |

## Out of Scope

- Group DMs
- Read receipts
- Message editing/deletion
- File attachments in DMs
- Blocking/muting users
