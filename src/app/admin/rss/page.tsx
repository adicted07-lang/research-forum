import type { Metadata } from "next";
import { RSSManager } from "./rss-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RSS Sources — Admin — T.I.E",
};

export default function AdminRSSPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">RSS Sources</h1>
      <p className="text-muted-foreground mb-6">
        Manage RSS feed sources for the news section.
      </p>
      <RSSManager />
    </div>
  );
}
