import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BadgePill } from "@/components/shared/badge-pill";
import { getQuestions } from "@/server/actions/questions";
import { getListings } from "@/server/actions/listings";
import { getJobs } from "@/server/actions/jobs";
import { getArticles } from "@/server/actions/articles";

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
        </div>
      }
    >
      <div className="text-center py-12 mb-8 border-b border-border-light dark:border-border-dark-light">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-3 tracking-tight">
          The Research Community Platform
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary text-lg mb-4 max-w-xl mx-auto">
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
              <div key={q.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all">
                <Link href={`/forum/${q.slug}`}>
                  <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">{q.title}</h3>
                </Link>
                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                  <span>{q.upvoteCount} upvotes</span>
                  <span>{q.answerCount} answers</span>
                  <div className="flex gap-1">{q.tags?.slice(0, 3).map((t: string) => <BadgePill key={t} label={t} />)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No questions yet" description="Be the first to ask." />
        )}
      </section>

      {/* Top Services */}
      <section className="mb-8">
        <SectionHeader title="Top Services & Tools" href="/marketplace" />
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((l: any) => (
              <div key={l.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all">
                <Link href={`/marketplace/${l.slug}`}>
                  <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">{l.title}</h3>
                </Link>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2">{l.tagline}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" description="List your service or tool." />
        )}
      </section>

      {/* Jobs */}
      <section className="mb-8">
        <SectionHeader title="Hire a Researcher" href="/hire" />
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((j: any) => (
              <div key={j.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all">
                <Link href={`/hire/${j.slug}`}>
                  <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">{j.title}</h3>
                </Link>
                <p className="text-xs text-text-tertiary">{j.locationPreference} · {j.projectType}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No jobs yet" description="Post a research project." />
        )}
      </section>

      {/* News */}
      <section className="mb-8">
        <SectionHeader title="Latest News" href="/news" />
        {articles.length > 0 ? (
          <div className="space-y-3">
            {articles.map((a: any) => (
              <div key={a.id} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all">
                <Link href={`/news/${a.slug}`}>
                  <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors mb-1">{a.title}</h3>
                </Link>
                <p className="text-xs text-text-tertiary">{a.readTime} min read</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No articles yet" description="Check back soon." />
        )}
      </section>
    </PageLayout>
  );
}
