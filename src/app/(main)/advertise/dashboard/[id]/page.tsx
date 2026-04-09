import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { CampaignDetail } from "@/components/advertising/campaign-detail";
import Link from "next/link";
import { getCampaignById } from "@/server/actions/campaigns";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let title = "Campaign Detail — The Intellectual Exchange";
  try {
    const campaign = await getCampaignById(id);
    if (campaign) {
      title = `${campaign.campaignName} — The Intellectual Exchange`;
    }
  } catch {
    // ignore
  }
  return { title, robots: { index: false, follow: false } };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/advertise/dashboard");
  }

  const { id } = await params;

  let campaign;
  try {
    campaign = await getCampaignById(id);
  } catch {
    campaign = null;
  }

  if (!campaign) {
    notFound();
  }

  return (
    <PageLayout>
      <div className="mb-4">
        <Link
          href="/advertise/dashboard"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary dark:text-text-dark-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
      <CampaignDetail campaign={campaign} />
    </PageLayout>
  );
}
