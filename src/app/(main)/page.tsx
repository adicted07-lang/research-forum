import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { QuestionCard } from "@/components/forum/question-card";
import { BadgePill } from "@/components/shared/badge-pill";
import { ListingCard } from "@/components/marketplace/listing-card";
import { JobCard } from "@/components/hire/job-card";
import { getQuestions } from "@/server/actions/questions";
import { getListings } from "@/server/actions/listings";
import { getJobs } from "@/server/actions/jobs";
import { getArticles } from "@/server/actions/articles";
import { ArticleCard } from "@/components/news/article-card";
import { MessageSquare, ShoppingBag, Users, Newspaper } from "lucide-react";
import { NewsletterSubscribe } from "@/components/newsletter/newsletter-subscribe";

const POPULAR_TAGS = [
  "machine-learning", "climate-science", "genomics", "neuroscience", "statistics",
  "deep-learning", "epidemiology", "quantum-computing", "nlp", "bioinformatics",
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let questions: any[] = [];
  let listings: any[] = [];
  let jobs: any[] = [];
  let articles: any[] = [];

  try { questions = (await getQuestions({ sort: "trending", limit: 4 })).questions; } catch {}
  try { listings = await getListings({ sort: "trending", limit: 4 }); } catch {}
  try { jobs = await getJobs({ sort: "newest", limit: 3 }); } catch {}
  try { articles = (await getArticles({ sort: "latest", limit: 3 })).articles; } catch {}

  return (
    <PageLayout
      sidebar={
        <div className="space-y-6">
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
          <NewsletterSubscribe />
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
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Join 12,000+ researchers
        </p>
      </div>

      {/* Trending Questions */}
      <section className="mb-8">
        <SectionHeader title="Trending Questions" href="/forum" />
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q: any) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        ) : (
          <EmptyState title="No questions yet" description="Be the first to ask a question and start the conversation." />
        )}
      </section>

      {/* Top Services & Tools */}
      <section className="mb-8">
        <SectionHeader title="Top Services & Tools" href="/marketplace" />
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((l: any) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" description="List your research service or tool to reach thousands of researchers." />
        )}
      </section>

      {/* Hire a Researcher */}
      <section className="mb-8">
        <SectionHeader title="Hire a Researcher" href="/hire" />
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((j: any) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <EmptyState title="No job postings yet" description="Post a research project and find the perfect expert." />
        )}
      </section>

      {/* Latest News */}
      <section className="mb-8">
        <SectionHeader title="Latest News" href="/news" />
        {articles.length > 0 ? (
          <div className="space-y-3">
            {articles.map((a: any) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <EmptyState title="No articles yet" description="Check back soon for research news and insights." />
        )}
      </section>
    </PageLayout>
  );
}
