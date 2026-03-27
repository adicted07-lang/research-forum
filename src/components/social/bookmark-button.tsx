"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleBookmark } from "@/server/actions/bookmarks";

interface BookmarkButtonProps {
  targetType: string;
  targetId: string;
  initialBookmarked?: boolean;
}

export function BookmarkButton({ targetType, targetId, initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleBookmark(targetType, targetId);
      if ("bookmarked" in result && typeof result.bookmarked === "boolean") {
        setBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        bookmarked
          ? "text-primary hover:text-primary/80"
          : "text-text-tertiary hover:text-text-secondary",
        isPending && "opacity-50"
      )}
    >
      <Bookmark className={cn("w-4 h-4", bookmarked && "fill-primary")} />
    </button>
  );
}
