import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BadgePill } from "@/components/shared/badge-pill";
import { DatasetCard } from "@/components/datasets/dataset-card";
import { getDatasets } from "@/server/actions/datasets";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Dataset Marketplace — T.I.E",
  description: "Discover and share research datasets from the T.I.E community.",
  alternates: { canonical: `${baseUrl}/datasets` },
  openGraph: {
    title: "Dataset Marketplace — T.I.E",
    description: "Discover and share research datasets from the T.I.E community.",
    siteName: "The Intellectual Exchange",
    images: [{ url: `${baseUrl}/api/og?title=Datasets&subtitle=T.I.E`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dataset Marketplace — T.I.E",
    description: "Discover and share research datasets from the T.I.E community.",
    images: [`${baseUrl}/api/og?title=Datasets&subtitle=T.I.E`],
  },
};

interface DatasetsPageProps {
  searchParams: Promise<{
    tag?: string;
    format?: string;
    sort?: string;
    page?: string;
  }>;
}

const POPULAR_TAGS = [
  "climate",
  "genomics",
  "nlp",
  "imaging",
  "economics",
  "neuroscience",
  "public-health",
  "astronomy",
];

const FORMATS = ["CSV", "JSON", "Parquet", "SQL", "Other"];

export default async function DatasetsPage({ searchParams }: DatasetsPageProps) {
  const params = await searchParams;
  const tag = params.tag;
  const format = params.format;
  const sort = params.sort ?? "newest";
  const page = params.page ? parseInt(params.page, 10) : 1;

  const datasets = await getDatasets({ tag, format, sort, page });

  return (
    <PageLayout
      sidebar={
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 dark:bg-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                Share a Dataset
              </h3>
            </div>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-3">
              Contribute your research data to the community.
            </p>
            <Link
              href="/datasets/new"
              className="block w-full text-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Upload Dataset
            </Link>
          </div>

          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((t) => {
                const isActive = tag === t;
                const href = isActive ? "/datasets" : `/datasets?tag=${t}`;
                return (
                  <Link key={t} href={href}>
                    <BadgePill label={t} variant={isActive ? "primary" : "default"} />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              Filter by Format
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS.map((f) => {
                const isActive = format === f;
                const href = isActive ? "/datasets" : `/datasets?format=${f}`;
                return (
                  <Link key={f} href={href}>
                    <BadgePill label={f} variant={isActive ? "primary" : "default"} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      }
    >
      <SectionHeader title="Dataset Marketplace" href="/datasets/new" linkText="Upload Dataset →" />

      {datasets.length === 0 ? (
        <EmptyState
          title="No datasets found"
          description={
            tag
              ? `No datasets tagged with "${tag}" yet.`
              : "Be the first to share a dataset with the community."
          }
          icon={<Database className="w-10 h-10" />}
          action={
            <Link
              href="/datasets/new"
              className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Upload Dataset
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {datasets.map((dataset: (typeof datasets)[number]) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
