import Link from "next/link";
import { cn } from "@/lib/utils";

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
  startDate: Date;
  endDate: Date;
  impressions: number;
  clicks: number;
  budgetAmount: number;
  spend: number;
}

interface CampaignCardProps {
  campaign: Campaign;
}

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  PENDING_APPROVAL: {
    label: "Pending",
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const status = campaign.status as CampaignStatus;
  const adType = campaign.adType as AdType;
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const adTypeLabel = AD_TYPE_LABELS[adType] ?? campaign.adType;

  const ctr =
    campaign.impressions > 0
      ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
      : "0.00";

  return (
    <Link href={`/advertise/dashboard/${campaign.id}`}>
      <div className="bg-white border border-border-light rounded-lg p-5 hover:border-border hover:shadow-sm transition-all duration-200 dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary line-clamp-1">
            {campaign.campaignName}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                statusConfig.className
              )}
            >
              {statusConfig.label}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface text-text-secondary dark:bg-surface-dark dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light">
              {adTypeLabel}
            </span>
          </div>
        </div>

        {/* Date range */}
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-4">
          {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border-light dark:border-border-dark-light">
          <div>
            <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mb-0.5">
              Impressions
            </p>
            <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              {campaign.impressions.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mb-0.5">
              Clicks
            </p>
            <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              {campaign.clicks.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mb-0.5">
              CTR
            </p>
            <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              {ctr}%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mb-0.5">
              Spend / Budget
            </p>
            <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              ${campaign.spend.toFixed(2)} / ${campaign.budgetAmount.toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
