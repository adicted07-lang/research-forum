import Link from "next/link";
import { ExternalLink, Globe, Mail } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { VoteButton } from "@/components/forum/vote-button";

interface ListingDetailAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface ListingDetailProps {
  listing: {
    id: string;
    title: string;
    tagline: string;
    description: string;
    type: string;
    categoryTags: string[];
    pricingInfo: string | null;
    websiteUrl: string | null;
    demoUrl: string | null;
    upvoteCount: number;
    author: ListingDetailAuthor;
    createdAt: Date;
  };
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const isService = listing.type === "SERVICE";
  const authorName = listing.author.name ?? listing.author.username ?? "Anonymous";

  return (
    <div className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isService
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              }`}
            >
              {isService ? "Service" : "Tool"}
            </span>
            {listing.categoryTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-text-secondary dark:bg-surface-dark dark:text-text-dark-secondary border border-border-light dark:border-border-dark-light"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            {listing.title}
          </h1>
          <p className="text-base text-text-secondary dark:text-text-dark-secondary mt-1">
            {listing.tagline}
          </p>
        </div>
        <VoteButton
          targetType="LISTING"
          targetId={listing.id}
          initialCount={listing.upvoteCount}
          initialVote={null}
        />
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-5 pb-5 border-b border-border-light dark:border-border-dark-light">
        <UserAvatar name={authorName} src={listing.author.image} size="sm" />
        <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
          by{" "}
          {listing.author.username ? (
            <Link
              href={`/profile/${listing.author.username}`}
              className="font-medium text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors"
            >
              {authorName}
            </Link>
          ) : (
            <span className="font-medium text-text-primary dark:text-text-dark-primary">{authorName}</span>
          )}
        </span>
      </div>

      {/* Description */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2 uppercase tracking-wide">
          About
        </h2>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-pre-line leading-relaxed">
          {listing.description}
        </p>
      </div>

      {/* Pricing */}
      {listing.pricingInfo && (
        <div className="mb-5 p-4 bg-surface rounded-lg dark:bg-gray-800/50 border border-border-light dark:border-border-dark-light">
          <h2 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-1">
            Pricing
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {listing.pricingInfo}
          </p>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {listing.websiteUrl && (
          <a
            href={listing.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border-light text-sm font-medium text-text-primary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-primary dark:hover:border-primary"
          >
            <Globe className="w-4 h-4" />
            Website
          </a>
        )}
        {listing.demoUrl && (
          <a
            href={listing.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border-light text-sm font-medium text-text-primary hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-primary dark:hover:border-primary"
          >
            <ExternalLink className="w-4 h-4" />
            Demo
          </a>
        )}
        <a
          href={`mailto:?subject=Inquiry about ${encodeURIComponent(listing.title)}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Contact Seller
        </a>
      </div>
    </div>
  );
}
