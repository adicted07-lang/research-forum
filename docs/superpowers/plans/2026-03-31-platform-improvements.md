# ResearchHub Platform Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 14 improvements across UI polish, feature additions, and infrastructure for the ResearchHub platform.

**Architecture:** All changes build on the existing Next.js 16 App Router codebase with Prisma ORM, server actions, and Lucide icons. Changes are grouped into independent tasks that can be committed separately. Three Prisma migrations are needed (run in order). IMPORTANT: Next.js 16 breaking change — `params` and `searchParams` are Promises and must be awaited. Read `node_modules/next/dist/docs/` before writing code per AGENTS.md.

**Tech Stack:** Next.js 16.2.1, React 19, Prisma 7.5, TypeScript 5, Tailwind CSS 4, Lucide React, Anthropic SDK, Resend

---

## File Structure

**New files:**
| File | Responsibility |
|------|---------------|
| `src/lib/validations/corporate-email.ts` | Free email provider blocklist + validation |
| `src/lib/claude.ts` | Anthropic API client singleton |
| `src/lib/structured-data.ts` | JSON-LD schema generator helpers |
| `src/components/shared/ad-unit.tsx` | Reusable Google AdSense slot component |
| `src/app/(main)/about/page.tsx` | About Us page (placeholder content) |
| `src/app/(main)/contact/page.tsx` | Contact Us page with form |
| `src/app/sitemap.ts` | Dynamic sitemap generation |
| `src/app/robots.ts` | Robots.txt generation |
| `src/components/messages/floating-chat-widget.tsx` | Floating widget container + state |
| `src/components/messages/messaging-hub.tsx` | Hub pill with thread dropdown |
| `src/components/messages/mini-chat.tsx` | Mini chat window component |

