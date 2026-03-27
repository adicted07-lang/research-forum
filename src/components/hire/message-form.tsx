"use client";

import { useState, useTransition, useRef } from "react";
import { sendMessage } from "@/server/actions/messages";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface MessageFormProps {
  threadId: string;
}

export function MessageForm({ threadId }: MessageFormProps) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;
    setError(null);

    const formData = new FormData();
    formData.set("body", value.trim());

    startTransition(async () => {
      const result = await sendMessage(threadId, formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      setValue("");
      router.refresh();
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form") as HTMLFormElement;
      form?.requestSubmit();
    }
  };

  return (
    <div className="border-t border-border-light dark:border-border-dark-light px-4 py-3">
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isPending}
          className="flex-1 rounded-full border border-border-light px-4 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending || !value.trim()}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
