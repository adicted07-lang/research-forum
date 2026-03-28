import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ResearcherProfile } from "@/components/profile/researcher-profile";
import { CompanyProfile } from "@/components/profile/company-profile";
import { getResearcherProfile, getCompanyProfile } from "@/server/actions/profiles";
import { getUserActivity } from "@/server/actions/activity";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;

  // Try researcher first, then company
  try {
    const researcher = await getResearcherProfile(username);
    if (researcher) {
      const displayName = researcher.name || researcher.username || "Researcher";
      const description = researcher.bio || `View ${displayName}'s profile on ResearchHub`;
      return {
        title: `${displayName} — ResearchHub`,
        description,
        openGraph: { title: displayName, description, type: "profile" },
        twitter: { card: "summary", title: displayName, description },
      };
    }

    const company = await getCompanyProfile(username);
    if (company) {
      const displayName = company.companyName || company.username || "Company";
      const description = company.description || `View ${displayName}'s profile on ResearchHub`;
      return {
        title: `${displayName} — ResearchHub`,
        description,
        openGraph: { title: displayName, description, type: "profile" },
        twitter: { card: "summary", title: displayName, description },
      };
    }
  } catch {
    // DB error — return default
  }

  return { title: "Profile — ResearchHub" };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Try researcher first
  try {
    const researcher = await getResearcherProfile(username);
    console.log("[PROFILE] username:", username, "researcher:", !!researcher);
    if (researcher) {
      let activity: any[] = [];
      try {
        activity = await getUserActivity(researcher.id);
      } catch {
        // Activity fetch failed
      }
      return (
        <PageLayout>
          <ResearcherProfile profile={researcher} activity={activity} />
        </PageLayout>
      );
    }

    // Try company
    const company = await getCompanyProfile(username);
    if (company) {
      return (
        <PageLayout>
          <CompanyProfile profile={company} />
        </PageLayout>
      );
    }
  } catch (err) {
    console.error("[PROFILE] DB error:", err);
  }

  // If we get here, profile wasn't found or DB failed
  // Return a "not found" UI instead of notFound() to debug
  return (
    <PageLayout>
      <div className="max-w-md mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          Profile not found
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Could not find a user with username &quot;{username}&quot;. The database may be warming up — try refreshing.
        </p>
      </div>
    </PageLayout>
  );
}
