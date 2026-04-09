import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { JobList } from "@/components/hire/job-list";
import { SectionHeader } from "@/components/shared/section-header";
import { auth } from "@/auth";
import { BadgePill } from "@/components/shared/badge-pill";
import { Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Talent Board — T.I.E",
  description: "Find expert researchers for your projects on T.I.E.",
  alternates: { canonical: `${baseUrl}/talent-board` },
  openGraph: {
    title: "Talent Board — T.I.E",
    description: "Find expert researchers for your projects on T.I.E.",
    siteName: "The Intellectual Exchange",
    images: [{ url: `${baseUrl}/api/og?title=Talent Board&subtitle=T.I.E`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talent Board — T.I.E",
    description: "Find expert researchers for your projects on T.I.E.",
    images: [`${baseUrl}/api/og?title=Talent Board&subtitle=T.I.E`],
  },
};

interface HirePageProps {
  searchParams: Promise<{
    domain?: string;
    location?: string;
    sort?: string;
    page?: string;
  }>;
}

const RESEARCH_DOMAINS = [
  "machine-learning",
  "climate-science",
  "genomics",
  "neuroscience",
  "statistics",
  "deep-learning",
  "epidemiology",
  "quantum-computing",
  "nlp",
  "bioinformatics",
  "economics",
  "psychology",
];

export default async function HirePage({ searchParams }: HirePageProps) {
  const params = await searchParams;
  const domain = params.domain;
  const location = params.location;
  const sort = params.sort ?? "newest";
  const page = params.page ? parseInt(params.page, 10) : 1;

  const session = await auth();
  const isCompany = session?.user?.role === "COMPANY";

  return (
    <PageLayout
      sidebar={
        <div className="space-y-6">
          {isCompany && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 dark:bg-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                  Post a Job
                </h3>
              </div>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-3">
                Find the perfect researcher for your project.
              </p>
              <Link
                href="/talent-board/new"
                className="block w-full text-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Post a Job
              </Link>
            </div>
          )}

          {!session && (
            <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
              <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">
                Talent Board
              </h3>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-3">
                Sign in as a company to post research projects.
              </p>
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}

          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              Research Domains
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {RESEARCH_DOMAINS.map((d) => {
                const isActive = domain === d;
                const href = isActive ? "/talent-board" : `/talent-board?domain=${d}`;
                return (
                  <Link key={d} href={href}>
                    <BadgePill
                      label={d}
                      variant={isActive ? "primary" : "default"}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">
              Browse Researchers
            </h3>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-3">
              Find expert researchers available for hire.
            </p>
            <Link
              href="/researchers"
              className="block w-full text-center px-4 py-2 rounded-md border border-border-light text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-secondary"
            >
              Browse Researchers
            </Link>
          </div>
        </div>
      }
    >
      <SectionHeader title="Talent Board" />
      <JobList domain={domain} location={location} sort={sort} page={page} />
    </PageLayout>
  );
}
