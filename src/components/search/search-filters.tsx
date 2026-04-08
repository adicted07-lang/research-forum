"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { INDUSTRIES } from "@/lib/constants/industries";

const RESEARCH_DOMAINS = [
  "Machine Learning", "Data Science", "Bioinformatics", "Climate Science",
  "Neuroscience", "Physics", "Chemistry", "Economics", "Social Sciences",
  "Genomics", "Statistics", "Epidemiology", "Quantum Computing", "NLP", "Other",
];

const CONTENT_TYPES = [
  { value: "", label: "All" },
  { value: "questions", label: "Questions" },
  { value: "articles", label: "Articles" },
  { value: "jobs", label: "Jobs" },
  { value: "listings", label: "Listings" },
  { value: "users", label: "Users" },
] as const;

const DATE_RANGES = [
  { value: "", label: "All time" },
  { value: "24h", label: "24h" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "upvotes", label: "Most Upvoted" },
] as const;

interface SearchFiltersProps {
  currentFilters: {
    type?: string;
    industry?: string;
    domain?: string;
    dateRange?: string;
    sortBy?: string;
  };
}

export function SearchFilters({ currentFilters }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Content Type */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2">
          Content Type
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => updateFilter("type", t.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                (currentFilters.type || "") === t.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-surface-dark border-border dark:border-border-dark text-text-secondary dark:text-text-dark-secondary hover:border-primary/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2">
          Sort By
        </h3>
        <select
          value={currentFilters.sortBy || "relevance"}
          onChange={(e) => updateFilter("sortBy", e.target.value === "relevance" ? "" : e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary outline-none focus:border-primary"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2">
          Date Range
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {DATE_RANGES.map((d) => (
            <button
              key={d.value}
              onClick={() => updateFilter("dateRange", d.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                (currentFilters.dateRange || "") === d.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-surface-dark border-border dark:border-border-dark text-text-secondary dark:text-text-dark-secondary hover:border-primary/40"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2">
          Industry
        </h3>
        <select
          value={currentFilters.industry || ""}
          onChange={(e) => updateFilter("industry", e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary outline-none focus:border-primary"
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {/* Research Domain */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2">
          Research Domain
        </h3>
        <select
          value={currentFilters.domain || ""}
          onChange={(e) => updateFilter("domain", e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary outline-none focus:border-primary"
        >
          <option value="">All Domains</option>
          {RESEARCH_DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex items-center gap-2 lg:hidden mb-4 px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary"
      >
        <Filter className="w-4 h-4" />
        Filters
        <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Mobile collapsible */}
      <div className={`lg:hidden ${mobileOpen ? "block mb-6" : "hidden"}`}>
        <div className="p-4 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark">
          {filterContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block p-4 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark sticky top-24">
        <h2 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4">Filters</h2>
        {filterContent}
      </div>
    </>
  );
}
