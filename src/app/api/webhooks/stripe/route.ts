import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const listingId = session.metadata?.listingId;
        const subscriptionId = session.subscription as string;
        if (listingId && subscriptionId) {
          await db.listing.update({
            where: { id: listingId },
            data: { stripeSubscriptionId: subscriptionId, isActive: true },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await db.listing.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { isActive: false },
        });
        break;
      }
      case "invoice.payment_failed": {
        // Could notify user — for now just log
        break;
      }
    }
  } catch {
    // DB error — still return 200 to acknowledge webhook
  }

  return NextResponse.json({ received: true });
}
