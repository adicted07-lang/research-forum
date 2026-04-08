import type { Metadata } from "next";
import { AdminListingsTable } from "@/components/admin/admin-listings-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace — Admin — T.I.E",
};

interface MarketplacePageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function AdminMarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const params = await searchParams;
  const search = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Marketplace</h1>
      <p className="text-muted-foreground mb-6">
        Manage marketplace listings and services.
      </p>
      <AdminListingsTable search={search} page={page} />
    </div>
  );
}
