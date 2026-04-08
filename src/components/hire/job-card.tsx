import Link from "next/link";
import { Users, DollarSign } from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";

interface JobCardCompany {
  id: string;
  companyName: string | null;
  username: string | null;
  companyLogo: string | null;
  image: string | null;
  role: string;
}

interface JobCardProps {
  job: {
    id: string;
    title: string;
    slug: string;
    researchDomain: string[];
    requiredSkills: string[];
    projectType: string;
    budgetMin: number | null;
    budgetMax: number | null;
    budgetNegotiable: boolean;
    timeline: string | null;
    locationPreference: string;
    applicationsCount: number;
    createdAt: Date;
    company: JobCardCompany;
  };
}

function getLogoGradient(name: string): string {
  const gradients = [
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-emerald-500 to-emerald-700",
    "from-orange-500 to-orange-700",
    "from-pink-500 to-pink-700",
    "from-teal-500 to-teal-700",
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

function formatBudget(min: number | null, max: number | null, negotiable: boolean): string {
  if (!min && !max) return negotiable ? "Negotiable" : "Budget TBD";
  if (min && max) return `$${min}–$${max}/hr`;
  if (min) return `From $${min}/hr`;
  if (max) return `Up to $${max}/hr`;
  return "Budget TBD";
}

function locationLabel(pref: string): string {
  if (pref === "REMOTE") return "Remote";
  if (pref === "ON_SITE") return "On-site";
  if (pref === "HYBRID") return "Hybrid";
  return pref;
}

function locationBadgeClass(pref: string): string {
  if (pref === "REMOTE") return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  if (pref === "HYBRID") return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
}

function projectTypeLabel(type: string): string {
  if (type === "ONE_TIME") return "One-time";
  if (type === "ONGOING") return "Ongoing";
  if (type === "CONTRACT") return "Contract";
  return type;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ job }: JobCardProps) {
  const displayName = job.company.companyName ?? job.company.username ?? "Company";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const gradient = getLogoGradient(displayName);
  const budget = formatBudget(job.budgetMin, job.budgetMax, job.budgetNegotiable);

  return (
    <div className="bg-white border border-border-light rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-primary/40 group">
      {/* Top: logo + title + company */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/hire/${job.slug}`} className="block shrink-0">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm`}
          >
            {initial}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/hire/${job.slug}`} className="block">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary group-hover:text-primary transition-colors leading-snug">
              {job.title}
            </h3>
          </Link>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
            {job.company.username ? (
              <Link
                href={`/profile/${job.company.username}`}
                className="hover:text-primary transition-colors"
              >
                {displayName}
              </Link>
            ) : (
              displayName
            )}
          </p>
        </div>
      </div>

      {/* Badges: location + project type */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${locationBadgeClass(job.locationPreference)}`}
        >
          {locationLabel(job.locationPreference)}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface text-text-secondary dark:bg-surface-dark dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light">
          {projectTypeLabel(job.projectType)}
        </span>
      </div>

      {/* Budget + meta */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-dark-secondary">
          <DollarSign className="w-3.5 h-3.5" />
          {budget}
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-dark-secondary">
          <Users className="w-3.5 h-3.5" />
          {job.applicationsCount} applicant{job.applicationsCount !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary ml-auto">
          {timeAgo(job.createdAt)}
        </span>
      </div>

      {/* Domain tags */}
      {job.researchDomain.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.researchDomain.slice(0, 5).map((domain) => (
            <BadgePill key={domain} label={domain} variant="primary" />
          ))}
          {job.researchDomain.length > 5 && (
            <BadgePill label={`+${job.researchDomain.length - 5}`} />
          )}
        </div>
      )}

      {/* Action link */}
      <div className="pt-3 border-t border-border-light dark:border-border-dark-light">
        <Link
          href={`/hire/${job.slug}`}
          className="flex items-center justify-center px-3 py-1.5 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
