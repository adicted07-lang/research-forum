import Link from "next/link";
import { Newspaper } from "lucide-react";
import { getArticles, getFeaturedArticles } from "@/server/actions/articles";
import { ArticleCard } from "@/components/news/article-card";
import { EmptyState } from "@/components/shared/empty-state";

const ARTICLE_CATEGORIES = [
  { label: "All", value: undefined },
  { label: "News", value: "news" },
  { label: "Opinion", value: "opinion" },
  { label: "How-To", value: "how_to" },
  { label: "Interview", value: "interview" },
  { label: "Announcement", value: "announcement" },
  { label: "Makers", value: "makers" },
] as const;

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Trending", value: "trending" },
];

interface ArticleListProps {
  category?: string;
  sort?: string;
  page?: number;
}

export async function ArticleList({
  category,
  sort = "latest",
  page = 1,
}: ArticleListProps) {
  let articles: Awaited<ReturnType<typeof getArticles>>["articles"] = [];
  let totalPages = 1;
  let currentPage = page;
  let featuredArticle: Awaited<ReturnType<typeof getFeaturedArticles>>[0] | null = null;

  try {
    const [articlesResult, featuredResult] = await Promise.all([
      getArticles({ category, sort, page, limit: 13 }),
      getFeaturedArticles(1),
    ]);
    articles = articlesResult.articles;
    totalPages = articlesResult.totalPages;
    currentPage = articlesResult.currentPage;
    if (featuredResult.length > 0 && !category) {
      featuredArticle = featuredResult[0];
      // Remove featured from main list if present
      articles = articles.filter((a) => a.id !== featuredArticle!.id);
    }
  } catch {
    // DB not available
  }

  function buildUrl(params: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    if (params.category) sp.set("category", String(params.category));
    if (params.sort && params.sort !== "latest") sp.set("sort", String(params.sort));
    if (params.page && Number(params.page) > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return `/news${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap mb-4 border-b border-border-light dark:border-border-dark-light pb-3">
        {ARTICLE_CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={buildUrl({ category: cat.value, sort, page: 1 })}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              category === cat.value || (!category && cat.value === undefined)
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface dark:text-text-dark-secondary dark:hover:bg-surface-dark"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Sort options */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          {articles.length === 0 && !featuredArticle
            ? "No articles"
            : `Page ${currentPage} of ${totalPages}`}
        </p>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ category, sort: opt.value, page: 1 })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                sort === opt.value || (!sort && opt.value === "latest")
                  ? "border-primary text-primary bg-primary-light"
                  : "border-border text-text-secondary hover:border-primary hover:text-primary dark:border-border-dark dark:text-text-dark-secondary"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured article */}
      {featuredArticle && (
        <div className="mb-6">
          <ArticleCard article={featuredArticle} variant="featured" />
        </div>
      )}

      {/* Article grid */}
      {articles.length === 0 && !featuredArticle ? (
        <EmptyState
          title="No articles yet"
          description={
            category
              ? `No articles in this category yet. Check back soon!`
              : "No articles published yet. Check back soon for research news and insights."
          }
          icon={<Newspaper className="w-12 h-12" />}
          action={
            <Link
              href="/news/submit"
              className="inline-flex px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
            >
              Submit Article
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="default" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          {currentPage > 1 && (
            <Link
              href={buildUrl({ category, sort, page: currentPage - 1 })}
              className="px-4 py-2 border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors dark:border-border-dark dark:text-text-dark-primary dark:hover:bg-surface-dark"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={buildUrl({ category, sort, page: currentPage + 1 })}
              className="px-4 py-2 border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors dark:border-border-dark dark:text-text-dark-primary dark:hover:bg-surface-dark"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
