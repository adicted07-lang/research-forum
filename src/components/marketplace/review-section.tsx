import { Star } from "lucide-react";
import { getReviews, getAverageRating } from "@/server/actions/reviews";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";

interface ReviewSectionProps {
  targetType: string;
  targetId: string;
}

function StarDisplay({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= filled
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-text-tertiary"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export async function ReviewSection({ targetType, targetId }: ReviewSectionProps) {
  let reviews: Awaited<ReturnType<typeof getReviews>> = [];
  let avgRating: number | null = null;

  try {
    reviews = await getReviews(targetType, targetId);
  } catch {
    // fallback
  }

  try {
    avgRating = await getAverageRating(targetType, targetId);
  } catch {
    // fallback
  }

  return (
    <div className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
          Reviews
        </h2>
        {avgRating != null && reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarDisplay rating={avgRating} />
            <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary text-center py-4">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const reviewerName =
              review.reviewer.name ?? review.reviewer.username ?? "Anonymous";
            return (
              <div
                key={review.id}
                className="border-t border-border-light dark:border-border-dark-light pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={reviewerName} src={review.reviewer.image} size="sm" />
                    <div>
                      <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                        {reviewerName}
                      </span>
                      <div className="mt-0.5">
                        <StarDisplay rating={review.rating} />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary shrink-0">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">
                  {review.body}
                </p>
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {review.tags.map((tag) => (
                      <BadgePill key={tag} label={tag} variant="primary" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
