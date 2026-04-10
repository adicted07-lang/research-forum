"use client";

import { useState } from "react";
import { toggleEndorsement } from "@/server/actions/endorsements";

type EndorseButtonProps = {
  endorseeId: string;
  skill: string;
  endorsed: boolean;
  onToggle?: (endorsed: boolean) => void;
};

export function EndorseButton({ endorseeId, skill, endorsed: initialEndorsed, onToggle }: EndorseButtonProps) {
  const [endorsed, setEndorsed] = useState(initialEndorsed);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const previousState = endorsed;
    setEndorsed(!endorsed);
    onToggle?.(!endorsed);

    try {
      const result = await toggleEndorsement(endorseeId, skill);
      if ("endorsed" in result && typeof result.endorsed === "boolean") {
        setEndorsed(result.endorsed);
        onToggle?.(result.endorsed);
      } else {
        setEndorsed(previousState);
        onToggle?.(previousState);
      }
    } catch {
      setEndorsed(previousState);
      onToggle?.(previousState);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      data-endorsed={endorsed}
      aria-label={endorsed ? `Remove endorsement for ${skill}` : `Endorse ${skill}`}
      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium transition-colors ${
        endorsed
          ? "bg-primary text-white hover:bg-red-500"
          : "bg-surface-secondary dark:bg-surface-dark-secondary text-text-secondary dark:text-text-dark-secondary hover:bg-primary hover:text-white"
      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {endorsed ? "✓" : "+1"}
    </button>
  );
}
