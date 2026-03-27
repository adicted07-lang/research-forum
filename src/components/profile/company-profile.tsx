import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Link as LinkIcon,
  Calendar,
  Users,
  Briefcase,
  Building2,
  ExternalLink,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { FollowButton } from "@/components/social/follow-button";
import { isFollowing } from "@/server/actions/follows";
import { auth } from "@/auth";

type CompanyJob = {
  id: string;
  title: string;
  slug: string;
  projectType: string;
  locationPreference: string;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetNegotiable: boolean;
  createdAt: Date;
};

type CompanyProfileData = {
  id: string;
  companyName: string | null;
  username: string | null;
  description: string | null;
  about: string | null;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  socialLinks: unknown;
  companyLogo: string | null;
  banner: string | null;
  hiringStatus: "ACTIVELY_HIRING" | "NOT_HIRING" | null;
  createdAt: Date;
  _count: {
    companyJobs: number;
    followers: number;
    following: number;
  };
  companyJobs: CompanyJob[];
};

const companySizeLabels: Record<string, string> = {
  SIZE_1_10: "1-10 employees",
  SIZE_11_50: "11-50 employees",
  SIZE_51_200: "51-200 employees",
  SIZE_201_500: "201-500 employees",
  SIZE_500_PLUS: "500+ employees",
};

const projectTypeLabels: Record<string, string> = {
  ONE_TIME: "One-time",
  ONGOING: "Ongoing",
  CONTRACT: "Contract",
};

const locationLabels: Record<string, string> = {
  REMOTE: "Remote",
  ON_SITE: "On-site",
  HYBRID: "Hybrid",
};

function getSocialLinks(socialLinks: unknown): Record<string, string> {
  if (typeof socialLinks === "object" && socialLinks !== null && !Array.isArray(socialLinks)) {
    return socialLinks as Record<string, string>;
  }
  return {};
}

interface CompanyProfileProps {
  profile: CompanyProfileData;
}

export async function CompanyProfile({ profile }: CompanyProfileProps) {
  const session = await auth();
  const following = session?.user?.id ? await isFollowing(profile.id) : false;
  const links = getSocialLinks(profile.socialLinks);
  const displayName = profile.companyName || profile.username || "Company";

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
        {profile.banner ? (
          <Image src={profile.banner} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600/80 to-indigo-500/60" />
        )}
      </div>

      {/* Profile header */}
      <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-b-xl px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            {profile.companyLogo ? (
              <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-surface-dark overflow-hidden relative bg-white">
                <Image src={profile.companyLogo} alt={displayName} fill className="object-contain p-1" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-surface-dark bg-white dark:bg-surface-dark flex items-center justify-center">
                <Building2 className="w-10 h-10 text-text-tertiary" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-14">
            <FollowButton targetUserId={profile.id} initialFollowing={following} />
          </div>
        </div>

        {/* Company name and username */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            {displayName}
          </h1>
          {profile.hiringStatus === "ACTIVELY_HIRING" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Actively Hiring
            </span>
          )}
        </div>
        {profile.username && (
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
            @{profile.username}
          </p>
        )}

        {/* Description */}
        {profile.description && (
          <p className="text-sm text-text-primary dark:text-text-dark-primary mb-4 max-w-2xl">
            {profile.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b border-border dark:border-border-dark mb-4">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
            <Briefcase className="w-4 h-4" />
            <span className="font-semibold text-text-primary dark:text-text-dark-primary">
              {profile._count.companyJobs}
            </span>
            <span>jobs posted</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
            <Users className="w-4 h-4" />
            <span className="font-semibold text-text-primary dark:text-text-dark-primary">
              {profile._count.followers}
            </span>
            <span>followers</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
          {profile.industry && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>{profile.industry}</span>
            </div>
          )}
          {profile.companySize && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{companySizeLabels[profile.companySize] ?? profile.companySize}</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Globe className="w-4 h-4" />
              {profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>
              Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Social links */}
        {Object.keys(links).length > 0 && (
          <div className="flex flex-wrap gap-3 text-sm">
            {links.twitter && (
              <a
                href={`https://twitter.com/${links.twitter.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <LinkIcon className="w-4 h-4" />
                Twitter
              </a>
            )}
            {links.linkedin && (
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <LinkIcon className="w-4 h-4" />
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* About section */}
      {profile.about && (
        <div className="mt-4 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            About
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-pre-wrap leading-relaxed">
            {profile.about}
          </p>
        </div>
      )}

      {/* Active job postings */}
      {profile.companyJobs.length > 0 && (
        <div className="mt-4 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              Open Positions
            </h2>
            <Link
              href={`/hire?company=${profile.username}`}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {profile.companyJobs.map((job) => (
              <Link
                key={job.id}
                href={`/hire/${job.slug}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                    {job.title}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
                      {projectTypeLabels[job.projectType] ?? job.projectType}
                    </span>
                    <span className="text-xs text-text-tertiary">·</span>
                    <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
                      {locationLabels[job.locationPreference] ?? job.locationPreference}
                    </span>
                  </div>
                </div>
                {(job.budgetMin != null || job.budgetMax != null) && (
                  <div className="text-sm font-medium text-text-primary dark:text-text-dark-primary shrink-0">
                    {job.budgetNegotiable
                      ? "Negotiable"
                      : job.budgetMin && job.budgetMax
                      ? `$${job.budgetMin.toLocaleString()}–$${job.budgetMax.toLocaleString()}`
                      : job.budgetMin
                      ? `From $${job.budgetMin.toLocaleString()}`
                      : `Up to $${job.budgetMax?.toLocaleString()}`}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
