import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { JobDetail } from "@/components/hire/job-detail";
import { ApplicationForm } from "@/components/hire/application-form";
import { getJobBySlug, incrementJobViews } from "@/server/actions/jobs";
import { auth } from "@/auth";
import { jobSchema, breadcrumbSchema } from "@/lib/structured-data";
import { getRelatedContent } from "@/server/actions/citations";
import { RelatedContent } from "@/components/shared/related-content";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const dynamic = "force-dynamic";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found — The Intellectual Exchange" };

  const companyName = job.company.companyName ?? job.company.username ?? "Company";
  const title = `${job.title} at ${companyName} — The Intellectual Exchange`;
  const description = job.description.replace(/<[^>]*>/g, "").slice(0, 160);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/talent-board/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `/api/og?title=${encodeURIComponent(job.title)}&subtitle=Talent Board`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;

  const job = await getJobBySlug(slug);
  if (!job) notFound();

  // Increment view count (fire and forget)
  incrementJobViews(job.id);

  const [session, relatedContent] = await Promise.all([
    auth(),
    getRelatedContent("job", job.id, job.requiredSkills ?? []),
  ]);
  const isAuthenticated = !!session?.user?.id;
  const isResearcher = session?.user?.role === "RESEARCHER";

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobSchema(job as any)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: `${process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com"}` },
              { name: "Talent Board", url: `${process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com"}/talent-board` },
              { name: job.title, url: `${process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com"}/talent-board/${slug}` },
            ])
          ),
        }}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumbs items={[
          { label: "Talent Board", href: "/talent-board" },
          { label: job.title },
        ]} />
        <JobDetail job={job} />
        <ApplicationForm
          jobId={job.id}
          isAuthenticated={isAuthenticated}
          isResearcher={isResearcher}
        />
        {relatedContent.length > 0 && <RelatedContent items={relatedContent} />}
      </div>
    </PageLayout>
  );
}
