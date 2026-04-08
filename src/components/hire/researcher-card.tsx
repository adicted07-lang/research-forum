import Link from "next/link";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { DollarSign, MessageSquare, Send } from "lucide-react";

interface ResearcherCardProps {
  researcher: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    bio: string | null;
    expertise: string[];
    hourlyRate: number | null;
    availability: string | null;
    role: string;
  };
}

function availabilityLabel(availability: string | null): string {
  if (!availability) return "Unknown";
  if (availability === "AVAILABLE") return "Available";
  if (availability === "BUSY") return "Busy";
  if (availability === "UNAVAILABLE") return "Unavailable";
  return availability;
}

function availabilityClass(availability: string | null): string {
  if (availability === "AVAILABLE")
    return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  if (availability === "BUSY")
    return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
  return "bg-gray-100 text-gray-500 dark:bg-surface-dark dark:text-text-dark-tertiary";
}

export function ResearcherCard({ researcher }: ResearcherCardProps) {
  const displayName = researcher.name ?? researcher.username ?? "Researcher";
  const profileHref = researcher.username ? `/profile/${researcher.username}` : "#";

  return (
    <div className="bg-white border border-border-light rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all dark:bg-surface-dark dark:border-border-dark-light">
      {/* Top: avatar + name + availability */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={profileHref}>
          <UserAvatar name={displayName} src={researcher.image} size="lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={profileHref}
                className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors block leading-snug"
              >
                {displayName}
              </Link>
              {researcher.username && (
                <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                  @{researcher.username}
                </span>
              )}
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${availabilityClass(researcher.availability)}`}
            >
              {availabilityLabel(researcher.availability)}
            </span>
          </div>

          {researcher.hourlyRate != null && (
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
                ${researcher.hourlyRate}/hr
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {researcher.bio && (
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary leading-relaxed line-clamp-2 mb-3">
          {researcher.bio}
        </p>
      )}

      {/* Expertise tags */}
      {researcher.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {researcher.expertise.slice(0, 5).map((tag) => (
            <BadgePill key={tag} label={tag} variant="primary" />
          ))}
          {researcher.expertise.length > 5 && (
            <BadgePill label={`+${researcher.expertise.length - 5}`} />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-3 border-t border-border-light dark:border-border-dark-light">
        <Link
          href={`/messages?userId=${researcher.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-border-light text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-secondary"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Contact
        </Link>
        <Link
          href={`/messages?userId=${researcher.id}&action=invite`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Invite to Apply
        </Link>
      </div>
    </div>
  );
}
