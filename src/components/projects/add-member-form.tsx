"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addProjectMember } from "@/server/actions/projects";

interface AddMemberFormProps {
  projectSlug: string;
}

export function AddMemberForm({ projectSlug }: AddMemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!username.trim()) return;

    startTransition(async () => {
      const result = await addProjectMember(projectSlug, username.trim());
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setUsername("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter username"
          className="flex-1 rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
        <button
          type="submit"
          disabled={isPending || !username.trim()}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-600 dark:text-green-400">Member added successfully.</p>
      )}
    </form>
  );
}
