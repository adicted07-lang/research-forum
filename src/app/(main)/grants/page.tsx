import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { getGrants } from "@/server/actions/grants";
import { GrantCard } from "@/components/grants/grant-card";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Grants — ResearchHub",
  description: "Find open research grants and funding opportunities.",
};

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tag = params.tag;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const { grants } = await getGrants({ tag, page });

  return (
    <PageLayout>
      <SectionHeader title="Research Grants & Funding" />
      {grants.length === 0 ? (
        <EmptyState
          title="No grants listed yet"
          description="Check back soon for open funding opportunities."
        />
      ) : (
        <div className="space-y-3">
          {grants.map((grant: any) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
