import type { Metadata } from "next";
import { NewsletterComposer } from "./newsletter-composer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter — Admin — The Intellectual Exchange",
};

export default function AdminNewsletterPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Newsletter</h1>
      <p className="text-muted-foreground mb-6">
        Compose and send newsletters to subscribers.
      </p>
      <NewsletterComposer />
    </div>
  );
}
