import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ExternalLink, Users, Video } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { BadgePill } from "@/components/shared/badge-pill";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getOfficeHourBySlug } from "@/server/actions/office-hours";

export const dynamic = "force-dynamic";

interface OfficeHourPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: OfficeHourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await getOfficeHourBySlug(slug);
  if (!session) return { title: "Session Not Found — ResearchHub" };

  const description = session.description.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: `${session.title} — ResearchHub Office Hours`,
    description,
    openGraph: {
      title: session.title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: session.title,
      description,
    },
  };
}

export default async function OfficeHourPage({ params }: OfficeHourPageProps) {
  const { slug } = await params;
  const session = await getOfficeHourBySlug(slug);
  if (!session) notFound();

  const startDate = new Date(session.startTime);
  const endDate = new Date(startDate.getTime() + session.duration * 60 * 1000);
  const now = new Date();

  // Show meeting link if within 15 minutes before or during the session
  const minutesUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60);
  const isLive = now >= startDate && now <= endDate;
  const isNearStart = minutesUntilStart <= 15 && minutesUntilStart > 0;
  const showMeetingLink = session.meetingUrl && (isLive || isNearStart);

  const hostName = session.host.name ?? session.host.username ?? "Unknown";

  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = startDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Main card */}
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <BadgePill label={session.topic} variant="primary" className="mb-2" />
              <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                {session.title}
              </h1>
            </div>
            {isLive && (
              <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold dark:bg-red-900/20 dark:text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Now
              </span>
            )}
          </div>

          {/* Host info */}
          <Link
            href={`/researchers/${session.host.username ?? session.host.id}`}
            className="flex items-center gap-3 mb-5 group"
          >
            <UserAvatar name={hostName} src={session.host.image} size="lg" />
            <div>
              <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary group-hover:text-primary transition-colors">
                {hostName}
              </p>
              {session.host.expertise.length > 0 && (
                <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                  {session.host.expertise.slice(0, 3).join(" · ")}
                </p>
              )}
            </div>
          </Link>

          {/* Session details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
              <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
              <Clock className="w-4 h-4 text-text-tertiary shrink-0" />
              <span>{timeStr} · {session.duration} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
              <Users className="w-4 h-4 text-text-tertiary shrink-0" />
              <span>
                {session.attendeeCount} attending
                {session.maxAttendees ? ` (max ${session.maxAttendees})` : ""}
              </span>
            </div>
          </div>

          {/* Meeting link — only visible close to start time or during */}
          {showMeetingLink && (
            <a
              href={session.meetingUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Video className="w-4 h-4" />
              {isLive ? "Join Live Session" : "Join Session (Starting Soon)"}
              <ExternalLink className="w-3.5 h-3.5 opacity-75" />
            </a>
          )}

          {!showMeetingLink && session.meetingUrl && !isLive && (
            <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary italic">
              The meeting link will be available 15 minutes before the session starts.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            About This Session
          </h2>
          <div
            className="prose prose-sm max-w-none text-text-secondary dark:text-text-dark-secondary"
            dangerouslySetInnerHTML={{ __html: session.description }}
          />
        </div>

        {/* Host bio */}
        {session.host.bio && (
          <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              About the Host
            </h2>
            <div className="flex items-start gap-3">
              <UserAvatar name={hostName} src={session.host.image} size="md" />
              <div>
                <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-1">
                  {hostName}
                </p>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-pre-wrap">
                  {session.host.bio}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
