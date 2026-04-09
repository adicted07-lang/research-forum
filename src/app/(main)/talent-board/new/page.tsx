export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { JobForm } from "@/components/hire/job-form";
import { SectionHeader } from "@/components/shared/section-header";

export const metadata: Metadata = {
  title: "Post a Job — The Intellectual Exchange",
  description: "Post a research project and find the perfect expert on The Intellectual Exchange.",
  robots: { index: false, follow: false },
};

export default function NewJobPage() {
  return (
    <PageLayout>
      <SectionHeader title="Post a Job" />
      <JobForm />
    </PageLayout>
  );
}
