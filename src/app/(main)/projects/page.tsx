import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { getMyProjects } from "@/server/actions/projects";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "My Projects — The Intellectual Exchange",
  description: "Collaborate with researchers on shared project workspaces.",
  alternates: { canonical: `${baseUrl}/projects` },
  openGraph: {
    title: "My Projects — The Intellectual Exchange",
    description: "Collaborate with researchers on shared project workspaces.",
    siteName: "The Intellectual Exchange",
    images: [{ url: `${baseUrl}/api/og?title=Projects&subtitle=The Intellectual Exchange`, width: 1200, height: 630 }],
  },
};

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { projects } = await getMyProjects();

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary tracking-tight">
          My Projects
        </h2>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project workspace to collaborate with other researchers."
        />
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
