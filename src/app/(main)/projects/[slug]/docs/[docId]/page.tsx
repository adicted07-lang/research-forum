import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { DocumentEditor } from "@/components/projects/document-editor";
import { getDocument, getProjectBySlug } from "@/server/actions/projects";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

interface DocPageProps {
  params: Promise<{ slug: string; docId: string }>;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug, docId } = await params;
  const doc = await getDocument(docId);
  if (!doc) return { title: "Document Not Found — The Intellectual Exchange" };
  const description = doc.body.replace(/<[^>]*>/g, "").slice(0, 160);
  return {
    title: `${doc.title} — The Intellectual Exchange`,
    description,
    alternates: { canonical: `${baseUrl}/projects/${slug}/docs/${docId}` },
    openGraph: {
      title: `${doc.title} — The Intellectual Exchange`,
      description,
      siteName: "The Intellectual Exchange",
      images: [{ url: `${baseUrl}/api/og?title=${encodeURIComponent(doc.title)}&subtitle=The Intellectual Exchange`, width: 1200, height: 630 }],
    },
  };
}

export default async function DocumentPage({ params }: DocPageProps) {
  const { slug, docId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify the user has access to the project
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const doc = await getDocument(docId);
  if (!doc) notFound();

  const authorName = doc.author.name ?? doc.author.username ?? "Unknown";

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
          <Link
            href={`/projects/${slug}`}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {project.name}
          </Link>
          <span className="text-text-tertiary">/</span>
          <span className="text-text-primary dark:text-text-dark-primary font-medium truncate">
            {doc.title}
          </span>
        </div>

        {/* Document header */}
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            {doc.title}
          </h1>
          <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
            Created by {authorName} · Version {doc.version} · Last updated {new Date(doc.updatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Editor */}
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <DocumentEditor
            docId={doc.id}
            initialContent={doc.body}
            version={doc.version}
          />
        </div>
      </div>
    </PageLayout>
  );
}
