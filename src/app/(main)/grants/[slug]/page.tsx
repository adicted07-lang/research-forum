import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, DollarSign, ExternalLink, Users } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { BadgePill } from "@/components/shared/badge-pill";
import { getGrantBySlug } from "@/server/actions/grants";
import { getRelatedContent } from "@/server/actions/citations";
import { RelatedContent } from "@/components/shared/related-content";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const dynamic = "force-dynamic";

interface GrantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GrantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
  const grant = await getGrantBySlug(slug);
  if (!grant) return { title: "Grant Not Found — The Intellectual Exchange" };

  const description = grant.description.replace(/<[^>]*>/g, "").slice(0, 160);
  const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(grant.title)}&subtitle=Grants`;
  return {
    title: `${grant.title} — The Intellectual Exchange`,
    description,
    alternates: { canonical: `${baseUrl}/grants/${slug}` },
    openGraph: {
      title: grant.title,
      description,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: grant.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function GrantPage({ params }: GrantPageProps) {
  const { slug } = await params;
  const grant = await getGrantBySlug(slug);
  if (!grant) notFound();

  const relatedContent = await getRelatedContent("grant", grant.id, grant.tags ?? []);
  const isExpired = grant.deadline && new Date(grant.deadline) < new Date();

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumbs items={[
          { label: "Grants", href: "/grants" },
          { label: grant.title },
        ]} />
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            {grant.title}
          </h1>
          <p className="text-base text-text-secondary dark:text-text-dark-secondary mb-4">
            {grant.funder}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary dark:text-text-dark-tertiary mb-6">
            {grant.fundingRange && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                {grant.fundingRange}
              </span>
            )}
            {grant.deadline && (
              <span className={`flex items-center gap-1.5 ${isExpired ? "text-red-500" : ""}`}>
                <Calendar className="w-4 h-4" />
                {isExpired
                  ? `Deadline passed (${new Date(grant.deadline).toLocaleDateString()})`
                  : `Deadline: ${new Date(grant.deadline).toLocaleDateString()}`}
              </span>
            )}
            {grant.eligibility && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {grant.eligibility}
              </span>
            )}
          </div>

          {grant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {grant.tags.map(tag => (
                <BadgePill key={tag} label={tag} />
              ))}
            </div>
          )}

          {grant.applicationUrl && (
            <a
              href={grant.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Apply Now
            </a>
          )}
        </div>

        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Description
          </h2>
          <div className="prose prose-sm max-w-none text-text-secondary dark:text-text-dark-secondary whitespace-pre-wrap">
            {grant.description}
          </div>
        </div>

        {grant.eligibility && (
          <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
              Eligibility
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-pre-wrap">
              {grant.eligibility}
            </p>
          </div>
        )}

        {relatedContent.length > 0 && <RelatedContent items={relatedContent} />}
      </div>
    </PageLayout>
  );
}
