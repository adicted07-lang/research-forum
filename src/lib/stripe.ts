import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  typescript: true,
});
export const LISTING_PRICE_AMOUNT = 1000; // $10.00 in cents
