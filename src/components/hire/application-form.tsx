"use client";

import { useState, useTransition } from "react";
import { createApplication } from "@/server/actions/applications";

interface ApplicationFormProps {
  jobId: string;
  isAuthenticated: boolean;
  isResearcher: boolean;
}

const INPUT_CLASS =
  "w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary";

const LABEL_CLASS =
  "block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1";

export function ApplicationForm({ jobId, isAuthenticated, isResearcher }: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div
        id="apply"
        className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light text-center"
      >
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
          Sign in to apply to this job.
        </p>
        <a
          href="/login"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Sign in
        </a>
      </div>
    );
  }

  if (!isResearcher) {
    return null;
  }

  if (success) {
    return (
      <div
        id="apply"
        className="bg-green-50 border border-green-200 rounded-lg p-6 dark:bg-green-900/20 dark:border-green-800 text-center"
      >
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          Application submitted successfully!
        </p>
        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
          The company will review your application and get back to you.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert comma-separated portfolio links
    const linksRaw = formData.get("portfolioLinksInput") as string;
    formData.delete("portfolioLinksInput");
    if (linksRaw) {
      const links = linksRaw.split(",").map((l) => l.trim()).filter(Boolean);
      links.forEach((l) => formData.append("portfolioLinks", l));
    }

    startTransition(async () => {
      const result = await createApplication(jobId, formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  };

  return (
    <div id="apply" className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
      <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
        Apply for This Position
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LABEL_CLASS}>
            Cover Letter <span className="text-red-500">*</span>
          </label>
          <textarea
            name="coverLetter"
            required
            rows={5}
            placeholder="Tell the company about yourself, your experience, and why you're a great fit..."
            className={`${INPUT_CLASS} resize-y`}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Proposed Rate ($/hr)</label>
          <input
            name="proposedRate"
            type="number"
            min="0"
            placeholder="e.g., 100"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Estimated Timeline</label>
          <input
            name="estimatedTimeline"
            type="text"
            placeholder="e.g., 2 months, available immediately"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>
            Portfolio Links
            <span className="text-text-tertiary font-normal ml-1">(comma-separated)</span>
          </label>
          <input
            name="portfolioLinksInput"
            type="text"
            placeholder="e.g., https://github.com/you, https://scholar.google.com/..."
            className={INPUT_CLASS}
          />
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
          {isPending ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
