import Link from "next/link";
import { getQuestions } from "@/server/actions/questions";
import { FORUM_CATEGORIES } from "@/lib/validations/forum";
import { QuestionCard } from "@/components/forum/question-card";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Most Upvoted", value: "most_upvoted" },
  { label: "Unanswered", value: "unanswered" },
];

interface QuestionListProps {
  category?: string;
  sort?: string;
  page?: number;
}

export async function QuestionList({
  category,
  sort = "newest",
  page = 1,
}: QuestionListProps) {
  let questions: Awaited<ReturnType<typeof getQuestions>>["questions"] = [];
  let totalPages = 1;
  let currentPage = page;
  try {
    const result = await getQuestions({ category, sort, page });
    questions = result.questions;
    totalPages = result.totalPages;
    currentPage = result.currentPage;
  } catch {
    // Database not connected yet
  }

  function buildUrl(params: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set("category", String(params.category));
    if (params.sort && params.sort !== "newest")
      searchParams.set("sort", String(params.sort));
    if (params.page && Number(params.page) > 1)
      searchParams.set("page", String(params.page));
    const qs = searchParams.toString();
    return `/forum${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap mb-4 border-b border-border-light dark:border-border-dark-light pb-3">
        <Link
          href={buildUrl({ sort, page: 1 })}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            !category
              ? "bg-primary text-white"
              : "text-text-secondary hover:text-text-primary hover:bg-surface dark:text-text-dark-secondary dark:hover:bg-surface-dark"
          }`}
        >
          All
        </Link>
        {FORUM_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={buildUrl({ category: cat, sort, page: 1 })}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              category === cat
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface dark:text-text-dark-secondary dark:hover:bg-surface-dark"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Sort dropdown row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          {questions.length === 0
            ? "No questions"
            : `Page ${currentPage} of ${totalPages}`}
        </p>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ category, sort: opt.value, page: 1 })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                sort === opt.value || (!sort && opt.value === "newest")
                  ? "border-primary text-primary bg-primary-light"
                  : "border-border text-text-secondary hover:border-primary hover:text-primary dark:border-border-dark dark:text-text-dark-secondary"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description={
            category
              ? `No questions in "${category}" yet. Be the first to ask!`
              : "No questions yet. Be the first to ask!"
          }
          icon={<MessageSquare className="w-12 h-12" />}
          action={
            <Link
              href="/forum/new"
              className="inline-flex px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
            >
              Ask a Question
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
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
