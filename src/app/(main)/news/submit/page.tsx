export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { ArticleForm } from "@/components/news/article-form";

export const metadata: Metadata = {
  title: "Submit Article — T.I.E",
};

export default async function SubmitArticlePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/news/submit");
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            Submit an Article
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
            Share your research insights, news, or knowledge with the community.
          </p>
        </div>
        <ArticleForm />
      </div>
    </PageLayout>
  );
}
