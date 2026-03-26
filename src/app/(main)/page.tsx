import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { QuestionCard } from "@/components/forum/question-card";
import { getQuestions } from "@/server/actions/questions";
import { MessageSquare, ShoppingBag, Users, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { questions } = await getQuestions({ sort: "trending", limit: 4 });

  return (
    <PageLayout
      sidebar={
        <div className="space-y-6">
          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary mb-4">
              Top Researchers This Week
            </h3>
            <p className="text-sm text-text-tertiary">Coming soon...</p>
          </div>
          <div className="bg-white border border-border-light rounded-lg p-5 dark:bg-surface-dark dark:border-border-dark-light">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary mb-4">
              Trending Topics
            </h3>
            <p className="text-sm text-text-tertiary">Coming soon...</p>
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
        <EmptyState
          title="No listings yet"
          description="List your research service or tool to reach thousands of researchers."
          icon={<ShoppingBag className="w-12 h-12" />}
        />
      </section>

      <section className="mb-8">
        <SectionHeader title="Hire a Researcher" href="/hire" />
        <EmptyState
          title="No job postings yet"
          description="Post a research project and find the perfect expert."
          icon={<Users className="w-12 h-12" />}
        />
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
