"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDataset } from "@/server/actions/datasets";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

const LICENSES = ["MIT", "CC-BY", "CC0", "Custom"];
const FORMATS = ["CSV", "JSON", "Parquet", "SQL", "Other"];

export function DatasetForm() {
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
      const result = await createDataset(formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("slug" in result && result.slug) {
        router.push(`/datasets/${result.slug}`);
      } else {
        router.push("/datasets");
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
          Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="e.g., Global Climate Observations 2020–2024"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          placeholder="Describe the dataset, its contents, methodology, and potential use cases..."
          onChange={setDescriptionHtml}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Tags
          <span className="text-text-tertiary font-normal ml-1">(comma-separated)</span>
        </label>
        <input
          name="tagsInput"
          type="text"
          placeholder="e.g., climate, temperature, satellite"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            License
          </label>
          <select
            name="license"
            className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
          >
            <option value="">Select license...</option>
            {LICENSES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            Format
          </label>
          <select
            name="format"
            className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
          >
            <option value="">Select format...</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Size
          <span className="text-text-tertiary font-normal ml-1">(optional, e.g., 2.4 GB)</span>
        </label>
        <input
          name="size"
          type="text"
          placeholder="e.g., 2.4 GB"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Download URL
          <span className="text-text-tertiary font-normal ml-1">(optional)</span>
        </label>
        <input
          name="downloadUrl"
          type="url"
          placeholder="https://example.com/dataset.zip"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Price (USD)
          <span className="text-text-tertiary font-normal ml-1">(0 for free)</span>
        </label>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue="0"
          placeholder="0.00"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
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
        {isPending ? "Publishing dataset..." : "Publish Dataset"}
      </button>
    </form>
  );
}
