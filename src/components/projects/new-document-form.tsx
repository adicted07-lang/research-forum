"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDocument } from "@/server/actions/projects";

interface NewDocumentFormProps {
  projectId: string;
  projectSlug: string;
}

export function NewDocumentForm({ projectId, projectSlug }: NewDocumentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return;

    startTransition(async () => {
      const result = await createDocument(projectId, title.trim(), "");
      if ("error" in result && result.error) {
        setError(result.error);
      } else if ("id" in result && result.id) {
        router.push(`/projects/${projectSlug}/docs/${result.id}`);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        + New Document
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Document title"
          autoFocus
          className="flex-1 rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="px-4 py-2 rounded-md border border-border-light text-sm font-medium text-text-secondary hover:bg-surface transition-colors dark:border-border-dark-light dark:text-text-dark-secondary dark:hover:bg-surface-dark"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
