import Link from "next/link";
import { Calendar, Clock, ExternalLink, Users } from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";
import { UserAvatar } from "@/components/shared/user-avatar";

interface OfficeHourCardProps {
  session: {
    id: string;
    title: string;
    slug: string;
    topic: string;
    startTime: Date;
    duration: number;
    meetingUrl: string | null;
    attendeeCount: number;
    maxAttendees: number | null;
    host: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
      expertise: string[];
    };
  };
}

export function OfficeHourCard({ session }: OfficeHourCardProps) {
  const startDate = new Date(session.startTime);
  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = startDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const hostName = session.host.name ?? session.host.username ?? "Unknown";

  return (
    <div className="bg-white border border-border-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
      <div className="flex items-start gap-3">
        <Link href={`/researchers/${session.host.username ?? session.host.id}`} className="shrink-0">
          <UserAvatar name={hostName} src={session.host.image} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/office-hours/${session.slug}`}>
            <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-0.5 truncate">
              {session.title}
            </h3>
          </Link>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-2">
            Hosted by{" "}
            <Link
              href={`/researchers/${session.host.username ?? session.host.id}`}
              className="hover:text-primary transition-colors font-medium"
            >
              {hostName}
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary dark:text-text-dark-tertiary mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateStr} at {timeStr}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {session.duration} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {session.attendeeCount}
              {session.maxAttendees ? ` / ${session.maxAttendees}` : ""} attending
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <BadgePill label={session.topic} variant="primary" />
            {session.meetingUrl && (
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                Join
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
