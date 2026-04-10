"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { startDirectMessage } from "@/server/actions/messages";

type DirectMessageButtonProps = {
  recipientId: string;
  isFollowing: boolean;
  existingThreadId?: string | null;
};

export function DirectMessageButton({ recipientId, isFollowing, existingThreadId }: DirectMessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isFollowing) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border dark:border-border-dark text-text-tertiary dark:text-text-dark-tertiary cursor-not-allowed opacity-60"
      >
        <MessageSquare className="w-4 h-4" />
        Follow to message
      </button>
    );
  }

  async function handleClick() {
    if (existingThreadId) {
      router.push(`/messages/${existingThreadId}`);
      return;
    }
    setLoading(true);
    try {
      const result = await startDirectMessage(recipientId, "");
      if ("threadId" in result) {
        router.push(`/messages/${result.threadId}`);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border dark:border-border-dark text-text-primary dark:text-text-dark-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors cursor-pointer disabled:opacity-50"
    >
      <MessageSquare className="w-4 h-4" />
      {loading ? "Opening..." : "Message"}
    </button>
  );
}
