export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Megaphone, LayoutDashboard, Star, TrendingUp, DollarSign, Users } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Advertise — T.I.E",
  description:
    "Reach thousands of research professionals with targeted ads on T.I.E.",
  alternates: { canonical: `${baseUrl}/advertise` },
};

const AD_TYPES = [
  {
    icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
    title: "Feed Ads",
    description:
      "Appear in-line within forum question lists and news feeds. Native format that blends with content and reaches engaged researchers actively browsing topics.",
    pricing: "From $2.00 CPM or $0.50 CPC",
  },
  {
    icon: <Megaphone className="w-6 h-6 text-primary" />,
    title: "Banner Ads",
    description:
      "Prominent placement in the sidebar across all pages. High-visibility format for brand awareness and product launches targeting the entire T.I.E audience.",
    pricing: "From $5.00 CPM or $1.00 CPC",
  },
  {
    icon: <Star className="w-6 h-6 text-primary" />,
    title: "Featured Listings",
    description:
      "Pin your marketplace listing or job posting to the top of relevant category pages. Ideal for services, tools, and research opportunities that need maximum exposure.",
    pricing: "From $10.00 CPM or $2.00 CPC",
  },
];

const BENEFITS = [
  {
    icon: <Users className="w-5 h-5 text-primary" />,
    title: "12,000+ Active Researchers",
    description: "Reach verified researchers, scientists, and academics across all disciplines.",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
    title: "High Engagement",
    description: "Our audience actively reads and shares research content, resulting in strong click-through rates.",
  },
  {
    icon: <DollarSign className="w-5 h-5 text-primary" />,
    title: "Pre-paid, No Surprises",
    description: "Set your budget upfront. No hidden fees or billing surprises. Pause anytime.",
  },
];

export default function AdvertisePage() {
  return (
    <PageLayout>
      {/* Hero */}
      <div className="text-center py-14 mb-10 border-b border-border-light dark:border-border-dark-light">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-5">
          <Megaphone className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-text-dark-primary mb-4 tracking-tight">
          Reach Research Professionals
        </h1>
        <p className="text-lg text-text-secondary dark:text-text-dark-secondary mb-8 max-w-xl mx-auto">
          Advertise your research tools, services, and opportunities to a highly engaged
          community of scientists, academics, and research-driven companies.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/advertise/new"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Campaign
          </Link>
          <Link
            href="/advertise/contact"
            className="px-6 py-3 border border-border-light text-text-primary font-semibold rounded-md hover:border-primary hover:text-primary transition-colors dark:border-border-dark-light dark:text-text-dark-primary"
          >
            Contact for Managed Advertising
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light"
            >
              <div className="flex items-center gap-2 mb-2">
                {b.icon}
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                  {b.title}
                </h3>
              </div>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ad types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-6 text-center">
          Ad Formats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {AD_TYPES.map((type) => (
            <div
              key={type.title}
              className="bg-white border border-border-light rounded-xl p-6 flex flex-col dark:bg-surface-dark dark:border-border-dark-light"
            >
              <div className="mb-4">{type.icon}</div>
              <h3 className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-2">
                {type.title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4 flex-1">
                {type.description}
              </p>
              <p className="text-xs font-semibold text-primary">{type.pricing}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing model */}
      <section className="mb-12">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center dark:bg-primary/10">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-3">
            Transparent Pricing
          </h2>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-6 max-w-lg mx-auto">
            Choose CPM (pay per 1,000 impressions) or CPC (pay per click). Set your total
            or daily budget, and we'll never charge more than you specify.
            Minimum budget is $10.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
            <div>
              <span className="block text-2xl font-bold text-primary mb-1">CPM</span>
              <span className="text-text-secondary dark:text-text-dark-secondary">
                Pay per 1,000 impressions
              </span>
            </div>
            <div className="text-2xl text-text-tertiary dark:text-text-dark-tertiary">
              or
            </div>
            <div>
              <span className="block text-2xl font-bold text-primary mb-1">CPC</span>
              <span className="text-text-secondary dark:text-text-dark-secondary">
                Pay per click
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mb-8">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-3">
          Ready to grow your audience?
        </h2>
        <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
          Create your first campaign in minutes. No long-term commitment required.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/advertise/new"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Campaign
          </Link>
          <Link
            href="/advertise/contact"
            className="text-sm text-text-secondary hover:text-primary dark:text-text-dark-secondary transition-colors"
          >
            Contact for managed advertising →
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
