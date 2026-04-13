import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ListingDetail } from "@/components/marketplace/listing-detail";
import { ReviewSection } from "@/components/marketplace/review-section";
import { ReviewForm } from "@/components/marketplace/review-form";
import { getListingBySlug, getListings } from "@/server/actions/listings";
import { auth } from "@/auth";
import { getRelatedContent } from "@/server/actions/citations";
import { RelatedContent } from "@/components/shared/related-content";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const dynamic = "force-dynamic";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const listing = await getListingBySlug(slug);
    if (!listing) {
      return { title: "Listing Not Found — The Intellectual Exchange" };
    }
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
    const description = listing.tagline ?? undefined;
    return {
      title: `${listing.title} — The Intellectual Exchange`,
      description,
      alternates: {
        canonical: `${baseUrl}/marketplace/${slug}`,
      },
      openGraph: {
        title: listing.title,
        description,
        type: "website",
        images: [{ url: `${baseUrl}/api/og?title=${encodeURIComponent(listing.title)}&subtitle=Marketplace`, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: listing.title,
        description,
        images: [`${baseUrl}/api/og?title=${encodeURIComponent(listing.title)}&subtitle=Marketplace`],
      },
    };
  } catch {
    return { title: "Marketplace — The Intellectual Exchange" };
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

  // Fetch related listings and cross-content
  let relatedListings: any[] = [];
  let relatedContent: { type: "question" | "article"; title: string; url: string }[] = [];
  try {
    const [allListings, related] = await Promise.all([
      getListings({ limit: 4 }),
      getRelatedContent("listing", listing.id, listing.categoryTags ?? []),
    ]);
    relatedListings = allListings
      .filter((l: any) => l.id !== listing.id)
      .slice(0, 3);
    relatedContent = related;
  } catch {}

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumbs items={[
          { label: "Marketplace", href: "/marketplace" },
          { label: listing.title },
        ]} />
        <ListingDetail listing={listing} relatedListings={relatedListings} />
        <ReviewSection targetType="LISTING" targetId={listing.id} />
        <ReviewForm
          targetType="LISTING"
          targetId={listing.id}
          isLoggedIn={isLoggedIn}
        />
        {relatedContent.length > 0 && <RelatedContent items={relatedContent} />}
      </div>
    </PageLayout>
  );
}
