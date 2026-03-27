import Link from "next/link";
import { MapPin, Clock, Users, DollarSign, Eye, Edit } from "lucide-react";
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

export async function JobDetail({ job }: JobDetailProps) {
  const session = await auth();
  const isOwner = session?.user?.id === job.company.id;
  const isResearcher = session?.user?.role === "RESEARCHER";

  const displayName = job.company.companyName ?? job.company.username ?? "Company";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const gradient = getLogoGradient(displayName);
  const budget = formatBudget(job.budgetMin, job.budgetMax, job.budgetNegotiable);

  return (
    <div className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl shrink-0`}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-text-primary dark:text-text-dark-primary leading-tight">
                {job.title}
              </h1>
              <Link
                href={job.company.username ? `/@${job.company.username}` : "#"}
                className="text-sm text-primary hover:underline mt-0.5 block"
              >
                {displayName}
              </Link>
            </div>
            {isOwner && (
              <Link
                href={`/hire/${job.slug}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-light text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-secondary"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Link>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
              <DollarSign className="w-4 h-4" />
              {budget}
            </span>
            {job.timeline && (
              <span className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
                <Clock className="w-4 h-4" />
                {job.timeline}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
              <MapPin className="w-4 h-4" />
              {locationLabel(job.locationPreference)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
              <Users className="w-4 h-4" />
              {job.applicationsCount} applicant{job.applicationsCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
              <Eye className="w-4 h-4" />
              {job.viewsCount} view{job.viewsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface text-text-secondary dark:bg-gray-800 dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light">
          {projectTypeLabel(job.projectType)}
        </span>
        {job.budgetNegotiable && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
            Budget negotiable
          </span>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">
          Project Description
        </h2>
        <div className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed whitespace-pre-wrap">
          {job.description}
        </div>
      </div>

      {/* Research domains */}
      {job.researchDomain.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">
            Research Domains
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {job.researchDomain.map((domain) => (
              <BadgePill key={domain} label={domain} variant="primary" />
            ))}
          </div>
        </div>
      )}

      {/* Required skills */}
      {job.requiredSkills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">
            Required Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill) => (
              <BadgePill key={skill} label={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Apply button for researchers */}
      {isResearcher && !isOwner && (
        <div className="pt-4 border-t border-border-light dark:border-border-dark-light">
          <a
            href="#apply"
            className="inline-flex items-center px-6 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Apply Now
          </a>
        </div>
      )}

      {!session && (
        <div className="pt-4 border-t border-border-light dark:border-border-dark-light">
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Sign in to Apply
          </Link>
        </div>
      )}
    </div>
  );
}
