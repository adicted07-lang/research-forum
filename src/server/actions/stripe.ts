"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe, LISTING_PRICE_AMOUNT } from "@/lib/stripe";

export async function createCheckoutSession(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) return { error: "Listing not found" };
    if (listing.authorId !== session.user.id) return { error: "Unauthorized" };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
            },
            unit_amount: LISTING_PRICE_AMOUNT,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        listingId,
        userId: session.user.id,
      },
      success_url: `${appUrl}/marketplace/${listing.slug}?success=true`,
      cancel_url: `${appUrl}/marketplace/${listing.slug}?canceled=true`,
    });

    return { url: checkoutSession.url };
  } catch {
    return { error: "Failed to create checkout session" };
  }
}

export async function cancelSubscription(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) return { error: "Listing not found" };
    if (listing.authorId !== session.user.id) return { error: "Unauthorized" };
    if (!listing.stripeSubscriptionId) return { error: "No active subscription" };

    await stripe.subscriptions.cancel(listing.stripeSubscriptionId);

    return { success: true };
  } catch {
    return { error: "Failed to cancel subscription" };
  }
}
