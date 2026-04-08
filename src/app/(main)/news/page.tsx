import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { NewsSidebar } from "@/components/news/news-sidebar";
import { ArticleList } from "@/components/news/article-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — T.I.E",
  description: "Latest research news, how-tos, and insights from The Intellectual Exchange community.",
  openGraph: {
    title: "News — T.I.E",
    description: "Latest research news, how-tos, and insights from The Intellectual Exchange community.",
    siteName: "The Intellectual Exchange",
  },
  twitter: {
    card: "summary",
    title: "News — T.I.E",
    description: "Latest research news, how-tos, and insights from The Intellectual Exchange community.",
  },
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const sort =
    typeof params.sort === "string" ? params.sort : "latest";
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  return (
    <PageLayout sidebar={<NewsSidebar />}>
      <ArticleList category={category} sort={sort} page={page} />
    </PageLayout>
  );
}
