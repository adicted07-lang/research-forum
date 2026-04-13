import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/page-layout";
import { personSchema, breadcrumbSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params;

  const user = await db.user.findFirst({
    where: { username, deletedAt: null },
    select: { name: true, username: true },
  });

  if (!user) {
    return { title: "Author Not Found — The Intellectual Exchange" };
  }

  const displayName = user.name || user.username || "Author";

  const [questionCount, articleCount] = await Promise.all([
    db.question.count({ where: { author: { username }, deletedAt: null } }),
    db.article.count({ where: { author: { username }, status: "PUBLISHED", deletedAt: null } }),
  ]);

  const description = `${displayName} has contributed ${questionCount} question${questionCount !== 1 ? "s" : ""} and ${articleCount} article${articleCount !== 1 ? "s" : ""} on The Intellectual Exchange.`;

  const ogImageUrl = `/api/og?type=profile&name=${encodeURIComponent(displayName)}`;

  return {
    title: `${displayName}'s Contributions — The Intellectual Exchange`,
    description,
    alternates: {
      canonical: `${baseUrl}/author/${username}`,
    },
    openGraph: {
      title: `${displayName}'s Contributions — The Intellectual Exchange`,
      description,
      type: "profile",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName}'s Contributions`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params;

  const user = await db.user.findFirst({
    where: { username, deletedAt: null },
    select: { id: true, name: true, username: true, bio: true, expertise: true },
  });

  if (!user) {
    notFound();
  }

  const [questions, articles, answers] = await Promise.all([
    db.question.findMany({
      where: { authorId: user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        slug: true,
        tags: true,
        upvoteCount: true,
        answerCount: true,
        createdAt: true,
      },
    }),
    db.article.findMany({
      where: { authorId: user.id, status: "PUBLISHED", deletedAt: null },
      orderBy: { publishedAt: "desc" },
      select: {
        title: true,
        slug: true,
        tags: true,
        category: true,
        publishedAt: true,
        readTime: true,
      },
    }),
    db.answer.findMany({
      where: { authorId: user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        body: true,
        createdAt: true,
        isAccepted: true,
        question: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const displayName = user.name || user.username || "Author";

  const personLd = personSchema({
    name: user.name,
    username: user.username || "",
    bio: user.bio,
    expertise: user.expertise as string[] | undefined,
  });

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Authors", url: `${baseUrl}/researchers` },
    { name: displayName, url: `${baseUrl}/author/${username}` },
  ]);

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{displayName}&apos;s Contributions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All questions, articles, and answers by{" "}
          <Link
            href={`/profile/${username}`}
            className="text-primary hover:underline"
          >
            {displayName}
          </Link>
        </p>
      </div>

      {/* Stats Summary */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="bg-white border border-border-light rounded-md p-4 text-center dark:bg-surface-dark dark:border-border-dark-light">
          <div className="text-2xl font-bold text-foreground">{questions.length}</div>
          <div className="text-sm text-muted-foreground">Questions</div>
        </div>
        <div className="bg-white border border-border-light rounded-md p-4 text-center dark:bg-surface-dark dark:border-border-dark-light">
          <div className="text-2xl font-bold text-foreground">{articles.length}</div>
          <div className="text-sm text-muted-foreground">Articles</div>
        </div>
        <div className="bg-white border border-border-light rounded-md p-4 text-center dark:bg-surface-dark dark:border-border-dark-light">
          <div className="text-2xl font-bold text-foreground">{answers.length}</div>
          <div className="text-sm text-muted-foreground">Answers</div>
        </div>
      </div>

      {/* Questions Section */}
      {questions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Questions</h2>
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.slug}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <Link href={`/forum/${q.slug}`} className="text-base font-medium text-foreground hover:text-primary">
                  {q.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{q.upvoteCount ?? 0} upvotes</span>
                  <span>{q.answerCount ?? 0} answers</span>
                  <time dateTime={q.createdAt.toISOString()}>
                    {q.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                </div>
                {q.tags && q.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(q.tags as string[]).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Articles Section */}
      {articles.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Articles</h2>
          <div className="space-y-3">
            {articles.map((a) => (
              <div
                key={a.slug}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <Link href={`/news/${a.slug}`} className="text-base font-medium text-foreground hover:text-primary">
                  {a.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {a.category && <span>{a.category}</span>}
                  {a.readTime && <span>{a.readTime} min read</span>}
                  {a.publishedAt && (
                    <time dateTime={a.publishedAt.toISOString()}>
                      {a.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </time>
                  )}
                </div>
                {a.tags && a.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(a.tags as string[]).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Answers Section */}
      {answers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Answers</h2>
          <div className="space-y-3">
            {answers.map((a, i) => (
              <div
                key={`answer-${i}`}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <div className="flex items-center gap-2 mb-2">
                  {a.isAccepted && (
                    <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Accepted
                    </span>
                  )}
                  <Link
                    href={`/forum/${a.question.slug}`}
                    className="text-base font-medium text-foreground hover:text-primary"
                  >
                    {a.question.title}
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {a.body.replace(/<[^>]*>/g, "").slice(0, 200)}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <time dateTime={a.createdAt.toISOString()}>
                    {a.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {questions.length === 0 && articles.length === 0 && answers.length === 0 && (
        <div className="bg-white border border-border-light rounded-md p-6 text-center dark:bg-surface-dark dark:border-border-dark-light">
          <p className="text-muted-foreground">{displayName} hasn&apos;t contributed any content yet.</p>
        </div>
      )}
    </PageLayout>
  );
}
