import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { JobDetail } from "@/components/hire/job-detail";
import { ApplicationForm } from "@/components/hire/application-form";
import { getJobBySlug, incrementJobViews } from "@/server/actions/jobs";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found — ResearchHub" };

  const companyName = job.company.companyName ?? job.company.username ?? "Company";
  return {
    title: `${job.title} at ${companyName} — ResearchHub`,
    description: job.description.slice(0, 160),
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
      <div className="space-y-6">
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
