"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageSquare, ShoppingBag, Newspaper, Users, Briefcase, X, HelpCircle, FileText, Database, Clock } from "lucide-react";
import { globalSearch, type SearchResults } from "@/server/actions/search";
import { UserAvatar } from "@/components/shared/user-avatar";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function hasResults(results: SearchResults): boolean {
  return (
    results.questions.length > 0 ||
    results.listings.length > 0 ||
    results.articles.length > 0 ||
    results.users.length > 0 ||
    results.jobs.length > 0
  );
}

const quickActions = [
  { label: "Ask a Question", icon: <HelpCircle className="w-4 h-4 text-blue-500" />, href: "/forum/new" },
  { label: "Browse Forum", icon: <MessageSquare className="w-4 h-4 text-orange-500" />, href: "/forum" },
  { label: "List a Service", icon: <ShoppingBag className="w-4 h-4 text-purple-500" />, href: "/marketplace/new" },
  { label: "Write an Article", icon: <FileText className="w-4 h-4 text-green-500" />, href: "/news/submit" },
  { label: "Post a Job", icon: <Briefcase className="w-4 h-4 text-blue-500" />, href: "/hire/new" },
  { label: "Upload Dataset", icon: <Database className="w-4 h-4 text-amber-500" />, href: "/datasets/new" },
  { label: "Office Hours", icon: <Clock className="w-4 h-4 text-red-500" />, href: "/office-hours" },
  { label: "Find Researchers", icon: <Users className="w-4 h-4 text-teal-500" />, href: "/researchers" },
];

export function SearchWithResults() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowActions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setShowActions(false);
    setLoading(true);
    const data = await globalSearch(q);
    setResults(data);
    setOpen(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  function navigateToSearch() {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") navigateToSearch();
    if (e.key === "Escape") { setOpen(false); setShowActions(false); }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={() => { if (query.trim() && results && hasResults(results)) setOpen(true); else if (!query.trim()) setShowActions(true); }}
          onFocus={() => { /* only open via click, not auto-focus */ }}
          placeholder="Search..."
          className="w-full py-2 pl-10 pr-9 text-[13.5px] rounded-md border border-border bg-surface text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-light dark:bg-surface-dark dark:border-border-dark dark:text-text-dark-primary dark:focus:bg-background dark:focus:ring-primary/20"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Actions (shown when focused with empty query) */}
      {showActions && !open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary bg-surface/50 dark:bg-surface-dark/30 border-b border-border dark:border-border-dark">
            Quick Actions
          </div>
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              onClick={() => { setShowActions(false); }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
            >
              {action.icon}
              <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{action.label}</span>
            </a>
          ))}
          <div className="border-t border-border dark:border-border-dark px-4 py-2 flex items-center justify-between text-[11px] text-text-tertiary">
            <span>Type to search content</span>
            <span>ESC to close</span>
          </div>
        </div>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-sm text-text-tertiary text-center">Searching...</div>
          ) : results && hasResults(results) ? (
            <>
              {results.questions.length > 0 && (
                <ResultSection
                  title="Questions"
                  icon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  {results.questions.map((q) => (
                    <ResultItem
                      key={q.id}
                      label={q.title}
                      meta={`${q.answerCount} answers`}
                      href={`/forum/${q.slug}`}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </ResultSection>
              )}

              {results.listings.length > 0 && (
                <ResultSection
                  title="Marketplace"
                  icon={<ShoppingBag className="w-3.5 h-3.5" />}
                >
                  {results.listings.map((l) => (
                    <ResultItem
                      key={l.id}
                      label={l.title}
                      meta={l.tagline}
                      href={`/marketplace/${l.slug}`}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </ResultSection>
              )}

              {results.articles.length > 0 && (
                <ResultSection
                  title="News & Articles"
                  icon={<Newspaper className="w-3.5 h-3.5" />}
                >
                  {results.articles.map((a) => (
                    <ResultItem
                      key={a.id}
                      label={a.title}
                      href={`/news/${a.slug}`}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </ResultSection>
              )}

              {results.users.length > 0 && (
                <ResultSection
                  title="People"
                  icon={<Users className="w-3.5 h-3.5" />}
                >
                  {results.users.map((u) => {
                    const displayName = u.name || u.companyName || u.username || "User";
                    const avatar = u.image || u.companyLogo;
                    const href = u.role === "COMPANY"
                      ? `/company/${u.username}`
                      : `/@${u.username}`;
                    return (
                      <a
                        key={u.id}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
                      >
                        <UserAvatar name={displayName} src={avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                            {displayName}
                          </p>
                          {u.username && (
                            <p className="text-xs text-text-tertiary truncate">@{u.username}</p>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </ResultSection>
              )}

              {results.jobs.length > 0 && (
                <ResultSection
                  title="Jobs"
                  icon={<Briefcase className="w-3.5 h-3.5" />}
                >
                  {results.jobs.map((j) => (
                    <ResultItem
                      key={j.id}
                      label={j.title}
                      meta={j.locationPreference}
                      href={`/hire/${j.slug}`}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </ResultSection>
              )}

              <div className="border-t border-border dark:border-border-dark px-4 py-2.5">
                <button
                  onClick={navigateToSearch}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  View all results for &ldquo;{query}&rdquo; →
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-sm text-text-tertiary text-center">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary bg-surface/50 dark:bg-surface-dark/30 border-b border-border dark:border-border-dark">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function ResultItem({
  label,
  meta,
  href,
  onNavigate,
}: {
  label: string;
  meta?: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onNavigate}
      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface dark:hover:bg-surface-dark/60 transition-colors"
    >
      <p className="text-sm text-text-primary dark:text-text-dark-primary truncate">{label}</p>
      {meta && (
        <span className="text-xs text-text-tertiary shrink-0">{meta}</span>
      )}
    </a>
  );
}
