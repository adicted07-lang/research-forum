# Batch 1: Core UX Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add in-app notifications UI, dark mode toggle, OG meta tags, and a seed data script to make the platform functional and demo-ready.

**Architecture:** All four features are independent. Notifications and dark mode toggle are client components added to the navbar. OG tags extend existing `generateMetadata` functions on dynamic pages. Seed script populates the database with realistic sample data.

**Tech Stack:** Next.js 16, next-themes, Prisma, bcryptjs, lucide-react

---

## File Structure

### New Files
- `src/components/notifications/notification-bell.tsx` — bell icon with unread badge + dropdown
- `src/components/theme/theme-toggle.tsx` — sun/moon toggle button
- `prisma/seed.ts` — database seed script

### Modified Files
- `src/components/ui/navbar.tsx` — add NotificationBell and ThemeToggle to desktop + mobile nav
- `src/app/layout.tsx` — add base OG metadata
- `src/app/(main)/forum/[slug]/page.tsx` — extend generateMetadata with OG tags
- `src/app/(main)/news/[slug]/page.tsx` — extend generateMetadata with OG tags
- `src/app/(main)/marketplace/[slug]/page.tsx` — extend generateMetadata with OG tags
- `src/app/(main)/user/[username]/page.tsx` — extend generateMetadata with OG tags
- `src/app/(main)/company/[username]/page.tsx` — extend generateMetadata with OG tags
- `src/app/(main)/hire/[slug]/page.tsx` — extend generateMetadata with OG tags
- `package.json` — add prisma seed command

---

## Task 1: In-App Notifications

**Files:**
- Create: `src/components/notifications/notification-bell.tsx`
- Modify: `src/components/ui/navbar.tsx`

- [ ] **Step 1: Create the NotificationBell component**

Create `src/components/notifications/notification-bell.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/server/actions/notifications";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  function handleOpen() {
    if (!isOpen) {
      startTransition(async () => {
        const results = await getNotifications(20);
        setNotifications(results);
      });
    }
    setIsOpen(!isOpen);
  }

  function handleClickNotification(notification: Notification) {
    if (!notification.isRead) {
      markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setIsOpen(false);
    if (notification.link) {
      window.location.href = notification.link;
    }
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface dark:hover:bg-surface-dark transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                <p className="text-sm text-text-tertiary">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border/50 dark:border-border-dark/50 hover:bg-surface dark:hover:bg-surface-dark transition-colors",
                    !n.isRead && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <div className={cn("min-w-0 flex-1", n.isRead && "ml-4")}>
                      <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-text-tertiary truncate mt-0.5">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-text-tertiary mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add NotificationBell to navbar**

In `src/components/ui/navbar.tsx`:

Add import at top:
```tsx
import { NotificationBell } from "@/components/notifications/notification-bell";
```

In the desktop nav (line ~207), add `<NotificationBell />` before the search:
```tsx
<div className="flex items-center gap-3">
  <SearchWithResults />
  <NotificationBell />
  {/* existing auth buttons */}
</div>
```

In the mobile nav sheet (line ~244), add `<NotificationBell />` next to the search:
```tsx
<div className="my-6 flex flex-col gap-6">
  <div className="flex items-center gap-2">
    <div className="flex-1">
      <SearchWithResults />
    </div>
    <NotificationBell />
  </div>
  {/* rest of mobile menu */}
</div>
```

- [ ] **Step 3: Verify build**

```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/notifications/notification-bell.tsx src/components/ui/navbar.tsx
git commit -m "feat: add in-app notification bell with dropdown"
```

---

## Task 2: Dark Mode Toggle

**Files:**
- Create: `src/components/theme/theme-toggle.tsx`
- Modify: `src/components/ui/navbar.tsx`

- [ ] **Step 1: Create ThemeToggle component**

Create `src/components/theme/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface dark:hover:bg-surface-dark transition-colors"
      aria-label="Toggle dark mode"
    >
      <Sun className="w-5 h-5 hidden dark:block" />
      <Moon className="w-5 h-5 block dark:hidden" />
    </button>
  );
}
```

- [ ] **Step 2: Add ThemeToggle to navbar**

In `src/components/ui/navbar.tsx`:

Add import:
```tsx
import { ThemeToggle } from "@/components/theme/theme-toggle";
```

In the desktop nav right section, add `<ThemeToggle />` after NotificationBell:
```tsx
<div className="flex items-center gap-3">
  <SearchWithResults />
  <NotificationBell />
  <ThemeToggle />
  {/* auth buttons */}
