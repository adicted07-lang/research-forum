import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Database, Tag, FileText, Scale, HardDrive } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { BadgePill } from "@/components/shared/badge-pill";
import { getDatasetBySlug } from "@/server/actions/datasets";

export const dynamic = "force-dynamic";

interface DatasetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DatasetPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const dataset = await getDatasetBySlug(slug);
    if (!dataset) {
      return { title: "Dataset Not Found — T.I.E" };
    }
    const description = dataset.description.replace(/<[^>]*>/g, "").slice(0, 160);
    return {
      title: `${dataset.title} — T.I.E Datasets`,
      description,
      openGraph: {
        title: dataset.title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: dataset.title,
        description,
      },
    };
  } catch {
    return { title: "Datasets — T.I.E" };
  }
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { slug } = await params;

  let dataset: Awaited<ReturnType<typeof getDatasetBySlug>> = null;
  try {
    dataset = await getDatasetBySlug(slug);
  } catch {
    notFound();
  }

  if (!dataset) {
    notFound();
  }

  const displayName = dataset.author.name ?? dataset.author.username ?? "Unknown";
  const priceLabel = dataset.price === 0 ? "Free" : `$${dataset.price.toFixed(2)}`;
  const isPaid = dataset.price > 0;

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <div className="flex items-start gap-4 mb-4">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
                {dataset.title}
              </h1>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                by{" "}
                {dataset.author.username ? (
                  <Link
                    href={`/profile/${dataset.author.username}`}
                    className="text-primary hover:underline"
                  >
                    {displayName}
                  </Link>
                ) : (
                  displayName
                )}
              </p>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-surface rounded-lg dark:bg-gray-800/50 border border-border-light dark:border-border-dark-light">
            {dataset.format && (
              <div className="flex flex-col">
                <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3" /> Format
                </span>
                <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {dataset.format}
                </span>
              </div>
            )}
            {dataset.size && (
              <div className="flex flex-col">
                <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary flex items-center gap-1 mb-1">
                  <HardDrive className="w-3 h-3" /> Size
                </span>
                <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {dataset.size}
                </span>
              </div>
            )}
            {dataset.license && (
              <div className="flex flex-col">
                <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary flex items-center gap-1 mb-1">
                  <Scale className="w-3 h-3" /> License
                </span>
                <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {dataset.license}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] text-text-tertiary dark:text-text-dark-tertiary flex items-center gap-1 mb-1">
                <Download className="w-3 h-3" /> Downloads
              </span>
              <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                {dataset.downloadCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tags */}
          {dataset.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Tag className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
              {dataset.tags.map((t: string) => (
                <Link key={t} href={`/datasets?tag=${t}`}>
                  <BadgePill label={t} variant="default" />
                </Link>
              ))}
            </div>
          )}

          {/* Download / Price action */}
          {dataset.downloadUrl ? (
            <a
              href={dataset.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              {isPaid ? `Download — ${priceLabel}` : "Download Free"}
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border-light text-sm font-medium text-text-secondary dark:border-border-dark-light dark:text-text-dark-secondary">
              {isPaid ? `Price: ${priceLabel}` : "Free Dataset"}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            About this Dataset
          </h2>
          <RichTextDisplay content={dataset.description} />
        </div>
      </div>
    </PageLayout>
  );
}
