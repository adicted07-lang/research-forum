"use client";

import { useState, useTransition } from "react";
import { toggleNewsletterSubscription } from "@/server/actions/newsletter";
import { Mail } from "lucide-react";

export function NewsletterSubscribe() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubscribe() {
    startTransition(async () => {
      const result = await toggleNewsletterSubscription("weekly_digest");
      if ("subscribed" in result && result.subscribed) {
        setMessage("Subscribed to weekly digest!");
      } else if ("error" in result) {
        setMessage(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 text-center">
      <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
      <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-1">
        Stay in the loop
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
        Get a weekly digest of trending research questions, new tools, and community highlights.
      </p>
      {message ? (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">{message}</p>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={isPending}
          className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Subscribing..." : "Subscribe to Weekly Digest"}
        </button>
      )}
    </div>
  );
}