</div>
```

In the mobile nav, add next to NotificationBell:
```tsx
<div className="flex items-center gap-2">
  <div className="flex-1">
    <SearchWithResults />
  </div>
  <NotificationBell />
  <ThemeToggle />
</div>
```

- [ ] **Step 3: Verify build**

```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/theme/theme-toggle.tsx src/components/ui/navbar.tsx
git commit -m "feat: add dark mode toggle to navbar"
```

---

## Task 3: OG Meta Tags

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/(main)/forum/[slug]/page.tsx`
- Modify: `src/app/(main)/news/[slug]/page.tsx`
- Modify: `src/app/(main)/marketplace/[slug]/page.tsx`
- Modify: `src/app/(main)/user/[username]/page.tsx`
- Modify: `src/app/(main)/company/[username]/page.tsx`
- Modify: `src/app/(main)/hire/[slug]/page.tsx`

- [ ] **Step 1: Add base OG metadata to root layout**

In `src/app/layout.tsx`, extend the `metadata` export:

```tsx
export const metadata: Metadata = {
  title: "ResearchHub — Research Forum & Marketplace",
  description:
    "A professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
  openGraph: {
    title: "ResearchHub — Research Forum & Marketplace",
    description:
      "A professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
    siteName: "ResearchHub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResearchHub — Research Forum & Marketplace",
    description:
      "A professional platform for researchers, academics, and companies.",
  },
};
```

- [ ] **Step 2: Extend forum question page metadata**

In `src/app/(main)/forum/[slug]/page.tsx`, update `generateMetadata`:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);
  if (!question) return { title: "Question Not Found — ResearchHub" };

  const description = question.body.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: `${question.title} — ResearchHub`,
    description,
    openGraph: {
      title: question.title,
      description,
      type: "article",
      authors: [question.author.name ?? question.author.username ?? undefined].filter(Boolean) as string[],
    },
    twitter: {
      card: "summary",
      title: question.title,
      description,
    },
  };
}
```

- [ ] **Step 3: Extend news article page metadata**

In `src/app/(main)/news/[slug]/page.tsx`, update `generateMetadata`:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found — ResearchHub" };

  const description = article.body.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: `${article.title} — ResearchHub`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
      authors: [article.author.name ?? undefined].filter(Boolean) as string[],
    },
    twitter: {
      card: article.coverImage ? "summary_large_image" : "summary",
      title: article.title,
      description,
    },
  };
}
```

- [ ] **Step 4: Extend marketplace listing page metadata**

In `src/app/(main)/marketplace/[slug]/page.tsx`, update `generateMetadata` similarly:

```tsx
// Same pattern — use listing.title for title, listing.tagline or listing.description (strip HTML, slice 160) for description
// openGraph type: "website"
```

- [ ] **Step 5: Extend user profile page metadata**

In `src/app/(main)/user/[username]/page.tsx`, update `generateMetadata`:

```tsx
// Use researcher name for title: "{name} — ResearchHub"
// Use bio for description
// openGraph type: "profile"
```

- [ ] **Step 6: Extend company profile and hire page metadata**

Same pattern for `src/app/(main)/company/[username]/page.tsx` and `src/app/(main)/hire/[slug]/page.tsx`.

- [ ] **Step 7: Verify build**

```bash
source "$HOME/.nvm/nvm.sh" && npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/(main)/forum/[slug]/page.tsx src/app/(main)/news/[slug]/page.tsx src/app/(main)/marketplace/[slug]/page.tsx src/app/(main)/user/[username]/page.tsx src/app/(main)/company/[username]/page.tsx src/app/(main)/hire/[slug]/page.tsx
git commit -m "feat: add OpenGraph and Twitter Card meta tags to all pages"
```

