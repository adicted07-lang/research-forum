# Skill Endorsements — Design Spec

## Overview

Add a skill endorsement system to researcher profiles on The Intellectual Exchange. Users can endorse specific skills on other researchers' profiles, building visible credibility signals. Endorsements are displayed as counts on expertise tags with an endorser list.

## Decisions

- Any logged-in user can endorse any researcher's listed skills
- Endorsers pick from the researcher's existing `expertise` array only
- Endorsement count and endorser names are publicly visible
- Both parties earn points: endorsee +3 IC, endorser +1 IC
- No limit on endorsements (unique constraint is the natural cap)
- "Endorsed Expert" badge awarded when any skill reaches 10+ endorsements

## Data Model

New Prisma model added to `schema.prisma`:

```prisma
model SkillEndorsement {
  id         String   @id @default(cuid())
  endorserId String
  endorseeId String
  skill      String
  createdAt  DateTime @default(now())

  endorser   User @relation("EndorsementsGiven", fields: [endorserId], references: [id], onDelete: Cascade)
  endorsee   User @relation("EndorsementsReceived", fields: [endorseeId], references: [id], onDelete: Cascade)

  @@unique([endorserId, endorseeId, skill])
  @@index([endorseeId])
  @@index([endorserId])
  @@map("skill_endorsements")
}
```

Two new relation fields on the User model:
- `endorsementsGiven SkillEndorsement[] @relation("EndorsementsGiven")`
- `endorsementsReceived SkillEndorsement[] @relation("EndorsementsReceived")`

## Server Actions

File: `src/server/actions/endorsements.ts`

### `toggleEndorsement(endorseeId: string, skill: string)`

1. Auth check — must be logged in
2. Reject self-endorsement
3. Normalize `skill` to lowercase with hyphens before comparison
4. Validate normalized `skill` exists in endorsee's `expertise` array (case-insensitive match)
5. If endorsement exists: delete it, deduct points only if balance >= amount (clamp at 0)
6. If not: create it, award 3 IC to endorsee, 1 IC to endorser
7. On create: send in-app notification to endorsee (skip if same endorser+skill notification already exists)
8. On create: check if endorsee now has any skill with 10+ endorsements — if so and they don't have the "Endorsed Expert" badge, award it
9. Badge is never revoked on un-endorse
10. Revalidate the profile page path

### `getEndorsements(userId: string)`

Returns endorsements grouped by skill, sorted by count descending:

```typescript
type EndorsementSummary = {
  skill: string;
  count: number;
  endorsers: { id: string; name: string; image: string | null }[]; // max 10, ordered by createdAt desc
};
```

Query fetches `count` via `_count` aggregation and `endorsers` with `take: 10` per skill to avoid unbounded payloads.

### `getMyEndorsementsForUser(endorseeId: string)`

Returns `string[]` — list of skills the current user has endorsed for a specific person. Used by the UI to show filled/unfilled state.

## UI Changes

### Enhanced Expertise Section on Profile

File: `src/components/profile/researcher-profile.tsx`

Current: expertise tags displayed as plain `BadgePill` components.

Changed to:
- Each skill tag shows endorsement count: `conjoint-analysis (8)`
- Skills sorted by endorsement count descending
- When viewing another user's profile: each skill has a "+1" endorse button
- Clicking toggles endorsement with optimistic state update
- Already-endorsed skills show a highlighted/filled state
- Own profile: no endorse buttons, counts still visible

### Endorsers Popover

New component: `src/components/profile/endorsers-popover.tsx`

- Triggered by clicking the endorsement count
- Shows endorser avatars + names (links to their profiles)
- Max 10 displayed, overflow shows "and N more"

### Endorse Button

New component: `src/components/profile/endorse-button.tsx`

- Client component following the existing `FollowButton` pattern
- Optimistic state toggle — on failure, rolls back both the filled state AND the count
- Calls `toggleEndorsement` server action
- Redirects to login if not authenticated

## Notifications

- Type: in-app only (no email — too noisy)
- Message: `"{endorser.name} endorsed your {skill} skill"`
- Links to endorser's profile
- Uses existing `Notification` model, no schema change

## Points

| Event | Endorsee | Endorser |
|-------|----------|----------|
| Endorse | +3 IC | +1 IC |
| Un-endorse | -3 IC (clamped at 0) | -1 IC (clamped at 0) |

Uses existing `awardPoints` / `deductPoints` from `src/server/actions/points.ts`. Deductions are clamped — never reduce points below zero.

## Edge Cases

- **Skill removed from profile after endorsements:** Endorsement rows remain in DB but are hidden from the UI (only skills in the current `expertise` array are displayed). If the skill is re-added, endorsements reappear.
- **User deleted:** Soft-deleted users (`deletedAt` set) — endorsements remain but are excluded from queries via `deletedAt IS NULL` joins. Hard-deleted users — endorsement rows are cascade-deleted via `onDelete: Cascade` on both relations.
- **Re-endorse notification spam:** If user A endorses, un-endorses, and re-endorses the same skill, only one notification is sent (skip if existing notification for same endorser+skill pair exists).

## Badge

- **Name:** "Endorsed Expert"
- **Category:** "expertise"
- **Trigger:** Any single skill reaches 10+ endorsements
- **Check runs:** Inside `toggleEndorsement` after creating a new endorsement
- **Logic:** Query endorsee's max endorsement count per skill. If any >= 10 and badge not already earned, award it.

## Files to Create/Modify

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add SkillEndorsement model + User relations |
| `src/server/actions/endorsements.ts` | Create — all endorsement logic |
| `src/components/profile/endorse-button.tsx` | Create — toggle button component |
| `src/components/profile/endorsers-popover.tsx` | Create — endorser list popover |
| `src/components/profile/researcher-profile.tsx` | Modify — enhance expertise section |
| `src/lib/points-config.ts` | Add ENDORSE_SKILL / RECEIVE_ENDORSEMENT constants |
| `src/server/actions/badges.ts` | Add "Endorsed Expert" badge check |

## Out of Scope

- Endorsement analytics or leaderboards
- Email notifications for endorsements
- Endorsing skills not on the researcher's profile
- Rate limiting endorsements
