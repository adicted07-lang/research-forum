"use client";

import { useState, useTransition } from "react";
import { toggleNewsletterSubscription } from "@/server/actions/newsletter";
import { Mail, ArrowRight } from "lucide-react";

export function InlineNewsletterCta() {
  const [isPending, startTransition] = useTransition();
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe() {
    startTransition(async () => {
      const result = await toggleNewsletterSubscription("weekly_digest");
      if ("subscribed" in result && result.subscribed) {
        setSubscribed(true);
      }
    });
  }

  if (subscribed) {
    return (
      <div className="my-8 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-5 text-center">
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          You&apos;re subscribed! Check your inbox for the next weekly digest.
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-1">
            Enjoying this article?
          </p>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">
            Get weekly research insights, trending questions, and community highlights delivered to your inbox.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Subscribing..." : "Subscribe to Weekly Digest"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
