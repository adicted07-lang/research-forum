# Batch 3: Advanced Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bounty system for questions, peer review workflow for articles, DM polish (read receipts, unread counts in nav), and user-facing analytics dashboard.

**Architecture:** Bounty extends existing question/answer actions with point deduction/award on accept. Peer review adds reviewer assignment and review UI. DM polish adds real-time unread indicators. Analytics queries existing models to compute user stats.

**Tech Stack:** Next.js 16, Prisma, existing points system

---

## Task 1: Bounty System

Wire bounty points flow: deduct from asker on question create, award to answerer on accept.

**Files:**
- Modify: `src/server/actions/questions.ts` — deduct bounty points on create
- Modify: `src/server/actions/answers.ts` — award bounty to accepted answerer
- Modify: `src/components/forum/question-detail.tsx` — show bounty expiry, award status

### Changes:

In `createQuestion` (questions.ts): after creating the question, if bounty > 0, deduct points from the asker:
```typescript
if (parsed.data.bounty > 0) {
  deductPoints(session.user.id, parsed.data.bounty);
}
```

In `acceptAnswer` (answers.ts): after accepting, if the question has a bounty > 0, award it to the answerer:
```typescript
// After the transaction, fetch question bounty
const q = await db.question.findUnique({ where: { id: answer.question.id }, select: { bounty: true } });
if (q?.bounty && q.bounty > 0) {
  awardPoints(answer.authorId, q.bounty);
}
```

In question-detail.tsx: if bounty > 0 and status is ANSWERED, show "Bounty awarded" instead of amount.

---

## Task 2: Peer Review Workflow

Add reviewer assignment and structured review UI for article submissions.

**Files:**
- Create: `src/server/actions/reviews.ts` — assign reviewer, submit review
- Create: `src/components/news/review-form.tsx` — reviewer feedback form
- Modify: `src/app/admin/news/page.tsx` — add review actions to moderation queue

### Changes:

Create `src/server/actions/reviews.ts` with:
- `assignReviewer(articleId, reviewerId)` — admin assigns a reviewer
- `submitReview(articleId, decision, feedback)` — reviewer submits review (approve/reject/revise with feedback)
- `getArticlesForReview()` — get articles assigned to current user for review

Create `src/components/news/review-form.tsx`:
- Form with decision radio (Approve/Request Revisions/Reject) + feedback textarea
- Calls submitReview action

Modify admin news page to show reviewer assignment UI.

---

## Task 3: DM Polish

Add unread message count to navbar and read receipt indicators.

**Files:**
- Create: `src/components/messages/unread-badge.tsx` — navbar unread count
- Modify: `src/components/ui/navbar.tsx` — add unread message indicator
- Modify: `src/app/(main)/messages/[threadId]/page.tsx` — add read receipts

### Changes:

Create unread badge component that fetches `getUnreadMessageCount()` on mount and displays count in navbar next to a Mail icon.

Add to navbar between NotificationBell and ThemeToggle.

In thread detail page, show "Read" indicator on sent messages that have been read.

---

## Task 4: User Analytics Dashboard

Add personal analytics section to the dashboard showing user's stats.

**Files:**
- Create: `src/server/actions/analytics.ts` — compute user stats
- Create: `src/components/dashboard/analytics-cards.tsx` — stat cards
- Modify: `src/app/(main)/dashboard/page.tsx` — add analytics section

### Changes:

Create `src/server/actions/analytics.ts` with `getUserAnalytics(userId)` returning:
- Total questions asked, total answers given
- Total upvotes received (across questions + answers)
- Total points, reputation tier
- Profile views (from question view counts)
- Acceptance rate (accepted answers / total answers)

Create analytics cards component showing stats in a grid.

Add to top of ResearcherDashboard and CompanyDashboard.
