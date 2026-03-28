import Link from "next/link";
import { getLeaderboard } from "@/server/actions/leaderboard";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StreakFire } from "@/components/shared/streak-fire";
import { AnimatedTooltipGroup, type TooltipItem } from "@/components/ui/animated-tooltip";

const rankColors: Record<number, string> = {
  1: "text-yellow-500 font-bold",
  2: "text-gray-400 font-bold",
  3: "text-amber-600 font-bold",
};

export async function LeaderboardCard() {
  const users = await getLeaderboard(5);

  // Build tooltip items for the animated avatar group
  const tooltipItems: TooltipItem[] = users.map((user) => ({
    id: user.id,
    name: user.name ?? user.username ?? "Researcher",
    designation: `${user.points} pts`,
    image: user.image ?? `https://api.dicebear.com/7.x/initials/svg?seed=${user.name ?? user.username}`,
  }));

  return (
    <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary mb-4">
        Top Researchers This Week
      </h3>

      {/* Animated avatar group at top */}
      {tooltipItems.length > 0 && (
        <div className="mb-4 flex justify-center pt-6">
          <AnimatedTooltipGroup items={tooltipItems} />
        </div>
      )}

      <ul className="space-y-3">
        {users.map((user, index) => {
          const rank = index + 1;
          return (
            <li key={user.id} className="flex items-center gap-3">
              <span
                className={`w-5 text-center text-sm shrink-0 ${
                  rankColors[rank] ?? "text-text-tertiary"
                }`}
              >
                {rank}
              </span>
              <Link href={`/profile/${user.username ?? user.id}`}>
                <UserAvatar
                  name={user.name ?? user.username ?? "User"}
                  src={user.image}
                  size="sm"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.username ?? user.id}`} className="hover:text-primary transition-colors">
                  <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                    {user.name ?? user.username}
                  </p>
                </Link>
                <p className="text-xs text-text-tertiary">{user.points} pts</p>
              </div>
              {user.currentStreak > 0 && (
                <StreakFire count={user.currentStreak} />
              )}
            </li>
          );
        })}
      </ul>

      {users.length === 0 && (
        <p className="text-sm text-text-tertiary text-center py-4">
          No researchers yet. Be the first!
        </p>
      )}

      <Link
        href="/leaderboard"
        className="mt-4 block text-sm text-primary hover:underline text-right"
      >
        View all →
      </Link>
    </div>
  );
}
