import Link from "next/link";
import { HelpCircle, MessageSquare, FileText } from "lucide-react";

interface ActivityItem {
  type: "question" | "answer" | "article";
  title: string;
  url: string;
  createdAt: Date;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const iconMap = {
  question: HelpCircle,
  answer: MessageSquare,
  article: FileText,
} as const;

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary dark:text-text-dark-secondary text-sm">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const Icon = iconMap[item.type];
        return (
          <li key={index} className="flex items-start gap-3">
            <Icon className="w-4 h-4 mt-0.5 shrink-0 text-text-secondary dark:text-text-dark-secondary" />
            <div className="flex-1 min-w-0">
              <Link
                href={item.url}
                className="text-sm text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors truncate block"
              >
                {item.title}
              </Link>
            </div>
            <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary shrink-0">
              {timeAgo(item.createdAt)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
