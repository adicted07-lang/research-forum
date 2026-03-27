import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ResearcherProfile } from "@/components/profile/researcher-profile";
import { getResearcherProfile } from "@/server/actions/profiles";

export const dynamic = "force-dynamic";

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getResearcherProfile(username);
  if (!profile) return { title: "User not found — ResearchHub" };
  const displayName = profile.name || profile.username || "Researcher";
  return {
    title: `${displayName} — ResearchHub`,
    description: profile.bio || `View ${displayName}'s profile on ResearchHub`,
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const profile = await getResearcherProfile(username);

  if (!profile) notFound();

  return (
    <PageLayout>
      <ResearcherProfile profile={profile} />
    </PageLayout>
  );
}
