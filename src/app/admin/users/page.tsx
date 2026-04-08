import type { Metadata } from "next";
import { UserTable } from "@/components/admin/user-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users — Admin — T.I.E",
};

interface UsersPageProps {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const search = params.search;
  const role = params.role;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Users</h1>
      <p className="text-muted-foreground mb-6">
        Manage user accounts, roles, and access.
      </p>
      <UserTable search={search} role={role} page={page} />
    </div>
  );
}
