"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveReport } from "@/server/actions/reports";

const RESOLUTIONS = [
  { value: "dismiss", label: "Dismiss" },
  { value: "warn_user", label: "Warn User" },
  { value: "remove_content", label: "Remove Content" },
];

interface ReportActionsProps {
  reportId: string;
}

export function ReportActions({ reportId }: ReportActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resolution, setResolution] = useState("dismiss");

  function handleResolve() {
    startTransition(async () => {
      const result = await resolveReport(reportId, resolution);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Report resolved");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        disabled={pending}
        className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground disabled:opacity-50"
      >
        {RESOLUTIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleResolve}
        disabled={pending}
        className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium"
      >
        Resolve
      </button>
    </div>
  );
}
