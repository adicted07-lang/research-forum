"use client";

import { useState } from "react";
import { FeedCard } from "@/components/feed/feed-card";
import { loadMoreFeedItems } from "@/server/actions/feed";
import type { FeedItem } from "@/lib/feed";

type FeedListProps = {
  initialItems: FeedItem[];
  initialHasMore: boolean;
};

export function FeedList({ initialItems, initialHasMore }: FeedListProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleLoadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await loadMoreFeedItems(nextPage);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary dark:text-text-dark-secondary">
          No activity yet. Check back soon!
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="/forum" className="text-sm text-primary hover:underline">Browse Forum</a>
          <a href="/news" className="text-sm text-primary hover:underline">Read News</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {items.map((item) => (
          <FeedCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium border border-border dark:border-border-dark rounded-lg text-text-primary dark:text-text-dark-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
