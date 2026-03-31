# ResearchHub Platform Improvements — Design Spec

**Date:** 2026-03-31
**Scope:** 14 items across UI polish, feature additions, and infrastructure

## Items Overview

| # | Item | Category |
|---|------|----------|
| 3 | Social icons on profile | Medium |
| 5 | Hide search on profile pages | Quick |
| 7 | Add research domains to questions | Medium |
| 8 | Google AdSense sidebar integration | Large |
| 10 | Automated AI news generation | Large |
| 11 | Icons in news categories sidebar | Medium |
| 12 | About Us & Contact Us pages | Medium |
| 13 | SEO technical foundations | Large |
| 14 | Remove Office Hours | Quick |
| 15 | Homepage section icons | Quick |
| 16 | Corporate email validation | Medium |
| 17 | Trending topic icons | Quick |
| 18 | Change "Join 12,000+" to "500+" | Quick |
| 19 | Floating chat widget (LinkedIn-style) | Large |

---

## Section 1: Quick Changes

### #18 — Change "Join 12,000+" to "500+"

**File:** `src/app/(main)/page.tsx` line 56
**Change:** Replace `"Join 12,000+ researchers"` with `"Join 500+ researchers"`

### #5 — Hide search on profile pages

**File:** `src/components/ui/navbar.tsx`
**Approach:**
- Import `usePathname()` from `next/navigation`
- Add: `const pathname = usePathname(); const isProfilePage = pathname.startsWith("/profile/");`
- Wrap `<SearchWithResults />` at line 229 (desktop) and line 271 (mobile) with `{!isProfilePage && ...}`

### #14 — Remove Office Hours

**Files to delete:**
- `src/app/(main)/office-hours/` (entire directory — page.tsx, [slug]/page.tsx, new/page.tsx)
- `src/components/office-hours/` (entire directory)
- Related server actions in `src/server/actions/office-hours.ts`

**Files to modify:**
- `src/components/ui/footer.tsx` line 53: Remove `{ label: "Office Hours", href: "/office-hours" }` from Hiring column
- `src/components/ui/mobile-bottom-nav.tsx`: Remove any Office Hours references
- Any navbar references (none found currently)

**Schema change:**
- Remove `OfficeHour` model from `prisma/schema.prisma`
- Generate migration: `npx prisma migrate dev --name remove-office-hours`
- Note: This drops the office_hours table and any existing data. Acceptable since the feature is being fully removed.

### #15 — Homepage section icons

**File:** `src/app/(main)/page.tsx`
**Imports:** `Flame, LayoutGrid, Users, Newspaper` from `lucide-react`

**Changes to section headers:**
- "Trending Questions" → `<Flame className="w-5 h-5 text-primary" />` + text
- "Top Services & Tools" → `<LayoutGrid className="w-5 h-5 text-primary" />` + text
- "Hire a Researcher" → `<Users className="w-5 h-5 text-primary" />` + text
- "Latest News" → `<Newspaper className="w-5 h-5 text-primary" />` + text

**Style:** Inline flex, 8px gap between icon and text.

### #17 — Trending topic icons

**File:** `src/app/(main)/page.tsx` lines 31-45

**Tag-to-icon mapping:**
```typescript
const TAG_ICONS: Record<string, LucideIcon> = {
  "machine-learning": Brain,
  "climate-science": Globe,
  "genomics": Dna,
  "neuroscience": Activity,
  "statistics": BarChart3,
  "deep-learning": Network,
  "epidemiology": HeartPulse,
  "quantum-computing": Atom,
  "nlp": MessageSquare,
  "bioinformatics": Database,
};
```

**Rendering:** For each tag in POPULAR_TAGS, look up icon from TAG_ICONS and render it inline (14px) inside the BadgePill link, before the label text.

---

## Section 2: Medium Changes

### #3 — Social icons on profile

**Files:**
- `src/components/profile/researcher-profile.tsx` lines 189-212
- `src/components/profile/company-profile.tsx` lines 198-224

**Current state:** Text links for website, Twitter, LinkedIn.

**Change:** Replace text links with icon buttons in a horizontal row in the profile header area.

**Icons (Lucide):**
- LinkedIn → `Linkedin` (20px)
- Twitter/X → `Twitter` (20px)
- Website → `Globe` (20px)
- GitHub → `Github` (20px) — render only if field exists

