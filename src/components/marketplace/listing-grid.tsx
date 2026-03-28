import Link from "next/link";
import { getListings } from "@/server/actions/listings";
import { ListingCard } from "./listing-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ShoppingBag } from "lucide-react";

interface ListingGridProps {
  type?: string;
  category?: string;
  sort?: string;
  page?: number;
}

const TABS = [
  { label: "All", value: undefined },
  { label: "Services", value: "SERVICE" },
  { label: "Tools", value: "TOOL" },
];

const SORT_OPTIONS = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "top_rated" },
];

const PAGE_SIZE = 20;

export async function ListingGrid({
  type,
  category,
  sort = "trending",
  page = 1,
}: ListingGridProps) {
  let listings: Awaited<ReturnType<typeof getListings>> = [];
  try {
    listings = await getListings({ type, category, sort, page, limit: PAGE_SIZE });
  } catch {
    // fallback to empty
  }

  return (
    <div>
      {/* Tabs + Sort bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {/* Type tabs */}
        <div className="flex gap-1 bg-surface rounded-lg p-1 dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
          {TABS.map((tab) => {
            const isActive = type === tab.value;
            const href = tab.value
              ? `/marketplace?type=${tab.value}${sort !== "trending" ? `&sort=${sort}` : ""}`
              : `/marketplace${sort !== "trending" ? `?sort=${sort}` : ""}`;
            return (
              <Link
                key={tab.label}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary shadow-sm"
                    : "text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Sort options */}
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => {
            const isActive = sort === opt.value;
            const params = new URLSearchParams();
            if (type) params.set("type", type);
            params.set("sort", opt.value);
            return (
              <Link
                key={opt.value}
                href={`/marketplace?${params.toString()}`}
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

      {/* Grid */}
      {listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {listings.length === PAGE_SIZE && (
            <div className="flex justify-center mt-6 gap-3">
              {page > 1 && (
                <Link
                  href={`/marketplace?${new URLSearchParams({
                    ...(type ? { type } : {}),
                    sort: sort ?? "trending",
                    page: String(page - 1),
                  }).toString()}`}
                  className="px-4 py-2 rounded-md border border-border-light text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-secondary"
                >
                  ← Previous
                </Link>
              )}
              <Link
                href={`/marketplace?${new URLSearchParams({
                  ...(type ? { type } : {}),
                  sort: sort ?? "trending",
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
          title="No listings found"
          description="Be the first to list your research service or tool."
          icon={<ShoppingBag className="w-12 h-12" />}
          action={
            <Link
              href="/marketplace/new"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              List Your Service
            </Link>
          }
        />
      )}
    </div>
  );
}
