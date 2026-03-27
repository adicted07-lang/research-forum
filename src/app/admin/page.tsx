import type { Metadata } from "next";
import { getAnalytics } from "@/server/actions/admin";
import { StatsCard } from "@/components/admin/stats-card";
import {
  Users,
  MessageSquare,
  MessageCircle,
  ShoppingBag,
  Briefcase,
  Newspaper,
  Megaphone,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Admin — ResearchHub",
};

export default async function AdminDashboardPage() {
  const analytics = await getAnalytics();

  if ("error" in analytics) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
        <p className="text-muted-foreground">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Overview of ResearchHub platform activity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard
          icon={<Users className="size-5" />}
          label="Total Users"
          value={analytics.totalUsers}
        />
        <StatsCard
          icon={<TrendingUp className="size-5" />}
          label="New This Month"
          value={analytics.newUsersThisMonth}
        />
        <StatsCard
          icon={<MessageSquare className="size-5" />}
          label="Questions"
          value={analytics.totalQuestions}
        />
        <StatsCard
          icon={<MessageCircle className="size-5" />}
          label="Answers"
          value={analytics.totalAnswers}
        />
        <StatsCard
          icon={<ShoppingBag className="size-5" />}
          label="Listings"
          value={`${analytics.activeListings} / ${analytics.totalListings}`}
        />
        <StatsCard
          icon={<Briefcase className="size-5" />}
          label="Jobs"
          value={`${analytics.openJobs} open / ${analytics.totalJobs}`}
        />
        <StatsCard
          icon={<Newspaper className="size-5" />}
          label="Articles"
          value={`${analytics.publishedArticles} / ${analytics.totalArticles}`}
        />
        <StatsCard
          icon={<Megaphone className="size-5" />}
          label="Campaigns"
          value={`${analytics.activeCampaigns} active / ${analytics.totalCampaigns}`}
        />
        <StatsCard
          icon={<DollarSign className="size-5" />}
          label="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
        />
      </div>
    </div>
  );
}
