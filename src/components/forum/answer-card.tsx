import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { VoteControls } from "@/components/shared/vote-controls";
import { AcceptAnswerButton } from "@/components/forum/accept-answer-button";
import { RichTextDisplay } from "@/components/shared/rich-text-display";

interface AnswerAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface AnswerCardProps {
  answer: {
    id: string;
    body: string;
    upvoteCount: number;
    downvoteCount?: number;
    isAccepted: boolean;
    author: AnswerAuthor;
    createdAt: Date;
  };
  questionAuthorId?: string | null;
  currentUserId?: string | null;
  questionHasAccepted: boolean;
  userVote?: null | "UPVOTE" | "DOWNVOTE";
  userPoints?: number;
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

export function AnswerCard({
  answer,
  questionAuthorId,
  currentUserId,
  questionHasAccepted,
  userVote,
  userPoints,
}: AnswerCardProps) {
  const authorName =
    answer.author.name ?? answer.author.username ?? "Anonymous";
  const isQuestionAuthor = currentUserId === questionAuthorId;
  const canAccept = isQuestionAuthor && !answer.isAccepted;

  return (
    <div
      className={`flex gap-4 bg-white border rounded-md p-4 dark:bg-surface-dark ${
        answer.isAccepted
          ? "border-success/40 bg-success/5 dark:bg-success/5"
          : "border-border-light dark:border-border-dark-light"
      }`}
    >
      {/* Vote */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <VoteControls
          targetType="ANSWER"
          targetId={answer.id}
          upvoteCount={answer.upvoteCount}
          downvoteCount={answer.downvoteCount ?? 0}
          initialVote={userVote ?? null}
          userPoints={userPoints ?? 0}
        />
        {answer.isAccepted && (
          <div className="flex flex-col items-center gap-0.5">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-[10px] font-semibold text-success">
              Accepted
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <RichTextDisplay content={answer.body} />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <UserAvatar name={authorName} src={answer.author.image} size="sm" />
            {answer.author.username ? (
              <Link
                href={`/profile/${answer.author.username}`}
                className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
              >
                {authorName}
              </Link>
            ) : (
              <span className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary">
                {authorName}
              </span>
            )}
            <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
              {relativeTime(answer.createdAt)}
            </span>
          </div>

          {canAccept && (
            <AcceptAnswerButton answerId={answer.id} />
          )}
        </div>
      </div>
    </div>
  );
}
