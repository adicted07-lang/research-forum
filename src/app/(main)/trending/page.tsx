import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Flame, FileText, Users } from "lucide-react";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/page-layout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending — The Intellectual Exchange",
};

export default async function TrendingPage() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Fetch all data in parallel
  const [recentQuestions, hotQuestions, popularArticles, activeResearchers] =
    await Promise.all([
      // For trending topics: get questions from last 7 days with tags + upvotes
      db.question.findMany({
        where: { deletedAt: null, createdAt: { gte: oneWeekAgo } },
        select: { tags: true, upvoteCount: true },
      }),
      // Hot questions: top 10 by upvotes in last 7 days
      db.question.findMany({
        where: { deletedAt: null, createdAt: { gte: oneWeekAgo } },
        select: {
          title: true,
          slug: true,
          upvoteCount: true,
          answerCount: true,
          tags: true,
          author: { select: { username: true, name: true } },
        },
        orderBy: { upvoteCount: "desc" },
        take: 10,
      }),
      // Popular articles: top 5 published by recent engagement
      db.article.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: {
          title: true,
          slug: true,
          upvoteCount: true,
          readTime: true,
          author: { select: { username: true, name: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      // Active researchers: top 5 users by points with bio
      db.user.findMany({
        where: { deletedAt: null, bio: { not: "" } },
        select: {
          username: true,
          name: true,
          image: true,
          bio: true,
          points: true,
          expertise: true,
        },
        orderBy: { points: "desc" },
        take: 5,
      }),
    ]);

  // Compute trending topics: tag frequency weighted by upvotes
  const tagCounts = new Map<string, { count: number; upvotes: number }>();
  for (const q of recentQuestions) {
    for (const tag of q.tags) {
      const entry = tagCounts.get(tag) || { count: 0, upvotes: 0 };
      entry.count++;
      entry.upvotes += q.upvoteCount;
      tagCounts.set(tag, entry);
    }
  }

  const trendingTopics = Array.from(tagCounts.entries())
    .map(([topic, data]) => ({
      topic,
      questions: data.count,
      upvotes: data.upvotes,
    }))
    .sort((a, b) => b.upvotes - a.upvotes || b.questions - a.questions)
    .slice(0, 15);

  const cardClass =
    "bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light";
  const headingClass = "text-text-primary dark:text-text-dark-primary";
  const linkClass = "text-primary hover:underline";

  return (
    <PageLayout>
      <div className="space-y-8">
        <div>
          <h1
            className={`text-2xl font-bold ${headingClass} flex items-center gap-2`}
          >
            <TrendingUp className="h-6 w-6" />
            Trending
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
            What the community is talking about this week
          </p>
        </div>

        {/* Trending Topics */}
        <section className={cardClass}>
          <h2
            className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}
          >
            <TrendingUp className="h-5 w-5" />
            Trending Topics
          </h2>
          {trendingTopics.length === 0 ? (
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              No trending topics this week.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t) => (
                <Link
                  key={t.topic}
                  href={`/topic/${t.topic}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-border-light dark:border-border-dark-light ${linkClass} hover:bg-primary/5 transition-colors`}
                >
                  <span className="font-medium">{t.topic}</span>
                  <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {t.questions}q &middot; {t.upvotes}
                    <span className="ml-0.5">&uarr;</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Hot Questions */}
        <section className={cardClass}>
          <h2
            className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}
          >
            <Flame className="h-5 w-5" />
            Hot Questions
          </h2>
          {hotQuestions.length === 0 ? (
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              No hot questions this week.
            </p>
          ) : (
            <ul className="space-y-4">
              {hotQuestions.map((q) => (
                <li key={q.slug} className="flex items-start gap-4">
                  <div className="flex flex-col items-center min-w-[48px] text-center">
                    <span className={`text-lg font-bold ${headingClass}`}>
                      {q.upvoteCount}
                    </span>
                    <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
                      votes
                    </span>
                  </div>
                  <div className="min-w-0">
                    <Link href={`/forum/${q.slug}`} className={linkClass}>
                      {q.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
                      <span>
                        {q.answerCount}{" "}
                        {q.answerCount === 1 ? "answer" : "answers"}
                      </span>
                      {q.author?.name && (
                        <>
                          <span>&middot;</span>
                          <span>{q.author.name}</span>
                        </>
                      )}
                      {q.tags.length > 0 && (
                        <>
                          <span>&middot;</span>
                          {q.tags.slice(0, 3).map((tag) => (
                            <Link
                              key={tag}
                              href={`/topic/${tag}`}
                              className="text-primary hover:underline"
                            >
                              {tag}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Popular Articles */}
        <section className={cardClass}>
          <h2
            className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}
          >
            <FileText className="h-5 w-5" />
            Popular Articles
          </h2>
          {popularArticles.length === 0 ? (
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              No articles published yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {popularArticles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/news/${a.slug}`} className={linkClass}>
                    {a.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
                    {a.author?.name && <span>by {a.author.name}</span>}
                    {a.readTime && (
                      <>
                        <span>&middot;</span>
                        <span>{a.readTime} min read</span>
                      </>
                    )}
                    <span>&middot;</span>
                    <span>
                      {a.upvoteCount} {a.upvoteCount === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Active Researchers */}
        <section className={cardClass}>
          <h2
            className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}
          >
            <Users className="h-5 w-5" />
            Active Researchers
          </h2>
          {activeResearchers.length === 0 ? (
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              No active researchers found.
            </p>
          ) : (
            <ul className="space-y-4">
              {activeResearchers.map((u) => (
                <li key={u.username} className="flex items-start gap-3">
                  {u.image ? (
                    <img
                      src={u.image}
                      alt={u.name || u.username || ""}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {(u.name || u.username || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${u.username}`}
                      className={`font-medium ${linkClass}`}
                    >
                      {u.name || u.username}
                    </Link>
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-1 mt-0.5">
                      {u.bio}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
                      <span>{u.points} points</span>
                      {u.expertise.length > 0 && (
                        <>
                          <span>&middot;</span>
                          <span>{u.expertise.slice(0, 3).join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
