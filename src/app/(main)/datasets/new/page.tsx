export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { DatasetForm } from "@/components/datasets/dataset-form";

export const metadata: Metadata = {
  title: "Upload a Dataset — ResearchHub",
  description: "Share your research dataset with the ResearchHub community.",
};

export default async function NewDatasetPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <SectionHeader title="Upload a Dataset" />
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          Share your research data with the community. Fill out the details below to publish your dataset.
        </p>
        <DatasetForm />
      </div>
    </PageLayout>
  );
}
