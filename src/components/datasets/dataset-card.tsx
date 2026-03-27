import Link from "next/link";
import { Download, Database } from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";

interface DatasetCardAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface DatasetCardProps {
  dataset: {
    id: string;
    title: string;
    description: string;
    slug: string;
    tags: string[];
    license: string | null;
    format: string | null;
    size: string | null;
    price: number;
    downloadCount: number;
    author: DatasetCardAuthor;
  };
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  const displayName = dataset.author.name ?? dataset.author.username ?? "Unknown";
  const priceLabel = dataset.price === 0 ? "Free" : `$${dataset.price.toFixed(2)}`;
  const isPaid = dataset.price > 0;

  return (
    <div className="flex flex-col bg-white border border-border-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all duration-200 dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
      <Link href={`/datasets/${dataset.slug}`} className="flex gap-3 mb-3 group">
        <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary group-hover:text-primary truncate">
            {dataset.title}
          </h3>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2 mt-0.5">
            {dataset.description.replace(/<[^>]*>/g, "").slice(0, 120)}
          </p>
        </div>
      </Link>

      {/* Tags */}
      {dataset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {dataset.tags.slice(0, 4).map((tag) => (
            <BadgePill key={tag} label={tag} variant="default" />
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-light dark:border-border-dark-light">
        <div className="flex items-center gap-2 flex-wrap">
          {dataset.format && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              {dataset.format}
            </span>
          )}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              isPaid
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            }`}
          >
            {priceLabel}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-tertiary dark:text-text-dark-tertiary">
          <Download className="w-3.5 h-3.5" />
          <span>{dataset.downloadCount}</span>
        </div>
      </div>

      <p className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary mt-2">
        by {displayName}
        {dataset.size && <span className="ml-1">· {dataset.size}</span>}
      </p>
    </div>
  );
}
