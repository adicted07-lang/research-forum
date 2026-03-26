"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  initialBookmarked?: boolean;
}

export function BookmarkButton({ initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  return (
    <button
      onClick={() => setBookmarked((prev) => !prev)}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        bookmarked
          ? "text-primary hover:text-primary/80"
          : "text-text-tertiary hover:text-text-secondary"
      )}
    >
      <Bookmark
        className={cn("w-4 h-4", bookmarked && "fill-primary")}
      />
    </button>
  );
}
