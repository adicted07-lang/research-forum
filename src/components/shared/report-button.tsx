"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { createReport } from "@/server/actions/reports";

type TargetType = "QUESTION" | "ANSWER" | "LISTING" | "ARTICLE" | "COMMENT";

const REASONS = [
  "Spam",
  "Harassment",
  "Misinformation",
  "Off-topic",
  "Other",
] as const;

interface ReportButtonProps {
  targetType: TargetType;
  targetId: string;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createReport(targetType, targetId, reason);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Report submitted. Thank you.");
        setOpen(false);
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Report content"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        <Flag className="size-3.5" />
        <span>Report</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Popover */}
          <div className="absolute right-0 top-7 z-50 w-56 bg-popover border border-border rounded-xl shadow-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-2">
              Report content
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={pending}
                className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 font-medium"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
