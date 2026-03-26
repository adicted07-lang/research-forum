import { Eye } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { StatusBadge } from "@/components/shared/status-badge";
import { VoteButton } from "@/components/forum/vote-button";

interface QuestionAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface QuestionDetailProps {
  question: {
    id: string;
    title: string;
    body: string;
    slug: string;
    tags: string[];
    category: string;
    bounty: number;
    status: string;
    upvoteCount: number;
    viewCount: number;
    author: QuestionAuthor;
    createdAt: Date;
  };
  currentUserId?: string | null;
}

function normalizeStatus(
  status: string
): "open" | "answered" | "closed" | "filled" {
  const s = status.toLowerCase();
  if (s === "open") return "open";
  if (s === "answered") return "answered";
  if (s === "closed") return "closed";
  return "open";
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function QuestionDetail({ question, currentUserId }: QuestionDetailProps) {
  const authorName =
    question.author.name ?? question.author.username ?? "Anonymous";
  const isAuthor = currentUserId === question.author.id;

  return (
    <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
      {/* Header */}
      <div className="flex gap-4">
        {/* Vote */}
        <div className="shrink-0">
          <VoteButton
            targetType="QUESTION"
            targetId={question.id}
            initialCount={question.upvoteCount}
            initialVote={null}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Category + Status */}
          <div className="flex items-center gap-2 mb-2">
            <BadgePill label={question.category} variant="primary" />
            <StatusBadge status={normalizeStatus(question.status)} />
            {question.bounty > 0 && (
              <BadgePill
                label={`$${question.bounty} bounty`}
                variant="bounty"
              />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-3">
            {question.title}
          </h1>

          {/* Body */}
          <div className="text-text-primary dark:text-text-dark-primary text-sm leading-relaxed whitespace-pre-wrap mb-4">
            {question.body}
          </div>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {question.tags.map((tag) => (
                <BadgePill key={tag} label={tag} />
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <UserAvatar
                  name={authorName}
                  src={question.author.image}
                  size="sm"
                />
                <span className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary">
                  {authorName}
                </span>
              </div>
              <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                {relativeTime(question.createdAt)}
              </span>
              <div className="flex items-center gap-1 text-xs text-text-tertiary">
                <Eye className="w-3.5 h-3.5" />
                <span>{question.viewCount} views</span>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary italic">
                  Your question
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
