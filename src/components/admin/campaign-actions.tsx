"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveCampaign, rejectCampaign } from "@/server/actions/admin";

interface CampaignActionsProps {
  campaignId: string;
}

export function CampaignActions({ campaignId }: CampaignActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveCampaign(campaignId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Campaign approved");
        router.refresh();
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectCampaign(campaignId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Campaign rejected");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 font-medium transition-colors disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium transition-colors disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
