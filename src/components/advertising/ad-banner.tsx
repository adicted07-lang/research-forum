"use client";

import { useEffect } from "react";
import { trackImpression, trackClick } from "@/server/actions/campaigns";

interface AdBannerProps {
  campaignId: string;
  headline: string;
  description: string;
  ctaUrl: string;
  ctaLabel?: string;
}

export function AdBanner({
  campaignId,
  headline,
  description,
  ctaUrl,
  ctaLabel = "Learn More",
}: AdBannerProps) {
  useEffect(() => {
    trackImpression(campaignId);
  }, [campaignId]);

  function handleClick() {
    trackClick(campaignId);
    window.open(ctaUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 p-5 shadow-lg dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Advertisement label */}
      <span className="absolute top-3 right-3 text-[10px] font-medium text-white/40 uppercase tracking-wider">
        Advertisement
      </span>

      {/* Content */}
      <div className="pr-16">
        <h3 className="text-base font-bold text-white mb-2 leading-snug">
          {headline}
        </h3>
        <p className="text-sm text-white/70 mb-4 leading-relaxed line-clamp-3">
          {description}
        </p>
        <button
          onClick={handleClick}
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 active:scale-95 transition-all"
        >
          {ctaLabel} →
        </button>
      </div>
    </div>
  );
}
