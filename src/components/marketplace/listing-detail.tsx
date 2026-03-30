import Link from "next/link";
import {
  ExternalLink,
  Globe,
  Mail,
  DollarSign,
  Calendar,
  ShoppingBag,
  Wrench,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
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
  relatedListings?: Array<{
    id: string;
    title: string;
    tagline: string;
    slug: string;
    type: string;
  }>;
}

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function ListingDetail({ listing, relatedListings = [] }: ListingDetailProps) {
  const isService = listing.type === "SERVICE";
  const authorName = listing.author.name ?? listing.author.username ?? "Anonymous";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0">
        {/* Hero Card */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-4">
          <div className="flex gap-5 items-start">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
              isService
                ? "bg-purple-100 dark:bg-purple-900/20"
                : "bg-blue-100 dark:bg-blue-900/20"
            }`}>
              {isService ? (
                <ShoppingBag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              ) : (
                <Wrench className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>

            {/* Title & Tagline */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isService
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                }`}>
                  {isService ? "Service" : "Tool"}
                </span>
              </div>
              <h1 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
                {listing.title}
              </h1>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {listing.tagline}
              </p>
            </div>

            {/* Upvote */}
            <div className="shrink-0">
              <VoteButton
                targetType="LISTING"
                targetId={listing.id}
                initialCount={listing.upvoteCount}
                initialVote={null}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {listing.categoryTags.map((tag: any) => (
              <BadgePill key={tag} label={tag} variant="primary" />
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-4">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            About
          </h2>
          <div
            className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: listing.description }}
          />
        </div>

        {/* Pricing */}
        {listing.pricingInfo && (
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-4">
            <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Pricing
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {listing.pricingInfo}
            </p>
          </div>
        )}
      </div>

      {/* ===== SIDEBAR ===== */}
      <div className="lg:w-[280px] shrink-0 space-y-4">
        {/* Provider Card */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5">
          <Link
            href={`/profile/${listing.author.username ?? ""}`}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <UserAvatar name={authorName} src={listing.author.image} size="md" />
            <div>
              <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                {authorName}
              </p>
              {listing.author.username && (
                <p className="text-xs text-text-tertiary">@{listing.author.username}</p>
              )}
            </div>
          </Link>

          {/* CTA Buttons */}
          <div className="space-y-2">
            {listing.websiteUrl && (
              <a
                href={listing.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            )}
            {listing.demoUrl && (
              <a
                href={listing.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md border border-border dark:border-border-dark text-sm font-medium text-text-primary dark:text-text-dark-primary hover:border-primary hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Try Demo
              </a>
            )}
            <a
              href={`mailto:?subject=Inquiry about ${encodeURIComponent(listing.title)}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md border border-border dark:border-border-dark text-sm font-medium text-text-primary dark:text-text-dark-primary hover:border-primary hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact
            </a>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5">
          <h4 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            Details
          </h4>
          <div className="space-y-2.5 text-sm">
            {listing.pricingInfo && (
              <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
                <DollarSign className="w-4 h-4 text-text-tertiary" />
                <span>{listing.pricingInfo}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              {isService ? (
                <ShoppingBag className="w-4 h-4 text-text-tertiary" />
              ) : (
                <Wrench className="w-4 h-4 text-text-tertiary" />
              )}
              <span>{isService ? "Service" : "Tool"}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <Star className="w-4 h-4 text-text-tertiary" />
              <span>{listing.upvoteCount} upvotes</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <Calendar className="w-4 h-4 text-text-tertiary" />
              <span>Listed {timeAgo(listing.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5">
            <h4 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              Related
            </h4>
            <div className="space-y-2">
              {relatedListings.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.slug}`}
                  className="flex items-center gap-2 py-2 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
