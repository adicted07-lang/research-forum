import Link from "next/link";
import { getLeaderboard } from "@/server/actions/leaderboard";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StreakFire } from "@/components/shared/streak-fire";

const rankColors: Record<number, string> = {
  1: "text-yellow-500 font-bold",
  2: "text-gray-400 font-bold",
  3: "text-amber-600 font-bold",
};

export async function LeaderboardCard() {
  const users = await getLeaderboard(5);

  return (
    <div className="bg-white border border-border-light rounded-lg p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Top Researchers This Week
      </h3>

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
              <UserAvatar
                name={user.name ?? user.username ?? "User"}
                src={user.image}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.name ?? user.username}
                </p>
                <p className="text-xs text-text-tertiary">{user.points} pts</p>
              </div>
              {user.currentStreak > 0 && (
                <StreakFire count={user.currentStreak} />
              )}
            </li>
          );
        })}
      </ul>

      <Link
        href="/leaderboard"
        className="mt-4 block text-sm text-primary hover:underline text-right"
      >
        View all →
      </Link>
    </div>
  );
}
