import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getJobs } from "@/server/actions/jobs";
import { JobCard } from "./job-card";
import { EmptyState } from "@/components/shared/empty-state";

interface JobListProps {
  domain?: string;
  location?: string;
  sort?: string;
  page?: number;
}

const LOCATION_PILLS = [
  { label: "All", value: undefined },
  { label: "Remote", value: "REMOTE" },
  { label: "On-site", value: "ON_SITE" },
  { label: "Hybrid", value: "HYBRID" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Budget (high to low)", value: "budget_high" },
];

const PAGE_SIZE = 20;

export async function JobList({
  domain,
  location,
  sort = "newest",
  page = 1,
}: JobListProps) {
  let jobs: Awaited<ReturnType<typeof getJobs>> = [];
  try {
    jobs = await getJobs({ domain, location, sort, page, limit: PAGE_SIZE });
  } catch {
    // fallback to empty
  }

  return (
    <div>
      {/* Filter + Sort bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {/* Location pills */}
        <div className="flex gap-1 bg-surface rounded-lg p-1 dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
          {LOCATION_PILLS.map((pill) => {
            const isActive = location === pill.value;
            const params = new URLSearchParams();
            if (pill.value) params.set("location", pill.value);
            if (sort && sort !== "newest") params.set("sort", sort);
            if (domain) params.set("domain", domain);
            const href = params.toString() ? `/hire?${params.toString()}` : "/hire";
            return (
              <Link
                key={pill.label}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary shadow-sm"
                    : "text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary"
                }`}
              >
                {pill.label}
              </Link>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => {
            const isActive = sort === opt.value || (opt.value === "newest" && !sort);
            const params = new URLSearchParams();
            if (location) params.set("location", location);
            if (domain) params.set("domain", domain);
            params.set("sort", opt.value);
            return (
              <Link
                key={opt.value}
                href={`/hire?${params.toString()}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary-light"
                    : "text-text-secondary dark:text-text-dark-secondary hover:text-primary"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Job list */}
      {jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {jobs.length === PAGE_SIZE && (
            <div className="flex justify-center mt-6 gap-3">
              {page > 1 && (
                <Link
                  href={`/hire?${new URLSearchParams({
                    ...(location ? { location } : {}),
                    ...(domain ? { domain } : {}),
                    sort: sort ?? "newest",
                    page: String(page - 1),
                  }).toString()}`}
                  className="px-4 py-2 rounded-md border border-border-light text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-secondary"
                >
                  ← Previous
                </Link>
              )}
              <Link
                href={`/hire?${new URLSearchParams({
                  ...(location ? { location } : {}),
                  ...(domain ? { domain } : {}),
                  sort: sort ?? "newest",
                  page: String(page + 1),
                }).toString()}`}
                className="px-4 py-2 rounded-md border border-border-light text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-secondary"
              >
                Next →
              </Link>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No job postings found"
          description="Be the first to post a research project and find the perfect expert."
          icon={<Briefcase className="w-12 h-12" />}
          action={
            <Link
              href="/hire/new"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Post a Job
            </Link>
          }
        />
      )}
    </div>
  );
}
