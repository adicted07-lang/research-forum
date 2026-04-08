"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toggleVote } from "@/server/actions/votes";

interface VoteControlsProps {
  targetType: string;
  targetId: string;
  upvoteCount: number;
  downvoteCount: number;
  initialVote: null | "UPVOTE" | "DOWNVOTE";
  userPoints?: number;
}

export function VoteControls({
  targetType,
  targetId,
  upvoteCount: initialUp,
  downvoteCount: initialDown,
  initialVote,
  userPoints = 0,
}: VoteControlsProps) {
  const [upCount, setUpCount] = useState(initialUp);
  const [downCount, setDownCount] = useState(initialDown);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const [isPending, startTransition] = useTransition();

  const netScore = upCount - downCount;
  const canDownvote = userPoints >= 50;

  function handleVote(value: "UPVOTE" | "DOWNVOTE") {
    if (value === "DOWNVOTE" && !canDownvote) return;

    if (currentVote === value) {
      if (value === "UPVOTE") setUpCount((p) => p - 1);
      else setDownCount((p) => p - 1);
      setCurrentVote(null);
    } else {
      if (currentVote === "UPVOTE") setUpCount((p) => p - 1);
      if (currentVote === "DOWNVOTE") setDownCount((p) => p - 1);
      if (value === "UPVOTE") setUpCount((p) => p + 1);
      else setDownCount((p) => p + 1);
      setCurrentVote(value);
    }

    startTransition(async () => {
      const result = await toggleVote(targetType, targetId, value);
      if (result?.error) {
        setUpCount(initialUp);
        setDownCount(initialDown);
        setCurrentVote(initialVote);
      }
    });
  }

  return (
    <div className={`flex flex-col items-center gap-0.5 ${isPending ? "opacity-70" : ""}`}>
      <button
        onClick={() => handleVote("UPVOTE")}
        className={`p-1 rounded transition-colors ${
          currentVote === "UPVOTE"
            ? "text-primary bg-primary-lighter"
            : "text-text-tertiary hover:text-primary hover:bg-primary-lighter"
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <span className={`text-sm font-semibold tabular-nums ${
        netScore > 0 ? "text-primary" : netScore < 0 ? "text-error" : "text-text-tertiary"
      }`}>
        {netScore}
      </span>
      <button
        onClick={() => handleVote("DOWNVOTE")}
        disabled={!canDownvote}
        title={!canDownvote ? "Reach Contributor level (50 IC) to downvote" : "Downvote"}
        className={`p-1 rounded transition-colors ${
          currentVote === "DOWNVOTE"
            ? "text-error bg-error/10"
            : canDownvote
              ? "text-text-tertiary hover:text-error hover:bg-error/10"
              : "text-text-tertiary/30 cursor-not-allowed"
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
