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
import { MessageSquare, ShoppingBag, Users, Newspaper } from "lucide-react";

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
  let questions: Awaited<ReturnType<typeof getQuestions>>["questions"] = [];
  try {
    const result = await getQuestions({ sort: "trending", limit: 4 });
    questions = result.questions;
  } catch {
    // Database not connected yet — show empty state
  }

  let listings: Awaited<ReturnType<typeof getListings>> = [];
  try {
    listings = await getListings({ sort: "trending", limit: 4 });
  } catch {
    // Database not connected yet — show empty state
  }

  let jobs: Awaited<ReturnType<typeof getJobs>> = [];
  try {
    jobs = await getJobs({ sort: "newest", limit: 3 });
  } catch {
    // Database not connected yet — show empty state
  }

  return (
    <PageLayout
      sidebar={
        <div className="space-y-6">
          <LeaderboardCard />
          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4">
              Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <Link key={tag} href={`/forum?tag=${tag}`}>
                  <BadgePill label={tag} variant="primary" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <section className="mb-8">
        <SectionHeader title="Trending Questions" href="/forum" />
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q) => (
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
            {listings.map((listing) => (
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
            {jobs.map((job) => (
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
        <EmptyState
          title="No articles yet"
          description="Check back soon for research news and insights."
          icon={<Newspaper className="w-12 h-12" />}
        />
      </section>
    </PageLayout>
  );
}
