import { getPendingCampaigns } from "@/server/actions/admin";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { CampaignActions } from "./campaign-actions";
import Image from "next/image";

export async function AdminCampaignsTable() {
  const result = await getPendingCampaigns(1, 50);

  if ("error" in result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load campaigns.
      </div>
    );
  }

  const { campaigns } = result;

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-white dark:bg-[#13131A] border border-border rounded-xl">
        <p className="text-lg font-medium">No pending campaigns</p>
        <p className="text-sm mt-1">All campaigns have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5"
        >
          <div className="flex items-start gap-4 flex-wrap">
            {/* Creative preview */}
            {campaign.creativeImage && (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                <Image
                  src={campaign.creativeImage}
                  alt={campaign.campaignName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}

            {/* Campaign info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {campaign.campaignName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {campaign.creativeHeadline}
                  </p>
                </div>
                <Badge variant="outline">{campaign.adType}</Badge>
              </div>

              {/* Advertiser */}
              <div className="flex items-center gap-2 mt-2">
                <UserAvatar
                  name={campaign.advertiser.name ?? "?"}
                  src={campaign.advertiser.image}
                  size="sm"
                />
                <span className="text-sm text-muted-foreground">
                  {campaign.advertiser.name ?? campaign.advertiser.username ?? "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {campaign.advertiser.email}
                </span>
              </div>

              {/* Budget & dates */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                <span>
                  Budget:{" "}
                  <span className="font-medium text-foreground">
                    ${campaign.budgetAmount.toLocaleString()}
                  </span>
                </span>
                <span>
                  Start:{" "}
                  {new Date(campaign.startDate).toLocaleDateString()}
                </span>
                <span>
                  End:{" "}
                  {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0">
              <CampaignActions campaignId={campaign.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
