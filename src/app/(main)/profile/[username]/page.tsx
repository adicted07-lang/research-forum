import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ResearcherProfile } from "@/components/profile/researcher-profile";
import { CompanyProfile } from "@/components/profile/company-profile";
import { getResearcherProfile, getCompanyProfile } from "@/server/actions/profiles";
import { getUserActivity } from "@/server/actions/activity";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUserRole(username: string): Promise<string | null> {
  try {
    const user = await db.user.findFirst({
      where: { username, deletedAt: null },
      select: { role: true },
    });
    return user?.role ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const role = await getUserRole(username);

  if (role === "COMPANY") {
    const profile = await getCompanyProfile(username);
    if (!profile) return { title: "Profile not found — ResearchHub" };
    const displayName = profile.companyName || profile.username || "Company";
    const description = profile.description || `View ${displayName}'s profile on ResearchHub`;
    return {
      title: `${displayName} — ResearchHub`,
      description,
      openGraph: { title: displayName, description, type: "profile" },
      twitter: { card: "summary", title: displayName, description },
    };
  }

  const profile = await getResearcherProfile(username);
  if (!profile) return { title: "Profile not found — ResearchHub" };
  const displayName = profile.name || profile.username || "Researcher";
  const description = profile.bio || `View ${displayName}'s profile on ResearchHub`;
  return {
    title: `${displayName} — ResearchHub`,
    description,
    openGraph: { title: displayName, description, type: "profile" },
    twitter: { card: "summary", title: displayName, description },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const role = await getUserRole(username);

  if (!role) notFound();

  if (role === "COMPANY") {
    const profile = await getCompanyProfile(username);
    if (!profile) notFound();
    return (
      <PageLayout>
        <CompanyProfile profile={profile} />
      </PageLayout>
    );
  }

  const profile = await getResearcherProfile(username);
  if (!profile) notFound();
  const activity = await getUserActivity(profile.id);

  return (
    <PageLayout>
      <ResearcherProfile profile={profile} activity={activity} />
    </PageLayout>
  );
}
