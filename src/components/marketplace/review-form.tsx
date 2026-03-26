"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { createReview } from "@/server/actions/reviews";

interface ReviewFormProps {
  targetType: string;
  targetId: string;
  isLoggedIn: boolean;
}

const REVIEW_TAGS = [
  "Reliable",
  "Fast Delivery",
  "Great Communication",
  "Good Value",
];

export function ReviewForm({ targetType, targetId, isLoggedIn }: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="bg-white border border-border-light rounded-lg p-6 text-center dark:bg-surface-dark dark:border-border-dark-light">
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
          Sign in to leave a review
        </p>
        <a
          href="/sign-in"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white border border-border-light rounded-lg p-6 text-center dark:bg-surface-dark dark:border-border-dark-light">
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          Your review has been submitted. Thank you!
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", String(rating));

    startTransition(async () => {
      const result = await createReview(targetType, targetId, formData);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
      <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-4">
        Write a Review
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star rating */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div
            className="flex gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className="p-0.5 transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-transparent text-text-tertiary"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="body"
            required
            rows={4}
            placeholder="Share your experience with this service or tool..."
            className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Tags <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map((tag) => (
              <label key={tag} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="tags"
                  value={tag}
                  className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