**Style:**
- Horizontal flex row with 8px gap
- Icons: `text-muted-foreground hover:text-primary` transition
- Wrapped in `<a>` tags with `target="_blank" rel="noopener noreferrer"`

### #7 — Add research domains to questions

**Schema change (`prisma/schema.prisma`):**
- Add to Question model (around line 300): `researchDomain String?`
- Migration: `npx prisma migrate dev --name add-question-research-domain`

**Domain values (reuse from jobs):**
```
Machine Learning, Data Science, Bioinformatics, Climate Science,
Neuroscience, Physics, Chemistry, Economics, Social Sciences,
Genomics, Statistics, Epidemiology, Quantum Computing, NLP, Other
```

**UI changes:**
- **Ask Question form** (`src/components/forum/`): Add optional dropdown/select for research domain before tags field
- **Question cards**: Show domain as a subtle colored badge (e.g., `<BadgePill variant="default" />`) next to existing tags
- **Forum page** (`src/app/(main)/forum/page.tsx`): Add domain filter dropdown alongside existing tag/sort filters
- **Server action** (`src/server/actions/questions.ts`): Accept `researchDomain` parameter in `getQuestions()` for filtering, include in `createQuestion()`

### #11 — Icons in news categories sidebar

**File:** `src/components/news/news-sidebar.tsx`

**Category-to-icon mapping:**
```typescript
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  News: Newspaper,
  Opinion: MessageCircle,
  "How-To": BookOpen,
  Interview: Mic,
  Announcement: Megaphone,
  Makers: Wrench,
};
```

**Rendering:** Add 16px icon inline before each category label. Style: `text-muted-foreground`, 8px gap.

### #12 — About Us & Contact Us pages

**New files:**
- `src/app/(main)/about/page.tsx`
- `src/app/(main)/contact/page.tsx`

**About Us page:**
- Uses PageLayout wrapper
- Sections: Hero/Mission, Team (placeholder), Values (placeholder)
- Metadata: `title: "About Us — ResearchHub"`
- Content: Placeholder text — user will provide actual content later via URLs

**Contact Us page:**
- Uses PageLayout wrapper
- Contact form: Name, Email, Subject, Message fields
- Server action: `sendContactEmail()` using existing Resend integration
- Sends email to `support@researchhub.com`
- Success toast via Sonner
- Metadata: `title: "Contact Us — ResearchHub"`

**Footer update (`src/components/ui/footer.tsx`):**
- Add to Legal column: `{ label: "About Us", href: "/about" }` and `{ label: "Contact Us", href: "/contact" }`

### #16 — Corporate email validation

**New file:** `src/lib/validations/corporate-email.ts`

```typescript
const FREE_EMAIL_PROVIDERS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "live.com", "aol.com", "icloud.com", "protonmail.com",
  "mail.com", "zoho.com", "yandex.com", "tutanota.com",
  "gmx.com", "fastmail.com", "hey.com",
];

export function isCorporateEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && !FREE_EMAIL_PROVIDERS.includes(domain);
}
```

**Client-side:** In company signup form (`src/components/auth/company-signup-form.tsx`), validate email on blur and on submit. Show error: "Please use your company email address."

**Server-side:** In company signup server action (`src/server/actions/auth.ts` or equivalent company signup action), call `isCorporateEmail()` and reject with error if free email provider detected.

---

## Section 3: Large Changes

### #8 — Google AdSense integration

**New file:** `src/components/shared/ad-unit.tsx`

```typescript
interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical";
  className?: string;
}
```

**Behavior:**
- Reads `NEXT_PUBLIC_ADSENSE_ID` from `process.env`
- If no ID configured, renders nothing (dev/staging safe)
- Uses `useEffect` to push ad after mount
- Renders `<ins className="adsbygoogle" ...>` with data attributes

**Root layout (`src/app/layout.tsx`):**
- Add AdSense script tag: `<Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX" crossOrigin="anonymous" />`
- Only loads when `NEXT_PUBLIC_ADSENSE_ID` is set

**Placements (sidebar only):**
- Homepage sidebar: Below Trending Topics card
- Forum sidebar: Below any existing sidebar content
- News sidebar: Below categories section

**No ads on:** Profile, dashboard, settings, auth, admin pages.

### #10 — Automated AI news generation

