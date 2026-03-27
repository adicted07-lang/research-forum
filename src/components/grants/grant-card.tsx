import Link from "next/link";
import { Calendar, DollarSign, ExternalLink } from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";

interface GrantCardProps {
  grant: {
    id: string;
    title: string;
    funder: string;
    fundingRange: string | null;
    deadline: Date | null;
    tags: string[];
    slug: string;
    applicationUrl: string | null;
  };
}

export function GrantCard({ grant }: GrantCardProps) {
  const isExpired = grant.deadline && new Date(grant.deadline) < new Date();

  return (
    <div className="bg-white border border-border-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
      <Link href={`/grants/${grant.slug}`}>
        <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">
          {grant.title}
        </h3>
      </Link>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
        {grant.funder}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary mb-3">
        {grant.fundingRange && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {grant.fundingRange}
          </span>
        )}
        {grant.deadline && (
          <span className={`flex items-center gap-1 ${isExpired ? "text-red-500" : ""}`}>
            <Calendar className="w-3.5 h-3.5" />
            {isExpired ? "Expired" : `Due ${new Date(grant.deadline).toLocaleDateString()}`}
          </span>
        )}
        {grant.applicationUrl && (
          <a href={grant.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
            <ExternalLink className="w-3.5 h-3.5" />
            Apply
          </a>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {grant.tags.slice(0, 4).map(tag => (
          <BadgePill key={tag} label={tag} />
        ))}
      </div>
    </div>
  );
}
