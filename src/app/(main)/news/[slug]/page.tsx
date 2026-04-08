import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { PageLayout } from "@/components/layout/page-layout";
import { ArticleDetail } from "@/components/news/article-detail";
import { NewsSidebar } from "@/components/news/news-sidebar";
import { CommentSection } from "@/components/forum/comment-section";
import { getArticleBySlug } from "@/server/actions/articles";
import { getComments } from "@/server/actions/comments";
import { getRelatedContent } from "@/server/actions/citations";
import { RelatedContent } from "@/components/shared/related-content";
import { articleSchema } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found — ResearchHub" };

  const description = article.body.replace(/<[^>]*>/g, "").slice(0, 160);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://researchhub.com";

  return {
    title: `${article.title} — ResearchHub`,
    description,
    alternates: {
      canonical: `${baseUrl}/news/${slug}`,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      ...(article.coverImage ? { images: [{ url: article.coverImage }] } : {}),
    },
    twitter: {
      card: article.coverImage ? "summary_large_image" : "summary",
      title: article.title,
      description,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  type CommentItem = {
    id: string;
    body: string;
    createdAt: Date;
    author: { id: string; name: string | null; username: string | null; image: string | null };
    replies?: CommentItem[];
  };
  let articleComments: CommentItem[] = [];
  try {
    const commentsResult = await getComments("ARTICLE", article.id);
    if ("comments" in commentsResult && commentsResult.comments) {
      articleComments = commentsResult.comments as CommentItem[];
    }
  } catch {
    // DB not available
  }

  const relatedContent = await getRelatedContent("article", article.id, article.tags);

  return (
    <PageLayout sidebar={<NewsSidebar />}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema(article as any)),
        }}
      />
      <div className="space-y-6">
        {/* Article */}
        <ArticleDetail article={article} />

        {/* Comments */}
        <div className="bg-white border border-border-light rounded-md px-6 pb-6 pt-4 dark:bg-surface-dark dark:border-border-dark-light">
          <h2 className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-4">
            Discussion
          </h2>
          <CommentSection
            targetType="ARTICLE"
            targetId={article.id}
            comments={articleComments}
          />
        </div>

        {/* Related content */}
        {relatedContent.length > 0 && <RelatedContent items={relatedContent} />}
      </div>
    </PageLayout>
  );
}
