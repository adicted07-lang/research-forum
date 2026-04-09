import type { Metadata } from "next";
import { FeaturedContentManager } from "./featured-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Featured Content — Admin — The Intellectual Exchange",
};

export default function AdminFeaturedPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Featured Content
      </h1>
      <p className="text-muted-foreground mb-6">
        Pin and feature questions and articles on the platform.
      </p>
      <FeaturedContentManager />
    </div>
  );
}
