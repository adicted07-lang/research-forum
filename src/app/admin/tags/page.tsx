import type { Metadata } from "next";
import { TagManager } from "@/components/admin/tag-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tags — Admin — The Intellectual Exchange",
};

export default async function AdminTagsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Tags</h1>
      <p className="text-muted-foreground mb-6">
        Create and manage tags used across the platform.
      </p>
      <TagManager />
    </div>
  );
}