**Modified files:**
| File | What changes |
|------|-------------|
| `prisma/schema.prisma` | Remove OfficeHour, add researchDomain to Question, add isAIGenerated to Article |
| `src/app/(main)/page.tsx` | Section icons, tag icons, "500+" text |
| `src/components/ui/navbar.tsx` | Hide search on /profile/* |
| `src/components/ui/footer.tsx` | Remove Office Hours link, add About/Contact links |
| `src/components/profile/researcher-profile.tsx` | Social icon buttons |
| `src/components/profile/company-profile.tsx` | Social icon buttons |
| `src/components/news/news-sidebar.tsx` | Category icons |
| `src/server/actions/questions.ts` | researchDomain in create + filter |
| `src/app/api/cron/rss-poll/route.ts` | Claude API article generation |
| `src/app/layout.tsx` | AdSense script, Organization JSON-LD |
| `src/app/(main)/layout.tsx` | Floating chat widget |
| `src/components/auth/company-signup-form.tsx` | Corporate email validation |
| `src/app/(main)/forum/[slug]/page.tsx` | QAPage JSON-LD + canonical |
| `src/app/(main)/news/[slug]/page.tsx` | Article JSON-LD + canonical |
| `src/app/(main)/hire/[slug]/page.tsx` | JobPosting JSON-LD + canonical |
| `src/app/(main)/profile/[username]/page.tsx` | Person/Org JSON-LD + canonical |

**Deleted files:**
| File | Reason |
|------|--------|
| `src/app/(main)/office-hours/` | Feature removed (#14) |
| `src/components/office-hours/` | Feature removed (#14) |
| `src/server/actions/office-hours.ts` | Feature removed (#14) |

---

### Task 1: Quick text + icon changes (#18, #15, #17)

**Files:**
- Modify: `src/app/(main)/page.tsx`

- [ ] **Step 1: Change "Join 12,000+" to "Join 500+"**

In `src/app/(main)/page.tsx`, find line 56:
```typescript
          Join 12,000+ researchers
```
Replace with:
```typescript
          Join 500+ researchers
```

- [ ] **Step 2: Add section icon imports**

At top of `src/app/(main)/page.tsx`, add import after existing imports (after line 9):
```typescript
import { Flame, LayoutGrid, Users, Newspaper, Brain, Globe, Dna, Activity, BarChart3, Network, HeartPulse, Atom, MessageSquare, Database, type LucideIcon } from "lucide-react";
```

- [ ] **Step 3: Add TAG_ICONS map**

After the `POPULAR_TAGS` array (after line 14), add:
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

- [ ] **Step 4: Add icons to section headers**

Replace each `<SectionHeader>` with an icon-prefixed version. For "Trending Questions" (line 62):
```typescript
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-primary" />
          <SectionHeader title="Trending Questions" href="/forum" />
        </div>
```

Repeat for:
- "Top Services & Tools" (line 85): `<LayoutGrid className="w-5 h-5 text-primary" />`
- "Hire a Researcher" (line 104): `<Users className="w-5 h-5 text-primary" />`
- "Latest News" (line 123): `<Newspaper className="w-5 h-5 text-primary" />`

Note: Check `SectionHeader` component — if it renders its own wrapper, you may need to adjust the flex container. Read the component first.

- [ ] **Step 5: Add icons to trending topic tags**

In the sidebar section (lines 37-42), replace the BadgePill rendering:
```typescript
              {POPULAR_TAGS.map((tag) => {
                const Icon = TAG_ICONS[tag];
                return (
                  <Link key={tag} href={`/forum?tag=${tag}`}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-lighter text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {tag}
                    </span>
                  </Link>
                );
              })}
```

- [ ] **Step 6: Verify the homepage renders**

Run: `cd /Users/akshay/research-forum && npx next dev`

Open http://localhost:3000 and verify:
- "Join 500+ researchers" text
- Section headers have icons
- Trending topics have per-tag icons

- [ ] **Step 7: Commit**

```bash
git add src/app/\(main\)/page.tsx
git commit -m "feat: add section icons, tag icons, update join count (#15, #17, #18)"
```

---

### Task 2: Hide search on profile pages (#5)

**Files:**
- Modify: `src/components/ui/navbar.tsx`

- [ ] **Step 1: Add usePathname import and conditional**

The navbar is a client component. Add `usePathname` import at the top of the file alongside other next/navigation imports:
```typescript
import { usePathname } from "next/navigation";
```

Inside the `Navbar1` component (after line 185), add:
```typescript
  const pathname = usePathname();
  const isProfilePage = pathname?.startsWith("/profile/");
```

- [ ] **Step 2: Wrap desktop search conditionally**

At line 229, wrap `<SearchWithResults />`:
```typescript
            {!isProfilePage && <SearchWithResults />}
```

- [ ] **Step 3: Wrap mobile search conditionally**

At line 271, wrap the mobile `<SearchWithResults />`:
```typescript
                    {!isProfilePage && (
                      <div className="flex-1">
                        <SearchWithResults />
                      </div>
                    )}
```

- [ ] **Step 4: Verify**

Open a profile page (e.g., http://localhost:3000/profile/someuser) — search should be hidden. Navigate to homepage — search should appear.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/navbar.tsx
git commit -m "feat: hide search bar on profile pages (#5)"
```

---

### Task 3: Remove Office Hours (#14)

**Files:**
- Delete: `src/app/(main)/office-hours/` (entire directory)
- Delete: `src/components/office-hours/` (entire directory)
- Delete: `src/server/actions/office-hours.ts`
- Modify: `src/components/ui/footer.tsx`
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Delete Office Hours pages and components**

```bash
rm -rf src/app/\(main\)/office-hours/
rm -rf src/components/office-hours/
rm -f src/server/actions/office-hours.ts
```

- [ ] **Step 2: Remove footer link**

In `src/components/ui/footer.tsx`, remove from the Hiring column links array (line 53):
```typescript
        { label: "Office Hours", href: "/office-hours" },
```

- [ ] **Step 3: Check for other references**

Search the codebase for any remaining "office-hours" references:
```bash
grep -r "office-hours\|office_hours\|OfficeHour" src/ --include="*.tsx" --include="*.ts" -l
```

Remove any found references (likely in mobile-bottom-nav.tsx or other nav components).

- [ ] **Step 4: Remove OfficeHour model from schema**

In `prisma/schema.prisma`, find and delete the entire `model OfficeHour { ... }` block and any related enums.

- [ ] **Step 5: Generate migration**

```bash
cd /Users/akshay/research-forum && npx prisma migrate dev --name remove-office-hours
```

Expected: Migration created successfully, drops the office_hours table.

- [ ] **Step 6: Verify build**

```bash
npx next build 2>&1 | head -50
```

Expected: No import errors for deleted files.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: remove Office Hours feature (#14)"
```

---

### Task 4: Social icon buttons on profiles (#3)

**Files:**
- Modify: `src/components/profile/researcher-profile.tsx`
- Modify: `src/components/profile/company-profile.tsx`

- [ ] **Step 1: Update researcher profile social links**

In `src/components/profile/researcher-profile.tsx`, add import:
```typescript
import { Linkedin, Twitter, Github } from "lucide-react";
```

Replace the social links section (lines 190-213) with:
```typescript
            {(links.website || links.twitter || links.linkedin) && (
              <div className="flex items-center gap-2 mt-2">
                {links.website && (
                  <a href={links.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-text-tertiary hover:text-primary hover:bg-primary-lighter transition-colors" title="Website">
                    <LinkIcon className="w-5 h-5" />
                  </a>
                )}
                {links.twitter && (
                  <a href={`https://twitter.com/${links.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-text-tertiary hover:text-primary hover:bg-primary-lighter transition-colors" title="Twitter">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {links.linkedin && (
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-text-tertiary hover:text-primary hover:bg-primary-lighter transition-colors" title="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
```

- [ ] **Step 2: Update company profile social links**

In `src/components/profile/company-profile.tsx`, add import:
```typescript
import { Linkedin, Twitter } from "lucide-react";
```

Replace the social links section (lines 198-224) with the same icon button pattern (using existing `links` object).

- [ ] **Step 3: Verify on a profile page**

Check both researcher and company profiles render icon buttons correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/researcher-profile.tsx src/components/profile/company-profile.tsx
git commit -m "feat: replace social text links with icon buttons on profiles (#3)"
```

---

### Task 5: News category icons (#11)

**Files:**
- Modify: `src/components/news/news-sidebar.tsx`

- [ ] **Step 1: Add icon imports and mapping**

At top of `src/components/news/news-sidebar.tsx`, add:
```typescript
import { Newspaper, MessageCircle, BookOpen, Mic, Megaphone, Wrench, type LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  news: Newspaper,
  opinion: MessageCircle,
  how_to: BookOpen,
  interview: Mic,
  announcement: Megaphone,
  makers: Wrench,
};
```

- [ ] **Step 2: Add icons to category links**

In the category list rendering (line 42), add the icon before the label:
```typescript
              <Link
                href={`/news?category=${encodeURIComponent(cat.value)}`}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-primary hover:bg-primary-lighter rounded-md transition-colors"
              >
                {CATEGORY_ICONS[cat.value] && (() => {
                  const Icon = CATEGORY_ICONS[cat.value];
                  return <Icon className="w-4 h-4 text-text-tertiary" />;
                })()}
                {cat.label}
              </Link>
```

- [ ] **Step 3: Verify on /news page**

Check categories show icons inline.

- [ ] **Step 4: Commit**

```bash
git add src/components/news/news-sidebar.tsx
git commit -m "feat: add icons to news category sidebar (#11)"
```

---

### Task 6: About Us & Contact Us pages (#12)

**Files:**
- Create: `src/app/(main)/about/page.tsx`
- Create: `src/app/(main)/contact/page.tsx`
- Modify: `src/components/ui/footer.tsx`

- [ ] **Step 1: Create About Us page**

Create `src/app/(main)/about/page.tsx`:
```typescript
import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";

export const metadata: Metadata = {
  title: "About Us — ResearchHub",
  description: "Learn about ResearchHub, the professional platform for researchers, academics, and companies.",
};

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12 space-y-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
            About ResearchHub
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
            ResearchHub is a professional platform connecting researchers, academics, and companies to share knowledge, collaborate, and advance science together.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">Our Mission</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            We believe that research thrives when knowledge is shared openly. Our mission is to build the best platform for the research community — a place to ask questions, find collaborators, hire experts, and discover tools that accelerate scientific progress.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">Our Team</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            Content coming soon.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">Our Values</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            Content coming soon.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Create Contact Us page**

Create `src/app/(main)/contact/page.tsx`:
```typescript
import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us — ResearchHub",
  description: "Get in touch with the ResearchHub team.",
};

export default function ContactPage() {
  return (
    <PageLayout>
      <div className="max-w-xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2 text-center">
          Contact Us
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary text-center mb-8">
          Have a question or feedback? We'd love to hear from you.
        </p>
        <ContactForm />
      </div>
    </PageLayout>
  );
}
```

Create `src/app/(main)/contact/contact-form.tsx`:
```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-8">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Name</label>
        <input id="name" name="name" type="text" required placeholder="Your name" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@example.com" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors" />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Subject</label>
        <input id="subject" name="subject" type="text" required placeholder="How can we help?" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Message</label>
        <textarea id="message" name="message" required rows={5} placeholder="Tell us more..." className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors resize-none" />
      </div>
      <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
```

Create `src/app/api/contact/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  try {
    await sendEmail({
      to: "support@researchhub.com",
      subject: `Contact Form: ${subject}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p>`,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
```

Note: Check `src/lib/email.ts` for the exact `sendEmail` function signature and adjust the API route accordingly.

- [ ] **Step 3: Add footer links**

In `src/components/ui/footer.tsx`, find the Legal column links array and add:
```typescript
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
```

- [ ] **Step 4: Verify pages render**

Visit http://localhost:3000/about and http://localhost:3000/contact. Check footer links work.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(main\)/about/ src/app/\(main\)/contact/ src/app/api/contact/ src/components/ui/footer.tsx
git commit -m "feat: add About Us and Contact Us pages (#12)"
```

---

### Task 7: Corporate email validation (#16)

**Files:**
- Create: `src/lib/validations/corporate-email.ts`
- Modify: `src/components/auth/company-signup-form.tsx`
- Modify: Server action for company signup

- [ ] **Step 1: Create validation utility**

Create `src/lib/validations/corporate-email.ts`:
```typescript
const FREE_EMAIL_PROVIDERS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "live.com", "aol.com", "icloud.com", "protonmail.com",
  "mail.com", "zoho.com", "yandex.com", "tutanota.com",
  "gmx.com", "fastmail.com", "hey.com", "pm.me",
  "proton.me", "yahoo.co.uk", "hotmail.co.uk",
];

export function isCorporateEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return !FREE_EMAIL_PROVIDERS.includes(domain);
}
```

- [ ] **Step 2: Add client-side validation to company signup form**

In `src/components/auth/company-signup-form.tsx`, add import:
```typescript
import { isCorporateEmail } from "@/lib/validations/corporate-email";
```

Add state for email error (after line 12):
```typescript
  const [emailError, setEmailError] = useState<string | null>(null);
```

Add email blur handler:
```typescript
  function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const email = e.target.value;
    if (email && !isCorporateEmail(email)) {
      setEmailError("Please use your company email address");
    } else {
      setEmailError(null);
    }
  }
```

Add `onBlur={handleEmailBlur}` to the email input (line 94), and display error below it:
```typescript
              {emailError && (
                <p className="mt-1 text-xs text-error">{emailError}</p>
              )}
```

Also add validation in handleSubmit before calling server action:
```typescript
    const email = formData.get("email") as string;
    if (!isCorporateEmail(email)) {
      setError("Please use your company email address");
      setLoading(false);
      return;
    }
```

- [ ] **Step 3: Add server-side validation**

Find the `companySignupAction` server action (imported from `@/server/actions/auth`). Add:
```typescript
import { isCorporateEmail } from "@/lib/validations/corporate-email";
```

Before creating the user, add check:
```typescript
  const email = formData.get("email") as string;
  if (!isCorporateEmail(email)) {
    return { error: "Please use your company email address" };
  }
```

- [ ] **Step 4: Verify**

Go to http://localhost:3000/signup/company, try entering a gmail.com email — should show error on blur and reject on submit.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/corporate-email.ts src/components/auth/company-signup-form.tsx src/server/actions/auth.ts
git commit -m "feat: add corporate email validation for company signup (#16)"
```

---

### Task 8: Add research domains to questions (#7)

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/server/actions/questions.ts`
- Modify: Forum ask form component
- Modify: Question card component
- Modify: `src/app/(main)/forum/page.tsx`

- [ ] **Step 1: Add field to Prisma schema**

In `prisma/schema.prisma`, add to the Question model (after line 295, after `category`):
```prisma
  researchDomain String?
```

- [ ] **Step 2: Generate migration**

```bash
cd /Users/akshay/research-forum && npx prisma migrate dev --name add-question-research-domain
```

- [ ] **Step 3: Update createQuestion server action**

In `src/server/actions/questions.ts`, add `researchDomain` to the form data extraction (around line 37):
```typescript
    researchDomain: formData.get("researchDomain") as string | null,
```

And include it in the `db.question.create` data (around line 52):
```typescript
        researchDomain: raw.researchDomain || null,
```

- [ ] **Step 4: Update getQuestions filter**

In the `getQuestions` function (around line 79), add domain filter:
```typescript
  if (opts.researchDomain) where.researchDomain = opts.researchDomain;
```

Add `researchDomain?: string` to the opts type (around line 66).

- [ ] **Step 5: Add domain dropdown to Ask Question form**

Find the ask question form component (search `src/components/forum/` for the form). Add a dropdown before the tags field:

```typescript
const RESEARCH_DOMAINS = [
  "Machine Learning", "Data Science", "Bioinformatics", "Climate Science",
  "Neuroscience", "Physics", "Chemistry", "Economics", "Social Sciences",
  "Genomics", "Statistics", "Epidemiology", "Quantum Computing", "NLP", "Other",
];
```

Render as a `<select>` with name="researchDomain":
```typescript
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
              Research Domain <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <select name="researchDomain" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors">
              <option value="">Select domain...</option>
              {RESEARCH_DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
```

- [ ] **Step 6: Show domain badge on question cards**

Find the question card rendering (in homepage and forum pages). If `q.researchDomain` exists, add a badge:
```typescript
                {q.researchDomain && <BadgePill label={q.researchDomain} />}
```

- [ ] **Step 7: Add domain filter to forum page**

In `src/app/(main)/forum/page.tsx`, add a domain filter dropdown alongside existing filters. Pass the `researchDomain` search param to `getQuestions()`.

- [ ] **Step 8: Verify**

Create a new question with a domain selected. Check it appears on question cards and can be filtered.

- [ ] **Step 9: Commit**

```bash
git add prisma/ src/server/actions/questions.ts src/components/forum/ src/app/\(main\)/forum/
git commit -m "feat: add research domain field to forum questions (#7)"
```

---

### Task 9: Google AdSense integration (#8)

**Files:**
- Create: `src/components/shared/ad-unit.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/(main)/page.tsx` (sidebar)
- Modify: `src/components/news/news-sidebar.tsx`

- [ ] **Step 1: Create AdUnit component**

Create `src/components/shared/ad-unit.tsx`:
```typescript
"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical";
  className?: string;
}

export function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || !adRef.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [adsenseId]);

  if (!adsenseId) return null;

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

- [ ] **Step 2: Add AdSense script to root layout**

In `src/app/layout.tsx`, add import:
```typescript
import Script from "next/script";
```

Inside the `<head>` or before `</body>`, add (only if env var is set):
```typescript
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
```

Note: Check Next.js 16 docs for Script component placement — read `node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md`.

- [ ] **Step 3: Add ad slot to homepage sidebar**

In `src/app/(main)/page.tsx`, after the Trending Topics card in the sidebar, add:
```typescript
          <AdUnit slot="homepage-sidebar" format="rectangle" className="mt-4" />
```

Add import: `import { AdUnit } from "@/components/shared/ad-unit";`

- [ ] **Step 4: Add ad slot to news sidebar**

In `src/components/news/news-sidebar.tsx`, after the categories card, add:
```typescript
      <AdUnit slot="news-sidebar" format="rectangle" />
```

Add import: `import { AdUnit } from "@/components/shared/ad-unit";`

- [ ] **Step 5: Add ad slot to forum sidebar**

Find the forum page that uses a sidebar (likely `src/app/(main)/forum/page.tsx` or its sidebar component). Add below existing sidebar content:
```typescript
      <AdUnit slot="forum-sidebar" format="rectangle" />
```

Add import: `import { AdUnit } from "@/components/shared/ad-unit";`

- [ ] **Step 6: Verify**

Without `NEXT_PUBLIC_ADSENSE_ID` set, the component should render nothing. No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/ad-unit.tsx src/app/layout.tsx src/app/\(main\)/page.tsx src/components/news/news-sidebar.tsx
git commit -m "feat: add Google AdSense integration with sidebar placements (#8)"
```

---

### Task 10: Automated AI news generation (#10)

**Files:**
- Create: `src/lib/claude.ts`
- Modify: `prisma/schema.prisma`
- Modify: `src/app/api/cron/rss-poll/route.ts`
- Modify: News article card component

- [ ] **Step 1: Install Anthropic SDK**

```bash
cd /Users/akshay/research-forum && npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Create Claude client**

Create `src/lib/claude.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

- [ ] **Step 3: Add isAIGenerated to Article model**

In `prisma/schema.prisma`, add to Article model (after line 628, after `isFeatured`):
```prisma
  isAIGenerated   Boolean       @default(false)
```

- [ ] **Step 4: Generate migration**

```bash
npx prisma migrate dev --name add-ai-generated-flag
```

- [ ] **Step 5: Update RSS poll route with Claude API**

In `src/app/api/cron/rss-poll/route.ts`, add import at top:
```typescript
import { anthropic } from "@/lib/claude";
```

Replace the article creation loop (lines 72-96) with:
```typescript
        const newItems = [];
        for (const item of items.slice(0, 10)) {
          const exists = await db.article.findFirst({
            where: { sourceUrl: item.link },
          });
          if (exists) continue;
          newItems.push(item);
        }

        // Cap at 5 per run to control API costs
        for (const item of newItems.slice(0, 5)) {
          let body = item.description || `<p>Read the full article at <a href="${item.link}">${item.link}</a></p>`;
          let isAIGenerated = false;

          if (process.env.ANTHROPIC_API_KEY) {
            try {
              const response = await anthropic.messages.create({
                model: "claude-sonnet-4-6",
                max_tokens: 2000,
                system: "You are a professional science journalist writing for ResearchHub, a platform for researchers and academics. Write in HTML format.",
                messages: [{
                  role: "user",
                  content: `Write a comprehensive article (minimum 800 words) based on this research news. Include: an engaging introduction, key findings and methodology, implications for the field, and a conclusion. At the end, add a source attribution line.\n\nTitle: ${item.title}\nDescription: ${item.description}\nSource URL: ${item.link}`,
                }],
              });
              const textBlock = response.content.find((b: any) => b.type === "text");
              if (textBlock && "text" in textBlock) {
                body = textBlock.text;
                isAIGenerated = true;
              }
            } catch (err) {
              console.error(`Claude API failed for "${item.title}":`, err);
              // Fall back to raw description
            }
          }

          const wordCount = body.trim().split(/\s+/).length;
          const slug = generateSlug(item.title);

          await db.article.create({
            data: {
              title: item.title,
              body,
              slug,
              authorId: admin.id,
              category: "news",
              sourceUrl: item.link,
              sourceTitle: source.name,
              readTime: Math.max(1, Math.ceil(wordCount / 200)),
              status: "PUBLISHED",
              publishedAt: new Date(),
              isAIGenerated,
            },
          });
          totalCreated++;
        }
```

- [ ] **Step 6: Add AI Generated badge to article cards**

Find the article card component (in `src/components/news/` or wherever articles are rendered). Add after the title or in the metadata area:
```typescript
              {article.isAIGenerated && (
                <span className="text-[10px] font-medium text-text-tertiary bg-surface dark:bg-surface-dark px-1.5 py-0.5 rounded">
                  AI Generated
                </span>
              )}
```

- [ ] **Step 7: Verify**

Without `ANTHROPIC_API_KEY` set, the cron should fall back to raw RSS descriptions (existing behavior).

- [ ] **Step 8: Commit**

```bash
git add src/lib/claude.ts prisma/ src/app/api/cron/rss-poll/route.ts src/components/news/ package.json package-lock.json
git commit -m "feat: AI-generated articles from RSS using Claude API (#10)"
```

---

### Task 11: SEO technical foundations (#13)

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/lib/structured-data.ts`
- Modify: `src/app/layout.tsx`
- Modify: Multiple detail pages for JSON-LD + canonical

- [ ] **Step 1: Create robots.ts**

Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md` first for correct API.

Create `src/app/robots.ts`:
```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://researchhub.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/dashboard", "/settings", "/messages", "/login", "/signup"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Create sitemap.ts**

Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` first for correct API — note v16 breaking change with `id` being a Promise.

Create `src/app/sitemap.ts`:
```typescript
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://researchhub.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/forum`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/marketplace`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/hire`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/news`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${baseUrl}/researchers`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/grants`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/leaderboard`, changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const [questions, articles, jobs, users] = await Promise.all([
    db.question.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
    db.article.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { slug: true, updatedAt: true } }),
    db.job.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
    db.user.findMany({ where: { deletedAt: null }, select: { username: true, updatedAt: true } }),
  ]);

  const dynamicPages: MetadataRoute.Sitemap = [
    ...questions.map((q) => ({ url: `${baseUrl}/forum/${q.slug}`, lastModified: q.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${baseUrl}/news/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...jobs.map((j) => ({ url: `${baseUrl}/hire/${j.slug}`, lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...users.map((u) => ({ url: `${baseUrl}/profile/${u.username}`, lastModified: u.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];

  return [...staticPages, ...dynamicPages];
}
```

- [ ] **Step 3: Create structured data helpers**

Create `src/lib/structured-data.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://researchhub.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ResearchHub",
    url: BASE_URL,
    description: "A professional platform for researchers, academics, and companies.",
    sameAs: [],
  };
}

export function questionSchema(question: { title: string; body: string; slug: string; createdAt: Date; author: { name: string | null }; answers: { body: string; createdAt: Date; author: { name: string | null } }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question.title,
      text: question.body.slice(0, 500),
      dateCreated: question.createdAt.toISOString(),
      author: { "@type": "Person", name: question.author.name || "Anonymous" },
      answerCount: question.answers.length,
      acceptedAnswer: question.answers[0] ? {
        "@type": "Answer",
        text: question.answers[0].body.slice(0, 500),
        dateCreated: question.answers[0].createdAt.toISOString(),
        author: { "@type": "Person", name: question.answers[0].author.name || "Anonymous" },
      } : undefined,
    },
  };
}

export function articleSchema(article: { title: string; body: string; slug: string; publishedAt: Date | null; coverImage: string | null; author: { name: string | null } }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedAt?.toISOString(),
    author: { "@type": "Person", name: article.author.name || "Anonymous" },
    publisher: { "@type": "Organization", name: "ResearchHub", url: BASE_URL },
    image: article.coverImage || undefined,
    url: `${BASE_URL}/news/${article.slug}`,
  };
}

export function jobSchema(job: { title: string; slug: string; locationPreference: string; projectType: string; createdAt: Date; company: { companyName: string | null } }) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    datePosted: job.createdAt.toISOString(),
    hiringOrganization: { "@type": "Organization", name: job.company.companyName || "Unknown" },
    jobLocationType: job.locationPreference === "REMOTE" ? "TELECOMMUTE" : undefined,
    url: `${BASE_URL}/hire/${job.slug}`,
  };
}

export function personSchema(user: { name: string | null; username: string; about: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name || user.username,
    url: `${BASE_URL}/profile/${user.username}`,
    description: user.about?.slice(0, 160) || undefined,
  };
}

export function organizationProfileSchema(company: { companyName: string | null; username: string; about: string | null; website: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.companyName || company.username,
    url: company.website || `${BASE_URL}/profile/${company.username}`,
    description: company.about?.slice(0, 160) || undefined,
  };
}
```

- [ ] **Step 4: Add Organization JSON-LD to root layout**

In `src/app/layout.tsx`, add import and render in body:
```typescript
import { organizationSchema } from "@/lib/structured-data";
```

Before `{children}`:
```typescript
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
            />
```

- [ ] **Step 5: Add JSON-LD + canonical to forum detail page**

In `src/app/(main)/forum/[slug]/page.tsx`, in the `generateMetadata` function, add canonical:
```typescript
    alternates: { canonical: `${process.env.NEXT_PUBLIC_URL || "https://researchhub.com"}/forum/${slug}` },
```

In the page component, render JSON-LD:
```typescript
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(questionSchema(question)) }}
      />
```

- [ ] **Step 6: Add JSON-LD + canonical to news, hire, and profile detail pages**

Repeat the pattern for:
- `src/app/(main)/news/[slug]/page.tsx` → `articleSchema()`
- `src/app/(main)/hire/[slug]/page.tsx` → `jobSchema()`
- `src/app/(main)/profile/[username]/page.tsx` → `personSchema()`

Remember: In Next.js 16, `params` is a Promise — `const { slug } = await params;`

- [ ] **Step 7: Verify**

```bash
curl http://localhost:3000/robots.txt
curl http://localhost:3000/sitemap.xml | head -30
```

Check a detail page source for JSON-LD script tag.

- [ ] **Step 8: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/lib/structured-data.ts src/app/layout.tsx src/app/\(main\)/forum/ src/app/\(main\)/news/ src/app/\(main\)/hire/ src/app/\(main\)/profile/
git commit -m "feat: add sitemap, robots.txt, JSON-LD structured data, canonical URLs (#13)"
```

---

### Task 12: Floating chat widget (#19)

**Files:**
- Create: `src/components/messages/floating-chat-widget.tsx`
- Create: `src/components/messages/messaging-hub.tsx`
- Create: `src/components/messages/mini-chat.tsx`
- Modify: `src/app/(main)/layout.tsx`

- [ ] **Step 1: Create mini-chat component**

Create `src/components/messages/mini-chat.tsx`:
```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Paperclip, Smile, Send } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getMessages, sendMessage } from "@/server/actions/messages";

interface MiniChatProps {
  threadId: string;
  otherUser: { id: string; name: string | null; username: string; image: string | null };
  currentUserId: string;
  onClose: () => void;
  onMinimize: () => void;
  minimized: boolean;
}

export function MiniChat({ threadId, otherUser, currentUserId, onClose, onMinimize, minimized }: MiniChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages(threadId).then(setMessages);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    const formData = new FormData();
    formData.set("threadId", threadId);
    formData.set("body", input.trim());
    const result = await sendMessage(formData);
    if (!result?.error) {
      setInput("");
      const updated = await getMessages(threadId);
      setMessages(updated);
    }
    setSending(false);
  }

  const displayName = otherUser.name || otherUser.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="w-[280px] bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light border-b-0 rounded-t-[10px] shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-primary text-white cursor-pointer select-none shrink-0"
        onClick={onMinimize}
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold shrink-0">
          {otherUser.image ? (
            <img src={otherUser.image} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : initials}
        </div>
        <span className="text-sm font-semibold flex-1 truncate">{displayName}</span>
        <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="p-1 rounded hover:bg-white/15 transition-colors">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 rounded hover:bg-white/15 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 max-h-[340px] min-h-[200px] bg-white dark:bg-surface-dark">
            {messages.map((msg: any) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                    isOwn
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-surface dark:bg-gray-800 border border-border-light dark:border-border-dark-light rounded-bl-sm"
                  }`}>
                    {msg.body}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-border-light dark:border-border-dark-light bg-white dark:bg-surface-dark">
            <div className="flex items-center gap-1 mb-1.5">
              <button className="p-1 text-text-tertiary hover:text-primary transition-colors"><Paperclip className="w-4 h-4" /></button>
              <button className="p-1 text-text-tertiary hover:text-primary transition-colors"><Smile className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Write a message..."
                className="flex-1 border border-border-light dark:border-border-dark-light rounded-full px-3 py-1.5 text-[13px] outline-none focus:border-primary bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create messaging hub component**

Create `src/components/messages/messaging-hub.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Pencil, MoreHorizontal, Search } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getThreads, getUnreadMessageCount } from "@/server/actions/messages";

interface MessagingHubProps {
  currentUser: { id: string; name: string | null; image: string | null };
  onOpenChat: (threadId: string, otherUser: any) => void;
}

export function MessagingHub({ currentUser, onOpenChat }: MessagingHubProps) {
  const [expanded, setExpanded] = useState(false);
  const [threads, setThreads] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUnreadMessageCount().then(setUnreadCount);
    getThreads().then(setThreads);
  }, []);

  const initials = (currentUser.name || "U").slice(0, 2).toUpperCase();

  function getOtherUser(thread: any) {
    return thread.user1.id === currentUser.id ? thread.user2 : thread.user1;
  }

  const filteredThreads = threads.filter((t) => {
    if (!search) return true;
    const other = getOtherUser(t);
    const name = (other.name || other.username || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="w-[300px] bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light border-b-0 rounded-t-[10px] shadow-lg overflow-hidden">
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-primary text-white cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold shrink-0">
          {currentUser.image ? (
            <img src={currentUser.image} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : initials}
        </div>
        <span className="text-sm font-semibold flex-1">Messaging</span>
        {unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button className="p-1 rounded hover:bg-white/15 transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
          <button className="p-1 rounded hover:bg-white/15 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
        </div>
        <button className="p-1 rounded hover:bg-white/15 transition-colors">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="max-h-[400px] overflow-y-auto bg-white dark:bg-surface-dark">
          {/* Search */}
          <div className="px-3 py-2 border-b border-border-light dark:border-border-dark-light">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-8 pr-3 py-1.5 border border-border-light dark:border-border-dark-light rounded-full text-[13px] outline-none focus:border-primary bg-surface dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary"
              />
            </div>
          </div>

          {/* Thread list */}
          {filteredThreads.map((thread: any) => {
            const other = getOtherUser(thread);
            const lastMsg = thread.messages?.[0];
            const displayName = other.role === "COMPANY" ? other.companyName || other.name : other.name || other.username;
            const initials = (displayName || "?").slice(0, 2).toUpperCase();

            return (
              <div
                key={thread.id}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface dark:hover:bg-gray-800 border-b border-border-light dark:border-border-dark-light transition-colors"
                onClick={() => { onOpenChat(thread.id, other); setExpanded(false); }}
              >
                <div className="w-10 h-10 rounded-full bg-primary-lighter flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                  {other.image ? (
                    <img src={other.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-text-primary dark:text-text-dark-primary truncate">{displayName}</span>
                    <span className="text-[11px] text-text-tertiary shrink-0">
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                  {lastMsg && (
                    <p className="text-[12px] text-text-secondary dark:text-text-dark-secondary truncate mt-0.5">{lastMsg.body}</p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredThreads.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">No conversations yet</div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create floating widget container**

Create `src/components/messages/floating-chat-widget.tsx`:
```typescript
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessagingHub } from "./messaging-hub";
import { MiniChat } from "./mini-chat";

interface OpenChat {
  threadId: string;
  otherUser: any;
  minimized: boolean;
}

interface FloatingChatWidgetProps {
  currentUser: { id: string; name: string | null; image: string | null };
}

export function FloatingChatWidget({ currentUser }: FloatingChatWidgetProps) {
  const pathname = usePathname();
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);

  // Hide on /messages page (full page takes over)
  if (pathname === "/messages" || pathname?.startsWith("/messages/")) return null;

  function handleOpenChat(threadId: string, otherUser: any) {
    setOpenChats((prev) => {
      // Already open? Just un-minimize it
      const existing = prev.find((c) => c.threadId === threadId);
      if (existing) return prev.map((c) => c.threadId === threadId ? { ...c, minimized: false } : c);

      // Max 2 open — minimize oldest
      const updated = prev.length >= 2
        ? [{ ...prev[0], minimized: true }, ...prev.slice(1)]
        : prev;

      return [...updated, { threadId, otherUser, minimized: false }];
    });
  }

  function handleCloseChat(threadId: string) {
    setOpenChats((prev) => prev.filter((c) => c.threadId !== threadId));
  }

  function handleMinimizeChat(threadId: string) {
    setOpenChats((prev) =>
      prev.map((c) => c.threadId === threadId ? { ...c, minimized: !c.minimized } : c)
    );
  }

  return (
    <div className="fixed bottom-0 right-6 flex items-end gap-2.5 z-50">
      {openChats.map((chat) => (
        <MiniChat
          key={chat.threadId}
          threadId={chat.threadId}
          otherUser={chat.otherUser}
          currentUserId={currentUser.id}
          onClose={() => handleCloseChat(chat.threadId)}
          onMinimize={() => handleMinimizeChat(chat.threadId)}
          minimized={chat.minimized}
        />
      ))}
      <MessagingHub currentUser={currentUser} onOpenChat={handleOpenChat} />
    </div>
  );
}
```

- [ ] **Step 4: Integrate into main layout**

In `src/app/(main)/layout.tsx`, add the widget for authenticated users:
```typescript
import { Navbar1 } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { auth } from "@/auth";
import { FloatingChatWidget } from "@/components/messages/floating-chat-widget";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const currentUser = session?.user ? {
    id: (session.user as any).id,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  } : null;

  return (
    <>
      <Navbar1 />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      {currentUser && <FloatingChatWidget currentUser={currentUser} />}
    </>
  );
}
```

- [ ] **Step 5: Verify**

Log in, check the floating widget appears bottom-right. Click to expand hub, click a thread to open mini-chat. Navigate to /messages — widget should hide.

- [ ] **Step 6: Commit**

```bash
git add src/components/messages/floating-chat-widget.tsx src/components/messages/messaging-hub.tsx src/components/messages/mini-chat.tsx src/app/\(main\)/layout.tsx
git commit -m "feat: add LinkedIn-style floating chat widget (#19)"
```

---

### Task 13: Final verification

- [ ] **Step 1: Run full build**

```bash
cd /Users/akshay/research-forum && npx next build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Smoke test all pages**

Manually verify:
- Homepage: icons, "500+", trending topics with icons, ad slot (empty without env var)
- Profile: social icon buttons, no search bar in navbar
- Forum: research domain dropdown on new question, domain filter, domain badges
- News: category icons in sidebar, AI Generated badge (if applicable)
- /about and /contact pages render
- /office-hours returns 404
- Company signup rejects gmail.com
- Floating chat widget visible when logged in
- /sitemap.xml and /robots.txt accessible
- View source on detail pages shows JSON-LD

- [ ] **Step 3: Final commit if any fixups needed**

```bash
git add -A
git commit -m "fix: address any issues found during smoke testing"
```
