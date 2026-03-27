import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";

interface ArticleAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

export interface ArticleCardData {
  id: string;
  title: string;
  body: string;
  slug: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  readTime: number | null;
  upvoteCount: number;
  author: ArticleAuthor;
  publishedAt: Date | null;
  createdAt: Date;
}

interface ArticleCardProps {
  article: ArticleCardData;
  variant?: "featured" | "default";
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  news: "from-[#1a1a2e] to-primary",
  opinion: "from-[#4F86EC] to-[#8B5CF6]",
  how_to: "from-[#00B67A] to-[#059669]",
  interview: "from-[#F59E0B] to-[#EF4444]",
  announcement: "from-[#6366F1] to-[#8B5CF6]",
  makers: "from-[#0EA5E9] to-[#06B6D4]",
};

const CATEGORY_LABELS: Record<string, string> = {
  news: "News",
  opinion: "Opinion",
  how_to: "How-To",
  interview: "Interview",
  announcement: "Announcement",
  makers: "Makers",
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getExcerpt(body: string, maxLen: number = 150): string {
  if (body.length <= maxLen) return body;
  return body.slice(0, maxLen).trimEnd() + "…";
}

function CoverGradient({
  category,
  coverImage,
  className,
}: {
  category: string;
  coverImage: string | null;
  className?: string;
}) {
  const gradient = CATEGORY_GRADIENTS[category] ?? "from-[#1a1a2e] to-primary";
  if (coverImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverImage}
        alt=""
        className={`object-cover w-full h-full ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gradient} ${className ?? ""}`}
    />
  );
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const authorName =
    article.author.name ?? article.author.username ?? "Anonymous";
  const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category;
  const dateDisplay = formatDate(article.publishedAt ?? article.createdAt);

  if (variant === "featured") {
    return (
      <Link href={`/news/${article.slug}`} className="block group">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white border border-border-light rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 dark:bg-surface-dark dark:border-border-dark-light">
          {/* Left: Cover image */}
          <div className="relative h-56 md:h-full min-h-[220px] overflow-hidden">
            <CoverGradient
              category={article.category}
              coverImage={article.coverImage}
              className="absolute inset-0"
            />
            {/* Category badge overlay */}
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
                {categoryLabel}
              </span>
            </div>
          </div>

          {/* Right: Content */}
          <div className="p-6 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary group-hover:text-primary transition-colors line-clamp-3 mb-3">
              {article.title}
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary line-clamp-3 mb-4 leading-relaxed">
              {getExcerpt(article.body, 200)}
            </p>

            {/* Author + meta */}
            <div className="flex items-center gap-3 text-xs text-text-tertiary dark:text-text-dark-tertiary">
              <div className="flex items-center gap-1.5">
                <UserAvatar name={authorName} src={article.author.image} size="sm" />
                <span className="font-medium text-text-secondary dark:text-text-dark-secondary">
                  {authorName}
                </span>
              </div>
              {dateDisplay && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateDisplay}</span>
                </div>
              )}
              {article.readTime != null && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime} min read</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default (compact) variant
  return (
    <Link href={`/news/${article.slug}`} className="block group">
      <div className="bg-white border border-border-light rounded-xl overflow-hidden hover:shadow-sm hover:border-border transition-all duration-200 dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
        {/* Cover image area */}
        <div className="relative h-36 overflow-hidden">
          <CoverGradient
            category={article.category}
            coverImage={article.coverImage}
          />
          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-3 leading-relaxed">
            {getExcerpt(article.body, 120)}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
            <div className="flex items-center gap-1">
              <UserAvatar name={authorName} src={article.author.image} size="sm" />
              <span>{authorName}</span>
            </div>
            {article.readTime != null && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime} min</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
