export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { OfficeHourForm } from "@/components/office-hours/office-hour-form";

export const metadata: Metadata = {
  title: "Schedule Office Hours — ResearchHub",
  description: "Host a live Q&A session and answer questions from the research community.",
};

export default async function NewOfficeHourPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <SectionHeader title="Schedule Office Hours" />
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          Host a live Q&amp;A session where community members can ask you questions about your research.
        </p>
        <OfficeHourForm />
      </div>
    </PageLayout>
  );
}
