import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { QuestionCard } from "@/components/forum/question-card";
import { LeaderboardCard } from "@/components/social/leaderboard-card";
import { BadgePill } from "@/components/shared/badge-pill";
import { ListingCard } from "@/components/marketplace/listing-card";
import { JobCard } from "@/components/hire/job-card";
import { getQuestions } from "@/server/actions/questions";
import { getListings } from "@/server/actions/listings";
import { getJobs } from "@/server/actions/jobs";
import { getArticles } from "@/server/actions/articles";
import { getFollowedTags } from "@/server/actions/tag-follows";
import { TagFollowButton } from "@/components/forum/tag-follow-button";
import { ArticleCard } from "@/components/news/article-card";
import { MessageSquare, ShoppingBag, Users, Newspaper } from "lucide-react";
import { AnimatedTooltipGroup, type TooltipItem } from "@/components/ui/animated-tooltip";
import { getActiveBannerAd } from "@/server/actions/campaigns";
import { AdBanner } from "@/components/advertising/ad-banner";
import { NewsletterSubscribe } from "@/components/newsletter/newsletter-subscribe";
import { auth } from "@/auth";
import { updateStreak } from "@/server/actions/streaks";

const sampleResearchers: TooltipItem[] = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    designation: "ML Researcher",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Prof. James Okafor",
    designation: "Climate Scientist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Emily Torres",
    designation: "Neuroscientist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Dr. Marcus Webb",
    designation: "Bioinformatician",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Dr. Priya Sharma",
    designation: "Genomics Expert",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 6,
    name: "Dr. Alex Kim",
    designation: "Quantum Computing",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
  },
];

const POPULAR_TAGS = [
  "machine-learning",
  "climate-science",
  "genomics",
  "neuroscience",
  "statistics",
  "deep-learning",
  "epidemiology",
  "quantum-computing",
  "nlp",
  "bioinformatics",
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try { return await HomePageContent(); } catch (e: any) {
    return (
      <div style={{padding:"40px",textAlign:"center",fontFamily:"system-ui"}}>
        <h1 style={{fontSize:"24px",marginBottom:"8px"}}>Something went wrong</h1>
        <p style={{color:"#666"}}>{String(e?.message || e).slice(0, 200)}</p>
        <p style={{color:"#999",fontSize:"12px",marginTop:"8px"}}>{e?.stack?.slice(0, 300)}</p>
      </div>
    );
  }
}

async function HomePageContent() {
  let session: any = null;
  try {
    session = await auth();
    if (session?.user?.id) {
      updateStreak(session.user.id);
    }
  } catch {
    // Auth/DB not available
  }

  // Fetch data sequentially (Neon HTTP adapter doesn't support concurrent queries well)
  let followedTags: string[] = [];
  let questions: any[] = [];
  let listings: any[] = [];
  let jobs: any[] = [];
  let articles: any[] = [];
  let bannerAd: any = null;

  try { followedTags = session?.user?.id ? await getFollowedTags() : []; } catch {}
  try { questions = (await getQuestions({ sort: "trending", limit: 4 })).questions; } catch (e: any) { console.error("[HOME] questions error:", e?.message?.slice(0, 100)); }
  try { listings = await getListings({ sort: "trending", limit: 4 }); } catch {}
  try { jobs = await getJobs({ sort: "newest", limit: 3 }); } catch {}
  try { articles = (await getArticles({ sort: "latest", limit: 3 })).articles; } catch {}
  try { bannerAd = await getActiveBannerAd(); } catch {}

  return (
    <PageLayout
      sidebar={
        <div className="space-y-6">
          <LeaderboardCard />
          {session?.user?.id && followedTags.length > 0 && (
            <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
              <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4">
                Your Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {followedTags.map((tag: any) => (
                  <TagFollowButton key={tag} tag={tag} initialFollowing={true} />
                ))}
              </div>
            </div>
          )}
          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4">
              Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag: any) =>
                session?.user?.id ? (
                  <TagFollowButton
                    key={tag}
                    tag={tag}
                    initialFollowing={followedTags.includes(tag)}
                  />
                ) : (
                  <Link key={tag} href={`/forum?tag=${tag}`}>
                    <BadgePill label={tag} variant="primary" />
                  </Link>
                )
              )}
            </div>
          </div>
          <NewsletterSubscribe />
          {bannerAd && (
            <AdBanner
              campaignId={bannerAd.id}
              headline={bannerAd.creativeHeadline}
              description={bannerAd.creativeDescription}
              ctaUrl={bannerAd.creativeCtaUrl}
            />
          )}
        </div>
      }
    >
      <div className="text-center py-12 mb-8 border-b border-border-light dark:border-border-dark-light">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-3 tracking-tight">
          The Research Community Platform
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary text-lg mb-6 max-w-xl mx-auto">
          Ask questions, share knowledge, hire experts, and discover research tools.
        </p>
        <div className="flex items-center justify-center gap-3">
          <AnimatedTooltipGroup items={sampleResearchers} />
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Join 12,000+ researchers
          </span>
        </div>
      </div>

      <section className="mb-8">
        <SectionHeader title="Trending Questions" href="/forum" />
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q: any) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No questions yet"
            description="Be the first to ask a question and start the conversation."
            icon={<MessageSquare className="w-12 h-12" />}
          />
        )}
      </section>

      <section className="mb-8">
        <SectionHeader title="Top Services & Tools" href="/marketplace" />
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No listings yet"
            description="List your research service or tool to reach thousands of researchers."
            icon={<ShoppingBag className="w-12 h-12" />}
          />
        )}
      </section>

      <section className="mb-8">
        <SectionHeader title="Hire a Researcher" href="/hire" />
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No job postings yet"
            description="Post a research project and find the perfect expert."
            icon={<Users className="w-12 h-12" />}
          />
        )}
      </section>

      <section className="mb-8">
        <SectionHeader title="Latest News" href="/news" />
        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles[0] && (
              <ArticleCard article={articles[0]} variant="featured" />
            )}
            {articles.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {articles.slice(1).map((article: any) => (
                  <ArticleCard key={article.id} article={article} variant="default" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No articles yet"
            description="Check back soon for research news and insights."
            icon={<Newspaper className="w-12 h-12" />}
          />
        )}
      </section>
    </PageLayout>
  );
}
