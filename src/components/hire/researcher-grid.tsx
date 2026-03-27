import { db } from "@/lib/db";
import { ResearcherCard } from "./researcher-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import Link from "next/link";

interface ResearcherGridProps {
  expertise?: string;
  availability?: string;
  rateMin?: number;
  rateMax?: number;
}

const AVAILABILITY_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Available", value: "AVAILABLE" },
  { label: "Busy", value: "BUSY" },
];

export async function ResearcherGrid({
  expertise,
  availability,
  rateMin,
  rateMax,
}: ResearcherGridProps) {
  type ResearcherUser = {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    bio: string | null;
    expertise: string[];
    hourlyRate: number | null;
    availability: string | null;
    role: string;
  };

  let researchers: ResearcherUser[] = [];
  try {
    const where: Record<string, unknown> = {
      role: "RESEARCHER",
      deletedAt: null,
    };
    if (expertise) {
      where.expertise = { has: expertise };
    }
    if (availability) {
      where.availability = availability;
    }
    if (rateMin != null || rateMax != null) {
      const rateFilter: Record<string, number> = {};
      if (rateMin != null) rateFilter.gte = rateMin;
      if (rateMax != null) rateFilter.lte = rateMax;
      where.hourlyRate = rateFilter;
    }

    researchers = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        expertise: true,
        hourlyRate: true,
        availability: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
  } catch {
    // DB not available — show empty state
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-text-secondary dark:text-text-dark-secondary font-medium">
          Availability:
        </span>
        <div className="flex gap-1 bg-surface rounded-lg p-1 dark:bg-surface-dark border border-border-light dark:border-border-dark-light">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const isActive = availability === opt.value;
            const params = new URLSearchParams();
            if (opt.value) params.set("availability", opt.value);
            if (expertise) params.set("expertise", expertise);
            const href = params.toString() ? `/researchers?${params.toString()}` : "/researchers";
            return (
              <Link
                key={opt.label}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary shadow-sm"
                    : "text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {researchers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {researchers.map((researcher) => (
            <ResearcherCard key={researcher.id} researcher={researcher} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No researchers found"
          description="Check back soon as more researchers join the platform."
          icon={<Users className="w-12 h-12" />}
        />
      )}
    </div>
  );
}
