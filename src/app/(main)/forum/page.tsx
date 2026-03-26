import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";

export const dynamic = "force-dynamic";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { QuestionList } from "@/components/forum/question-list";

export const metadata: Metadata = {
  title: "Forum — ResearchHub",
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  return (
    <PageLayout sidebar={<ForumSidebar />}>
      <QuestionList category={category} sort={sort} page={page} />
    </PageLayout>
  );
}
