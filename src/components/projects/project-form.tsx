"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/server/actions/projects";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

export function ProjectForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("description", descriptionHtml);

    startTransition(async () => {
      const result = await createProject(formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("slug" in result && result.slug) {
        router.push(`/projects/${result.slug}`);
      } else {
        router.push("/projects");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light"
    >
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          placeholder="e.g., Climate Data Analysis Pipeline"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          placeholder="Describe your project, its goals, and what collaborators will work on..."
          onChange={setDescriptionHtml}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            Visibility
          </label>
          <select
            name="visibility"
            defaultValue="private"
            className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
          >
            <option value="private">Private — invite only</option>
            <option value="public">Public — visible to all</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            Tags
            <span className="text-text-tertiary font-normal ml-1">(optional, comma-separated)</span>
          </label>
          <input
            name="tags"
            type="text"
            placeholder="e.g., ML, climate, genomics"
            className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating project..." : "Create Project"}
      </button>
    </form>
  );
}
