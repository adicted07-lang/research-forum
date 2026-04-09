import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BadgePill } from "@/components/shared/badge-pill";
import { VoteButton } from "@/components/forum/vote-button";
import { RichTextDisplay } from "@/components/shared/rich-text-display";

interface ArticleAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface ArticleDetailProps {
  article: {
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
  };
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
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  const authorName =
    article.author.name ?? article.author.username ?? "Anonymous";
  const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category;
  const gradient =
    CATEGORY_GRADIENTS[article.category] ?? "from-[#1a1a2e] to-primary";
  const dateDisplay = formatDate(article.publishedAt ?? article.createdAt);

  return (
    <article className="bg-white border border-border-light rounded-xl overflow-hidden dark:bg-surface-dark dark:border-border-dark-light">
      {/* Cover image */}
      <div className="relative h-64 sm:h-80">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        {/* Category badge overlay */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
            {categoryLabel}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-border-light dark:border-border-dark-light">
          <div className="flex items-center gap-3">
            <UserAvatar name={authorName} src={article.author.image} size="lg" />
            <div>
              {article.author.username ? (
                <Link
                  href={`/profile/${article.author.username}`}
                  className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors"
                >
                  {authorName}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                  {authorName}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-text-tertiary dark:text-text-dark-tertiary mt-0.5">
                {dateDisplay && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={new Date(article.publishedAt ?? article.createdAt).toISOString()}>{dateDisplay}</time>
                  </div>
                )}
                {article.readTime != null && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime} min read</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vote button */}
          <VoteButton
            targetType="ARTICLE"
            targetId={article.id}
            initialCount={article.upvoteCount}
            initialVote={null}
          />
        </div>

        {/* Body */}
        <div className="mb-6">
          <RichTextDisplay content={article.body} />
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border-light dark:border-border-dark-light">
            {article.tags.map((tag) => (
              <BadgePill key={tag} label={tag} variant="primary" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
