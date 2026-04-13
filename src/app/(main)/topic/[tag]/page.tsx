import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/page-layout";
import { breadcrumbSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

function titleCase(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const displayTag = titleCase(tag);

  const title = `${displayTag} — Research Topics — The Intellectual Exchange`;
  const description = `Explore questions, articles, jobs, datasets, grants, and researchers related to ${displayTag} on The Intellectual Exchange.`;
  const canonical = `${baseUrl}/topic/${encodeURIComponent(tag)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      siteName: "The Intellectual Exchange",
      images: [
        {
          url: `${baseUrl}/api/og?title=${encodeURIComponent(displayTag)}&subtitle=Research+Topics`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `${baseUrl}/api/og?title=${encodeURIComponent(displayTag)}&subtitle=Research+Topics`,
      ],
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const displayTag = titleCase(tag);

  const [questions, articles, jobs, datasets, grants, researchers] =
    await Promise.all([
      db.question.findMany({
        where: { tags: { has: tag }, deletedAt: null },
        select: { id: true, title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.article.findMany({
        where: { tags: { has: tag }, status: "PUBLISHED", deletedAt: null },
        select: { id: true, title: true, slug: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
      db.job.findMany({
        where: { requiredSkills: { has: tag }, deletedAt: null },
        select: { id: true, title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.dataset.findMany({
        where: { tags: { has: tag }, deletedAt: null, isActive: true },
        select: { id: true, title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.grant.findMany({
        where: { tags: { has: tag }, isActive: true },
        select: { id: true, title: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.user.findMany({
        where: {
          expertise: { has: tag },
          deletedAt: null,
          bio: { not: "" },
        },
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          image: true,
        },
        take: 20,
      }),
    ]);

  const totalCount =
    questions.length +
    articles.length +
    jobs.length +
    datasets.length +
    grants.length +
    researchers.length;

  if (totalCount === 0) {
    notFound();
  }

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Topics", url: `${baseUrl}/topic` },
    {
      name: displayTag,
      url: `${baseUrl}/topic/${encodeURIComponent(tag)}`,
    },
  ]);

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-text-tertiary dark:text-text-dark-tertiary mb-3">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Topics</span>
          <span className="mx-2">/</span>
          <span className="text-text-secondary dark:text-text-dark-secondary">
            {displayTag}
          </span>
        </nav>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary">
          {displayTag}
        </h1>
        <p className="mt-2 text-text-secondary dark:text-text-dark-secondary">
          {totalCount} result{totalCount !== 1 ? "s" : ""} across questions,
          articles, jobs, datasets, grants, and researchers.
        </p>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Questions ({questions.length})
          </h2>
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <Link
                  href={`/forum/${q.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {q.title}
                </Link>
                <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary mt-1">
                  {q.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Articles ({articles.length})
          </h2>
          <div className="space-y-3">
            {articles.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <Link
                  href={`/news/${a.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {a.title}
                </Link>
                <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary mt-1">
                  {a.publishedAt?.toLocaleDateString() ?? ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jobs */}
      {jobs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Jobs ({jobs.length})
          </h2>
          <div className="space-y-3">
            {jobs.map((j) => (
              <div
                key={j.id}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <Link
                  href={`/talent-board/${j.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {j.title}
                </Link>
                <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary mt-1">
                  {j.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Datasets */}
      {datasets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Datasets ({datasets.length})
          </h2>
          <div className="space-y-3">
            {datasets.map((d) => (
              <div
                key={d.id}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <Link
                  href={`/datasets/${d.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {d.title}
                </Link>
                <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary mt-1">
                  {d.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grants */}
      {grants.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Grants ({grants.length})
          </h2>
          <div className="space-y-3">
            {grants.map((g) => (
              <div
                key={g.id}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light"
              >
                <Link
                  href={`/grants/${g.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {g.title}
                </Link>
                <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary mt-1">
                  {g.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Researchers */}
      {researchers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Researchers ({researchers.length})
          </h2>
          <div className="space-y-3">
            {researchers.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light flex items-center gap-4"
              >
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.name ?? r.username ?? "Researcher"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <Link
                    href={`/profile/${r.username}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {r.name ?? r.username}
                  </Link>
                  {r.bio && (
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-0.5">
                      {r.bio.slice(0, 120)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
