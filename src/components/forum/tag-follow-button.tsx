"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { toggleTagFollow } from "@/server/actions/tag-follows";

interface TagFollowButtonProps {
  tag: string;
  initialFollowing?: boolean;
}

export function TagFollowButton({ tag, initialFollowing = false }: TagFollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleTagFollow(tag);
      if ("following" in result && result.following !== undefined) {
        setFollowing(result.following);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        following
          ? "bg-primary/10 text-primary"
          : "bg-surface text-text-secondary hover:bg-surface-hover dark:bg-surface-dark dark:text-text-dark-secondary"
      } ${isPending ? "opacity-50" : ""}`}
    >
      {following ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
      {tag}
    </button>
  );
}
