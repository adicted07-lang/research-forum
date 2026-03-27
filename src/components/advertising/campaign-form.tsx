"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign, submitCampaign } from "@/server/actions/campaigns";

const AD_TYPES = [
  { value: "FEED", label: "Feed Ad" },
  { value: "BANNER", label: "Banner Ad" },
  { value: "FEATURED_LISTING", label: "Featured Listing" },
];

const BUDGET_TYPES = [
  { value: "DAILY", label: "Daily Budget" },
  { value: "TOTAL", label: "Total Budget" },
];

const BID_TYPES = [
  { value: "CPM", label: "CPM (Cost per 1,000 impressions)" },
  { value: "CPC", label: "CPC (Cost per click)" },
];

const USER_TYPE_OPTIONS = [
  { value: "researchers", label: "Researchers" },
  { value: "companies", label: "Companies" },
  { value: "all", label: "All Users" },
];

export function CampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTypes, setUserTypes] = useState<string[]>([]);

  function toggleUserType(value: string) {
    setUserTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Replace checkboxes with joined user types
      formData.set("targetingUserType", userTypes.join(","));

      const result = await createCampaign(formData);

      if ("error" in result && result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if ("id" in result && result.id) {
        const submitResult = await submitCampaign(result.id);
        if ("error" in submitResult && submitResult.error) {
          setError(submitResult.error);
          setLoading(false);
          return;
        }
        if ("url" in submitResult && submitResult.url) {
          router.push(submitResult.url);
          return;
        }
      }

      setError("Something went wrong. Please try again.");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-border-light rounded-md text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary dark:placeholder:text-text-dark-tertiary";
  const labelClass =
    "block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1";
  const sectionClass =
    "bg-white border border-border-light rounded-lg p-5 space-y-4 dark:bg-surface-dark dark:border-border-dark-light";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Campaign basics */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Campaign Details
        </h2>

        <div>
          <label className={labelClass} htmlFor="campaignName">
            Campaign Name
          </label>
          <input
            id="campaignName"
            name="campaignName"
            type="text"
            required
            placeholder="e.g. Spring ML Tool Launch"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="adType">
            Ad Type
          </label>
          <select id="adType" name="adType" required className={inputClass}>
            {AD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Creative */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Creative
        </h2>

        <div>
          <label className={labelClass} htmlFor="creativeHeadline">
            Headline
          </label>
          <input
            id="creativeHeadline"
            name="creativeHeadline"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. Analyze Data 10x Faster"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="creativeDescription">
            Description
          </label>
          <textarea
            id="creativeDescription"
            name="creativeDescription"
            required
            maxLength={300}
            rows={3}
            placeholder="Describe your product or service in a compelling way..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="creativeCtaUrl">
            CTA URL
          </label>
          <input
            id="creativeCtaUrl"
            name="creativeCtaUrl"
            type="url"
            required
            placeholder="https://yoursite.com/product"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="creativeImage">
            Image URL{" "}
            <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
          <input
            id="creativeImage"
            name="creativeImage"
            type="url"
            placeholder="https://yoursite.com/image.png"
            className={inputClass}
          />
        </div>
      </div>

      {/* Targeting */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Targeting
        </h2>

        <div>
          <label className={labelClass} htmlFor="targetingCategories">
            Categories{" "}
            <span className="text-text-tertiary font-normal">
              (comma-separated)
            </span>
          </label>
          <input
            id="targetingCategories"
            name="targetingCategories"
            type="text"
            placeholder="machine-learning, genomics, statistics"
            className={inputClass}
          />
        </div>

        <div>
          <p className={labelClass}>User Type</p>
          <div className="flex flex-wrap gap-4 mt-1">
            {USER_TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-text-primary dark:text-text-dark-primary cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={userTypes.includes(opt.value)}
                  onChange={() => toggleUserType(opt.value)}
                  className="rounded border-border-light text-primary focus:ring-primary/30"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="targetingGeography">
            Geography{" "}
            <span className="text-text-tertiary font-normal">
              (comma-separated)
            </span>
          </label>
          <input
            id="targetingGeography"
            name="targetingGeography"
            type="text"
            placeholder="US, UK, Canada"
            className={inputClass}
          />
        </div>
      </div>

      {/* Budget */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Budget
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="budgetType">
              Budget Type
            </label>
            <select
              id="budgetType"
              name="budgetType"
              required
              className={inputClass}
            >
              {BUDGET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="budgetAmount">
              Budget Amount ($)
            </label>
            <input
              id="budgetAmount"
              name="budgetAmount"
              type="number"
              required
              min="10"
              step="0.01"
              placeholder="100.00"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="bidType">
              Bid Type
            </label>
            <select
              id="bidType"
              name="bidType"
              required
              className={inputClass}
            >
              {BID_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="bidAmount">
              Bid Amount ($)
            </label>
            <input
              id="bidAmount"
              name="bidAmount"
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="2.50"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Schedule
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="startDate">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="endDate">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating campaign..." : "Create Campaign & Pay"}
      </button>
    </form>
  );
}
