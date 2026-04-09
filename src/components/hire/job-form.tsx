"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/server/actions/jobs";

const PROJECT_TYPES = [
  { value: "ONE_TIME", label: "One-time project" },
  { value: "ONGOING", label: "Ongoing work" },
  { value: "CONTRACT", label: "Contract" },
];

const LOCATION_OPTIONS = [
  { value: "REMOTE", label: "Remote" },
  { value: "ON_SITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];

const INPUT_CLASS =
  "w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary";

const LABEL_CLASS =
  "block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1";

export function JobForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [negotiable, setNegotiable] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert comma-separated domains
    const domainsRaw = formData.get("researchDomainInput") as string;
    formData.delete("researchDomainInput");
    if (domainsRaw) {
      const domains = domainsRaw.split(",").map((d) => d.trim()).filter(Boolean);
      domains.forEach((d) => formData.append("researchDomain", d));
    }

    // Convert comma-separated skills
    const skillsRaw = formData.get("requiredSkillsInput") as string;
    formData.delete("requiredSkillsInput");
    if (skillsRaw) {
      const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      skills.forEach((s) => formData.append("requiredSkills", s));
    }

    // Set negotiable
    formData.set("budgetNegotiable", negotiable ? "true" : "false");

    startTransition(async () => {
      const result = await createJob(formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("slug" in result && result.slug) {
        router.push(`/talent-board/${result.slug}`);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light"
    >
      <div>
        <label className={LABEL_CLASS}>
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="e.g., Machine Learning Researcher for Climate Modeling"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={6}
          placeholder="Describe the project, requirements, and what you're looking for in a researcher..."
          className={`${INPUT_CLASS} resize-y`}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Research Domains
          <span className="text-text-tertiary font-normal ml-1">(comma-separated)</span>
        </label>
        <input
          name="researchDomainInput"
          type="text"
          placeholder="e.g., machine-learning, climate-science, genomics"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Required Skills
          <span className="text-text-tertiary font-normal ml-1">(comma-separated)</span>
        </label>
        <input
          name="requiredSkillsInput"
          type="text"
          placeholder="e.g., Python, R, TensorFlow, statistical-analysis"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Project Type <span className="text-red-500">*</span>
        </label>
        <select name="projectType" required className={INPUT_CLASS}>
          {PROJECT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Budget Min ($/hr)</label>
          <input
            name="budgetMin"
            type="number"
            min="0"
            placeholder="e.g., 80"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Budget Max ($/hr)</label>
          <input
            name="budgetMax"
            type="number"
            min="0"
            placeholder="e.g., 150"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="negotiable"
          type="checkbox"
          checked={negotiable}
          onChange={(e) => setNegotiable(e.target.checked)}
          className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
        />
        <label
          htmlFor="negotiable"
          className="text-sm text-text-primary dark:text-text-dark-primary"
        >
          Budget is negotiable
        </label>
      </div>

      <div>
        <label className={LABEL_CLASS}>Timeline</label>
        <input
          name="timeline"
          type="text"
          placeholder="e.g., 3 months, 6 weeks, Ongoing"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Location Preference <span className="text-red-500">*</span>
        </label>
        <select name="locationPreference" required className={INPUT_CLASS}>
          {LOCATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
        {isPending ? "Posting job..." : "Post Job"}
      </button>
    </form>
  );
}
