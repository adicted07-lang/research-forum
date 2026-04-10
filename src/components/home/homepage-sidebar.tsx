import Link from "next/link";
import {
  ArrowRight, Mail, Sparkles, Star, Megaphone,
  MessageSquare, FileText, ShoppingBag,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AdUnit } from "@/components/shared/ad-unit";
import { db } from "@/lib/db";
import { getLevel } from "@/lib/reputation";
import { SuggestedResearchers } from "@/components/home/suggested-researchers";

async function getRecentActivity(limit = 6) {
  try {
    const [questions, answers] = await Promise.all([
      db.question.findMany({
        where: { deletedAt: null },
        select: {
          title: true,
          slug: true,
          createdAt: true,
          author: { select: { name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.answer.findMany({
        where: { deletedAt: null },
        select: {
          createdAt: true,
          author: { select: { name: true, username: true, image: true } },
          question: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    const items = [
      ...questions.map((q: any) => ({
        type: "question" as const,
        text: q.title,
        url: `/forum/${q.slug}`,
        user: q.author,
        createdAt: q.createdAt,
      })),
      ...answers.map((a: any) => ({
        type: "answer" as const,
        text: a.question.title,
        url: `/forum/${a.question.slug}`,
        user: a.author,
        createdAt: a.createdAt,
      })),
    ];

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.slice(0, limit);
  } catch {
    return [];
  }
}

async function getFeaturedResearcher() {
  try {
    const user = await db.user.findFirst({
      where: { role: "RESEARCHER", deletedAt: null },
      orderBy: { points: "desc" },
      select: {
        name: true,
        username: true,
        image: true,
        bio: true,
        points: true,
        expertise: true,
        _count: { select: { answers: true } },
      },
    });
    return user;
  } catch {
    return null;
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const activityIcons = {
  question: { icon: MessageSquare, color: "text-green-500" },
  answer: { icon: FileText, color: "text-blue-500" },
};

interface HomepageSidebarProps {
  tags: { tag: string; icon?: React.ComponentType<{ className?: string }> }[];
}

export async function HomepageSidebar({ tags }: HomepageSidebarProps) {
  const [activity, featured] = await Promise.all([
    getRecentActivity(5),
    getFeaturedResearcher(),
  ]);

  return (
    <div className="space-y-5">
      {/* Getting Started CTA */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">New here?</h3>
        </div>
        <ul className="space-y-2 text-xs text-text-secondary dark:text-text-dark-secondary mb-4">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
            Ask questions and get expert answers
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
            Hire researchers or find freelance work
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
            Discover tools, datasets, and grants
          </li>
        </ul>
        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-all"
        >
          Create Free Account
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Trending Topics */}
      <div className="bg-white border border-border-light rounded-xl p-5 dark:bg-surface-dark dark:border-border-dark-light">
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
          Trending Topics
        </h3>
        <div className="flex flex-wrap gap-1.5 overflow-hidden">
          {tags.map(({ tag, icon: Icon }) => (
            <Link key={tag} href={`/forum?tag=${tag}`}>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-primary-lighter text-primary text-[11px] sm:text-xs font-medium hover:bg-primary/10 transition-colors whitespace-nowrap">
                {Icon && <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {tag}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <div className="bg-white border border-border-light rounded-xl overflow-hidden dark:bg-surface-dark dark:border-border-dark-light">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              Recent Activity
            </h3>
          </div>
          <div>
            {activity.map((item, i) => {
              const config = activityIcons[item.type];
              const Icon = config.icon;
              const userName = item.user?.name || item.user?.username || "Someone";
              return (
                <Link
                  key={`${item.type}-${i}`}
                  href={item.url}
                  className="flex items-start gap-2.5 px-5 py-2.5 hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                >
                  <UserAvatar
                    name={userName}
                    src={item.user?.image}
                    size="sm"
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-primary dark:text-text-dark-primary leading-snug">
                      <span className="font-medium">{userName}</span>
                      <span className="text-text-tertiary">
                        {item.type === "question" ? " asked" : " answered"}
                      </span>
                    </p>
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary truncate">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">{timeAgo(item.createdAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Ad Placement */}
      <div className="bg-white border border-border-light rounded-xl overflow-hidden dark:bg-surface-dark dark:border-border-dark-light">
        <AdUnit slot="homepage-sidebar" format="rectangle" />
        <div className="border border-dashed border-border dark:border-border-dark rounded-lg p-6 m-4 text-center">
          <Megaphone className="w-6 h-6 text-primary/40 mx-auto mb-2" />
          <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary mb-1">
            Reach 500+ researchers
          </p>
          <p className="text-[10px] text-text-tertiary mb-3">
            Promote your product, service, or event to the research community
          </p>
          <Link
            href="/advertise"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/5 transition-colors"
          >
            Advertise Here
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Featured Researcher */}
      {featured && (
        <div className="bg-white border border-border-light rounded-xl p-5 dark:bg-surface-dark dark:border-border-dark-light">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              Featured Researcher
            </h3>
          </div>
          <Link href={`/profile/${featured.username}`} className="block group">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar name={featured.name || "Researcher"} src={featured.image} size="lg" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary group-hover:text-primary transition-colors truncate">
                  {featured.name}
                </p>
                <p className="text-xs text-text-tertiary">@{featured.username}</p>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-1 ${getLevel(featured.points).color} ${getLevel(featured.points).bgColor}`}>
                  {getLevel(featured.points).name}
                </span>
              </div>
            </div>
            {featured.bio && (
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-2">
                {featured.bio}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span>{featured._count.answers} answers</span>
              <span>{featured.points} points</span>
            </div>
            {featured.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {featured.expertise.slice(0, 3).map((e) => (
                  <span key={e} className="px-2 py-0.5 rounded-full bg-surface dark:bg-surface-dark text-[10px] text-text-tertiary border border-border/50 dark:border-border-dark/50">
                    {e}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="bg-white border border-border-light rounded-xl p-5 dark:bg-surface-dark dark:border-border-dark-light">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
            Weekly Digest
          </h3>
        </div>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-3">
          Top questions, new tools, and research highlights delivered to your inbox every week.
        </p>
        <form action="/api/newsletter" method="POST" className="space-y-2">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            aria-label="Email address for newsletter"
            placeholder="you@university.edu"
            className="w-full px-3 py-2 text-xs border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-light transition-colors"
          />
          <button
            type="submit"
            className="w-full py-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-all"
          >
            Subscribe
          </button>
        </form>
        <p className="text-[10px] text-text-tertiary mt-2 text-center">
          No spam. Unsubscribe anytime.
        </p>
      </div>

      <SuggestedResearchers />
    </div>
  );
}
