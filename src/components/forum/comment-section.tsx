"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CommentForm } from "@/components/forum/comment-form";

interface CommentAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  body: string;
  author: CommentAuthor;
  createdAt: Date;
  replies?: Comment[];
}

interface CommentSectionProps {
  targetType: string;
  targetId: string;
  comments: Comment[];
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

function CommentItem({
  comment,
  targetType,
  targetId,
  isReply = false,
}: {
  comment: Comment;
  targetType: string;
  targetId: string;
  isReply?: boolean;
}) {
  const { data: session } = useSession();
  const [showReply, setShowReply] = useState(false);
  const authorName =
    comment.author.name ?? comment.author.username ?? "Anonymous";

  return (
    <div className={`${isReply ? "ml-6 border-l-2 border-border-light pl-4 dark:border-border-dark-light" : ""}`}>
      <div className="flex gap-2.5">
        <UserAvatar name={authorName} src={comment.author.image} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {comment.author.username ? (
              <Link
                href={`/profile/${comment.author.username}`}
                className="text-xs font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors"
              >
                {authorName}
              </Link>
            ) : (
              <span className="text-xs font-semibold text-text-primary dark:text-text-dark-primary">
                {authorName}
              </span>
            )}
            <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
              {relativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-text-primary dark:text-text-dark-primary leading-relaxed">
            {comment.body}
          </p>
          {!isReply && session && (
            <button
              onClick={() => setShowReply((prev) => !prev)}
              className="mt-1 text-[11px] text-text-tertiary hover:text-primary transition-colors"
            >
              {showReply ? "Cancel" : "Reply"}
            </button>
          )}
        </div>
      </div>

      {showReply && (
        <div className="ml-8 mt-2">
          <CommentForm
            targetType={targetType}
            targetId={targetId}
            parentId={comment.id}
            onCancel={() => setShowReply(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              targetType={targetType}
              targetId={targetId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  targetType,
  targetId,
  comments,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark-light">
      {comments.length > 0 && (
        <div className="space-y-3 mb-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              targetType={targetType}
              targetId={targetId}
            />
          ))}
        </div>
      )}

      {session ? (
        showForm ? (
          <CommentForm
            targetType={targetType}
            targetId={targetId}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-text-tertiary hover:text-primary transition-colors"
          >
            + Add a comment
          </button>
        )
      ) : (
        <p className="text-xs text-text-tertiary">
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>{" "}
          to comment
        </p>
      )}
    </div>
  );
}
