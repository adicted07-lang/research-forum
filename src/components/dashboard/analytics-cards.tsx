import { MessageSquare, HelpCircle, FileText, ThumbsUp, Star, Trophy, Flame, Target } from "lucide-react";

interface AnalyticsData {
  totalQuestions: number;
  totalAnswers: number;
  totalArticles: number;
  totalUpvotesReceived: number;
  totalPoints: number;
  acceptanceRate: number;
  currentStreak: number;
  longestStreak: number;
}

const stats = [
  { key: "totalPoints", label: "Points", icon: Star, color: "text-yellow-500" },
  { key: "totalUpvotesReceived", label: "Upvotes Received", icon: ThumbsUp, color: "text-green-500" },
  { key: "totalQuestions", label: "Questions Asked", icon: HelpCircle, color: "text-blue-500" },
  { key: "totalAnswers", label: "Answers Given", icon: MessageSquare, color: "text-purple-500" },
  { key: "totalArticles", label: "Articles Published", icon: FileText, color: "text-orange-500" },
  { key: "acceptanceRate", label: "Acceptance Rate", icon: Target, color: "text-teal-500", suffix: "%" },
  { key: "currentStreak", label: "Current Streak", icon: Flame, color: "text-red-500", suffix: "d" },
  { key: "longestStreak", label: "Longest Streak", icon: Trophy, color: "text-amber-500", suffix: "d" },
] as const;

export function AnalyticsCards({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = data[stat.key as keyof AnalyticsData];
        const suffix = "suffix" in stat ? stat.suffix : "";
        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-text-tertiary">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-text-primary dark:text-text-dark-primary">
              {typeof value === "number" ? value.toLocaleString() : value}{suffix}
            </p>
          </div>
        );
      })}
    </div>
  );
}
