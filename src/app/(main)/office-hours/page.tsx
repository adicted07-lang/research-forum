import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { OfficeHourCard } from "@/components/office-hours/office-hour-card";
import { getUpcomingOfficeHours } from "@/server/actions/office-hours";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Office Hours — ResearchHub",
  description: "Join live Q&A sessions hosted by researchers. Ask questions and get answers in real time.",
};

const TOPICS = [
  "Machine Learning",
  "Data Science",
  "Bioinformatics",
  "Climate Science",
  "Neuroscience",
  "Physics",
  "Chemistry",
  "Economics",
  "Social Sciences",
  "Other",
];

export default async function OfficeHoursPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; page?: string }>;
}) {
  const params = await searchParams;
  const topic = params.topic;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [session, { sessions }] = await Promise.all([
    auth(),
    getUpcomingOfficeHours({ topic, page }),
  ]);

  const isLoggedIn = !!session?.user?.id;

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary tracking-tight">
          Office Hours &amp; Live Q&amp;A
        </h2>
        {isLoggedIn && (
          <Link
            href="/office-hours/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            + Schedule Office Hours
          </Link>
        )}
      </div>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/office-hours"
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !topic
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary hover:bg-surface-hover dark:bg-surface-dark dark:text-text-dark-secondary"
          }`}
        >
          All
        </Link>
        {TOPICS.map((t) => (
          <Link
            key={t}
            href={`/office-hours?topic=${encodeURIComponent(t)}`}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              topic === t
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface-hover dark:bg-surface-dark dark:text-text-dark-secondary"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No upcoming office hours"
          description={
            isLoggedIn
              ? "Be the first to schedule a session for the community."
              : "Check back soon — researchers will be hosting live Q&A sessions here."
          }
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s: Parameters<typeof OfficeHourCard>[0]["session"]) => (
            <OfficeHourCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
