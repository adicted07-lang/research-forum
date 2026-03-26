"use client";

import { useState, useTransition } from "react";
import { UpvoteButton } from "@/components/shared/upvote-button";
import { toggleVote } from "@/server/actions/votes";

interface VoteButtonProps {
  targetType: string;
  targetId: string;
  initialCount: number;
  initialVote: null | "UPVOTE" | "DOWNVOTE";
}

export function VoteButton({
  targetType,
  targetId,
  initialCount,
  initialVote,
}: VoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const [isPending, startTransition] = useTransition();

  const handleVote = () => {
    const newVote = currentVote === "UPVOTE" ? null : "UPVOTE";

    // Optimistic update
    setCount((prev) => (currentVote === "UPVOTE" ? prev - 1 : prev + 1));
    setCurrentVote(newVote);

    startTransition(async () => {
      const result = await toggleVote(targetType, targetId, "UPVOTE");
      if (result?.error) {
        // Revert on error
        setCount(initialCount);
        setCurrentVote(initialVote);
      }
    });
  };

  return (
    <UpvoteButton
      count={count}
      isActive={currentVote === "UPVOTE"}
      onVote={handleVote}
      className={isPending ? "opacity-70" : ""}
    />
  );
}
