import Link from "next/link";
import { UserAvatar } from "@/components/shared/user-avatar";
import { FollowButton } from "@/components/social/follow-button";
import { getSuggestedResearchers } from "@/lib/discover";
import { auth } from "@/auth";

export async function SuggestedResearchers() {
  const session = await auth();
  if (!session?.user) return null;

  const researchers = await getSuggestedResearchers(3);
  if (researchers.length === 0) return null;

  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-surface dark:bg-surface-dark">
      <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
        Researchers you might know
      </h3>
      <div className="space-y-3">
        {researchers.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2">
            <Link href={`/profile/${r.username}`} className="flex items-center gap-2 min-w-0">
              <UserAvatar name={r.name ?? r.username ?? "?"} src={r.image} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                  {r.name || r.username}
                </p>
                {r.expertise[0] && (
                  <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary truncate">
                    {r.expertise[0]}
                  </p>
                )}
              </div>
            </Link>
            <FollowButton targetUserId={r.id} initialFollowing={r.isFollowing} />
          </div>
        ))}
      </div>
      <Link
        href="/explore"
        className="block text-center text-xs text-primary hover:underline mt-3 pt-3 border-t border-border dark:border-border-dark"
      >
        See all →
      </Link>
    </div>
  );
}
