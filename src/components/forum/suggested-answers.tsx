import Link from "next/link";
import { Lightbulb, ThumbsUp } from "lucide-react";

interface SuggestedAnswer {
  questionTitle: string;
  questionSlug: string;
  answerExcerpt: string;
  authorName: string;
  authorUsername: string | null;
  upvoteCount: number;
}

export function SuggestedAnswers({ suggestions }: { suggestions: SuggestedAnswer[] }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
          Related answers from the community
        </h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <div
            key={s.questionSlug}
            className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-blue-100 dark:border-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <Link href={`/forum/${s.questionSlug}`} className="block">
              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
                {s.questionTitle}
              </p>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-2">
                {s.answerExcerpt}
              </p>
            </Link>
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              {s.authorUsername ? (
                <Link
                  href={`/profile/${s.authorUsername}`}
                  className="hover:text-primary transition-colors"
                >
                  {s.authorName}
                </Link>
              ) : (
                <span>{s.authorName}</span>
              )}
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {s.upvoteCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
