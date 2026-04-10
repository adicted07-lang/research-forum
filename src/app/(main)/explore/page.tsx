import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { LevelBadge } from "@/components/shared/level-badge";
import { FollowButton } from "@/components/social/follow-button";
import { ExploreFilters } from "@/components/explore/explore-filters";
import { getSuggestedResearchers, getTopExpertiseTags } from "@/lib/discover";
import { auth } from "@/auth";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover Researchers — The Intellectual Exchange",
  description: "Find and connect with market researchers by expertise, industry, and shared interests.",
};

interface ExplorePageProps {
  searchParams: Promise<{ industry?: string; expertise?: string; availability?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const session = await auth();

  const filters = {
    industry: params.industry || undefined,
    expertise: params.expertise || undefined,
    availability: params.availability || undefined,
  };

  const [researchers, expertiseTags] = await Promise.all([
    getSuggestedResearchers(20, filters),
    getTopExpertiseTags(20),
  ]);

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
            Discover Researchers
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
            Find researchers to follow based on shared expertise and interests.
          </p>
        </div>

        <ExploreFilters expertiseTags={expertiseTags} />

        {researchers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-text-tertiary dark:text-text-dark-tertiary mx-auto mb-3" />
            <p className="text-text-secondary dark:text-text-dark-secondary">
              No researchers found matching your filters.
            </p>
            {(params.industry || params.expertise || params.availability) && (
              <Link href="/explore" className="text-sm text-primary hover:underline mt-2 inline-block">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchers.map((researcher) => {
              return (
                <div
                  key={researcher.id}
                  className="border border-border dark:border-border-dark rounded-xl p-5 bg-surface dark:bg-surface-dark hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/profile/${researcher.username}`} className="flex items-center gap-3">
                      <UserAvatar name={researcher.name} src={researcher.image} size="md" />
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-dark-primary text-sm">
                          {researcher.name || researcher.username}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                          @{researcher.username}
                        </p>
                      </div>
                    </Link>
                    <LevelBadge points={researcher.points} size="sm" />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {researcher.expertise.slice(0, 3).map((tag) => (
                      <BadgePill key={tag} label={tag} variant="primary" />
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                      {researcher.mutualFollowers > 0
                        ? `${researcher.mutualFollowers} people you follow`
                        : `${researcher._count.followers} followers`}
                    </div>
                    {session?.user && session.user.id !== researcher.id && (
                      <FollowButton
                        targetUserId={researcher.id}
                        initialFollowing={researcher.isFollowing}
                      />
                    )}
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
