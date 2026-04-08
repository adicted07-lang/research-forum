import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ListingDetail } from "@/components/marketplace/listing-detail";
import { ReviewSection } from "@/components/marketplace/review-section";
import { ReviewForm } from "@/components/marketplace/review-form";
import { getListingBySlug, getListings } from "@/server/actions/listings";
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
      return { title: "Listing Not Found — T.I.E" };
    }
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
    const description = listing.tagline ?? undefined;
    return {
      title: `${listing.title} — T.I.E Marketplace`,
      description,
      alternates: {
        canonical: `${baseUrl}/marketplace/${slug}`,
      },
      openGraph: {
        title: listing.title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: listing.title,
        description,
      },
    };
  } catch {
    return { title: "Marketplace — T.I.E" };
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

  // Fetch related listings
  let relatedListings: any[] = [];
  try {
    const allListings = await getListings({ limit: 4 });
    relatedListings = allListings
      .filter((l: any) => l.id !== listing.id)
      .slice(0, 3);
  } catch {}

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <ListingDetail listing={listing} relatedListings={relatedListings} />
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
