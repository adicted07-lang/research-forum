import type { Metadata } from "next";
import { AnnouncementsManager } from "./announcements-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Announcements — Admin — ResearchHub",
};

export default function AdminAnnouncementsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Announcements
      </h1>
      <p className="text-muted-foreground mb-6">
        Create and manage site-wide announcement banners.
      </p>
      <AnnouncementsManager />
    </div>
  );
}
