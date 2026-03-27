import Link from "next/link";
import { Bookmark, FileText, MessageSquare, ShoppingBag } from "lucide-react";

interface BookmarkItem {
  id: string;
  targetType: string;
  title: string;
  url: string;
  createdAt: Date;
}

const typeIcons: Record<string, React.ElementType> = {
  QUESTION: MessageSquare,
  LISTING: ShoppingBag,
  ARTICLE: FileText,
};

const typeLabels: Record<string, string> = {
  QUESTION: "Question",
  LISTING: "Listing",
  ARTICLE: "Article",
};

export function BookmarksList({ bookmarks }: { bookmarks: BookmarkItem[] }) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
        <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
          No saved items yet
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          Bookmark questions, listings, and articles to find them here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border dark:divide-border-dark">
      {bookmarks.map((bm) => {
        const Icon = typeIcons[bm.targetType] ?? Bookmark;
        return (
          <li key={bm.id}>
            <Link
              href={bm.url}
              className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-surface dark:hover:bg-surface-dark transition-colors"
            >
              <Icon className="w-4 h-4 text-text-tertiary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                  {bm.title}
                </p>
                <p className="text-xs text-text-tertiary">
                  {typeLabels[bm.targetType] ?? bm.targetType}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
