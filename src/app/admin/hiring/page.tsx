import type { Metadata } from "next";
import { AdminJobsTable } from "@/components/admin/admin-jobs-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hiring — Admin — ResearchHub",
};

interface HiringPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function AdminHiringPage({
  searchParams,
}: HiringPageProps) {
  const params = await searchParams;
  const search = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Hiring</h1>
      <p className="text-muted-foreground mb-6">
        Manage job postings and hiring activity.
      </p>
      <AdminJobsTable search={search} page={page} />
    </div>
  );
}
