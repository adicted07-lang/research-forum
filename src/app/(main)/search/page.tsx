import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  ShoppingBag,
  Newspaper,
  Users,
  Briefcase,
  Search,
  ArrowUp,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { SearchFilters } from "@/components/search/search-filters";
import { searchWithFilters } from "@/server/actions/search";
import type { SearchFilters as SearchFiltersType } from "@/server/actions/search";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || "";
  return {
    title: q ? `"${q}" — Search — T.I.E` : "Search — T.I.E",
    description: "Search across questions, listings, articles, researchers, and jobs on T.I.E.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const filters: SearchFiltersType = {
    query,
    type: params.type || undefined,
    industry: params.industry || undefined,
    domain: params.domain || undefined,
    dateRange: params.dateRange || undefined,
    sortBy: params.sortBy || undefined,
  };

  const results = query ? await searchWithFilters(filters) : null;

  const counts = results
    ? {
        questions: results.questions.length,
        articles: results.articles.length,
        jobs: results.jobs.length,
        users: results.users.length,
        listings: results.listings.length,
      }
    : null;

  const totalResults = counts
    ? counts.questions + counts.articles + counts.jobs + counts.users + counts.listings
    : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      {/* Search input */}
      <div className="max-w-3xl mb-6">
        <form method="get" action="/search">
          {/* Preserve filters in hidden fields */}
          {params.type && <input type="hidden" name="type" value={params.type} />}
          {params.industry && <input type="hidden" name="industry" value={params.industry} />}
          {params.domain && <input type="hidden" name="domain" value={params.domain} />}
          {params.dateRange && <input type="hidden" name="dateRange" value={params.dateRange} />}
          {params.sortBy && <input type="hidden" name="sortBy" value={params.sortBy} />}
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
          <p className="text-lg font-medium">Search T.I.E</p>
          <p className="text-sm mt-1">Find questions, marketplace listings, researchers, and more</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside>
            <SearchFilters
              currentFilters={{
                type: filters.type,
                industry: filters.industry,
                domain: filters.domain,
                dateRange: filters.dateRange,
                sortBy: filters.sortBy,
              }}
            />
          </aside>

          {/* Results */}
          <main>
            {totalResults === 0 ? (
              <div className="text-center py-16 text-text-tertiary">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm mt-1">Try a different search term or adjust the filters</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
                  {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;
                  <span className="font-medium text-text-primary dark:text-text-dark-primary">{query}</span>
                  &rdquo;
                </p>

                <div className="space-y-8">
                  {/* Questions */}
                  {results!.questions.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                          Questions
                        </h2>
                        <span className="text-xs text-text-tertiary">({counts!.questions})</span>
                      </div>
                      <div className="space-y-2">
                        {results!.questions.map((q) => (
                          <Link
                            key={q.id}
                            href={`/forum/${q.slug}`}
                            className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                                {q.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                {q.category && (
                                  <span className="text-xs text-text-tertiary">{q.category}</span>
                                )}
                                {q.industry && (
                                  <span className="text-xs text-text-tertiary">{q.industry}</span>
                                )}
                                <span className="text-xs text-text-tertiary">
                                  {new Date(q.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4 text-xs text-text-tertiary">
                              <span className="flex items-center gap-0.5">
                                <ArrowUp className="w-3 h-3" />
                                {q.upvoteCount}
                              </span>
                              <span>{q.answerCount} answers</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Articles */}
                  {results!.articles.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Newspaper className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                          News & Articles
                        </h2>
                        <span className="text-xs text-text-tertiary">({counts!.articles})</span>
                      </div>
                      <div className="space-y-2">
                        {results!.articles.map((a) => (
                          <Link
                            key={a.id}
                            href={`/news/${a.slug}`}
                            className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                                {a.title}
                              </p>
                              <span className="text-xs text-text-tertiary mt-1 block">{a.category}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4 text-xs text-text-tertiary">
                              <span className="flex items-center gap-0.5">
                                <ArrowUp className="w-3 h-3" />
                                {a.upvoteCount}
                              </span>
                              <span>
                                {new Date(a.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Listings */}
                  {results!.listings.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                          Marketplace
                        </h2>
                        <span className="text-xs text-text-tertiary">({counts!.listings})</span>
                      </div>
                      <div className="space-y-2">
                        {results!.listings.map((l) => (
                          <Link
                            key={l.id}
                            href={`/marketplace/${l.slug}`}
                            className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                                {l.title}
                              </p>
                              {l.tagline && (
                                <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5 truncate max-w-lg">
                                  {l.tagline}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4 text-xs text-text-tertiary">
                              <span className="flex items-center gap-0.5">
                                <ArrowUp className="w-3 h-3" />
                                {l.upvoteCount}
                              </span>
                              <span>{l.type}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* People */}
                  {results!.users.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                          People
                        </h2>
                        <span className="text-xs text-text-tertiary">({counts!.users})</span>
                      </div>
                      <div className="space-y-2">
                        {results!.users.map((u) => {
                          const displayName = u.name || u.companyName || u.username || "User";
                          const avatar = u.image || u.companyLogo;
                          return (
                            <Link
                              key={u.id}
                              href={`/profile/${u.username}`}
                              className="flex items-center gap-3 p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                            >
                              <UserAvatar name={displayName} src={avatar} size="md" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                                  {displayName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {u.username && (
                                    <span className="text-xs text-text-tertiary">@{u.username}</span>
                                  )}
                                  {u.bio && (
                                    <span className="text-xs text-text-secondary dark:text-text-dark-secondary truncate max-w-xs">
                                      {u.bio}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-text-tertiary ml-auto capitalize shrink-0">
                                {u.role.toLowerCase()}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Jobs */}
                  {results!.jobs.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
                          Jobs
                        </h2>
                        <span className="text-xs text-text-tertiary">({counts!.jobs})</span>
                      </div>
                      <div className="space-y-2">
                        {results!.jobs.map((j) => (
                          <Link
                            key={j.id}
                            href={`/hire/${j.slug}`}
                            className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                                {j.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                                <span>{j.projectType}</span>
                                <span>{j.locationPreference}</span>
                                <span>
                                  {new Date(j.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
