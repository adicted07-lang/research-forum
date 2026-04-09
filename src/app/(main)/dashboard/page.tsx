import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BadgePill } from "@/components/shared/badge-pill";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getMyApplications } from "@/server/actions/applications";
import { getJobs } from "@/server/actions/jobs";
import { getUserBookmarks } from "@/server/actions/bookmarks";
import { getUserAnalytics } from "@/server/actions/analytics";
import { BookmarksList } from "@/components/bookmarks/bookmarks-list";
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";

import { Briefcase, FileText, Users, BookmarkIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — The Intellectual Exchange",
  description: "Manage your research projects and applications.",
  robots: { index: false, follow: false },
};

function applicationStatusClass(status: string): string {
  if (status === "PENDING") return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
  if (status === "ACCEPTED") return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  if (status === "REJECTED") return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
  return "bg-surface text-text-secondary dark:bg-surface-dark dark:text-text-dark-secondary";
}

function applicationStatusLabel(status: string): string {
  if (status === "PENDING") return "Pending";
  if (status === "ACCEPTED") return "Accepted";
  if (status === "REJECTED") return "Rejected";
  return status;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const role = session.user.role;
  const isResearcher = role === "RESEARCHER";
  const isCompany = role === "COMPANY";

  return (
    <PageLayout>
      <SectionHeader title="Dashboard" />

      {isResearcher && <ResearcherDashboard userId={session.user.id} />}
      {isCompany && <CompanyDashboard userId={session.user.id} />}
      {!isResearcher && !isCompany && (
        <EmptyState
          title="Complete your profile"
          description="Set up your account as a researcher or company to get started."
          icon={<Users className="w-12 h-12" />}
          action={
            <Link
              href="/settings"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Settings
            </Link>
          }
        />
      )}
    </PageLayout>
  );
}

async function ResearcherDashboard({ userId }: { userId: string }) {
  void userId; // used implicitly via session in getMyApplications
  let applications: Awaited<ReturnType<typeof getMyApplications>> = [];
  try {
    applications = await getMyApplications();
  } catch {
    // DB not available
  }

  const { bookmarks } = await getUserBookmarks();
  const analytics = await getUserAnalytics();

  return (
    <div className="space-y-6">
      {analytics && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Your Stats
          </h2>
          <AnalyticsCards data={analytics} />
        </section>
      )}

      {/* My Applications */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            My Applications
          </h2>
          <Link href="/talent-board" className="text-sm text-primary hover:underline">
            Browse jobs →
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app: any) => {
              const companyName =
                app.job.company.companyName ?? app.job.company.username ?? "Company";
              return (
                <div
                  key={app.id}
                  className="bg-white border border-border-light rounded-lg p-4 dark:bg-surface-dark dark:border-border-dark-light"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/talent-board/${app.job.slug}`}
                        className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors"
                      >
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                        {companyName}
                      </p>
                      {app.proposedRate && (
                        <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mt-1">
                          Proposed rate: ${app.proposedRate}/hr
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${applicationStatusClass(app.status)}`}
                      >
                        {applicationStatusLabel(app.status)}
                      </span>
                      <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                        {timeAgo(app.createdAt)}
                      </span>
                    </div>
                  </div>
                  {app.job.researchDomain.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.job.researchDomain.slice(0, 3).map((d: string) => (
                        <BadgePill key={d} label={d} variant="primary" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No applications yet"
            description="Browse open positions and apply to research projects."
            icon={<Briefcase className="w-10 h-10" />}
            action={
              <Link
                href="/talent-board"
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Browse Jobs
              </Link>
            }
          />
        )}
      </section>

      {/* Saved Items */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center gap-2">
            <BookmarkIcon className="w-5 h-5 text-primary" />
            Saved Items
          </h2>
        </div>
        <BookmarksList bookmarks={bookmarks} />
      </section>
    </div>
  );
}

async function CompanyDashboard({ userId }: { userId: string }) {
  type JobWithCount = Awaited<ReturnType<typeof getJobs>>[number];
  let jobs: JobWithCount[] = [];
  const analytics = await getUserAnalytics();
  try {
    // getJobs already filters by status=OPEN, we fetch company's own jobs via a workaround:
    // We pass the company's userId context through session (handled in getJobs).
    // For now, fetch all open jobs and we'll filter client-side... Actually we need all company jobs.
    // We'll use a direct db query approach via a try/catch.
    const { db } = await import("@/lib/db");
    const rawJobs = await db.job.findMany({
      where: { companyId: userId, deletedAt: null },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            username: true,
            companyLogo: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    jobs = rawJobs;
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      {analytics && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Your Stats
          </h2>
          <AnalyticsCards data={analytics} />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            My Job Postings
          </h2>
          <Link
            href="/talent-board/new"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + Post a Job
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-white border border-border-light rounded-lg p-4 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/talent-board/${job.slug}`}
                      className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-secondary dark:text-text-dark-secondary flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {job.applicationsCount} applicant{job.applicationsCount !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                        {timeAgo(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        job.status === "OPEN"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-surface-dark dark:text-text-dark-tertiary"
                      }`}
                    >
                      {job.status === "OPEN" ? "Open" : "Closed"}
                    </span>
                    {job.applicationsCount > 0 && (
                      <Link
                        href={`/talent-board/${job.slug}#applicants`}
                        className="text-xs text-primary hover:underline"
                      >
                        View applicants →
                      </Link>
                    )}
                  </div>
                </div>
                {job.researchDomain.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.researchDomain.slice(0, 3).map((d: string) => (
                      <BadgePill key={d} label={d} variant="primary" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No job postings yet"
            description="Post a research project to find the perfect expert."
            icon={<Briefcase className="w-10 h-10" />}
            action={
              <Link
                href="/talent-board/new"
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Post Your First Job
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
