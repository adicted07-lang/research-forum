import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ResearcherProfile } from "@/components/profile/researcher-profile";
import { getResearcherProfile } from "@/server/actions/profiles";
import { getUserActivity } from "@/server/actions/activity";

export const dynamic = "force-dynamic";

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getResearcherProfile(username);
  if (!profile) return { title: "User not found — T.I.E" };
  const displayName = profile.name || profile.username || "Researcher";
  const description = profile.bio || `View ${displayName}'s profile on T.I.E`;
  return {
    title: `${displayName} — T.I.E`,
    description,
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

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const profile = await getResearcherProfile(username);

  if (!profile) notFound();

  const activity = await getUserActivity(profile.id);

  return (
    <PageLayout>
      <ResearcherProfile profile={profile} activity={activity} />
    </PageLayout>
  );
}
