import { Brain, Globe, Dna, Activity, BarChart3, Network, HeartPulse, Atom, MessageSquare, Database, type LucideIcon } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { HomepageSidebar } from "@/components/home/homepage-sidebar";
import { FeedList } from "@/components/feed/feed-list";
import { SignupBanner } from "@/components/feed/signup-banner";
import { getFeedItems } from "@/lib/feed";
import { auth } from "@/auth";

const POPULAR_TAGS = [
  "machine-learning", "climate-science", "genomics", "neuroscience", "statistics",
  "deep-learning", "epidemiology", "quantum-computing", "nlp", "bioinformatics",
];

const TAG_ICONS: Record<string, LucideIcon> = {
  "machine-learning": Brain,
  "climate-science": Globe,
  "genomics": Dna,
  "neuroscience": Activity,
  "statistics": BarChart3,
  "deep-learning": Network,
  "epidemiology": HeartPulse,
  "quantum-computing": Atom,
  "nlp": MessageSquare,
  "bioinformatics": Database,
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const { items, hasMore } = await getFeedItems(1, session?.user?.id);

  return (
    <PageLayout
      sidebar={
        <HomepageSidebar
          tags={POPULAR_TAGS.map((tag) => ({ tag, icon: TAG_ICONS[tag] }))}
        />
      }
    >
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
          Your Feed
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          Latest from the research community
        </p>

        {!session?.user && <SignupBanner />}

        <FeedList initialItems={items} initialHasMore={hasMore} />
      </div>
    </PageLayout>
  );
}
