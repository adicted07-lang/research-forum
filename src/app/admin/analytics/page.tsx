import type { Metadata } from "next";
import { getSiteAnalytics } from "@/server/actions/admin-analytics";
import { StatsCard } from "@/components/admin/stats-card";
import {
  Users,
  UserPlus,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  BarChart2,
  Newspaper,
  ShoppingBag,
  Briefcase,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Analytics — Admin — ResearchHub",
};

export default async function AdminAnalyticsPage() {
  const analytics = await getSiteAnalytics();

  if (!analytics) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Site Analytics
        </h1>
        <p className="text-muted-foreground">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Site Analytics
      </h1>
      <p className="text-muted-foreground mb-8">
        Detailed platform metrics and growth trends.
      </p>

      {/* Users */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Users
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          icon={<Users className="size-5" />}
          label="Total Users"
          value={analytics.totalUsers}
        />
        <StatsCard
          icon={<UserPlus className="size-5" />}
          label="New This Week"
          value={analytics.newUsersWeek}
        />
        <StatsCard
          icon={<TrendingUp className="size-5" />}
          label="New This Month"
          value={analytics.newUsersMonth}
        />
      </div>

      {/* Content */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Content
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          icon={<MessageSquare className="size-5" />}
          label="Total Questions"
          value={analytics.totalQuestions}
        />
        <StatsCard
          icon={<MessageSquare className="size-5" />}
          label="Questions This Week"
          value={analytics.questionsWeek}
        />
        <StatsCard
          icon={<MessageCircle className="size-5" />}
          label="Total Answers"
          value={analytics.totalAnswers}
        />
        <StatsCard
          icon={<MessageCircle className="size-5" />}
          label="Answers This Week"
          value={analytics.answersWeek}
        />
        <StatsCard
          icon={<BarChart2 className="size-5" />}
          label="Answer Rate"
          value={`${analytics.answerRate}%`}
        />
        <StatsCard
          icon={<Newspaper className="size-5" />}
          label="Published Articles"
          value={analytics.totalArticles}
        />
      </div>

      {/* Marketplace */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Marketplace
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          icon={<ShoppingBag className="size-5" />}
          label="Active Listings"
          value={analytics.totalListings}
        />
        <StatsCard
          icon={<Briefcase className="size-5" />}
          label="Open Jobs"
          value={analytics.totalJobs}
        />
      </div>
    </div>
  );
}
