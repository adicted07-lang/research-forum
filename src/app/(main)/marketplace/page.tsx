import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { MarketplaceSidebar } from "@/components/marketplace/marketplace-sidebar";
import { SectionHeader } from "@/components/shared/section-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace — T.I.E",
  description: "Discover research services and tools from the T.I.E community.",
};

interface MarketplacePageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const type = params.type;
  const category = params.category;
  const sort = params.sort ?? "trending";
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <PageLayout sidebar={<MarketplaceSidebar />}>
      <SectionHeader title="Marketplace" />
      <ListingGrid type={type} category={category} sort={sort} page={page} />
    </PageLayout>
  );
}
