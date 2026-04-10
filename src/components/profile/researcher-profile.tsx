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
  MapPin,
  Award,
  Flame,
  Trophy,
  HelpCircle,
  FileText,
  AtSign,
  ExternalLink,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { StreakFire } from "@/components/shared/streak-fire";
import { FollowButton } from "@/components/social/follow-button";
import { isFollowing } from "@/server/actions/follows";
import { getUserBadges } from "@/server/actions/badges";
import { auth } from "@/auth";
import { ActivityFeed } from "@/components/profile/activity-feed";
import { getLevel } from "@/lib/reputation";
import { LevelBadge } from "@/components/shared/level-badge";
import { EndorseButton } from "@/components/profile/endorse-button";
import { EndorsersPopover } from "@/components/profile/endorsers-popover";
import type { EndorsementSummary } from "@/server/actions/endorsements";

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
  NOT_AVAILABLE: { label: "Not available", className: "bg-gray-100 text-gray-600 dark:bg-surface-dark dark:text-text-dark-tertiary" },
};

function getSocialLinks(socialLinks: unknown): Record<string, string> {
  if (typeof socialLinks === "object" && socialLinks !== null && !Array.isArray(socialLinks)) {
    return socialLinks as Record<string, string>;
  }
  return {};
}

interface ResearcherProfileProps {
  profile: ResearcherProfileData;
  activity: Array<{ type: "question" | "answer" | "article"; title: string; url: string; createdAt: Date }>;
  endorsements: EndorsementSummary[];
  myEndorsements: string[];
}

const badgeIcons: Record<string, { icon: typeof Award; color: string }> = {
  streak: { icon: Flame, color: "text-orange-500" },
  community: { icon: Award, color: "text-blue-500" },
  expertise: { icon: Trophy, color: "text-amber-500" },
};

