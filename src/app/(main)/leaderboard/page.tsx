import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StreakFire } from "@/components/shared/streak-fire";
import { getLeaderboard } from "@/server/actions/leaderboard";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard — ResearchHub",
};

const rankMedal: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const rankRowClass: Record<number, string> = {
  1: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700/30",
  2: "bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700/30",
  3: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/30",
};

const rankNumClass: Record<number, string> = {
  1: "text-yellow-500 font-bold",
  2: "text-gray-400 font-bold",
  3: "text-amber-600 font-bold",
};

export default async function LeaderboardPage() {
  let users: Awaited<ReturnType<typeof getLeaderboard>> = [];
  try {
    users = await getLeaderboard(50);
  } catch {
    // DB unavailable — show empty state
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-dark-secondary">
            Top researchers ranked by points earned through contributions.
          </p>
        </div>

        {users.length === 0 ? (
          <EmptyState
            title="No researchers yet"
            description="Be the first to earn points by asking questions and contributing answers."
            icon={<Trophy className="w-12 h-12" />}
          />
        ) : (
          <div className="space-y-2">
            {users.map((user, index) => {
              const rank = index + 1;
              const rowClass = rankRowClass[rank] ?? "border-border-light dark:border-border-dark-light";
              const numClass = rankNumClass[rank] ?? "text-text-tertiary dark:text-text-dark-tertiary";
              const displayName = user.name ?? user.username ?? "Unknown";
              const profileHref = user.username
                ? `/profile/${user.username}`
                : `/profile/${user.id}`;

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg border bg-white dark:bg-surface-dark ${rowClass}`}
                >
                  {/* Rank */}
                  <span className={`w-8 text-center text-sm shrink-0 ${numClass}`}>
                    {rankMedal[rank] ?? rank}
                  </span>

                  {/* Avatar */}
                  <UserAvatar name={displayName} src={user.image} size="md" />

                  {/* Name + link */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={profileHref}
                      className="text-sm font-medium text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors truncate block"
                    >
                      {displayName}
                    </Link>
                    {user.username && (
                      <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary truncate">
                        @{user.username}
                      </p>
                    )}
                  </div>

                  {/* Streak */}
                  {user.currentStreak > 0 && (
                    <StreakFire count={user.currentStreak} />
                  )}

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                      {user.points.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary ml-1">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
