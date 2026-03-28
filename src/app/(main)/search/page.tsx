import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ShoppingBag, Newspaper, Users, Briefcase, Search } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { UserAvatar } from "@/components/shared/user-avatar";
import { globalSearch } from "@/server/actions/search";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || "";
  return {
    title: q ? `"${q}" — Search — ResearchHub` : "Search — ResearchHub",
    description: "Search across questions, listings, articles, researchers, and jobs on ResearchHub.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const type = params.type;

  const results = query ? await globalSearch(query, type) : null;

  const totalResults = results
    ? results.questions.length +
      results.listings.length +
      results.articles.length +
      results.users.length +
      results.jobs.length
    : 0;

  return (
    <PageLayout>
      <div className="max-w-3xl">
        {/* Search input */}
        <div className="mb-6">
          <form method="get" action="/search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search questions, tools, researchers, jobs..."
                autoFocus
                className="w-full py-3 pl-10 pr-4 text-sm rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </form>
        </div>

        {!query ? (
          <div className="text-center py-20 text-text-tertiary">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Search ResearchHub</p>
            <p className="text-sm mt-1">Find questions, marketplace listings, researchers, and more</p>
          </div>
        ) : results && totalResults === 0 ? (
          <div className="text-center py-16 text-text-tertiary">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-sm mt-1">Try a different search term or browse the categories</p>
          </div>
        ) : results ? (
          <>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;
              <span className="font-medium text-text-primary dark:text-text-dark-primary">{query}</span>
              &rdquo;
            </p>

            <div className="space-y-8">
              {/* Questions */}
              {results.questions.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                      Questions
                    </h2>
                    <span className="text-xs text-text-tertiary">({results.questions.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.questions.map((q: any) => (
                      <Link
                        key={q.id}
                        href={`/forum/${q.slug}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                      >
                        <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                          {q.title}
                        </p>
                        <span className="text-xs text-text-tertiary shrink-0 ml-4">
                          {q.answerCount} answers
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Marketplace */}
              {results.listings.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                      Marketplace
                    </h2>
                    <span className="text-xs text-text-tertiary">({results.listings.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.listings.map((l: any) => (
                      <Link
                        key={l.id}
                        href={`/marketplace/${l.slug}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                            {l.title}
                          </p>
                          {l.tagline && (
                            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5 truncate max-w-lg">
                              {l.tagline}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-text-tertiary shrink-0 ml-4">{l.type}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Articles */}
              {results.articles.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Newspaper className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                      News & Articles
                    </h2>
                    <span className="text-xs text-text-tertiary">({results.articles.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.articles.map((a: any) => (
                      <Link
                        key={a.id}
                        href={`/news/${a.slug}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                      >
                        <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                          {a.title}
                        </p>
                        <span className="text-xs text-text-tertiary shrink-0 ml-4">
                          {new Date(a.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* People */}
              {results.users.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                      People
                    </h2>
                    <span className="text-xs text-text-tertiary">({results.users.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.users.map((u: any) => {
                      const displayName = u.name || u.companyName || u.username || "User";
                      const avatar = u.image || u.companyLogo;
                      const href = u.role === "COMPANY"
                        ? `/company/${u.username}`
                        : `/@${u.username}`;
                      return (
                        <Link
                          key={u.id}
                          href={href}
                          className="flex items-center gap-3 p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                        >
                          <UserAvatar name={displayName} src={avatar} size="md" />
                          <div>
                            <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                              {displayName}
                            </p>
                            {u.username && (
                              <p className="text-xs text-text-tertiary">@{u.username}</p>
                            )}
                          </div>
                          <span className="text-xs text-text-tertiary ml-auto capitalize">
                            {u.role.toLowerCase()}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Jobs */}
              {results.jobs.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                      Jobs
                    </h2>
                    <span className="text-xs text-text-tertiary">({results.jobs.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.jobs.map((j: any) => (
                      <Link
                        key={j.id}
                        href={`/hire/${j.slug}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                      >
                        <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                          {j.title}
                        </p>
                        <span className="text-xs text-text-tertiary shrink-0 ml-4">
                          {j.locationPreference}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        ) : null}
      </div>
    </PageLayout>
  );
}
