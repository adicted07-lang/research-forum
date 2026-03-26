import Link from "next/link";
import { Plus } from "lucide-react";

const POPULAR_CATEGORIES = [
  "data-analysis",
  "machine-learning",
  "statistics",
  "bioinformatics",
  "survey-design",
  "literature-review",
  "coding",
  "visualization",
  "consulting",
  "writing",
];

export function MarketplaceSidebar() {
  return (
    <div className="space-y-5">
      {/* CTA */}
      <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">
          Offer Your Expertise
        </h3>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-4">
          Reach thousands of researchers by listing your service or tool in the marketplace.
        </p>
        <Link
          href="/marketplace/new"
          className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          List Your Service
        </Link>
      </div>

      {/* Category tags */}
      <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4">
          Browse by Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/marketplace?category=${cat}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-surface text-text-secondary hover:bg-primary-light hover:text-primary transition-colors dark:bg-surface-dark dark:text-text-dark-secondary dark:hover:text-primary border border-border-light dark:border-border-dark-light"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
