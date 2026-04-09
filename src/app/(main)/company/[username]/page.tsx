import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { CompanyProfile } from "@/components/profile/company-profile";
import { getCompanyProfile } from "@/server/actions/profiles";

export const dynamic = "force-dynamic";

interface CompanyProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getCompanyProfile(username);
  if (!profile) return { title: "Company not found — The Intellectual Exchange", robots: { index: false, follow: false } };
  const displayName = profile.companyName || profile.username || "Company";
  const description = profile.description || `View ${displayName}'s profile on The Intellectual Exchange`;
  return {
    title: `${displayName} — The Intellectual Exchange`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: displayName,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: displayName,
      description,
    },
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { username } = await params;
  const profile = await getCompanyProfile(username);

  if (!profile) notFound();

  return (
    <PageLayout>
      <CompanyProfile profile={profile} />
    </PageLayout>
  );
}
