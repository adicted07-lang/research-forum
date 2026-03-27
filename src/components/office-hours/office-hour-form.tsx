"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOfficeHour } from "@/server/actions/office-hours";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

const TOPICS = [
  "Machine Learning",
  "Data Science",
  "Bioinformatics",
  "Climate Science",
  "Neuroscience",
  "Physics",
  "Chemistry",
  "Economics",
  "Social Sciences",
  "Other",
];

const DURATIONS = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
];

export function OfficeHourForm() {
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
      const result = await createOfficeHour(formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("slug" in result && result.slug) {
        router.push(`/office-hours/${result.slug}`);
      } else {
        router.push("/office-hours");
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
          Session Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="e.g., Ask Me Anything: Large Language Models"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          placeholder="What will you discuss? What questions can attendees ask? Any prerequisites?"
          onChange={setDescriptionHtml}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            Topic <span className="text-red-500">*</span>
          </label>
          <select
            name="topic"
            required
            className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
          >
            <option value="">Select a topic...</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            Duration <span className="text-red-500">*</span>
          </label>
          <select
            name="duration"
            defaultValue="60"
            className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Start Date &amp; Time <span className="text-red-500">*</span>
        </label>
        <input
          name="startTime"
          type="datetime-local"
          required
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Meeting URL
          <span className="text-text-tertiary font-normal ml-1">(optional — Zoom, Google Meet, etc.)</span>
        </label>
        <input
          name="meetingUrl"
          type="url"
          placeholder="https://zoom.us/j/..."
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Max Attendees
          <span className="text-text-tertiary font-normal ml-1">(optional — leave blank for unlimited)</span>
        </label>
        <input
          name="maxAttendees"
          type="number"
          min="1"
          placeholder="e.g., 50"
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
        {isPending ? "Scheduling session..." : "Schedule Office Hours"}
      </button>
    </form>
  );
}
