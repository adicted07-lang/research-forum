import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Clock,
  DollarSign,
  Users,
  MessageSquare,
  Star,
  Globe,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { StreakFire } from "@/components/shared/streak-fire";
import { FollowButton } from "@/components/social/follow-button";
import { isFollowing } from "@/server/actions/follows";
import { auth } from "@/auth";

type ResearcherProfileData = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  about: string | null;
  expertise: string[];
  experienceYears: number | null;
  hourlyRate: number | null;
  availability: "AVAILABLE" | "BUSY" | "NOT_AVAILABLE" | null;
  socialLinks: unknown;
  image: string | null;
  banner: string | null;
  isVerified: boolean;
  points: number;
  currentStreak: number;
  createdAt: Date;
  _count: {
    questions: number;
    answers: number;
    followers: number;
    following: number;
  };
};

const availabilityConfig = {
  AVAILABLE: { label: "Available for hire", className: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  BUSY: { label: "Busy", className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" },
  NOT_AVAILABLE: { label: "Not available", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

function getSocialLinks(socialLinks: unknown): Record<string, string> {
  if (typeof socialLinks === "object" && socialLinks !== null && !Array.isArray(socialLinks)) {
    return socialLinks as Record<string, string>;
  }
  return {};
}

interface ResearcherProfileProps {
  profile: ResearcherProfileData;
}

export async function ResearcherProfile({ profile }: ResearcherProfileProps) {
  const session = await auth();
  const following = session?.user?.id ? await isFollowing(profile.id) : false;
  const links = getSocialLinks(profile.socialLinks);
  const displayName = profile.name || profile.username || "Researcher";
  const availability = profile.availability ? availabilityConfig[profile.availability] : null;

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
        {profile.banner ? (
          <Image src={profile.banner} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/80 to-warning/60" />
        )}
      </div>

      {/* Profile header */}
      <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-b-xl px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            {profile.image ? (
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-surface-dark overflow-hidden relative">
                <Image src={profile.image} alt={displayName} fill className="object-cover" />
              </div>
            ) : (
              <UserAvatar
                name={displayName}
                size="lg"
                className="w-24 h-24 text-2xl border-4 border-white dark:border-surface-dark"
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-14">
            <FollowButton targetUserId={profile.id} initialFollowing={following} />
          </div>
        </div>

        {/* Name and username */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            {displayName}
          </h1>
          {profile.isVerified && (
            <BadgeCheck className="w-5 h-5 text-primary" aria-label="Verified" />
          )}
        </div>
        {profile.username && (
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
            @{profile.username}
          </p>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-text-primary dark:text-text-dark-primary mb-4 max-w-2xl">
            {profile.bio}
          </p>
        )}

        {/* Availability + badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {availability && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availability.className}`}>
              {availability.label}
            </span>
          )}
          {profile.expertise.slice(0, 6).map((tag) => (
            <BadgePill key={tag} label={tag} variant="primary" />
          ))}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b border-border dark:border-border-dark mb-4">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
            <Star className="w-4 h-4 text-warning" />
            <span className="font-semibold text-text-primary dark:text-text-dark-primary">
              {profile.points.toLocaleString()}
            </span>
            <span>points</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
            <MessageSquare className="w-4 h-4" />
            <span className="font-semibold text-text-primary dark:text-text-dark-primary">
              {profile._count.answers}
            </span>
            <span>answers</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary">
            <Users className="w-4 h-4" />
            <span className="font-semibold text-text-primary dark:text-text-dark-primary">
              {profile._count.followers}
            </span>
            <span>followers</span>
          </div>
          <StreakFire count={profile.currentStreak} />
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
          {profile.hourlyRate != null && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>${profile.hourlyRate}/hr</span>
            </div>
          )}
          {profile.experienceYears != null && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{profile.experienceYears} yrs experience</span>
            </div>
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
            {links.website && (
              <a
                href={links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
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

      {/* Activity tabs placeholder */}
      <div className="mt-4 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6">
        <div className="flex gap-4 border-b border-border dark:border-border-dark mb-4">
          {["Recent Activity", "Answers", "Collections"].map((tab) => (
            <button
              key={tab}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab === "Answers"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-secondary dark:text-text-dark-secondary hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-center py-8 text-text-secondary dark:text-text-dark-secondary text-sm">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>
            {profile._count.answers} answer{profile._count.answers !== 1 ? "s" : ""} contributed
          </p>
          <Link
            href={`/forum?answered_by=${profile.username}`}
            className="text-primary text-sm hover:underline mt-1 inline-block"
          >
            Browse answers →
          </Link>
        </div>
      </div>
    </div>
  );
}
