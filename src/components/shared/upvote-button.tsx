"use client";

import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";

interface UpvoteButtonProps {
  count: number;
  isActive?: boolean;
  onVote?: () => void;
  className?: string;
}

export function UpvoteButton({
  count,
  isActive = false,
  onVote,
  className,
}: UpvoteButtonProps) {
  return (
    <button
      onClick={onVote}
      data-active={isActive ? "true" : undefined}
      className={cn(
        "flex flex-col items-center gap-0.5 px-3.5 py-2.5 rounded-md border transition-all duration-200 min-w-[52px]",
        isActive
          ? "border-primary bg-primary text-white"
          : "border-border bg-white hover:border-primary hover:bg-primary-light dark:bg-surface-dark dark:border-border-dark",
        className
      )}
    >
      <ChevronUp
        data-testid="upvote-arrow"
        className={cn(
          "w-4 h-4 transition-colors",
          isActive ? "text-white" : "text-text-tertiary"
        )}
      />
      <span
        className={cn(
          "text-sm font-bold transition-colors",
          isActive ? "text-white" : "text-text-primary dark:text-text-dark-primary"
        )}
      >
        {count}
      </span>
    </button>
  );
}
