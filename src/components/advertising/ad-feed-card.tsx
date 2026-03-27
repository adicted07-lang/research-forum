"use client";

import { useEffect } from "react";
import { trackImpression, trackClick } from "@/server/actions/campaigns";

interface AdFeedCardProps {
  campaignId: string;
  headline: string;
  description: string;
  ctaUrl: string;
}

export function AdFeedCard({
  campaignId,
  headline,
  description,
  ctaUrl,
}: AdFeedCardProps) {
  useEffect(() => {
    trackImpression(campaignId);
  }, [campaignId]);

  function handleClick() {
    trackClick(campaignId);
    window.open(ctaUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative bg-white border border-border-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all duration-200 dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
      {/* Sponsored badge */}
      <span className="absolute top-3 right-3 text-[10px] font-semibold text-text-tertiary dark:text-text-dark-tertiary uppercase tracking-wide bg-surface dark:bg-surface-dark px-2 py-0.5 rounded-full border border-border-light dark:border-border-dark-light">
        Sponsored
      </span>

      {/* Content */}
      <div className="pr-20">
        <button
          onClick={handleClick}
          className="block text-left w-full group"
        >
          <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {headline}
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-3">
            {description}
          </p>
        </button>

        <button
          onClick={handleClick}
          className="inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          Learn more →
        </button>
      </div>
    </div>
  );
}
