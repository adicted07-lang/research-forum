import { getPendingArticles } from "@/server/actions/admin";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ModerationActions } from "./moderation-actions";

interface ModerationQueueProps {
  page?: number;
}

export async function ModerationQueue({ page = 1 }: ModerationQueueProps) {
  const result = await getPendingArticles(page, 20);

  if ("error" in result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load pending articles.
      </div>
    );
  }

  const { articles } = result;

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-white dark:bg-[#13131A] border border-border rounded-xl">
        <p className="text-lg font-medium">Queue is empty</p>
        <p className="text-sm mt-1">No articles pending review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article: any) => (
        <div
          key={article.id}
          className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-base leading-snug">
                {article.title}
              </h3>

              {/* Author */}
              <div className="flex items-center gap-2 mt-2">
                <UserAvatar
                  name={article.author.name ?? "?"}
                  src={article.author.image}
                  size="sm"
                />
                <span className="text-sm text-muted-foreground">
                  {article.author.name ?? article.author.username ?? "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  &middot;{" "}
                  {new Date(article.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Excerpt */}
              {article.body && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {article.body.slice(0, 200)}
                  {article.body.length > 200 ? "..." : ""}
                </p>
              )}
            </div>

            <div className="shrink-0">
              <ModerationActions articleId={article.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
