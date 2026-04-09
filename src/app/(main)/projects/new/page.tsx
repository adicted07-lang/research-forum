export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = {
  title: "New Project — T.I.E",
  description: "Create a new research project workspace for your team.",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <SectionHeader title="Create a Project" />
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          Set up a shared workspace where you and your team can collaborate on research.
        </p>
        <ProjectForm />
      </div>
    </PageLayout>
  );
}
