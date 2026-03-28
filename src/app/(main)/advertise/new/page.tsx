export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { CampaignForm } from "@/components/advertising/campaign-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Campaign — ResearchHub",
  description: "Create a new advertising campaign on ResearchHub.",
};

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/advertise/new");
  }

  return (
    <PageLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
            Create Campaign
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
            Fill in the details below and you&apos;ll be redirected to checkout to fund your campaign.
          </p>
        </div>
        <CampaignForm />
      </div>
    </PageLayout>
  );
}
