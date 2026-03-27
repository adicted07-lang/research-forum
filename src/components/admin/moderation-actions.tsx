"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveArticle, rejectArticle } from "@/server/actions/articles";

interface ModerationActionsProps {
  articleId: string;
}

export function ModerationActions({ articleId }: ModerationActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveArticle(articleId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Article approved");
        router.refresh();
      }
    });
  }

  function handleReject() {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    startTransition(async () => {
      const result = await rejectArticle(articleId, reason);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Article rejected");
        setShowRejectInput(false);
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-start gap-2 flex-wrap">
      <button
        onClick={handleApprove}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 font-medium transition-colors disabled:opacity-50"
      >
        Approve
      </button>

      {showRejectInput ? (
        <div className="flex items-center gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground w-48 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleReject}
            disabled={pending}
            className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium transition-colors disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              setShowRejectInput(false);
              setReason("");
            }}
            disabled={pending}
            className="text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleReject}
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      )}
    </div>
  );
}
