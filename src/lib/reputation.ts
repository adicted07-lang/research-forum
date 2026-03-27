export interface ReputationTier {
  name: string;
  minPoints: number;
  color: string;
  bgColor: string;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { name: "Newcomer", minPoints: 0, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
  { name: "Contributor", minPoints: 50, color: "text-green-700", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { name: "Active Researcher", minPoints: 200, color: "text-blue-700", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { name: "Expert", minPoints: 500, color: "text-purple-700", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  { name: "Authority", minPoints: 1000, color: "text-orange-700", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  { name: "Legend", minPoints: 5000, color: "text-yellow-700", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
];

export function getReputationTier(points: number): ReputationTier {
  for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
    if (points >= REPUTATION_TIERS[i].minPoints) return REPUTATION_TIERS[i];
  }
  return REPUTATION_TIERS[0];
}
