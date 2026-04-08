export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { QuestionForm } from "@/components/forum/question-form";

export const metadata: Metadata = {
  title: "Ask a Question — T.I.E",
};

export default function AskQuestionPage() {
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            Ask a Question
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
            Share your question with the research community.
          </p>
        </div>
        <QuestionForm />
      </div>
    </PageLayout>
  );
}
