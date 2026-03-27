"use client";

import { useState, useTransition } from "react";
import { toggleNewsletterSubscription } from "@/server/actions/newsletter";

const NEWSLETTER_TYPES = [
  { type: "weekly_digest", label: "Weekly Digest", description: "Top questions, tools, and community highlights" },
  { type: "product_updates", label: "Product Updates", description: "New features and platform announcements" },
  { type: "research_highlights", label: "Research Highlights", description: "Curated research findings and insights" },
];

interface Subscription {
  type: string;
  isActive: boolean;
}

export function NewsletterSettings({ initialSubscriptions }: { initialSubscriptions: Subscription[] }) {
  const [subs, setSubs] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const s of initialSubscriptions) {
      map[s.type] = s.isActive;
    }
    return map;
  });
  const [isPending, startTransition] = useTransition();

  function handleToggle(type: string) {
    startTransition(async () => {
      const result = await toggleNewsletterSubscription(type);
      if ("subscribed" in result && result.subscribed !== undefined) {
        const subscribed = result.subscribed as boolean;
        setSubs((prev) => {
          const next: Record<string, boolean> = { ...prev };
          next[type] = subscribed;
          return next;
        });
      }
    });
  }

  return (
    <div className="space-y-3">
      {NEWSLETTER_TYPES.map((nl) => (
        <label
          key={nl.type}
          className="flex items-start gap-3 p-3 rounded-lg border border-border dark:border-border-dark hover:bg-surface dark:hover:bg-surface-dark transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            checked={subs[nl.type] ?? false}
            onChange={() => handleToggle(nl.type)}
            disabled={isPending}
            className="mt-0.5 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
              {nl.label}
            </p>
            <p className="text-xs text-text-tertiary">{nl.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
