"use client";

import { useRef, useState, useTransition } from "react";
import { createComment } from "@/server/actions/comments";

interface CommentFormProps {
  targetType: string;
  targetId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  targetType,
  targetId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Add a comment...",
}: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createComment(targetType, targetId, formData, parentId);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        onSuccess?.();
        // Refresh to show new comment
        window.location.reload();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      <textarea
        name="body"
        rows={2}
        required
        placeholder={placeholder}
        className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary-light outline-none resize-none bg-white dark:bg-surface-dark dark:border-border-dark dark:text-text-dark-primary placeholder:text-text-tertiary"
      />
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-border rounded-md text-text-secondary hover:bg-surface transition-colors dark:border-border-dark dark:text-text-dark-secondary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {isPending ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  );
}