---

## Task 4: Seed Data Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: Add seed command to package.json**

Add to `package.json` at root level:
```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Create the seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 12);

  // --- Users ---
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Chen",
      username: "alicechen",
      role: "RESEARCHER",
      bio: "Computational biologist specializing in genomics and machine learning applications in drug discovery.",
      about: "I'm a postdoc at MIT working on applying deep learning to protein structure prediction. Previously worked at DeepMind on AlphaFold-related projects. I love helping other researchers navigate the intersection of ML and biology.",
      expertise: ["Computational Biology", "Machine Learning", "Genomics", "Drug Discovery"],
      experienceYears: 8,
      hourlyRate: 150,
      availability: "AVAILABLE",
      points: 340,
      currentStreak: 5,
      longestStreak: 12,
      image: null,
      isVerified: true,
      socialLinks: { twitter: "@alicechen_bio", linkedin: "https://linkedin.com/in/alicechen", website: "https://alicechen.dev" },
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "alice@example.com",
          access_token: password,
        },
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Martinez",
      username: "bobmartinez",
      role: "RESEARCHER",
      bio: "Survey methodologist and data scientist with 12 years in public health research.",
      about: "I specialize in designing large-scale survey instruments and analyzing complex datasets for public health outcomes. Currently consulting for WHO on global health metrics.",
      expertise: ["Survey Design", "Biostatistics", "Public Health", "R Programming", "SPSS"],
      experienceYears: 12,
      hourlyRate: 120,
      availability: "BUSY",
      points: 580,
      currentStreak: 3,
      longestStreak: 21,
      isVerified: true,
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "bob@example.com",
          access_token: password,
        },
      },
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      email: "carol@example.com",
      name: "Carol Nguyen",
      username: "carolnguyen",
      role: "RESEARCHER",
      bio: "Qualitative researcher focused on UX research methods and human-computer interaction.",
      about: "PhD in HCI from Stanford. I run a small UX research consultancy and love teaching others about mixed-methods research design.",
      expertise: ["UX Research", "Qualitative Methods", "HCI", "Interview Design", "Ethnography"],
      experienceYears: 6,
      hourlyRate: 95,
      availability: "AVAILABLE",
      points: 210,
      currentStreak: 1,
      longestStreak: 7,
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "carol@example.com",
          access_token: password,
        },
      },
    },
  });

  const techcorp = await prisma.user.upsert({
    where: { email: "admin@techcorp.com" },
    update: {},
    create: {
      email: "admin@techcorp.com",
      username: "techcorp",
      role: "COMPANY",
      companyName: "TechCorp Research",
      description: "AI-first research company building tools for the next generation of scientists.",
      about: "TechCorp Research is a Series B startup developing AI-powered research tools. We work with universities and pharmaceutical companies to accelerate scientific discovery.",
      industry: "Technology",
      companySize: "SIZE_51_200",
      website: "https://techcorp.example.com",
      hiringStatus: "ACTIVELY_HIRING",
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "admin@techcorp.com",
          access_token: password,
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@researchhub.com" },
    update: {},
    create: {
      email: "admin@researchhub.com",
      name: "ResearchHub Admin",
      username: "admin",
      role: "ADMIN",
      bio: "Platform administrator",
      points: 0,
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "admin@researchhub.com",
          access_token: password,
        },
      },
    },
  });

  // --- Follows ---
  await prisma.follow.createMany({
    data: [
      { followerId: alice.id, followingId: bob.id },
      { followerId: bob.id, followingId: alice.id },
      { followerId: carol.id, followingId: alice.id },
      { followerId: carol.id, followingId: bob.id },
    ],
    skipDuplicates: true,
  });

  // --- Questions ---
  const q1 = await prisma.question.create({
    data: {
      title: "What's the best approach for handling missing data in longitudinal studies?",
      body: "<p>I'm working on a 10-year longitudinal study with about 15% missing data across waves. I've been using listwise deletion but I know that's not ideal. What are the current best practices?</p><p>Specifically interested in:</p><ul><li>Multiple imputation vs. FIML</li><li>How to handle MNAR data</li><li>Software recommendations (R preferred)</li></ul>",
      slug: "best-approach-missing-data-longitudinal-studies",
      tags: ["statistics", "missing-data", "longitudinal", "R"],
      category: "Research Methodologies",
      authorId: bob.id,
      upvoteCount: 12,
      viewCount: 234,
      answerCount: 3,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      title: "How do you validate a machine learning model for drug discovery?",
      body: "<p>We're building a GNN-based model for predicting drug-protein interactions. Our test set AUROC looks great (0.94) but I'm worried about data leakage and overfitting to the benchmark.</p><p>What validation strategies do you use beyond random train/test splits? Particularly interested in temporal splits and scaffold splits.</p>",
      slug: "validate-ml-model-drug-discovery",
      tags: ["machine-learning", "drug-discovery", "validation", "deep-learning"],
      category: "Research Methodologies",
      authorId: alice.id,
      upvoteCount: 18,
      viewCount: 456,
      answerCount: 2,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      title: "Tips for conducting remote user interviews across different cultures?",
      body: "<p>I'm starting a cross-cultural UX study with participants in Japan, Brazil, and Germany. I've done plenty of remote interviews but never across such different cultural contexts.</p><p>Looking for advice on:</p><ul><li>Adapting interview protocols</li><li>Working with translators</li><li>Cultural considerations for rapport building</li></ul>",
      slug: "remote-user-interviews-cross-cultural",
      tags: ["ux-research", "qualitative", "cross-cultural", "interviews"],
      category: "General Discussion",
      authorId: carol.id,
      upvoteCount: 8,
      viewCount: 178,
      answerCount: 2,
    },
  });

  const q4 = await prisma.question.create({
    data: {
      title: "Is p-value thresholding still appropriate in 2026?",
      body: "<p>With the ASA's statement on p-values and the growing Bayesian movement, I'm wondering if anyone has successfully transitioned their lab or research group away from NHST. What did the transition look like?</p>",
      slug: "p-value-thresholding-2026",
      tags: ["statistics", "bayesian", "methodology", "p-values"],
      category: "General Discussion",
      authorId: bob.id,
      upvoteCount: 24,
      viewCount: 567,
      answerCount: 3,
      bounty: 50,
    },
  });

  const q5 = await prisma.question.create({
    data: {
      title: "Best practices for reproducible computational experiments?",
      body: "<p>Our lab keeps running into issues where experiments from 6 months ago can't be reproduced due to dependency changes. We're using Python/PyTorch. What's your stack for ensuring reproducibility?</p><p>Currently looking at: Docker, DVC, MLflow, Weights & Biases</p>",
      slug: "reproducible-computational-experiments",
      tags: ["reproducibility", "python", "mlops", "best-practices"],
      category: "Research Methodologies",
      authorId: alice.id,
      upvoteCount: 15,
      viewCount: 312,
      answerCount: 0,
      status: "OPEN",
    },
  });

  // --- Answers ---
  const a1 = await prisma.answer.create({
    data: {
      body: "<p>For longitudinal data with 15% missingness, I'd strongly recommend <strong>multiple imputation</strong> using the <code>mice</code> package in R. Here's why:</p><ul><li>FIML is great but assumes your model is correctly specified</li><li>MI is more flexible and lets you check imputation quality</li><li>For MNAR, look into pattern-mixture models or selection models</li></ul><p>Key tip: include auxiliary variables in your imputation model — they don't need to be in your analysis model but they improve imputation quality significantly.</p>",
      authorId: alice.id,
      questionId: q1.id,
      upvoteCount: 8,
      isAccepted: true,
    },
  });

  await prisma.answer.create({
    data: {
      body: "<p>Adding to Alice's answer — if your data is MAR (which 15% usually is), <code>mice</code> with predictive mean matching works beautifully. I've used it on datasets with up to 40% missingness.</p><p>One thing to watch: make sure your imputation model includes the outcome variable. It's a common mistake to leave it out.</p>",
      authorId: carol.id,
      questionId: q1.id,
      upvoteCount: 4,
    },
  });

  await prisma.answer.create({
    data: {
      body: "<p>Don't overlook the <code>Amelia</code> package for time-series cross-sectional data. It's specifically designed for longitudinal/panel data and handles time trends natively.</p>",
      authorId: bob.id,
      questionId: q1.id,
      upvoteCount: 3,
    },
  });

  await prisma.answer.create({
    data: {
      body: "<p>Scaffold splits are essential for drug discovery ML. Random splits inflate metrics because similar molecules end up in both train and test sets.</p><p>Our validation pipeline:</p><ol><li>Scaffold split (Murcko scaffolds)</li><li>Temporal split (compounds before/after a cutoff date)</li><li>Target-based split for interaction prediction</li></ol><p>We also use a prospective validation set — compounds tested after model training. That's the real test.</p>",
      authorId: bob.id,
      questionId: q2.id,
      upvoteCount: 11,
      isAccepted: true,
    },
  });

  await prisma.answer.create({
    data: {
      body: "<p>One thing that's underrated: <strong>leave-one-cluster-out cross-validation</strong>. Cluster your compounds by some meaningful property (scaffold, target family, etc.) and hold out entire clusters.</p><p>Also, always report confidence intervals on your metrics, not just point estimates. Bootstrap your test set at minimum.</p>",
      authorId: carol.id,
      questionId: q2.id,
      upvoteCount: 6,
    },
  });

  await prisma.answer.create({
    data: {
      body: "<p>I've done extensive cross-cultural research in Japan and Germany. Key tips:</p><ul><li><strong>Japan:</strong> Longer warm-up, indirect questions work better. Silence is comfortable — don't rush to fill it. Use a native speaker as co-moderator, not just a translator.</li><li><strong>Germany:</strong> Be direct and structured. German participants appreciate knowing the exact agenda and time commitment.</li><li><strong>Brazil:</strong> Build personal connection first. Be flexible with scheduling. Participants may bring family members — embrace it.</li></ul>",
      authorId: alice.id,
      questionId: q3.id,
      upvoteCount: 9,
    },
  });

  await prisma.answer.create({
    data: {
      body: "<p>One practical tip: use back-translation for your interview guide. Have it translated to the target language, then have a different translator convert it back to English. Compare the two English versions for meaning drift.</p>",
      authorId: bob.id,
      questionId: q3.id,
      upvoteCount: 5,
    },
  });

  // Answers for q4
  await prisma.answer.createMany({
    data: [
      {
        body: "<p>Our lab transitioned to Bayesian methods two years ago. The biggest challenge wasn't the statistics — it was getting reviewers to accept Bayes factors and credible intervals instead of p-values.</p><p>My advice: use both during the transition. Report p-values for the reviewers, but make your actual decisions based on effect sizes and Bayesian posteriors.</p>",
        authorId: alice.id,
        questionId: q4.id,
        upvoteCount: 14,
      },
      {
        body: "<p>I think the real issue isn't p-values vs. Bayes — it's dichotomous thinking. Whether you use a p-value threshold or a Bayes factor threshold, the problem is treating evidence as binary.</p><p>Report effect sizes with confidence/credible intervals. Let readers judge the evidence themselves.</p>",
        authorId: carol.id,
        questionId: q4.id,
        upvoteCount: 19,
      },
      {
        body: "<p>Practical suggestion: check out the <code>bayestestR</code> package in R. It provides a nice bridge — you can compute both frequentist and Bayesian equivalents side by side.</p>",
        authorId: bob.id,
        questionId: q4.id,
        upvoteCount: 7,
      },
    ],
  });

  // Update q1 status to ANSWERED since it has an accepted answer
  await prisma.question.update({
    where: { id: q1.id },
    data: { status: "ANSWERED" },
  });
  await prisma.question.update({
    where: { id: q2.id },
    data: { status: "ANSWERED" },
  });

  // --- Listings ---
  await prisma.listing.create({
    data: {
      title: "Statistical Analysis & Data Visualization Service",
      tagline: "Expert statistical consulting for academic research and clinical trials",
      description: "<p>I provide comprehensive statistical analysis services including:</p><ul><li>Study design and power analysis</li><li>Descriptive and inferential statistics</li><li>Survival analysis and longitudinal modeling</li><li>Publication-ready figures and tables</li></ul><p>12 years of experience across public health, psychology, and biomedical research.</p>",
      slug: "statistical-analysis-data-visualization",
      type: "SERVICE",
      categoryTags: ["statistics", "data-analysis", "visualization", "R"],
      pricingInfo: "Starting at $80/hour",
      websiteUrl: "https://bobstats.example.com",
      authorId: bob.id,
      isActive: true,
      upvoteCount: 7,
    },
  });

  await prisma.listing.create({
    data: {
      title: "ResearchKit — Open-Source Survey Builder for Academics",
      tagline: "Build complex research surveys with branching logic, randomization, and built-in analytics",
      description: "<p>ResearchKit is a free, open-source survey platform designed specifically for academic research:</p><ul><li>IRB-compliant data collection</li><li>Complex branching and skip logic</li><li>Randomized block design support</li><li>Built-in consent forms</li><li>Export to SPSS, R, and CSV</li></ul>",
      slug: "researchkit-survey-builder",
      type: "TOOL",
      categoryTags: ["surveys", "open-source", "data-collection", "research-tools"],
      pricingInfo: "Free (open-source)",
      websiteUrl: "https://researchkit.example.com",
      demoUrl: "https://demo.researchkit.example.com",
      authorId: carol.id,
      isActive: true,
      upvoteCount: 14,
    },
  });

  await prisma.listing.create({
    data: {
      title: "AI-Powered Literature Review Assistant",
      tagline: "Summarize papers, find connections, and generate citation maps with GPT-4",
      description: "<p>Stop spending weeks on literature reviews. Our tool:</p><ul><li>Analyzes full-text PDFs in seconds</li><li>Identifies key themes and gaps</li><li>Generates structured summaries</li><li>Creates interactive citation network graphs</li><li>Exports to BibTeX, Zotero, and Mendeley</li></ul>",
      slug: "ai-literature-review-assistant",
      type: "TOOL",
      categoryTags: ["AI", "literature-review", "productivity", "NLP"],
      pricingInfo: "$29/month for researchers, free for students",
      websiteUrl: "https://litreview.example.com",
      authorId: alice.id,
      isActive: true,
      upvoteCount: 22,
    },
  });

  // --- Jobs ---
  await prisma.job.create({
    data: {
      title: "Senior ML Research Engineer — Drug Discovery",
      description: "<p>We're looking for an experienced ML researcher to join our drug discovery team. You'll work on graph neural networks for molecular property prediction and generative models for drug design.</p><h3>Requirements</h3><ul><li>PhD in ML, computational chemistry, or related field</li><li>3+ years industry experience</li><li>Strong publication record</li><li>Experience with PyTorch Geometric or DGL</li></ul><h3>What we offer</h3><ul><li>Competitive salary ($180-240K)</li><li>Equity package</li><li>Conference budget</li><li>20% time for personal research</li></ul>",
      slug: "senior-ml-research-engineer-drug-discovery",
      researchDomain: ["machine-learning", "drug-discovery", "computational-chemistry"],
      requiredSkills: ["PyTorch", "GNN", "Python", "molecular-modeling"],
      projectType: "FULL_TIME",
      budgetMin: 180000,
      budgetMax: 240000,
      locationPreference: "HYBRID",
      companyId: techcorp.id,
      status: "OPEN",
    },
  });

  await prisma.job.create({
    data: {
      title: "Freelance UX Researcher — Healthcare App Redesign",
      description: "<p>3-month contract to lead user research for a major redesign of our healthcare management app. Need someone experienced with medical/health UX.</p><h3>Scope</h3><ul><li>User interviews (20 participants)</li><li>Usability testing (3 rounds)</li><li>Journey mapping</li><li>Research report with design recommendations</li></ul>",
      slug: "freelance-ux-researcher-healthcare",
      researchDomain: ["ux-research", "healthcare", "user-interviews"],
      requiredSkills: ["user-interviews", "usability-testing", "figma", "healthcare-UX"],
      projectType: "CONTRACT",
      budgetMin: 8000,
      budgetMax: 15000,
      budgetNegotiable: true,
      timeline: "3 months",
      locationPreference: "REMOTE",
      companyId: techcorp.id,
      status: "OPEN",
    },
  });

  // --- Articles ---
  await prisma.article.create({
    data: {
      title: "The Replication Crisis Is Not Over — Here's What We Should Do About It",
      body: "<p>Five years after the initial shockwaves of the replication crisis, the research community has made progress but still faces fundamental challenges. Open science practices are growing but far from universal.</p><p>In this article, I argue for three concrete steps every lab can take today:</p><h2>1. Pre-registration should be the default</h2><p>Pre-registering hypotheses and analysis plans eliminates the garden of forking paths. Tools like OSF and AsPredicted make it trivial.</p><h2>2. Share your data and code</h2><p>If your analysis can't be reproduced from your shared materials, your paper is incomplete. Use repositories like Zenodo or Figshare.</p><h2>3. Embrace adversarial collaboration</h2><p>Instead of arguing about conflicting results in separate papers, design studies together with researchers who disagree with you.</p>",
      slug: "replication-crisis-what-to-do",
      authorId: bob.id,
      category: "news",
      tags: ["replication-crisis", "open-science", "methodology"],
      readTime: 5,
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-20"),
      upvoteCount: 31,
    },
  });

  await prisma.article.create({
    data: {
      title: "How AI Is Changing Peer Review — For Better and Worse",
      body: "<p>Large language models are increasingly being used in the peer review process, from automated screening to full review generation. This raises important questions about quality, bias, and the future of academic publishing.</p><h2>The Good</h2><p>AI can help with desk rejection of clearly out-of-scope or low-quality submissions, freeing editors' time. It can also flag statistical errors and methodological issues that human reviewers might miss.</p><h2>The Bad</h2><p>LLM-generated reviews tend to be generic and miss the nuanced, domain-specific insights that make peer review valuable. There's also a fairness concern: AI systems trained on existing literature may perpetuate biases against novel or unconventional research.</p>",
      slug: "ai-changing-peer-review",
      authorId: alice.id,
      category: "news",
      tags: ["AI", "peer-review", "publishing", "LLMs"],
      readTime: 4,
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-22"),
      upvoteCount: 18,
    },
  });

  await prisma.article.create({
    data: {
      title: "A Beginner's Guide to Mixed Methods Research Design",
      body: "<p>Mixed methods research combines quantitative and qualitative approaches to provide a more complete understanding of research problems. Here's how to get started.</p><h2>When to use mixed methods</h2><p>Use mixed methods when neither quantitative nor qualitative approaches alone can answer your research question. Common scenarios include exploring a phenomenon (qual) before measuring it (quant), or explaining unexpected quantitative results with qualitative follow-up.</p><h2>Common designs</h2><p><strong>Sequential Explanatory:</strong> Quant → Qual. Collect quantitative data first, then use qualitative data to explain the results.</p><p><strong>Sequential Exploratory:</strong> Qual → Quant. Explore qualitatively first, then test findings quantitatively.</p><p><strong>Convergent:</strong> Collect both simultaneously and merge results for comparison.</p>",
      slug: "beginners-guide-mixed-methods",
      authorId: carol.id,
      category: "news",
      tags: ["mixed-methods", "methodology", "beginner", "research-design"],
      readTime: 6,
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-24"),
      upvoteCount: 25,
    },
  });

  await prisma.article.create({
    data: {
      title: "Why Every Researcher Should Learn to Code in 2026",
      body: "<p>Programming is no longer optional for researchers. Whether you're in the humanities or the hard sciences, coding skills will make you more productive, more employable, and better at research.</p><h2>Start with Python or R</h2><p>Both are free, have massive communities, and cover 90% of research computing needs. Python is more general-purpose; R is stronger for statistics.</p><h2>Automate the boring stuff</h2><p>Data cleaning, reformatting, and basic analysis can be automated. Time spent learning to code pays for itself within months.</p>",
      slug: "researchers-should-learn-to-code",
      authorId: alice.id,
      category: "news",
      tags: ["coding", "python", "R", "skills"],
      readTime: 3,
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-25"),
      upvoteCount: 42,
    },
  });

  await prisma.article.create({
    data: {
      title: "The Ethics of Using Social Media Data in Research",
      body: "<p>Social media platforms are a goldmine of research data, but using them raises serious ethical questions about consent, privacy, and representativeness.</p><h2>Consent in public spaces</h2><p>Just because a tweet is public doesn't mean the user consented to being studied. Many IRBs now require additional justification for social media research.</p><h2>Representativeness</h2><p>Social media users are not representative of the general population. Any findings should be contextualized within this limitation.</p>",
      slug: "ethics-social-media-data-research",
      authorId: bob.id,
      category: "news",
      tags: ["ethics", "social-media", "privacy", "methodology"],
      readTime: 4,
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-26"),
      upvoteCount: 15,
    },
  });

  // --- Notifications ---
  await prisma.notification.createMany({
    data: [
      {
        userId: bob.id,
        type: "answer",
        title: "Alice Chen answered your question",
        body: "What's the best approach for handling missing data...",
        link: "/forum/best-approach-missing-data-longitudinal-studies",
      },
      {
        userId: alice.id,
        type: "follow",
        title: "Carol Nguyen started following you",
        link: "/user/carolnguyen",
      },
      {
        userId: carol.id,
        type: "answer",
        title: "Alice Chen answered your question",
        body: "Tips for conducting remote user interviews...",
        link: "/forum/remote-user-interviews-cross-cultural",
      },
      {
        userId: alice.id,
        type: "upvote",
        title: "Your answer received 8 upvotes",
        body: "On: What's the best approach for handling missing data...",
        link: "/forum/best-approach-missing-data-longitudinal-studies",
      },
      {
        userId: bob.id,
        type: "follow",
        title: "Alice Chen started following you",
        link: "/user/alicechen",
      },
    ],
  });

  // --- Votes (sample) ---
  await prisma.vote.createMany({
    data: [
      { userId: alice.id, targetType: "QUESTION", targetId: q4.id, value: "UPVOTE" },
      { userId: bob.id, targetType: "QUESTION", targetId: q2.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "QUESTION", targetId: q1.id, value: "UPVOTE" },
      { userId: carol.id, targetType: "ANSWER", targetId: a1.id, value: "UPVOTE" },
    ],
    skipDuplicates: true,
  });

  // --- Badges ---
  await prisma.badge.createMany({
    data: [
      { userId: alice.id, name: "Gone Streaking 10", category: "streak" },
      { userId: alice.id, name: "Top Answerer", category: "expertise" },
      { userId: bob.id, name: "Gone Streaking 5", category: "streak" },
      { userId: bob.id, name: "Gone Streaking 10", category: "streak" },
      { userId: bob.id, name: "Gone Streaking 25", category: "streak" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete!");
  console.log("Login credentials for all users: password123");
  console.log("Users: alice@example.com, bob@example.com, carol@example.com, admin@techcorp.com, admin@researchhub.com");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 3: Install tsx if needed and verify seed runs**

```bash
source "$HOME/.nvm/nvm.sh"
npx tsx --version || npm install -D tsx
npx prisma db seed
```

Expected: "Seed complete!" with no errors.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add database seed script with sample users, questions, and content"
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

- [ ] **Step 4: Final commit if needed**

```bash
git add -A && git commit -m "fix: resolve build issues from batch 1"
```