const activityDotColors: Record<string, string> = {
  question: "bg-green-500",
  answer: "bg-blue-500",
  article: "bg-purple-500",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export async function ResearcherProfile({ profile, activity, endorsements, myEndorsements }: ResearcherProfileProps) {
  const session = await auth();
  const following = session?.user?.id ? await isFollowing(profile.id) : false;
  const badges = await getUserBadges(profile.id);
  const links = getSocialLinks(profile.socialLinks);
  const displayName = profile.name || profile.username || "Researcher";
  const availability = profile.availability ? availabilityConfig[profile.availability] : null;
  const tier = getLevel(profile.points);
  const isOwnProfile = session?.user?.id === profile.id;

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ===== LEFT SIDEBAR ===== */}
        <div className="lg:w-[280px] shrink-0">
          {/* Avatar */}
          <div className="mb-4">
            <div className="w-[200px] h-[200px] mx-auto lg:mx-0 rounded-full overflow-hidden border border-border dark:border-border-dark bg-gradient-to-br from-primary to-warning flex items-center justify-center text-white text-6xl font-bold">
              {profile.image ? (
                <img src={profile.image} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName[0]?.toUpperCase() ?? "?"
              )}
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                {displayName}
              </h1>
              {profile.isVerified && (
                <BadgeCheck className="w-5 h-5 text-primary" />
              )}
            </div>
            {profile.username && (
              <p className="text-lg font-light text-text-secondary dark:text-text-dark-secondary">
                {profile.username}
              </p>
            )}
            <div className="mt-1.5">
              <LevelBadge points={profile.points} showProgress />
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-text-primary dark:text-text-dark-primary leading-relaxed mb-4">
              {profile.bio}
            </p>
          )}

          {/* Follow button */}
          <div className="mb-4">
            <FollowButton targetUserId={profile.id} initialFollowing={following} />
          </div>

          {/* Followers/Following */}
          <div className="flex items-center gap-1 text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
            <Users className="w-4 h-4" />
            <span className="font-semibold text-text-primary dark:text-text-dark-primary">{profile._count.followers}</span>
            <span>followers</span>
            <span className="mx-1">·</span>
            <span className="font-semibold text-text-primary dark:text-text-dark-primary">{profile._count.following}</span>
            <span>following</span>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
            {availability && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${availability.className}`}>
                  {availability.label}
                </span>
              </div>
            )}
            {profile.hourlyRate != null && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>${profile.hourlyRate}/hr</span>
              </div>
            )}
            {profile.experienceYears != null && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{profile.experienceYears} yrs experience</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Remote</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
            {(links.website || links.twitter || links.linkedin) && (
              <div className="flex items-center gap-2 mt-2">
                {links.website && (
                  <a href={links.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-text-tertiary hover:text-primary hover:bg-primary-lighter transition-colors" title="Website">
                    <LinkIcon className="w-5 h-5" />
                  </a>
                )}
                {links.twitter && (
                  <a href={`https://twitter.com/${links.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-text-tertiary hover:text-primary hover:bg-primary-lighter transition-colors" title="Twitter">
                    <AtSign className="w-5 h-5" />
                  </a>
                )}
                {links.linkedin && (
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-text-tertiary hover:text-primary hover:bg-primary-lighter transition-colors" title="LinkedIn">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
            {isOwnProfile && profile.username && (
              <Link
                href={`/profile/${profile.username}/embed`}
                className="text-xs text-text-secondary dark:text-text-dark-secondary hover:text-primary mt-2 inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Embed badge
              </Link>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="pt-4 border-t border-border dark:border-border-dark mb-4">
              <h4 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Badges
              </h4>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge: any) => {
                  const config = badgeIcons[badge.category] || { icon: Award, color: "text-gray-500" };
                  const BadgeIcon = config.icon;
                  return (
                    <span
                      key={badge.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
                      title={`Earned ${new Date(badge.earnedAt).toLocaleDateString()}`}
                    >
                      <BadgeIcon className={`w-3.5 h-3.5 ${config.color}`} />
                      {badge.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expertise with Endorsements */}
          {profile.expertise.length > 0 && (
            <div className="pt-4 border-t border-border dark:border-border-dark">
              <h4 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
                Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.expertise
                  .map((tag) => {
                    const endorsement = endorsements.find(
                      (e) => e.skill === tag.toLowerCase().replace(/\s+/g, "-")
                    );
                    return { tag, count: endorsement?.count || 0, endorsers: endorsement?.endorsers || [] };
                  })
                  .sort((a, b) => b.count - a.count)
                  .map(({ tag, count, endorsers }) => (
                    <div key={tag} className="flex items-center gap-1">
                      <BadgePill label={tag} variant="primary" />
                      <EndorsersPopover count={count} endorsers={endorsers} skill={tag} />
                      {!isOwnProfile && (
                        <EndorseButton
                          endorseeId={profile.id}
                          skill={tag}
                          endorsed={myEndorsements.includes(tag.toLowerCase().replace(/\s+/g, "-"))}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT CONTENT ===== */}
        <div className="flex-1 min-w-0">
          {/* Stats bar */}
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-warning" />
                <span className="font-bold text-text-primary dark:text-text-dark-primary">{profile.points.toLocaleString()}</span>
                <span className="text-text-secondary dark:text-text-dark-secondary">IC this year</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tier.color} ${tier.bgColor}`}>
                  {tier.name}
                </span>
                <StreakFire count={profile.currentStreak} />
              </div>
            </div>
          </div>

          {/* About */}
          {profile.about && (
            <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-5 mb-4">
              <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
                About
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-pre-wrap leading-relaxed">
                {profile.about}
              </p>
            </div>
          )}

          {/* Pinned Content */}
          {(profile._count.questions > 0 || profile._count.answers > 0) && (
            <>
              <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
                Pinned
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">Questions</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                    {profile._count.questions}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">questions asked</p>
                </div>
                <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">Answers</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                    {profile._count.answers}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">answers contributed</p>
                </div>
              </div>
            </>
          )}

          {/* Activity */}
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            Activity
          </h3>
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg overflow-hidden">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-tertiary">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No activity yet
              </div>
            ) : (
              <div>
                {activity.map((item, i) => (
                  <Link
                    key={`${item.type}-${i}`}
                    href={item.url}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border/50 dark:border-border-dark/50 last:border-0 hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activityDotColors[item.type] || "bg-gray-400"}`} />
                    <span className="text-sm text-text-primary dark:text-text-dark-primary truncate flex-1">
                      {item.title}
                    </span>
                    <span className="text-xs text-text-tertiary shrink-0">
                      {timeAgo(item.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
