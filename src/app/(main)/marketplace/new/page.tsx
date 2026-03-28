export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { ListingForm } from "@/components/marketplace/listing-form";
import { SectionHeader } from "@/components/shared/section-header";

export const metadata: Metadata = {
  title: "List Your Service — ResearchHub",
  description: "Add your research service or tool to the ResearchHub marketplace.",
};

export default function NewListingPage() {
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <SectionHeader title="List Your Service or Tool" />
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          Fill out the details below. Your listing will go live after completing the subscription checkout.
        </p>
        <ListingForm />
      </div>
    </PageLayout>
  );
}
