import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { MarketplaceSidebar } from "@/components/marketplace/marketplace-sidebar";
import { SectionHeader } from "@/components/shared/section-header";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Marketplace — T.I.E",
  description: "Discover research services and tools from the T.I.E community.",
  alternates: { canonical: `${baseUrl}/marketplace` },
  openGraph: {
    title: "Marketplace — T.I.E",
    description: "Discover research services and tools from the T.I.E community.",
    siteName: "The Intellectual Exchange",
    images: [{ url: `${baseUrl}/api/og?title=Marketplace&subtitle=T.I.E`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace — T.I.E",
    description: "Discover research services and tools from the T.I.E community.",
    images: [`${baseUrl}/api/og?title=Marketplace&subtitle=T.I.E`],
  },
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
