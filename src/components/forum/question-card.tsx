import Link from "next/link";
import { MessageSquare } from "lucide-react";
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

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    body: string;
    slug: string;
    tags: string[];
    category: string;
    researchDomain?: string | null;
    bounty: number;
    status: string;
    upvoteCount: number;
    answerCount: number;
    author: QuestionAuthor;
    createdAt: Date;
  };
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

export function QuestionCard({ question }: QuestionCardProps) {
  const authorName = question.author.name ?? question.author.username ?? "Anonymous";
  const excerpt = question.body.length > 120
    ? question.body.slice(0, 120) + "..."
    : question.body;

  return (
    <div className="flex gap-4 bg-white border border-border-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all duration-200 dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
      {/* Vote button */}
      <div className="shrink-0">
        <VoteButton
          targetType="QUESTION"
          targetId={question.id}
          initialCount={question.upvoteCount}
          initialVote={null}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={`/forum/${question.slug}`}>
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors line-clamp-2 mb-1">
            {question.title}
          </h2>
        </Link>

        <p className="text-sm text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-3">
          {excerpt}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Author */}
          <Link
            href={`/profile/${question.author.username ?? ""}`}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <UserAvatar name={authorName} src={question.author.image} size="sm" />
            <span className="text-xs text-text-secondary dark:text-text-dark-secondary hover:text-primary transition-colors">
              {authorName}
            </span>
          </Link>

          {/* Answer count */}
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{question.answerCount} answers</span>
          </div>

          {/* Research Domain */}
          {question.researchDomain && (
            <span className="text-xs font-medium text-primary bg-primary-lighter px-2 py-0.5 rounded-full">
              {question.researchDomain}
            </span>
          )}

          {/* Tags */}
          {question.tags.slice(0, 3).map((tag) => (
            <BadgePill key={tag} label={tag} />
          ))}

          {/* Bounty */}
          {question.bounty > 0 && (
            <BadgePill
              label={`$${question.bounty} bounty`}
              variant="bounty"
            />
          )}

          {/* Status */}
          <StatusBadge status={normalizeStatus(question.status)} />
        </div>
      </div>
    </div>
  );
}
