import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { NewsSidebar } from "@/components/news/news-sidebar";
import { ArticleList } from "@/components/news/article-list";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "News — The Intellectual Exchange",
  description: "Latest research news, how-tos, and insights from The Intellectual Exchange community.",
  alternates: { canonical: `${baseUrl}/news` },
  openGraph: {
    title: "News — The Intellectual Exchange",
    description: "Latest research news, how-tos, and insights from The Intellectual Exchange community.",
    siteName: "The Intellectual Exchange",
    images: [{ url: `${baseUrl}/api/og?title=News&subtitle=The Intellectual Exchange`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "News — The Intellectual Exchange",
    description: "Latest research news, how-tos, and insights from The Intellectual Exchange community.",
    images: [`${baseUrl}/api/og?title=News&subtitle=The Intellectual Exchange`],
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
      <h1 className="sr-only">Research News and Articles</h1>
      <ArticleList category={category} sort={sort} page={page} />
    </PageLayout>
  );
}
