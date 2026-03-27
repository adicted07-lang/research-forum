"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuestion } from "@/server/actions/questions";
import { FORUM_CATEGORIES } from "@/lib/validations/forum";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

export function QuestionForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [bodyHtml, setBodyHtml] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Inject rich text body
    formData.set("body", bodyHtml);

    // Convert comma-separated tags to individual form entries
    const tagsRaw = formData.get("tagsInput") as string;
    formData.delete("tagsInput");
    if (tagsRaw) {
      const tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      tags.forEach((tag) => formData.append("tags", tag));
    }

    startTransition(async () => {
      const result = await createQuestion(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.slug) {
        router.push(`/forum/${result.slug}`);
      }
    });
  };

  return (
    <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-1.5"
          >
            Title <span className="text-error">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={300}
            placeholder="What is your question? Be specific."
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary-light outline-none bg-white dark:bg-surface-dark dark:border-border-dark dark:text-text-dark-primary placeholder:text-text-tertiary"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-1.5">
            Body <span className="text-error">*</span>
          </label>
          <RichTextEditor
            content={bodyHtml}
            onChange={setBodyHtml}
            placeholder="Describe your question in detail..."
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-1.5"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue="General Discussion"
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary-light outline-none bg-white dark:bg-surface-dark dark:border-border-dark dark:text-text-dark-primary"
          >
            {FORUM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tagsInput"
            className="block text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-1.5"
          >
            Tags{" "}
            <span className="text-xs font-normal text-text-tertiary">
              (comma-separated, up to 5)
            </span>
          </label>
          <input
            id="tagsInput"
            name="tagsInput"
            type="text"
            placeholder="e.g. machine-learning, NLP, data-science"
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary-light outline-none bg-white dark:bg-surface-dark dark:border-border-dark dark:text-text-dark-primary placeholder:text-text-tertiary"
          />
        </div>

        {error && (
          <p className="text-sm text-error bg-error/10 border border-error/30 rounded-md px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors dark:border-border-dark dark:text-text-dark-primary dark:hover:bg-surface-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(218,85,47,0.25)] disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none"
          >
            {isPending ? "Posting..." : "Post Question"}
          </button>
        </div>
      </form>
    </div>
  );
}
