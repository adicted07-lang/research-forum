import type { Metadata } from "next";
import { GrantsManager } from "./grants-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grants — Admin — T.I.E",
};

export default function AdminGrantsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Grants</h1>
      <p className="text-muted-foreground mb-6">
        Add and manage research grants and funding opportunities.
      </p>
      <GrantsManager />
    </div>
  );
}
