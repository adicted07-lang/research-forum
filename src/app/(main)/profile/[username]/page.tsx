import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ResearcherProfile } from "@/components/profile/researcher-profile";
import { CompanyProfile } from "@/components/profile/company-profile";
import { getResearcherProfile, getCompanyProfile } from "@/server/actions/profiles";
import { getUserActivity } from "@/server/actions/activity";
import { personSchema, organizationProfileSchema } from "@/lib/structured-data";
import { getEndorsements, getMyEndorsementsForUser } from "@/server/actions/endorsements";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

  // Try researcher first, then company
  try {
    const researcher = await getResearcherProfile(username);
    if (researcher) {
      const displayName = researcher.name || researcher.username || "Researcher";
      const description = researcher.bio || `View ${displayName}'s profile on The Intellectual Exchange`;
      return {
        title: `${displayName} — The Intellectual Exchange`,
        description,
        alternates: {
          canonical: `${baseUrl}/profile/${username}`,
        },
        openGraph: {
          title: displayName,
          description,
          type: "profile",
          images: [{ url: `${baseUrl}/api/og?title=${encodeURIComponent(displayName)}&subtitle=Researcher Profile`, width: 1200, height: 630 }],
        },
        twitter: { card: "summary_large_image", title: displayName, description, images: [`${baseUrl}/api/og?title=${encodeURIComponent(displayName)}&subtitle=Researcher Profile`] },
      };
    }

    const company = await getCompanyProfile(username);
    if (company) {
      const displayName = company.companyName || company.username || "Company";
      const description = company.description || `View ${displayName}'s profile on The Intellectual Exchange`;
      return {
        title: `${displayName} — The Intellectual Exchange`,
        description,
        alternates: {
          canonical: `${baseUrl}/profile/${username}`,
        },
        openGraph: {
          title: displayName,
          description,
          type: "profile",
          images: [{ url: `${baseUrl}/api/og?title=${encodeURIComponent(displayName)}&subtitle=Company Profile`, width: 1200, height: 630 }],
        },
        twitter: { card: "summary_large_image", title: displayName, description, images: [`${baseUrl}/api/og?title=${encodeURIComponent(displayName)}&subtitle=Company Profile`] },
      };
    }
  } catch {
    // DB error — return default
  }

  return { title: "Profile — The Intellectual Exchange" };
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
      const [endorsements, myEndorsements] = await Promise.all([
        getEndorsements(researcher.id),
        getMyEndorsementsForUser(researcher.id),
      ]);
      return (
        <PageLayout>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(personSchema(researcher as any)),
            }}
          />
          <ResearcherProfile profile={researcher} activity={activity} endorsements={endorsements} myEndorsements={myEndorsements} />
        </PageLayout>
      );
    }

    // Try company
    const company = await getCompanyProfile(username);
    if (company) {
      return (
        <PageLayout>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationProfileSchema(company as any)),
            }}
          />
          <CompanyProfile profile={company} />
        </PageLayout>
      );
    }
  } catch (err) {
    console.error("[PROFILE] DB error:", err);
  }

  // Profile not found or DB failed — return proper 404
  notFound();
}
