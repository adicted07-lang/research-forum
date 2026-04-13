"use client";

import { useEffect, useState } from "react";
import { Share2, Copy, Check, Users, Gift } from "lucide-react";
import { getOrCreateReferralCode, getReferralStats } from "@/server/actions/referrals";

interface ReferralEntry {
  name: string | null;
  joinedAt: Date;
  points: number;
}

export function ReferralCard() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{
    count: number;
    totalPoints: number;
    referrals: ReferralEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [codeResult, statsResult] = await Promise.all([
          getOrCreateReferralCode(),
          getReferralStats(),
        ]);

        if ("code" in codeResult && codeResult.code) {
          setCode(codeResult.code);
        }

        if ("count" in statsResult && statsResult.count !== undefined) {
          setStats({
            count: statsResult.count as number,
            totalPoints: (statsResult.totalPoints as number) ?? 0,
            referrals: (statsResult.referrals as ReferralEntry[]) ?? [],
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const referralLink = code
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${code}`
    : "";

  async function handleCopy() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="bg-white border border-border-light rounded-xl p-6 dark:bg-surface-dark dark:border-border-dark-light animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-light rounded-xl p-6 dark:bg-surface-dark dark:border-border-dark-light">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
          Refer a Friend
        </h2>
      </div>

      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
        Share your referral link and earn <strong>50 points</strong> for every person who joins.
      </p>

      {/* Referral link */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark-light rounded-md px-3 py-2 text-text-primary dark:text-text-dark-primary truncate"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy link
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <Users className="h-5 w-5 text-text-secondary dark:text-text-dark-secondary" />
          <div>
            <p className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              {stats?.count ?? 0}
            </p>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
              Referrals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <Gift className="h-5 w-5 text-text-secondary dark:text-text-dark-secondary" />
          <div>
            <p className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              {stats?.totalPoints ?? 0}
            </p>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
              Points earned
            </p>
          </div>
        </div>
      </div>

      {/* Recent referrals */}
      {stats && stats.referrals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Recent Referrals
          </h3>
          <ul className="space-y-2">
            {stats.referrals.slice(0, 5).map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm py-1.5 border-b border-border-light dark:border-border-dark-light last:border-0"
              >
                <span className="text-text-primary dark:text-text-dark-primary">
                  {r.name || "Anonymous"}
                </span>
                <span className="text-text-secondary dark:text-text-dark-secondary text-xs">
                  +{r.points} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
