import Link from "next/link";
import { Star } from "lucide-react";
import { VoteButton } from "@/components/forum/vote-button";

interface ListingCardAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    tagline: string;
    slug: string;
    type: string;
    categoryTags: string[];
    upvoteCount: number;
    averageRating?: number | null;
    reviewCount?: number;
    author: ListingCardAuthor;
  };
}

function getIconGradient(type: string): string {
  if (type === "SERVICE") return "from-purple-500 to-purple-700";
  return "from-blue-500 to-blue-700";
}

function StarRating({ rating, count }: { rating?: number | null; count?: number }) {
  const r = rating ?? 0;
  const filled = Math.round(r);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= filled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-text-tertiary"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
        {count != null ? `(${count})` : "(0)"}
      </span>
    </div>
  );
}

export function ListingCard({ listing }: ListingCardProps) {
  const initial = listing.title[0]?.toUpperCase() ?? "?";
  const gradient = getIconGradient(listing.type);
  const isService = listing.type === "SERVICE";

  return (
    <div className="flex flex-col bg-white border border-border-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all duration-200 dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
      <Link href={`/marketplace/${listing.slug}`} className="flex gap-3 mb-3 group">
        {/* Icon placeholder */}
        <div
          className={`shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold`}
        >
          {initial}
        </div>
        {/* Title + tagline */}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary group-hover:text-primary truncate">
            {listing.title}
          </h3>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2 mt-0.5">
            {listing.tagline}
          </p>
        </div>
      </Link>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-light dark:border-border-dark-light">
        <div className="flex items-center gap-2">
          <StarRating rating={listing.averageRating} count={listing.reviewCount} />
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              isService
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            }`}
          >
            {isService ? "Service" : "Tool"}
          </span>
        </div>
        <VoteButton
          targetType="LISTING"
          targetId={listing.id}
          initialCount={listing.upvoteCount}
          initialVote={null}
        />
      </div>
    </div>
  );
}
