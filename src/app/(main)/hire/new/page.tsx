export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { JobForm } from "@/components/hire/job-form";
import { SectionHeader } from "@/components/shared/section-header";

export const metadata: Metadata = {
  title: "Post a Job — T.I.E",
  description: "Post a research project and find the perfect expert on T.I.E.",
};

export default function NewJobPage() {
  return (
    <PageLayout>
      <SectionHeader title="Post a Job" />
      <JobForm />
    </PageLayout>
  );
}
