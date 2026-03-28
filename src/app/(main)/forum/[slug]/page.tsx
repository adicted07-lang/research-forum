import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { QuestionDetail } from "@/components/forum/question-detail";
import { AnswerCard } from "@/components/forum/answer-card";
import { AnswerForm } from "@/components/forum/answer-form";
import { CommentSection } from "@/components/forum/comment-section";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { getQuestionBySlug, incrementViewCount } from "@/server/actions/questions";
import { getComments } from "@/server/actions/comments";
import { getSuggestedAnswers } from "@/server/actions/suggestions";
import { SuggestedAnswers } from "@/components/forum/suggested-answers";
import { getRelatedContent } from "@/server/actions/citations";
import { RelatedContent } from "@/components/shared/related-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);
  if (!question) return { title: "Question Not Found — ResearchHub" };

  const description = question.body.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: `${question.title} — ResearchHub`,
    description,
    openGraph: {
      title: question.title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: question.title,
      description,
    },
  };
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const question = await getQuestionBySlug(slug);
  if (!question) notFound();

  // Increment view count (fire and forget)
  incrementViewCount(question.id).catch(() => {});

  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  // Fetch comments for the question
  const questionCommentsResult = await getComments("QUESTION", question.id);
  const questionComments =
    "comments" in questionCommentsResult && questionCommentsResult.comments
      ? questionCommentsResult.comments
      : [];

  // Fetch comments for all answers
  const answerCommentsMap: Record<string, typeof questionComments> = {};
  await Promise.all(
    question.answers.map(async (answer: any) => {
      const result = await getComments("ANSWER", answer.id);
      answerCommentsMap[answer.id] =
        "comments" in result && result.comments ? result.comments : [];
    })
  );

  const hasAcceptedAnswer = question.answers.some((a) => a.isAccepted);

  const [suggestions, relatedContent] = await Promise.all([
    question.answerCount === 0
      ? getSuggestedAnswers(question.id, question.tags)
      : Promise.resolve([]),
    getRelatedContent("question", question.id, question.tags),
  ]);

  return (
    <PageLayout sidebar={<ForumSidebar />}>
      <div className="space-y-6">
        {/* Question */}
        <QuestionDetail question={question} currentUserId={currentUserId} />

        {/* Suggested answers for unanswered questions */}
        {suggestions.length > 0 && <SuggestedAnswers suggestions={suggestions} />}

        {/* Question comments */}
        <div className="bg-white border border-border-light rounded-md px-6 pb-4 dark:bg-surface-dark dark:border-border-dark-light">
          <CommentSection
            targetType="QUESTION"
            targetId={question.id}
            comments={questionComments}
          />
        </div>

        {/* Answers section */}
        {question.answers.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-text-dark-primary mb-3">
              {question.answers.length}{" "}
              {question.answers.length === 1 ? "Answer" : "Answers"}
            </h2>
            <div className="space-y-4">
              {question.answers.map((answer: any) => {
                const answerComments = answerCommentsMap[answer.id] ?? [];

                return (
                  <div key={answer.id}>
                    <AnswerCard
                      answer={answer}
                      questionAuthorId={question.authorId}
                      currentUserId={currentUserId}
                      questionHasAccepted={hasAcceptedAnswer}
                    />
                    <div className="bg-white border border-t-0 border-border-light rounded-b-md px-6 pb-4 dark:bg-surface-dark dark:border-border-dark-light">
                      <CommentSection
                        targetType="ANSWER"
                        targetId={answer.id}
                        comments={answerComments}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Answer form */}
        <div>
          <h2 className="text-lg font-bold text-text-primary dark:text-text-dark-primary mb-3">
            Your Answer
          </h2>
          <AnswerForm questionId={question.id} />
        </div>

        {/* Related content */}
        {relatedContent.length > 0 && <RelatedContent items={relatedContent} />}
      </div>
    </PageLayout>
  );
}
