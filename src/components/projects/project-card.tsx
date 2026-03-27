import Link from "next/link";
import { Users, Lock, Globe } from "lucide-react";
import { BadgePill } from "@/components/shared/badge-pill";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    slug: string;
    visibility: string;
    tags: string[];
    owner: {
      name: string | null;
      username: string | null;
    };
    _count: {
      members: number;
    };
    myRole?: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ownerName = project.owner.name ?? project.owner.username ?? "Unknown";
  const descriptionText = project.description.replace(/<[^>]*>/g, "").slice(0, 120);

  return (
    <div className="bg-white border border-border-light rounded-md p-4 hover:border-border hover:shadow-sm transition-all dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark">
      <div className="flex items-start justify-between gap-3 mb-2">
        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-base font-semibold text-text-primary dark:text-text-dark-primary hover:text-primary transition-colors">
            {project.name}
          </h3>
        </Link>
        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-text-tertiary dark:text-text-dark-tertiary">
          {project.visibility === "public" ? (
            <Globe className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          {project.visibility === "public" ? "Public" : "Private"}
        </span>
      </div>

      {descriptionText && (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3 line-clamp-2">
          {descriptionText}
          {project.description.replace(/<[^>]*>/g, "").length > 120 ? "…" : ""}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary dark:text-text-dark-tertiary mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {project._count.members} {project._count.members === 1 ? "member" : "members"}
        </span>
        <span>by {ownerName}</span>
        {project.myRole && (
          <BadgePill
            label={project.myRole === "owner" ? "Owner" : "Member"}
            variant={project.myRole === "owner" ? "primary" : "default"}
          />
        )}
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map(tag => (
            <BadgePill key={tag} label={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
