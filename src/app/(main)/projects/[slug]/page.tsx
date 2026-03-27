import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { BadgePill } from "@/components/shared/badge-pill";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { AddMemberForm } from "@/components/projects/add-member-form";
import { NewDocumentForm } from "@/components/projects/new-document-form";
import { getProjectBySlug, getProjectDocuments } from "@/server/actions/projects";
import { FileText, Lock, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found — ResearchHub" };

  const description = project.description.replace(/<[^>]*>/g, "").slice(0, 160);
  return {
    title: `${project.name} — ResearchHub Projects`,
    description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const documents = await getProjectDocuments(project.id);

  const isOwner = project.ownerId === session.user.id;
  const ownerName = project.owner.name ?? project.owner.username ?? "Unknown";

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Project header */}
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                  {project.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs text-text-tertiary dark:text-text-dark-tertiary">
                  {project.visibility === "public" ? (
                    <Globe className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  {project.visibility === "public" ? "Public" : "Private"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/researchers/${project.owner.username ?? project.owner.id}`}
                  className="flex items-center gap-2 group"
                >
                  <UserAvatar name={ownerName} src={project.owner.image} size="sm" />
                  <span className="text-sm text-text-secondary dark:text-text-dark-secondary group-hover:text-primary transition-colors">
                    {ownerName}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {project.description && (
            <div
              className="prose prose-sm max-w-none text-text-secondary dark:text-text-dark-secondary mt-4"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {project.tags.map(tag => (
                <BadgePill key={tag} label={tag} />
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Members ({project.members.length})
          </h2>

          <div className="space-y-3 mb-4">
            {project.members.map(member => {
              const memberName = member.user.name ?? member.user.username ?? "Unknown";
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <Link href={`/researchers/${member.user.username ?? member.user.id}`}>
                    <UserAvatar name={memberName} src={member.user.image} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/researchers/${member.user.username ?? member.user.id}`}
                      className="text-sm font-medium text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors"
                    >
                      {memberName}
                    </Link>
                    {member.user.username && (
                      <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                        @{member.user.username}
                      </p>
                    )}
                  </div>
                  <BadgePill
                    label={member.role === "owner" ? "Owner" : "Member"}
                    variant={member.role === "owner" ? "primary" : "default"}
                  />
                </div>
              );
            })}
          </div>

          {isOwner && (
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                Add a member
              </p>
              <AddMemberForm projectSlug={slug} />
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white border border-border-light rounded-md p-6 dark:bg-surface-dark dark:border-border-dark-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              Documents ({documents.length})
            </h2>
            <NewDocumentForm projectId={project.id} projectSlug={slug} />
          </div>

          {documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description="Create a document to start collaborating on research notes, reports, or plans."
            />
          ) : (
            <div className="space-y-2">
              {documents.map(doc => {
                const authorName = doc.author.name ?? doc.author.username ?? "Unknown";
                return (
                  <Link
                    key={doc.id}
                    href={`/projects/${slug}/docs/${doc.id}`}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-surface dark:hover:bg-surface-dark border border-transparent hover:border-border-light dark:hover:border-border-dark-light transition-all group"
                  >
                    <FileText className="w-4 h-4 text-text-tertiary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary group-hover:text-primary transition-colors truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                        by {authorName} · v{doc.version} · {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
