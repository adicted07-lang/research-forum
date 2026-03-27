import type { Metadata } from "next";
import { AdminCampaignsTable } from "@/components/admin/admin-campaigns-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advertising — Admin — ResearchHub",
};

export default async function AdminAdvertisingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Advertising</h1>
      <p className="text-muted-foreground mb-6">
        Review and approve pending advertising campaigns.
      </p>
      <AdminCampaignsTable />
    </div>
  );
}
