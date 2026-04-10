import Link from "next/link";
import { HelpCircle, FileText, MessageSquare, Briefcase } from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";
import type { FeedItem } from "@/lib/feed";

const typeConfig = {
  question: { icon: HelpCircle, label: "Question", color: "text-green-500" },
  article: { icon: FileText, label: "Article", color: "text-purple-500" },
  answer: { icon: MessageSquare, label: "Answer", color: "text-blue-500" },
  job: { icon: Briefcase, label: "Job", color: "text-amber-500" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function FeedCard({ item }: { item: FeedItem }) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-5 bg-surface dark:bg-surface-dark hover:shadow-sm transition-shadow">
      {/* Type label */}
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>

      {/* Title */}
      <Link href={item.url} className="block mb-1">
        <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors line-clamp-2">
          {item.type === "answer" ? `Answered: ${item.title}` : item.title}
        </h3>
      </Link>

      {/* Body preview */}
      {item.body && item.type !== "job" && (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-3">
          {item.body}
        </p>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map((tag) => (
            <BadgePill key={tag} label={tag} variant="primary" />
          ))}
        </div>
      )}

      {/* Job-specific: location */}
      {item.type === "job" && item.body && (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
          {item.body}
        </p>
      )}

      {/* Footer: author + stats */}
      <div className="flex items-center justify-between text-xs text-text-tertiary dark:text-text-dark-tertiary">
        <div className="flex items-center gap-2">
          {item.author.image ? (
            <img src={item.author.image} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-surface-secondary dark:bg-surface-dark-secondary flex items-center justify-center text-[10px] font-bold">
              {(item.author.name || "?")[0]}
            </div>
          )}
          <span>{item.author.name || item.author.username || "Anonymous"}</span>
          <span>·</span>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          {item.stats.upvotes !== undefined && <span>{item.stats.upvotes} upvotes</span>}
          {item.stats.answers !== undefined && <span>{item.stats.answers} answers</span>}
          {item.stats.readTime !== undefined && <span>{item.stats.readTime} min read</span>}
        </div>
      </div>
    </div>
  );
}
