import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  Eye,
  Edit,
  Calendar,
  Briefcase,
  Building2,
} from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";
import { auth } from "@/auth";

interface JobDetailCompany {
  id: string;
  companyName: string | null;
  username: string | null;
  companyLogo: string | null;
  image: string | null;
  role: string;
}

interface JobDetailProps {
  job: {
    id: string;
    title: string;
    slug: string;
    description: string;
    researchDomain: string[];
    requiredSkills: string[];
    projectType: string;
    budgetMin: number | null;
    budgetMax: number | null;
    budgetNegotiable: boolean;
    timeline: string | null;
    locationPreference: string;
    applicationsCount: number;
    viewsCount: number;
    createdAt: Date;
    company: JobDetailCompany;
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
  return gradients[name.charCodeAt(0) % gradients.length];
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

function projectTypeLabel(type: string): string {
  if (type === "ONE_TIME") return "One-time project";
  if (type === "ONGOING") return "Ongoing work";
  if (type === "CONTRACT") return "Contract";
  return type;
}

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export async function JobDetail({ job }: JobDetailProps) {
  const session = await auth();
  const isOwner = session?.user?.id === job.company.id;
  const isResearcher = session?.user?.role === "RESEARCHER";

  const displayName = job.company.companyName ?? job.company.username ?? "Company";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const gradient = getLogoGradient(displayName);
  const budget = formatBudget(job.budgetMin, job.budgetMax, job.budgetNegotiable);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0">
        {/* Hero Card */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-4">
          <div className="flex gap-5 items-start">
            {/* Company Logo */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl shrink-0`}
            >
              {initial}
            </div>

            {/* Title & Company */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  {projectTypeLabel(job.projectType)}
                </span>
                {job.budgetNegotiable && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Budget negotiable
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
                {job.title}
              </h1>
              <Link
                href={job.company.username ? `/profile/${job.company.username}` : "#"}
                className="text-sm text-primary hover:underline"
              >
                {displayName}
              </Link>
            </div>

            {/* Edit button for owner */}
            {isOwner && (
              <div className="shrink-0">
                <Link
                  href={`/talent-board/${job.slug}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border dark:border-border-dark text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors dark:text-text-dark-secondary"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>
            )}
          </div>

          {/* Tags */}
          {job.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {job.requiredSkills.slice(0, 5).map((skill) => (
                <BadgePill key={skill} label={skill} variant="primary" />
              ))}
              {job.requiredSkills.length > 5 && (
                <span className="text-xs text-text-tertiary self-center">
                  +{job.requiredSkills.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description Card */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-4">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            Project Description
          </h2>
          <div
            className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Required Skills Card */}
        {job.requiredSkills.length > 0 && (
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-4">
            <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.map((skill) => (
                <BadgePill key={skill} label={skill} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== SIDEBAR ===== */}
      <div className="lg:w-[280px] shrink-0 space-y-4">
        {/* Company Card */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5">
          <Link
            href={job.company.username ? `/profile/${job.company.username}` : "#"}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shrink-0`}
            >
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                {displayName}
              </p>
              {job.company.username && (
                <p className="text-xs text-text-tertiary">@{job.company.username}</p>
              )}
            </div>
          </Link>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <Link
              href={job.company.username ? `/profile/${job.company.username}` : "#"}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md border border-border dark:border-border-dark text-sm font-medium text-text-primary dark:text-text-dark-primary hover:border-primary hover:text-primary transition-colors"
            >
              <Building2 className="w-4 h-4" />
              View Company
            </Link>
            {isResearcher && !isOwner && (
              <a
                href="#apply"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Apply Now
              </a>
            )}
            {!session && (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign in to Apply
              </Link>
            )}
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5">
          <h4 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            Details
          </h4>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <DollarSign className="w-4 h-4 text-text-tertiary" />
              <span>{budget}</span>
            </div>
            {job.timeline && (
              <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
                <Clock className="w-4 h-4 text-text-tertiary" />
                <span>{job.timeline}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <MapPin className="w-4 h-4 text-text-tertiary" />
              <span>{locationLabel(job.locationPreference)}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <Briefcase className="w-4 h-4 text-text-tertiary" />
              <span>{projectTypeLabel(job.projectType)}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <Users className="w-4 h-4 text-text-tertiary" />
              <span>{job.applicationsCount} applicant{job.applicationsCount !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <Eye className="w-4 h-4 text-text-tertiary" />
              <span>{job.viewsCount} view{job.viewsCount !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <Calendar className="w-4 h-4 text-text-tertiary" />
              <span>Posted {timeAgo(job.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Research Domains Card */}
        {job.researchDomain.length > 0 && (
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5">
            <h4 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              Research Domains
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.researchDomain.map((domain) => (
                <BadgePill key={domain} label={domain} variant="primary" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
