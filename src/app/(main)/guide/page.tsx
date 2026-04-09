import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import {
  UserCircle, MessageSquare, Trophy, Store, Briefcase, Newspaper,
  Database, Bell, Lightbulb, ArrowRight, Building2, Star, TrendingUp,
  Zap, Award, Shield, BookOpen, FolderOpen, ChevronRight,
} from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Getting Started — T.I.E",
  description: "Learn how to use The Intellectual Exchange platform. A complete guide for researchers, academics, and professionals.",
  alternates: { canonical: `${baseUrl}/guide` },
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

function PointRow({ action, points }: { action: string; points: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
      <span className="text-text-primary dark:text-text-dark-primary text-sm">{action}</span>
      <span className="text-primary font-bold text-sm">{points}</span>
    </div>
  );
}

function LevelBadge({ name, points, color, privilege }: { name: string; points: string; color: string; privilege: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <div className="flex-1">
        <span className="font-semibold text-text-primary dark:text-text-dark-primary text-sm">{name}</span>
        <span className="text-text-tertiary dark:text-text-dark-tertiary text-xs ml-2">{points} IC</span>
      </div>
      <span className="text-xs text-text-secondary dark:text-text-dark-secondary">{privilege}</span>
    </div>
  );
}

export default function GuidePage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12 space-y-10">
        {/* Header */}
        <div className="text-center pb-8 border-b border-border-light dark:border-border-dark-light">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-3 tracking-tight">
            Researcher Guide
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
            Everything you need to know to get the most out of T.I.E.
          </p>
          <Link href="/guide/companies" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            <Building2 className="w-4 h-4" /> Looking for the Company Guide? <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Welcome */}
        <Section icon={Lightbulb} title="Welcome to T.I.E">
          <p>
            The Intellectual Exchange is the professional platform where researchers exchange knowledge,
            hire domain experts, and discover tools that accelerate their work. Whether you are an early-career
            academic, a seasoned industry scientist, or an independent consultant — T.I.E gives you the
            community and infrastructure to grow.
          </p>
        </Section>

        {/* Profile */}
        <Section icon={UserCircle} title="Creating Your Profile">
          <p>A complete profile helps you get hired, builds credibility, and makes it easier for others to find you.</p>
          <ul className="space-y-2">
            {[
              ["Bio", "Write a concise summary of your background and research interests."],
              ["Expertise tags", "Add tags like machine learning, genomics, econometrics."],
              ["Experience", "Specify years of experience so clients can gauge seniority."],
              ["Hourly rate", "Set a rate if you offer consulting or freelance work."],
              ["Social links", "Connect Google Scholar, ORCID, LinkedIn, or your website."],
            ].map(([label, desc]) => (
              <li key={label} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span><strong className="text-text-primary dark:text-text-dark-primary">{label}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Forum */}
        <Section icon={MessageSquare} title="Forum — Ask & Answer">
          <p>The forum is the heart of T.I.E — where researchers pose questions, share insights, and solve problems together.</p>

          <div className="space-y-3 mt-2">
            <div className="p-4 rounded-lg bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary text-sm mb-1">Asking a Question</h3>
              <p className="text-sm">Provide a title, detailed body (Markdown supported), tags, category, research domain, and industry. More context = better answers.</p>
            </div>
            <div className="p-4 rounded-lg bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary text-sm mb-1">Answering & Voting</h3>
              <p className="text-sm">Contribute answers to earn IC. Use upvotes to surface great content. The question author can mark the best answer.</p>
            </div>
            <div className="p-4 rounded-lg bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary text-sm mb-1">Bounties</h3>
              <p className="text-sm">Need an urgent answer? Attach IC points as a bounty to attract more attention and reward the best response.</p>
            </div>
          </div>
        </Section>

        {/* Reputation */}
        <Section icon={Trophy} title="Reputation & Levels">
          <p>Your reputation is measured in <strong className="text-text-primary dark:text-text-dark-primary">IC (Intellectual Capital)</strong> points:</p>

          <div className="space-y-1.5 mt-2">
            <PointRow action="Ask a question" points="+5 IC" />
            <PointRow action="Post an answer" points="+10 IC" />
            <PointRow action="Answer accepted" points="+25 IC" />
            <PointRow action="Receive an upvote" points="+2 IC" />
            <PointRow action="Write a review" points="+5 IC" />
            <PointRow action="Publish an article" points="+15 IC" />
          </div>

          <p className="mt-4 font-semibold text-text-primary dark:text-text-dark-primary text-sm">Levels & Privileges</p>
          <div className="border border-border-light dark:border-border-dark-light rounded-lg divide-y divide-border-light dark:divide-border-dark-light px-4">
            <LevelBadge name="Associate" points="0" color="bg-gray-400" privilege="Basic posting" />
            <LevelBadge name="Analyst" points="50" color="bg-blue-500" privilege="Downvoting" />
            <LevelBadge name="Strategist" points="200" color="bg-green-500" privilege="Set bounties" />
            <LevelBadge name="Director" points="500" color="bg-purple-500" privilege="Close voting" />
            <LevelBadge name="Partner" points="1,000" color="bg-orange-500" privilege="Direct editing" />
            <LevelBadge name="Fellow" points="2,500" color="bg-red-500" privilege="Moderation" />
          </div>
        </Section>

        {/* Marketplace */}
        <Section icon={Store} title="Marketplace">
          <p>
            Browse and list research services and tools. Find software, consulting, data services, and more
            from other researchers and companies. Leave reviews to help the community — each review earns you <strong className="text-text-primary dark:text-text-dark-primary">+5 IC</strong>.
          </p>
        </Section>

        {/* Finding Work */}
        <Section icon={Briefcase} title="Finding Work">
          <p>The Talent Board lists research jobs posted by companies and institutions.</p>
          <ul className="space-y-2">
            {[
              ["Browse", "Filter by job type (one-time, ongoing, contract) and location (remote, on-site, hybrid)."],
              ["Apply", "Submit a cover letter and proposed rate directly through the platform."],
              ["Track", "Monitor all your applications from your dashboard."],
            ].map(([label, desc]) => (
              <li key={label} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span><strong className="text-text-primary dark:text-text-dark-primary">{label}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* News */}
        <Section icon={Newspaper} title="News & Articles">
          <p>
            Stay current with the latest research news curated by the community. Submit your own articles
            for review — published articles earn you <strong className="text-text-primary dark:text-text-dark-primary">+15 IC</strong>.
          </p>
        </Section>

        {/* Datasets & Projects */}
        <Section icon={Database} title="Datasets & Projects">
          <p>
            Share datasets in formats like CSV, JSON, and Parquet. Create collaborative projects where you
            can invite team members, organize shared documents, and work together in one place.
          </p>
        </Section>

        {/* Messaging */}
        <Section icon={Bell} title="Messaging & Notifications">
          <p>
            Use direct messaging to reach out to other researchers or follow up on answers.
            The notification center keeps you informed about new answers, upvotes, followers, and more.
          </p>
        </Section>

        {/* Tips */}
        <Section icon={Star} title="Tips for Success">
          <ul className="space-y-2">
            {[
              ["Complete your profile", "Profiles with a photo, bio, and expertise tags get significantly more engagement."],
              ["Be active daily", "T.I.E tracks activity streaks — consistent participation keeps you visible."],
              ["Answer in your expertise", "Focused, high-quality answers build reputation faster than broad, shallow ones."],
              ["Write quality content", "Detailed questions, clear answers, and thoughtful reviews all strengthen your profile."],
              ["Engage with the community", "Upvote helpful content, leave reviews, and follow researchers whose work interests you."],
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