**New dependency:** `@anthropic-ai/sdk`

**New file:** `src/lib/claude.ts`
```typescript
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Schema change (`prisma/schema.prisma`):**
- Add to Article model: `isAIGenerated Boolean @default(false)`
- Migration: `npx prisma migrate dev --name add-ai-generated-flag`

**Modified file:** `src/app/api/cron/rss-poll/route.ts`

**New flow:**
1. Fetch RSS items (existing)
2. For each new item, call Claude API:
   - Model: `claude-sonnet-4-6` (fast, cost-effective for content generation)
   - System prompt: "You are a professional science journalist writing for ResearchHub, a platform for researchers and academics."
   - User prompt: "Write a comprehensive article (minimum 800 words) based on this research news. Include: an engaging introduction, key findings and methodology, implications for the field, and a conclusion. Source: {title} — {description} — {sourceUrl}"
   - Max tokens: 2000
3. Save generated content as article body
4. Set `isAIGenerated: true`, `status: "PUBLISHED"`
5. Include attribution: "Source: {sourceTitle}" with link to `sourceUrl`

**UI change:**
- Article cards (`src/components/news/`): Show subtle "AI Generated" badge when `isAIGenerated === true`
- Style: Small muted badge, non-intrusive

**Rate limiting:**
- Cap at 5 articles per cron run to control API costs
- Process newest items first, remaining will be picked up on next poll

**Error handling:**
- If Claude API fails for an item, fall back to saving raw RSS description (current behavior)
- Log errors but don't block other items

### #13 — SEO Technical Foundations

**New file:** `src/app/sitemap.ts`
- Dynamic sitemap using Next.js `MetadataRoute.Sitemap`
- Includes: static pages (/forum, /marketplace, /hire, /news, /researchers, /grants, /leaderboard, /about, /contact)
- Dynamic pages: all published questions, articles, job listings, user profiles
- Fetches slugs from Prisma
- Sets `changeFrequency` and `priority` per page type

**New file:** `src/app/robots.ts`
- `MetadataRoute.Robots` format
- Allow all user agents
- Disallow: `/admin`, `/api`, `/dashboard`, `/settings`, `/messages`, `/login`, `/signup`
- Sitemap URL: `{NEXT_PUBLIC_URL}/sitemap.xml`

**New file:** `src/lib/structured-data.ts`
- Helper functions to generate JSON-LD objects:
  - `organizationSchema()` — ResearchHub org info
  - `questionSchema(question)` — QAPage schema for forum questions
  - `articleSchema(article)` — Article schema for news
  - `jobSchema(job)` — JobPosting schema
  - `personSchema(user)` — Person schema for researcher profiles
  - `organizationProfileSchema(company)` — Organization schema for company profiles

**JSON-LD placement:**
- Root layout: `<script type="application/ld+json">` with Organization schema
- `src/app/(main)/forum/[slug]/page.tsx`: QAPage schema
- `src/app/(main)/news/[slug]/page.tsx`: Article schema
- `src/app/(main)/hire/[slug]/page.tsx`: JobPosting schema
- `src/app/(main)/profile/[username]/page.tsx`: Person or Organization schema

**Canonical URLs:**
- Add `alternates: { canonical: "https://researchhub.com{path}" }` to metadata in all page files
- Requires `NEXT_PUBLIC_URL` env var

**OpenGraph improvements:**
- Forum questions: OG title = question title, OG description = first 160 chars of body
- Articles: OG title = article title, OG image = coverImage if available
- Jobs: OG title = job title + company, OG description = summary
- Profiles: OG title = user name + role, OG description = bio

### #19 — Floating chat widget (LinkedIn-style)

A persistent bottom-right floating messaging widget visible on all pages (except auth pages). Two components:

**1. Messaging Hub Pill** — always visible when logged in
- Fixed to bottom-right corner
- Shows: user avatar + "Messaging" label + unread count badge (red circle)
- Action buttons: options (three dots), compose (pen icon), expand/collapse (chevron)
- Click chevron to expand: reveals thread list dropdown with search + recent conversations
- Clicking a thread opens a mini-chat window

**2. Mini Chat Windows** — open when a conversation is active
- Appears to the left of the messaging hub pill
- Header bar: avatar + name + online indicator + close (X) button
- Collapsible: click header to minimize to just the bar
- Body: scrollable message area with same bubble styles as /messages page
- Input: attachment + emoji toolbar buttons, text input, send button
- Max 2 mini-chats open simultaneously (oldest auto-minimizes)

**New files:**
- `src/components/messages/floating-chat-widget.tsx` — Main widget container, manages open chats state
- `src/components/messages/messaging-hub.tsx` — The hub pill with thread list dropdown
- `src/components/messages/mini-chat.tsx` — Individual mini chat window

**Integration:**
- Render in `src/app/(main)/layout.tsx` — only for authenticated users
- Uses existing `getThreads()`, `getMessages()`, `sendMessage()` server actions
- Uses existing `getUnreadMessageCount()` for badge count
- State management: React state for open/minimized chats (max 2 open)

**Behavior:**
- Hub starts collapsed (just the bar)
- Clicking a thread in hub opens mini-chat + collapses hub
- Closing a mini-chat removes it; clicking hub re-expands thread list
- New message notification: bump unread badge count
- On `/messages` page: hide the floating widget (full page takes over)

**Styling:**
- Hub bar + mini-chat header: `bg-primary` with white text (matches ResearchHub primary #DA552F)
- Mini-chat body: white background with existing message bubble styles
- Shadow: `shadow-lg` for floating elevation
- Border-radius: `rounded-md rounded-b-none` (rounded top, flat bottom to sit on screen edge)
- Z-index: 50 (above page content, below modals)

---

## Environment Variables

New env vars required:
- `NEXT_PUBLIC_ADSENSE_ID` — Google AdSense publisher ID (optional, ads disabled without it)
- `ANTHROPIC_API_KEY` — For Claude API article generation
- `NEXT_PUBLIC_URL` — Base URL for canonical links and sitemap (e.g., `https://researchhub.com`)

