"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  getFeaturedContent,
  toggleQuestionFeatured,
  toggleQuestionPinned,
  toggleArticleFeatured,
  searchQuestionsForFeature,
  searchArticlesForFeature,
} from "@/server/actions/admin-content";
import { Star, Pin, Search, Newspaper, MessageSquare, X } from "lucide-react";

interface Question {
  id: string;
  title: string;
  isFeatured: boolean;
  isPinned: boolean;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  isFeatured: boolean;
  slug: string;
}

export function FeaturedContentManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  // Search state
  const [questionSearch, setQuestionSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [searchedQuestions, setSearchedQuestions] = useState<Question[]>([]);
  const [searchedArticles, setSearchedArticles] = useState<Article[]>([]);
  const [searchingQ, setSearchingQ] = useState(false);
  const [searchingA, setSearchingA] = useState(false);

  useEffect(() => {
    getFeaturedContent().then((result) => {
      setQuestions(result.questions);
      setArticles(result.articles);
      setLoading(false);
    });
  }, []);

  async function handleQuestionSearch(query: string) {
    setQuestionSearch(query);
    if (!query.trim()) {
      setSearchedQuestions([]);
      return;
    }
    setSearchingQ(true);
    const result = await searchQuestionsForFeature(query);
    setSearchedQuestions(result.questions);
    setSearchingQ(false);
  }

  async function handleArticleSearch(query: string) {
    setArticleSearch(query);
    if (!query.trim()) {
      setSearchedArticles([]);
      return;
    }
    setSearchingA(true);
    const result = await searchArticlesForFeature(query);
    setSearchedArticles(result.articles);
    setSearchingA(false);
  }

  function handleToggleQuestionFeatured(q: Question) {
    startTransition(async () => {
      const result = await toggleQuestionFeatured(q.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        const updated = { ...q, isFeatured: !q.isFeatured };
        setQuestions((prev) => {
          const existing = prev.find((x) => x.id === q.id);
          if (existing) {
            return prev
              .map((x) => (x.id === q.id ? updated : x))
              .filter((x) => x.isFeatured || x.isPinned);
          }
          if (updated.isFeatured || updated.isPinned) return [updated, ...prev];
          return prev;
        });
        setSearchedQuestions((prev) =>
          prev.map((x) => (x.id === q.id ? updated : x))
        );
        toast.success(updated.isFeatured ? "Question featured" : "Question unfeatured");
      }
    });
  }

  function handleToggleQuestionPinned(q: Question) {
    startTransition(async () => {
      const result = await toggleQuestionPinned(q.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        const updated = { ...q, isPinned: !q.isPinned };
        setQuestions((prev) => {
          const existing = prev.find((x) => x.id === q.id);
          if (existing) {
            return prev
              .map((x) => (x.id === q.id ? updated : x))
              .filter((x) => x.isFeatured || x.isPinned);
          }
          if (updated.isFeatured || updated.isPinned) return [updated, ...prev];
          return prev;
        });
        setSearchedQuestions((prev) =>
          prev.map((x) => (x.id === q.id ? updated : x))
        );
        toast.success(updated.isPinned ? "Question pinned" : "Question unpinned");
      }
    });
  }

  function handleToggleArticleFeatured(a: Article) {
    startTransition(async () => {
      const result = await toggleArticleFeatured(a.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        const updated = { ...a, isFeatured: !a.isFeatured };
        setArticles((prev) => {
          const existing = prev.find((x) => x.id === a.id);
          if (existing) {
            return prev
              .map((x) => (x.id === a.id ? updated : x))
              .filter((x) => x.isFeatured);
          }
          if (updated.isFeatured) return [updated, ...prev];
          return prev;
        });
        setSearchedArticles((prev) =>
          prev.map((x) => (x.id === a.id ? updated : x))
        );
        toast.success(updated.isFeatured ? "Article featured" : "Article unfeatured");
      }
    });
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Questions */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="size-4" />
          Featured &amp; Pinned Questions
        </h2>

        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={questionSearch}
            onChange={(e) => handleQuestionSearch(e.target.value)}
            placeholder="Search questions to feature..."
            className="w-full text-sm border border-border rounded-lg pl-9 pr-9 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {questionSearch && (
            <button
              onClick={() => {
                setQuestionSearch("");
                setSearchedQuestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Search results */}
        {questionSearch && (
          <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2.5 border-b border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Search results
              </p>
            </div>
            {searchingQ ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchedQuestions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No questions found
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {searchedQuestions.map((q) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    onToggleFeatured={() => handleToggleQuestionFeatured(q)}
                    onTogglePinned={() => handleToggleQuestionPinned(q)}
                    pending={pending}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Current featured/pinned */}
        <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs text-muted-foreground font-medium">
              Currently featured / pinned
            </p>
          </div>
          {questions.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No featured or pinned questions
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {questions.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  onToggleFeatured={() => handleToggleQuestionFeatured(q)}
                  onTogglePinned={() => handleToggleQuestionPinned(q)}
                  pending={pending}
                />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Articles */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Newspaper className="size-4" />
          Featured Articles
        </h2>

        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={articleSearch}
            onChange={(e) => handleArticleSearch(e.target.value)}
            placeholder="Search articles to feature..."
            className="w-full text-sm border border-border rounded-lg pl-9 pr-9 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {articleSearch && (
            <button
              onClick={() => {
                setArticleSearch("");
                setSearchedArticles([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Search results */}
        {articleSearch && (
          <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2.5 border-b border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Search results
              </p>
            </div>
            {searchingA ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchedArticles.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No articles found
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {searchedArticles.map((a) => (
                  <ArticleRow
                    key={a.id}
                    article={a}
                    onToggleFeatured={() => handleToggleArticleFeatured(a)}
                    pending={pending}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Current featured articles */}
        <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs text-muted-foreground font-medium">
              Currently featured
            </p>
          </div>
          {articles.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No featured articles
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {articles.map((a) => (
                <ArticleRow
                  key={a.id}
                  article={a}
                  onToggleFeatured={() => handleToggleArticleFeatured(a)}
                  pending={pending}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function QuestionRow({
  question,
  onToggleFeatured,
  onTogglePinned,
  pending,
}: {
  question: Question;
  onToggleFeatured: () => void;
  onTogglePinned: () => void;
  pending: boolean;
}) {
  return (
    <li className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors gap-4">
      <p className="text-sm text-foreground line-clamp-1 min-w-0 flex-1">
        {question.title}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onTogglePinned}
          disabled={pending}
          title={question.isPinned ? "Unpin" : "Pin"}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
            question.isPinned
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Pin className="size-3.5" />
          {question.isPinned ? "Pinned" : "Pin"}
        </button>
        <button
          onClick={onToggleFeatured}
          disabled={pending}
          title={question.isFeatured ? "Unfeature" : "Feature"}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
            question.isFeatured
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Star className="size-3.5" />
          {question.isFeatured ? "Featured" : "Feature"}
        </button>
      </div>
    </li>
  );
}

function ArticleRow({
  article,
  onToggleFeatured,
  pending,
}: {
  article: Article;
  onToggleFeatured: () => void;
  pending: boolean;
}) {
  return (
    <li className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors gap-4">
      <p className="text-sm text-foreground line-clamp-1 min-w-0 flex-1">
        {article.title}
      </p>
      <button
        onClick={onToggleFeatured}
        disabled={pending}
        title={article.isFeatured ? "Unfeature" : "Feature"}
        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 shrink-0 ${
          article.isFeatured
            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
            : "border-border text-muted-foreground hover:bg-muted"
        }`}
      >
        <Star className="size-3.5" />
        {article.isFeatured ? "Featured" : "Feature"}
      </button>
    </li>
  );
}
