"use client";

import { UserPlus, ThumbsUp, MessageSquare, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
  onClick?: (link?: string | null) => void;
}

function getIcon(type: string) {
  switch (type) {
    case "follow":
      return <UserPlus className="w-4 h-4 text-primary shrink-0" />;
    case "upvote":
      return <ThumbsUp className="w-4 h-4 text-success shrink-0" />;
    case "comment":
    case "answer":
      return <MessageSquare className="w-4 h-4 text-warning shrink-0" />;
    default:
      return <Bell className="w-4 h-4 text-text-tertiary shrink-0" />;
  }
}

export function NotificationItem({
  type,
  title,
  body,
  link,
  isRead,
  createdAt,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      onClick={() => onClick?.(link)}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors",
        !isRead && "bg-primary-light/30"
      )}
    >
      <div className="mt-0.5">{getIcon(type)}</div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm text-text-primary truncate",
            !isRead && "font-semibold"
          )}
        >
          {title}
        </p>
        {body && (
          <p className="text-xs text-text-tertiary truncate mt-0.5">{body}</p>
        )}
        <p className="text-xs text-text-tertiary mt-1">
          {relativeTime(createdAt)}
        </p>
      </div>
      {!isRead && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </button>
  );
}
