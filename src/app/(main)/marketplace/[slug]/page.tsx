import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ListingDetail } from "@/components/marketplace/listing-detail";
import { ReviewSection } from "@/components/marketplace/review-section";
import { ReviewForm } from "@/components/marketplace/review-form";
import { getListingBySlug } from "@/server/actions/listings";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const listing = await getListingBySlug(slug);
    if (!listing) {
      return { title: "Listing Not Found — ResearchHub" };
    }
    return {
      title: `${listing.title} — ResearchHub Marketplace`,
      description: listing.tagline,
    };
  } catch {
    return { title: "Marketplace — ResearchHub" };
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;

  let listing: Awaited<ReturnType<typeof getListingBySlug>> = null;
  try {
    listing = await getListingBySlug(slug);
  } catch {
    notFound();
  }

  if (!listing) {
    notFound();
  }

  let isLoggedIn = false;
  try {
    const session = await auth();
    isLoggedIn = !!session?.user?.id;
  } catch {
    // unauthenticated
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <ListingDetail listing={listing} />
        <ReviewSection targetType="LISTING" targetId={listing.id} />
        <ReviewForm
          targetType="LISTING"
          targetId={listing.id}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </PageLayout>
  );
}
