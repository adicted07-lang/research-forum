"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/server/actions/listings";
import { createCheckoutSession } from "@/server/actions/stripe";

const LISTING_TYPES = [
  { value: "SERVICE", label: "Service" },
  { value: "TOOL", label: "Tool" },
];

export function ListingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert comma-separated category tags to multiple entries
    const tagsRaw = formData.get("categoryTagsInput") as string;
    formData.delete("categoryTagsInput");
    if (tagsRaw) {
      const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      tags.forEach((tag) => formData.append("categoryTags", tag));
    }

    startTransition(async () => {
      const result = await createListing(formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("listingId" in result && result.listingId) {
        // Redirect to Stripe checkout
        const checkoutResult = await createCheckoutSession(result.listingId);
        if ("url" in checkoutResult && checkoutResult.url) {
          window.location.href = checkoutResult.url;
        } else if ("error" in checkoutResult && checkoutResult.error) {
          // Stripe unavailable — go to listing page anyway
          if ("slug" in result && result.slug) {
            router.push(`/marketplace/${result.slug}`);
          } else {
            router.push("/marketplace");
          }
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-border-light rounded-lg p-6 dark:bg-surface-dark dark:border-border-dark-light">
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="e.g., Professional Data Analysis Service"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Tagline <span className="text-red-500">*</span>
        </label>
        <input
          name="tagline"
          type="text"
          required
          maxLength={300}
          placeholder="One sentence describing your service or tool"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Describe what you offer, your experience, and what makes you stand out..."
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          name="type"
          required
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        >
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Category Tags
          <span className="text-text-tertiary font-normal ml-1">(comma-separated, up to 5)</span>
        </label>
        <input
          name="categoryTagsInput"
          type="text"
          placeholder="e.g., data-analysis, statistics, machine-learning"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Pricing Info
          <span className="text-text-tertiary font-normal ml-1">(optional)</span>
        </label>
        <input
          name="pricingInfo"
          type="text"
          placeholder="e.g., Starting at $50/hour, Custom quotes available"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Website URL
          <span className="text-text-tertiary font-normal ml-1">(optional)</span>
        </label>
        <input
          name="websiteUrl"
          type="url"
          placeholder="https://yourwebsite.com"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Demo URL
          <span className="text-text-tertiary font-normal ml-1">(optional)</span>
        </label>
        <input
          name="demoUrl"
          type="url"
          placeholder="https://demo.yourwebsite.com"
          className="w-full rounded-md border border-border-light px-3 py-2 text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <p className="text-xs text-text-tertiary">
        Listing requires a $29/month subscription to stay active. You&apos;ll be redirected to checkout after submitting.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating listing..." : "Create Listing & Continue to Payment"}
      </button>
    </form>
  );
}
