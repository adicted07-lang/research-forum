import { Clock } from "lucide-react";

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function LastUpdated({ date }: { date: Date }) {
  const ago = timeAgo(date);
  if (ago === "today") return null; // Don't show if just updated today

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
      <Clock className="w-3 h-3" />
      Updated {ago}
    </span>
  );
}
