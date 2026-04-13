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
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry: rawIndustry } = await params;
  const industry = decodeURIComponent(rawIndustry);
  const displayIndustry = titleCase(industry);

  const title = `${displayIndustry} — Industry — The Intellectual Exchange`;
  const description = `Explore questions, articles, and jobs related to the ${displayIndustry} industry on The Intellectual Exchange.`;
  const canonical = `${baseUrl}/industry/${encodeURIComponent(industry)}`;

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
          url: `${baseUrl}/api/og?title=${encodeURIComponent(displayIndustry)}&subtitle=Industry`,
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
        `${baseUrl}/api/og?title=${encodeURIComponent(displayIndustry)}&subtitle=Industry`,
      ],
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry: rawIndustry } = await params;
  const industry = decodeURIComponent(rawIndustry);
  const displayIndustry = titleCase(industry);

  const [questions, articles, jobs] = await Promise.all([
    db.question.findMany({
      where: { industry, deletedAt: null },
      select: { id: true, title: true, slug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.article.findMany({
      where: { category: industry, status: "PUBLISHED", deletedAt: null },
      select: { id: true, title: true, slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
    db.job.findMany({
      where: { researchDomain: { has: industry }, deletedAt: null },
      select: { id: true, title: true, slug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalCount = questions.length + articles.length + jobs.length;

  if (totalCount === 0) {
    notFound();
  }

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Industries", url: `${baseUrl}/industry` },
    {
      name: displayIndustry,
      url: `${baseUrl}/industry/${encodeURIComponent(industry)}`,
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
          <span>Industries</span>
          <span className="mx-2">/</span>
          <span className="text-text-secondary dark:text-text-dark-secondary">
            {displayIndustry}
          </span>
        </nav>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary">
          {displayIndustry}
        </h1>
        <p className="mt-2 text-text-secondary dark:text-text-dark-secondary">
          {totalCount} result{totalCount !== 1 ? "s" : ""} across questions,
          articles, and jobs in the {displayIndustry} industry.
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
    </PageLayout>
  );
}
