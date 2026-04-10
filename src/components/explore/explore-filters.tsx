"use client";

import { useRouter, useSearchParams } from "next/navigation";

const INDUSTRIES = [
  "Transport and Logistics", "Aerospace and Defence", "Packaging",
  "Automotive", "Agriculture", "Machinery and Equipment",
  "Energy and Power", "Consumer Goods", "Chemical and Material",
  "Healthcare", "Food and Beverages", "Semiconductor and Electronic", "ICT",
];

const AVAILABILITY = [
  { value: "AVAILABLE", label: "Available" },
  { value: "BUSY", label: "Busy" },
  { value: "NOT_AVAILABLE", label: "Not Available" },
];

type ExploreFiltersProps = {
  expertiseTags: string[];
};

export function ExploreFilters({ expertiseTags }: ExploreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIndustry = searchParams.get("industry") || "";
  const currentExpertise = searchParams.get("expertise") || "";
  const currentAvailability = searchParams.get("availability") || "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/explore?${params.toString()}`);
  }

  const hasFilters = currentIndustry || currentExpertise || currentAvailability;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        value={currentIndustry}
        onChange={(e) => updateFilter("industry", e.target.value)}
        className="px-3 py-2 text-sm border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark text-text-primary dark:text-text-dark-primary"
      >
        <option value="">All Industries</option>
        {INDUSTRIES.map((ind) => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>

      <select
        value={currentExpertise}
        onChange={(e) => updateFilter("expertise", e.target.value)}
        className="px-3 py-2 text-sm border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark text-text-primary dark:text-text-dark-primary"
      >
        <option value="">All Expertise</option>
        {expertiseTags.map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>

      <select
        value={currentAvailability}
        onChange={(e) => updateFilter("availability", e.target.value)}
        className="px-3 py-2 text-sm border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark text-text-primary dark:text-text-dark-primary"
      >
        <option value="">Any Availability</option>
        {AVAILABILITY.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push("/explore")}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
