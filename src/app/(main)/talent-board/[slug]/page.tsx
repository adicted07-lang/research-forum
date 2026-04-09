import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { JobDetail } from "@/components/hire/job-detail";
import { ApplicationForm } from "@/components/hire/application-form";
import { getJobBySlug, incrementJobViews } from "@/server/actions/jobs";
import { auth } from "@/auth";
import { jobSchema, breadcrumbSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found — T.I.E" };

  const companyName = job.company.companyName ?? job.company.username ?? "Company";
  const title = `${job.title} at ${companyName} — T.I.E`;
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

  const session = await auth();
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
        <JobDetail job={job} />
        <ApplicationForm
          jobId={job.id}
          isAuthenticated={isAuthenticated}
          isResearcher={isResearcher}
        />
      </div>
    </PageLayout>
  );
}
