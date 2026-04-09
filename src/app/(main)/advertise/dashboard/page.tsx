import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { CampaignList } from "@/components/advertising/campaign-list";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ad Dashboard — T.I.E",
  description: "Manage your advertising campaigns on T.I.E.",
  robots: { index: false, follow: false },
};

export default async function AdDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/advertise/dashboard");
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            Ad Dashboard
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
            Track and manage your advertising campaigns.
          </p>
        </div>
        <Link
          href="/advertise/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>
      <CampaignList />
    </PageLayout>
  );
}
