import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Building2, FileText, UserSearch, ClipboardList, Megaphone, Store,
  MessageSquare, Star, ArrowRight, ChevronRight, Users, DollarSign,
  BarChart3, Lightbulb,
} from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Company Guide — T.I.E",
  description: "Learn how companies can hire researchers, post jobs, and advertise on The Intellectual Exchange.",
  alternates: { canonical: `${baseUrl}/guide/companies` },
};

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary">{title}</h2>
      </div>
      <div className="pl-[52px] space-y-3 text-[15px] text-text-secondary dark:text-text-dark-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function AdCard({ title, desc, price }: { title: string; desc: string; price: string }) {
  return (
    <div className="p-4 rounded-lg bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-text-primary dark:text-text-dark-primary text-sm">{title}</h3>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{price}</span>
      </div>
      <p className="text-sm">{desc}</p>
    </div>
  );
}

function StatusFlow() {
  const steps = ["Pending", "Shortlisted", "Accepted"];
  return (
    <div className="flex items-center gap-2 py-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark-light text-text-primary dark:text-text-dark-primary">
            {step}
          </span>
          {i < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />}
        </div>
      ))}
    </div>
  );
}

export default function CompanyGuidePage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12 space-y-10">
        {/* Header */}
        <div className="text-center pb-8 border-b border-border-light dark:border-border-dark-light">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-3 tracking-tight">
            Company Guide
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
            Hire top researchers, promote your brand, and grow on T.I.E.
          </p>
          <Link href="/guide" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            <Users className="w-4 h-4" /> Looking for the Researcher Guide? <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Welcome */}
        <Section icon={Lightbulb} title="Welcome">
          <p>
            The Intellectual Exchange connects your company with top researchers worldwide.
            Post jobs, discover domain experts, promote your tools, and build your brand
            within the research community.
          </p>
        </Section>

        {/* Company Profile */}
        <Section icon={Building2} title="Setting Up Your Company Profile">
          <p>
            Sign up with your corporate email at{" "}
            <Link href="/signup/company" className="text-primary font-medium hover:underline">/signup/company</Link>.
            A polished profile builds trust with researchers.
          </p>
          <ul className="space-y-2">
            {[
              ["Company name & logo", "First impression matters — upload a clear logo."],
              ["Industry & size", "Helps researchers understand your organization."],
              ["Website & description", "Tell researchers what you do and what you're looking for."],
              ["Hiring status", "Set to 'Actively Hiring' to attract applicants."],
            ].map(([label, desc]) => (
              <li key={label} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span><strong className="text-text-primary dark:text-text-dark-primary">{label}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Posting Jobs */}
        <Section icon={FileText} title="Posting Research Jobs">
          <p>
            Post on the{" "}
            <Link href="/talent-board" className="text-primary font-medium hover:underline">Talent Board</Link>{" "}
            to find the right researcher for your project.
          </p>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">When posting a job, include:</p>
            <ul className="space-y-1 text-sm">
              {["Clear title and detailed description", "Required skills and research domains", "Project type: one-time, ongoing, or contract", "Budget range (or mark as negotiable)", "Timeline and location preference"].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Finding Researchers */}
        <Section icon={UserSearch} title="Finding & Hiring Researchers">
          <p>
            Browse the{" "}
            <Link href="/researchers" className="text-primary font-medium hover:underline">researcher directory</Link>{" "}
            to find experts. Filter by expertise, availability, and hourly rate.
            View full profiles with credentials, reputation levels, and work history.
            Message researchers directly to discuss opportunities.
          </p>
        </Section>

        {/* Managing Applications */}
        <Section icon={ClipboardList} title="Managing Applications">
          <p>View all applicants on your <Link href="/dashboard" className="text-primary font-medium hover:underline">dashboard</Link>. Each application includes a cover letter, proposed rate, and timeline.</p>
          <StatusFlow />
          <p className="text-sm">Move applicants through stages and message them directly at any point.</p>
        </Section>

        {/* Advertising */}
        <Section icon={Megaphone} title="Advertising on T.I.E">
          <p>Reach thousands of researchers with targeted advertising. Three formats available:</p>
          <div className="space-y-2 mt-2">
            <AdCard title="Feed Ads" desc="Inline with forum questions and articles." price="From $2 CPM" />
            <AdCard title="Banner Ads" desc="Sidebar placement across all pages." price="From $5 CPM" />
            <AdCard title="Featured Listings" desc="Pinned to the top of categories." price="From $10 CPM" />
          </div>
          <p className="text-sm mt-2">
            Manage campaigns at{" "}
            <Link href="/advertise" className="text-primary font-medium hover:underline">/advertise</Link>.
            Set budgets, targeting, and track performance with impressions, clicks, and spend analytics.
          </p>
        </Section>

        {/* Marketplace */}
        <Section icon={Store} title="Marketplace">
          <p>
            List your research tools or services on the{" "}
            <Link href="/marketplace" className="text-primary font-medium hover:underline">marketplace</Link>.
            Get reviews from the community and showcase your offerings to thousands of researchers.
          </p>
        </Section>

        {/* Community */}
        <Section icon={MessageSquare} title="Engaging with the Community">
          <p>
            Build your company's reputation as a thought leader. Ask questions in the forum,
            share articles and news, and participate in discussions. Companies that engage
            authentically attract better applicants and more visibility.
          </p>
        </Section>

        {/* Tips */}
        <Section icon={Star} title="Tips for Success">
          <ul className="space-y-2">
            {[
              ["Complete your profile", "Companies with logos and detailed descriptions get 3x more applicant interest."],
              ["Write detailed job posts", "Clear requirements attract qualified researchers and reduce back-and-forth."],
              ["Respond quickly", "Researchers apply to multiple positions — fast responses win top talent."],
              ["Engage in the forum", "Answering questions and sharing insights builds credibility and brand awareness."],
              ["Try advertising", "Even a small campaign can significantly boost visibility for your job postings."],
            ].map(([label, desc]) => (
              <li key={label} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span><strong className="text-text-primary dark:text-text-dark-primary">{label}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </PageLayout>
  );
}
