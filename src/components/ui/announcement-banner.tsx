"use client";

import { useState } from "react";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
  type: string;
}

interface AnnouncementBannerProps {
  announcement: Announcement | null;
}

const typeConfig: Record<
  string,
  { classes: string; icon: React.ReactNode }
> = {
  info: {
    classes:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800",
    icon: <Info className="size-4 shrink-0" />,
  },
  warning: {
    classes:
      "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 border-b border-yellow-200 dark:border-yellow-800",
    icon: <AlertTriangle className="size-4 shrink-0" />,
  },
  success: {
    classes:
      "bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 border-b border-green-200 dark:border-green-800",
    icon: <CheckCircle className="size-4 shrink-0" />,
  },
  error: {
    classes:
      "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-b border-red-200 dark:border-red-800",
    icon: <AlertCircle className="size-4 shrink-0" />,
  },
};

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  const config = typeConfig[announcement.type] ?? typeConfig.info;

  return (
    <div className={`w-full px-4 py-2.5 flex items-center gap-3 ${config.classes}`}>
      {config.icon}
      <p className="text-sm flex-1 text-center">{announcement.message}</p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
        aria-label="Dismiss announcement"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