---

## Database Migrations

1. Remove `OfficeHour` model (#14)
2. Add `researchDomain String?` to Question model (#7)
3. Add `isAIGenerated Boolean @default(false)` to Article model (#10)

Run as separate migrations in order.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/components/shared/ad-unit.tsx` | Reusable AdSense component |
| `src/lib/claude.ts` | Anthropic client singleton |
| `src/lib/validations/corporate-email.ts` | Free email provider blocklist |
| `src/lib/structured-data.ts` | JSON-LD schema generators |
| `src/app/sitemap.ts` | Dynamic sitemap |
| `src/app/robots.ts` | Robots.txt |
| `src/app/(main)/about/page.tsx` | About Us page |
| `src/app/(main)/contact/page.tsx` | Contact Us page |
| `src/components/messages/floating-chat-widget.tsx` | Floating widget container |
| `src/components/messages/messaging-hub.tsx` | Hub pill with thread list |
| `src/components/messages/mini-chat.tsx` | Mini chat window |

## Files Modified

| File | Changes |
|------|---------|
| `src/app/(main)/page.tsx` | #15 section icons, #17 tag icons, #18 text change |
| `src/components/ui/navbar.tsx` | #5 hide search on profile |
| `src/components/ui/footer.tsx` | #14 remove Office Hours, #12 add About/Contact links |
| `src/components/profile/researcher-profile.tsx` | #3 social icon buttons |
| `src/components/profile/company-profile.tsx` | #3 social icon buttons |
| `src/components/news/news-sidebar.tsx` | #11 category icons |
| `src/components/forum/` (ask form + cards) | #7 research domain field |
| `src/server/actions/questions.ts` | #7 domain filter/create |
| `src/app/api/cron/rss-poll/route.ts` | #10 Claude API integration |
| `src/app/layout.tsx` | #8 AdSense script, #13 Organization JSON-LD |
| `src/app/(main)/forum/[slug]/page.tsx` | #13 QAPage JSON-LD + canonical |
| `src/app/(main)/news/[slug]/page.tsx` | #13 Article JSON-LD + canonical |
| `src/app/(main)/hire/[slug]/page.tsx` | #13 JobPosting JSON-LD + canonical |
| `src/app/(main)/profile/[username]/page.tsx` | #13 Person/Org JSON-LD + canonical |
| `prisma/schema.prisma` | #7, #10, #14 schema changes |
| Company signup form + server action | #16 email validation |
| `src/app/(main)/layout.tsx` | #19 render floating chat widget for authenticated users |
