"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyCampaigns } from "@/server/actions/campaigns";
import { CampaignCard } from "@/components/advertising/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone } from "lucide-react";

type Campaign = Awaited<ReturnType<typeof getMyCampaigns>>[number];

type FilterTab = "All" | "Active" | "Paused" | "Draft" | "Completed";

const FILTER_TABS: FilterTab[] = ["All", "Active", "Paused", "Draft", "Completed"];

const STATUS_MAP: Record<FilterTab, string[]> = {
  All: [],
  Active: ["ACTIVE"],
  Paused: ["PAUSED"],
  Draft: ["DRAFT", "PENDING_APPROVAL"],
  Completed: ["COMPLETED"],
};

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  useEffect(() => {
    getMyCampaigns().then((data) => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

  const filtered =
    activeTab === "All"
      ? campaigns
      : campaigns.filter((c) => STATUS_MAP[activeTab].includes(c.status));

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-border-light rounded-lg p-5 animate-pulse h-32 dark:bg-surface-dark dark:border-border-dark-light"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap mb-5 border-b border-border-light dark:border-border-dark-light pb-3">
        {FILTER_TABS.map((tab) => {
          const count =
            tab === "All"
              ? campaigns.length
              : campaigns.filter((c) => STATUS_MAP[tab].includes(c.status))
                  .length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface dark:text-text-dark-secondary dark:hover:bg-surface-dark"
              }`}
            >
              {tab}
              {count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Campaign list */}
      {filtered.length === 0 ? (
        <EmptyState
          title={
            activeTab === "All" ? "No campaigns yet" : `No ${activeTab.toLowerCase()} campaigns`
          }
          description={
            activeTab === "All"
              ? "Create your first ad campaign to start reaching research professionals."
              : `You don't have any ${activeTab.toLowerCase()} campaigns right now.`
          }
          icon={<Megaphone className="w-12 h-12" />}
          action={
            activeTab === "All" ? (
              <Link
                href="/advertise/new"
                className="inline-flex px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Campaign
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
