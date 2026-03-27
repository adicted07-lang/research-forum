"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { pauseCampaign, resumeCampaign } from "@/server/actions/campaigns";

type CampaignStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "REJECTED";

type AdType = "FEED" | "BANNER" | "FEATURED_LISTING";

interface Campaign {
  id: string;
  campaignName: string;
  status: string;
  adType: string;
  creativeHeadline: string;
  creativeDescription: string;
  creativeCtaUrl: string;
  creativeImage: string | null;
  budgetType: string;
  budgetAmount: number;
  bidType: string;
  bidAmount: number;
  spend: number;
  impressions: number;
  clicks: number;
  startDate: Date;
  endDate: Date;
  targetingCategories: string[];
  targetingUserType: string[];
  targetingGeography: string[];
}

interface CampaignDetailProps {
  campaign: Campaign;
}

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  ACTIVE: {
    label: "Active",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  PAUSED: {
    label: "Paused",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

const AD_TYPE_LABELS: Record<AdType, string> = {
  FEED: "Feed Ad",
  BANNER: "Banner Ad",
  FEATURED_LISTING: "Featured Listing",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-border-light rounded-lg p-4 dark:bg-surface-dark dark:border-border-dark-light">
      <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
          {sub}
        </p>
      )}
    </div>
  );
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = campaign.status as CampaignStatus;
  const adType = campaign.adType as AdType;
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const adTypeLabel = AD_TYPE_LABELS[adType] ?? campaign.adType;

  const ctr =
    campaign.impressions > 0
      ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
      : "0.00";
  const remaining = Math.max(0, campaign.budgetAmount - campaign.spend);

  async function handlePause() {
    setError(null);
    setLoading(true);
    try {
      const result = await pauseCampaign(campaign.id);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("Failed to pause campaign.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResume() {
    setError(null);
    setLoading(true);
    try {
      const result = await resumeCampaign(campaign.id);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("Failed to resume campaign.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            {campaign.campaignName}
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                statusConfig.className
              )}
            >
              {statusConfig.label}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-text-secondary dark:bg-surface-dark dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light">
              {adTypeLabel}
            </span>
          </div>
        </div>

        {/* Pause / Resume */}
        <div className="shrink-0">
          {status === "ACTIVE" && (
            <button
              onClick={handlePause}
              disabled={loading}
              className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-md hover:bg-orange-200 disabled:opacity-60 transition-colors dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
            >
              {loading ? "Pausing..." : "Pause Campaign"}
            </button>
          )}
          {status === "PAUSED" && (
            <button
              onClick={handleResume}
              disabled={loading}
              className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-md hover:bg-green-200 disabled:opacity-60 transition-colors dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
            >
              {loading ? "Resuming..." : "Resume Campaign"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Performance stats */}
      <div>
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-3">
          Performance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Impressions"
            value={campaign.impressions.toLocaleString()}
          />
          <StatCard
            label="Clicks"
            value={campaign.clicks.toLocaleString()}
          />
          <StatCard label="CTR" value={`${ctr}%`} />
          <StatCard
            label="Spend"
            value={`$${campaign.spend.toFixed(2)}`}
            sub={`$${remaining.toFixed(2)} remaining`}
          />
        </div>
      </div>

      {/* Campaign info */}
      <div className="bg-white border border-border-light rounded-lg p-5 space-y-4 dark:bg-surface-dark dark:border-border-dark-light">
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Campaign Info
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-tertiary dark:text-text-dark-tertiary mb-0.5">
              Schedule
            </p>
            <p className="text-text-primary dark:text-text-dark-primary">
              {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
            </p>
          </div>
          <div>
            <p className="text-text-tertiary dark:text-text-dark-tertiary mb-0.5">
              Budget
            </p>
            <p className="text-text-primary dark:text-text-dark-primary">
              ${campaign.budgetAmount.toFixed(2)} (
              {campaign.budgetType.toLowerCase()})
            </p>
          </div>
          <div>
            <p className="text-text-tertiary dark:text-text-dark-tertiary mb-0.5">
              Bid Type
            </p>
            <p className="text-text-primary dark:text-text-dark-primary">
              {campaign.bidType} — ${campaign.bidAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Creative preview */}
      <div className="bg-white border border-border-light rounded-lg p-5 space-y-3 dark:bg-surface-dark dark:border-border-dark-light">
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Creative Preview
        </h2>

        <div className="border border-border-light rounded-md p-4 bg-surface dark:bg-surface-dark dark:border-border-dark-light">
          {campaign.creativeImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.creativeImage}
              alt="Ad creative"
              className="w-full max-h-40 object-cover rounded mb-3"
            />
          )}
          <h3 className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-1">
            {campaign.creativeHeadline}
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
            {campaign.creativeDescription}
          </p>
          <a
            href={campaign.creativeCtaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Learn More →
          </a>
        </div>
      </div>

      {/* Targeting */}
      <div className="bg-white border border-border-light rounded-lg p-5 space-y-4 dark:bg-surface-dark dark:border-border-dark-light">
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Targeting
        </h2>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-text-tertiary dark:text-text-dark-tertiary mb-1">
              Categories
            </p>
            {campaign.targetingCategories.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {campaign.targetingCategories.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 bg-surface text-text-secondary rounded-full text-xs dark:bg-surface-dark dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary dark:text-text-dark-secondary">
                All categories
              </p>
            )}
          </div>
          <div>
            <p className="text-text-tertiary dark:text-text-dark-tertiary mb-1">
              User Type
            </p>
            {campaign.targetingUserType.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {campaign.targetingUserType.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-surface text-text-secondary rounded-full text-xs dark:bg-surface-dark dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary dark:text-text-dark-secondary">
                All users
              </p>
            )}
          </div>
          <div>
            <p className="text-text-tertiary dark:text-text-dark-tertiary mb-1">
              Geography
            </p>
            {campaign.targetingGeography.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {campaign.targetingGeography.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 bg-surface text-text-secondary rounded-full text-xs dark:bg-surface-dark dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Global
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
