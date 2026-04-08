import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { ResearcherGrid } from "@/components/hire/researcher-grid";
import { SectionHeader } from "@/components/shared/section-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Researchers — T.I.E",
  description: "Find expert researchers available for hire on T.I.E.",
};

interface ResearchersPageProps {
  searchParams: Promise<{
    expertise?: string;
    availability?: string;
    rateMin?: string;
    rateMax?: string;
  }>;
}

export default async function ResearchersPage({ searchParams }: ResearchersPageProps) {
  const params = await searchParams;
  const expertise = params.expertise;
  const availability = params.availability;
  const rateMin = params.rateMin ? parseInt(params.rateMin, 10) : undefined;
  const rateMax = params.rateMax ? parseInt(params.rateMax, 10) : undefined;

  return (
    <PageLayout>
      <SectionHeader title="Browse Researchers" />
      <ResearcherGrid
        expertise={expertise}
        availability={availability}
        rateMin={rateMin}
        rateMax={rateMax}
      />
    </PageLayout>
  );
}
